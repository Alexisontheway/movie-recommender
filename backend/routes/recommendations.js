const express = require("express");
const router = express.Router();
const tmdbService = require("../services/tmdbService");
const scoringService = require("../services/scoringService");
const userProfileService = require("../services/userProfileService");
const mlService = require("../services/mlService");
const { timingMiddleware } = require("../middleware/timing");
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

// T0-1: time every recommendation request and log duration + rolling p50/p95.
router.use(timingMiddleware);

// ─── Utilities ────────────────────────────────────────────────────────────────

function isRealMovie(movie) {
  const title = (movie.title || "").toLowerCase();
  const overview = (movie.overview || "").toLowerCase();
  const blockedTerms = [
    "concert", "tour", "live at", "unplugged", "on stage",
    "permission to dance", "monster ball", "speak yourself",
    "live in", "world tour", "farewell tour", "comedy special",
    "stand-up", "standup", "behind the scenes", "making of",
    "recap", "compilation", "live from"
  ];
  for (const term of blockedTerms) {
    if (title.includes(term) || overview.includes(term)) return false;
  }
  const genreIds = movie.genre_ids || movie.genreIds || [];
  const isMusic = genreIds.includes(10402);
  const isDoc = genreIds.includes(99);
  const isTVMovie = genreIds.includes(10770);
  if (isMusic && (!movie.vote_count || movie.vote_count < 1000)) return false;
  if (isDoc && (!movie.vote_count || movie.vote_count < 500)) return false;
  if (isTVMovie && (!movie.vote_average || movie.vote_average < 7.0)) return false;
  return true;
}

/**
 * Extract ML-ready metadata from a TMDB movie detail response.
 * Converts structured genres/keywords/cast/director into space-separated strings
 * for TF-IDF vectorization.
 */
function extractMLMetadata(details) {
  if (!details) return null;

  const genres = (details.genres || []).map(g => g.name.replace(/\s+/g, "")).join(" ");
  const keywords = (details.keywords?.keywords || []).map(k => k.name.replace(/\s+/g, "")).join(" ");

  let cast = "";
  let director = "";
  if (details.credits) {
    cast = (details.credits.cast || []).slice(0, 5).map(c => c.name.replace(/\s+/g, "")).join(" ");
    const dir = (details.credits.crew || []).find(c => c.job === "Director");
    director = dir ? dir.name.replace(/\s+/g, "") : "";
  }

  return {
    id: details.id,
    title: details.title || "",
    genres: genres,
    keywords: keywords,
    cast: cast,
    director: director,
    overview: details.overview || "",
    vote_average: details.vote_average || 0,
    popularity: details.popularity || 0,
    original_language: details.original_language || "en",
    genre_ids: (details.genres || []).map(g => g.id),
    poster_path: details.poster_path || null,
    backdrop_path: details.backdrop_path || null,
    release_date: details.release_date || "",
    vote_count: details.vote_count || 0,
  };
}

/**
 * Build a large candidate pool from TMDB for a given movie.
 * Fetches from multiple sources: similar, recommendations, genre-discover, trending.
 */
async function buildCandidatePool(movieId, sourceGenreIds, sourceLang) {
  const candidateIds = new Set();
  const rawCandidates = [];

  const addCandidates = (movies) => {
    for (const m of movies) {
      if (!candidateIds.has(m.id) && m.id !== parseInt(movieId)) {
        candidateIds.add(m.id);
        rawCandidates.push(m);
      }
    }
  };

  // Source 1: TMDB Similar Movies (page 1 + 2)
  try {
    const similar = await tmdbService.getSimilarMovies(movieId);
    addCandidates(similar);
  } catch (e) { console.log("Similar fetch failed:", e.message); }

  await tmdbService.delay(250);

  // Source 2: TMDB Recommendations
  try {
    const recs = await tmdbService.fetchWithRetry(`/movie/${movieId}/recommendations`);
    if (recs && recs.results) addCandidates(recs.results);
  } catch (e) { console.log("Recommendations fetch failed:", e.message); }

  await tmdbService.delay(250);

  // Source 3: Genre-matched Discover (high-quality pool)
  if (sourceGenreIds.length > 0) {
    try {
      const genreStr = sourceGenreIds.slice(0, 3).join(",");
      const discover1 = await tmdbService.fetchWithRetry("/discover/movie", {
        with_genres: genreStr,
        sort_by: "vote_average.desc",
        "vote_count.gte": 100,
        page: 1,
      });
      if (discover1 && discover1.results) addCandidates(discover1.results);

      await tmdbService.delay(200);

      const discover2 = await tmdbService.fetchWithRetry("/discover/movie", {
        with_genres: genreStr,
        sort_by: "popularity.desc",
        "vote_count.gte": 50,
        page: 1,
      });
      if (discover2 && discover2.results) addCandidates(discover2.results);
    } catch (e) { console.log("Discover fetch failed:", e.message); }
  }

  await tmdbService.delay(250);

  // Source 4: Same-language cinema (for non-English source)
  if (sourceLang && sourceLang !== "en") {
    try {
      const langDiscover = await tmdbService.fetchWithRetry("/discover/movie", {
        with_original_language: sourceLang,
        sort_by: "vote_average.desc",
        "vote_count.gte": 100,
        page: 1,
      });
      if (langDiscover && langDiscover.results) addCandidates(langDiscover.results);
    } catch (e) { console.log("Language discover failed:", e.message); }

    await tmdbService.delay(250);
  }

  // Source 5: Trending (broadens pool with fresh content)
  try {
    const trending = await tmdbService.getTrendingMovies();
    addCandidates(trending);
  } catch (e) { console.log("Trending fetch failed:", e.message); }

  // Filter: only real movies with valid data
  const filtered = rawCandidates.filter(m => {
    if (!m.poster_path) return false;
    if (!m.vote_count || m.vote_count < 30) return false;
    if (!m.vote_average || m.vote_average < 4.0) return false;
    if (!isRealMovie(m)) return false;
    return true;
  });

  console.log(`📦 Candidate pool: ${filtered.length} movies from ${rawCandidates.length} raw`);
  return filtered;
}

/**
 * Enrich a list of TMDB movie stubs with full details for ML metadata extraction.
 * Uses batched fetching with rate limiting.
 */
async function enrichCandidatesWithDetails(candidates, batchSize = 8) {
  const enriched = [];

  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(c => tmdbService.getMovieDetails(c.id))
    );

    for (let j = 0; j < batchResults.length; j++) {
      if (batchResults[j].status === "fulfilled" && batchResults[j].value) {
        const meta = extractMLMetadata(batchResults[j].value);
        if (meta) enriched.push(meta);
      }
    }

    if (i + batchSize < candidates.length) {
      await tmdbService.delay(300);
    }
  }

  return enriched;
}


// ─── Routes ───────────────────────────────────────────────────────────────────

// Quiz-based recommendations (unchanged from v1)
router.post("/generate", async (req, res) => {
  try {
    const quizAnswers = req.body;
    const userProfile = userProfileService.buildUserProfile(quizAnswers);
    const expandedGenres = userProfileService.getExpandedGenres(quizAnswers);
    let allMovies = [];
    if (expandedGenres.length > 0) {
      try { const g = await tmdbService.getMoviesByMultipleGenres(expandedGenres, 3); allMovies = [...allMovies, ...g]; } catch(e) {}
      await tmdbService.delay(800);
    }
    try { const h = await tmdbService.getHiddenGems(2); allMovies = [...allMovies, ...h]; } catch(e) {}
    await tmdbService.delay(800);
    try { const c = await tmdbService.getUnderratedClassics(2); allMovies = [...allMovies, ...c]; } catch(e) {}
    await tmdbService.delay(800);
    if (userProfile.favoriteMovie && userProfile.favoriteMovie.id) {
      try { const s = await tmdbService.getSimilarMovies(userProfile.favoriteMovie.id); allMovies = [...allMovies, ...s]; } catch(e) {}
      await tmdbService.delay(800);
    }
    try { const p = await tmdbService.getPopularMovies(2); allMovies = [...allMovies, ...p]; } catch(e) {}
    await tmdbService.delay(800);
    try { const t = await tmdbService.getTopRatedMovies(2); allMovies = [...allMovies, ...t]; } catch(e) {}
    const uniqueMovies = allMovies
      .filter((movie, index, self) => index === self.findIndex(m => m.id === movie.id))
      .filter(movie => {
        if (!movie.vote_average || movie.vote_average === 0) return false;
        if (!movie.overview || movie.overview.length < 20) return false;
        if (!movie.poster_path) return false;
        if (!movie.vote_count || movie.vote_count < 50) return false;
        if (!isRealMovie(movie)) return false;
        return true;
      });
    if (uniqueMovies.length === 0) return res.json({ success: false, recommendations: [] });
    const recommendations = scoringService.scoreAndRankMovies(uniqueMovies, userProfile, 20);
    const formatted = recommendations.map((movie, i) => {
      const f = tmdbService.formatMovie(movie);
      f.matchScore = movie.matchScore; f.isHiddenGem = movie.isHiddenGem; f.rank = i + 1;
      return f;
    });
    res.json({ success: true, count: formatted.length, hiddenGems: formatted.filter(m => m.isHiddenGem).length, userProfile, recommendations: formatted });
  } catch (error) {
    console.error("Generate error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate recommendations" });
  }
});


// ML Status — v2 dynamic engine
router.get("/ml/status", async (req, res) => {
  const statusData = await mlService.getStatus();
  if (statusData) {
    res.json({
      ml_service: "online",
      version: statusData.version || "2.0.0",
      engine: statusData.engine || "dynamic-tfidf",
      coverage: statusData.coverage || "800K+ movies",
      mode: statusData.mode || "real-time",
    });
  } else {
    res.json({ ml_service: "offline" });
  }
});


// TMDB Live Search
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) return res.json({ success: true, results: [] });
    console.log("Searching TMDB for: " + query);
    const results = await tmdbService.searchMovies(query);
    const formatted = results.filter(m => m.poster_path && m.vote_average > 0).slice(0, 10).map(m => tmdbService.formatMovie(m));
    res.json({ success: true, query, count: formatted.length, results: formatted });
  } catch (e) { res.status(500).json({ success: false, message: "Search failed" }); }
});


// ─── HYBRID v2: Dynamic ML + TMDB Scoring ─────────────────────────────────────

router.get("/ml/hybrid/:movieId", async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const movieTitle = req.query.title;
    const count = parseInt(req.query.count) || 15;
    console.log(`🧠 Hybrid v2 request: ${movieTitle} (ID: ${movieId})`);

    // Step 1: Get source movie full details
    let sourceDetails = null;
    try { sourceDetails = await tmdbService.getMovieDetails(movieId); } catch (e) {}

    const sourceGenreIds = sourceDetails?.genres ? sourceDetails.genres.map(g => g.id) : [];
    const sourceLang = sourceDetails?.original_language || "en";
    const sourceMeta = extractMLMetadata(sourceDetails);

    // Step 2: Build candidate pool from TMDB (~100-150 movies)
    const rawPool = await buildCandidatePool(movieId, sourceGenreIds, sourceLang);

    // Step 3: Enrich candidates with full metadata for ML
    const enrichedCandidates = await enrichCandidatesWithDetails(rawPool);
    console.log(`🔬 Enriched ${enrichedCandidates.length} candidates with ML metadata`);

    // Step 4: Send to ML engine for dynamic TF-IDF scoring
    let mlResults = [];
    let mlAvailable = false;

    if (sourceMeta && enrichedCandidates.length > 0) {
      const mlResponse = await mlService.getDynamicRecommendations(
        sourceMeta,
        enrichedCandidates,
        count * 2  // request extra so we can merge
      );

      if (mlResponse && mlResponse.recommendations) {
        mlAvailable = true;
        mlResults = mlResponse.recommendations;
        console.log(`🧠 ML returned ${mlResults.length} results (${mlResponse.features_extracted} features)`);
      }
    }

    // Step 5: Score and merge ML results with TMDB-scored results
    const mergedMap = {};

    // Add ML results (with ML similarity as primary score)
    for (const mlRec of mlResults) {
      const candidate = enrichedCandidates.find(c => c.id === mlRec.id);
      if (!candidate) continue;

      const f = tmdbService.formatMovie({
        ...candidate,
        poster_path: candidate.poster_path,
        backdrop_path: candidate.backdrop_path,
        genre_ids: candidate.genre_ids,
      });

      // ML score: similarity * 60 + quality bonus
      let score = mlRec.similarity_score * 60;
      score += Math.min((candidate.vote_average || 0) * 3, 30);
      score += Math.min((candidate.popularity || 0) / 20, 10);

      // Genre overlap bonus
      const movieGenres = candidate.genre_ids || [];
      const overlap = movieGenres.filter(g => sourceGenreIds.includes(g)).length;
      if (sourceGenreIds.length > 0) score += (overlap / sourceGenreIds.length) * 15;

      // Language bonus
      if (candidate.original_language === sourceLang) score += 8;

      mergedMap[candidate.id] = {
        ...f,
        source: "ml",
        score: Math.min(Math.round(score), 100),
        similarity_score: mlRec.similarity_score,
      };
    }

    // Add TMDB-only candidates (not in ML results or boost existing)
    for (const candidate of enrichedCandidates) {
      if (mergedMap[candidate.id]) {
        // Already from ML — mark as "both" if high quality
        if (candidate.vote_count > 100 && candidate.vote_average > 6.5) {
          mergedMap[candidate.id].source = "both";
          mergedMap[candidate.id].score = Math.min(mergedMap[candidate.id].score + 10, 100);
        }
        continue;
      }

      const f = tmdbService.formatMovie({
        ...candidate,
        poster_path: candidate.poster_path,
        backdrop_path: candidate.backdrop_path,
        genre_ids: candidate.genre_ids,
      });

      let score = (candidate.vote_average || 0) * 4.8 + Math.min((candidate.popularity || 0) / 10, 15);
      const movieGenres = candidate.genre_ids || [];
      const overlap = movieGenres.filter(g => sourceGenreIds.includes(g)).length;
      if (sourceGenreIds.length > 0) score += (overlap / sourceGenreIds.length) * 20;
      if (candidate.original_language === sourceLang) score += 10;
      if (candidate.vote_count > 1000) score += 7;
      else if (candidate.vote_count > 500) score += 5;
      else if (candidate.vote_count > 100) score += 3;

      mergedMap[candidate.id] = { ...f, source: "tmdb", score: Math.min(Math.round(score), 100) };
    }

    // Remove source movie from results
    delete mergedMap[parseInt(movieId)];

    const merged = Object.values(mergedMap)
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((m, i) => ({ ...m, rank: i + 1 }));

    const mlCount = merged.filter(m => m.source === "ml" || m.source === "both").length;
    const tmdbCount = merged.filter(m => m.source === "tmdb" || m.source === "both").length;
    const bothCount = merged.filter(m => m.source === "both").length;

    res.json({
      success: true,
      source_movie: movieTitle,
      source_movie_id: movieId,
      ml_available: mlAvailable,
      engine: "dynamic-tfidf-v2",
      candidates_analyzed: enrichedCandidates.length,
      total: merged.length,
      ml_count: mlCount,
      tmdb_count: tmdbCount,
      both_count: bothCount,
      recommendations: merged,
    });
  } catch (error) {
    console.error("Hybrid v2 error:", error);
    res.status(500).json({ success: false, message: "Failed to get recommendations" });
  }
});


// ─── MULTI-MOVIE Hybrid v2 ────────────────────────────────────────────────────

router.post("/ml/multi", async (req, res) => {
  try {
    const { movies, count } = req.body;
    if (!movies || !Array.isArray(movies) || movies.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide movies" });
    }
    console.log(`🧠 Multi-movie v2 request for ${movies.length} movies`);

    // Gather source metadata
    const allSourceGenres = [];
    const allSourceLangs = [];
    const sourceMetadataList = [];

    for (const movie of movies) {
      try {
        const d = await tmdbService.getMovieDetails(movie.id);
        if (d && d.genres) allSourceGenres.push(...d.genres.map(g => g.id));
        if (d) allSourceLangs.push(d.original_language);
        const meta = extractMLMetadata(d);
        if (meta) sourceMetadataList.push(meta);
        await tmdbService.delay(200);
      } catch (e) {}
    }

    const uniqueSourceGenres = [...new Set(allSourceGenres)];
    const langCounts = {};
    allSourceLangs.forEach(l => { langCounts[l] = (langCounts[l] || 0) + 1; });
    const primaryLang = Object.keys(langCounts).sort((a, b) => langCounts[b] - langCounts[a])[0] || "en";

    // Build merged candidate pool from all source movies
    const allCandidateIds = new Set();
    const allRawCandidates = [];

    for (const movie of movies) {
      const pool = await buildCandidatePool(movie.id, uniqueSourceGenres, primaryLang);
      for (const c of pool) {
        if (!allCandidateIds.has(c.id)) {
          allCandidateIds.add(c.id);
          allRawCandidates.push(c);
        }
      }
      await tmdbService.delay(300);
    }

    // Enrich all candidates
    const enrichedCandidates = await enrichCandidatesWithDetails(allRawCandidates);
    console.log(`🔬 Multi: Enriched ${enrichedCandidates.length} unique candidates`);

    // Create a combined source "super-movie" for ML (merge all source metadata)
    const combinedSource = {
      id: null,
      title: movies.map(m => m.title).join(" + "),
      genres: sourceMetadataList.map(s => s.genres).join(" "),
      keywords: sourceMetadataList.map(s => s.keywords).join(" "),
      cast: sourceMetadataList.map(s => s.cast).join(" "),
      director: sourceMetadataList.map(s => s.director).join(" "),
      overview: sourceMetadataList.map(s => s.overview).join(" "),
      vote_average: 0,
      popularity: 0,
    };

    // Send to ML engine
    let mlResults = [];
    let mlAvailable = false;

    if (enrichedCandidates.length > 0) {
      const mlResponse = await mlService.getDynamicRecommendations(
        combinedSource,
        enrichedCandidates,
        (count || 5) * movies.length * 2
      );

      if (mlResponse && mlResponse.recommendations) {
        mlAvailable = true;
        mlResults = mlResponse.recommendations;
      }
    }

    // Build merged results
    const mergedMap = {};
    const sourceIds = movies.map(m => m.id);

    for (const mlRec of mlResults) {
      if (sourceIds.includes(mlRec.id)) continue;
      const candidate = enrichedCandidates.find(c => c.id === mlRec.id);
      if (!candidate) continue;
      if (!isRealMovie(candidate)) continue;

      const f = tmdbService.formatMovie({
        ...candidate,
        poster_path: candidate.poster_path,
        backdrop_path: candidate.backdrop_path,
        genre_ids: candidate.genre_ids,
      });

      let score = mlRec.similarity_score * 60;
      score += Math.min((candidate.vote_average || 0) * 3, 30);
      score += Math.min((candidate.popularity || 0) / 20, 10);

      const movieGenres = candidate.genre_ids || [];
      const overlap = movieGenres.filter(g => uniqueSourceGenres.includes(g)).length;
      if (uniqueSourceGenres.length > 0) score += (overlap / Math.min(uniqueSourceGenres.length, 5)) * 25;
      if (candidate.original_language === primaryLang) score += 12;
      if (candidate.vote_count > 1000) score += 7;
      else if (candidate.vote_count > 500) score += 5;
      else if (candidate.vote_count > 100) score += 3;

      mergedMap[candidate.id] = { ...f, source: "ml", score: Math.min(Math.round(score), 100) };
    }

    // Add TMDB-only fallbacks
    for (const candidate of enrichedCandidates) {
      if (sourceIds.includes(candidate.id)) continue;
      if (mergedMap[candidate.id]) {
        if (candidate.vote_count > 100) {
          mergedMap[candidate.id].source = "both";
          mergedMap[candidate.id].score = Math.min(mergedMap[candidate.id].score + 10, 100);
        }
        continue;
      }
      if (!isRealMovie(candidate)) continue;

      const f = tmdbService.formatMovie({
        ...candidate,
        poster_path: candidate.poster_path,
        backdrop_path: candidate.backdrop_path,
        genre_ids: candidate.genre_ids,
      });

      let score = (candidate.vote_average || 0) * 4.8 + Math.min((candidate.popularity || 0) / 10, 15);
      const movieGenres = candidate.genre_ids || [];
      const overlap = movieGenres.filter(g => uniqueSourceGenres.includes(g)).length;
      if (uniqueSourceGenres.length > 0) score += (overlap / Math.min(uniqueSourceGenres.length, 5)) * 25;
      if (candidate.original_language === primaryLang) score += 12;
      if (candidate.vote_count > 1000) score += 7;
      else if (candidate.vote_count > 500) score += 5;
      else if (candidate.vote_count > 100) score += 3;

      mergedMap[candidate.id] = { ...f, source: "tmdb", score: Math.min(Math.round(score), 100) };
    }

    // Genre penalty/boost
    for (const id in mergedMap) {
      const rec = mergedMap[id];
      const recGenres = rec.genreIds || [];
      const genreOverlap = recGenres.filter(g => uniqueSourceGenres.includes(g)).length;
      const overlapRatio = uniqueSourceGenres.length > 0 ? genreOverlap / Math.min(uniqueSourceGenres.length, 4) : 0;

      if (uniqueSourceGenres.length > 0) {
        if (genreOverlap === 0) rec.score = Math.max(rec.score - 45, 0);
        else if (overlapRatio < 0.25) rec.score = Math.max(rec.score - 25, 0);
        else if (overlapRatio >= 0.75) rec.score = Math.min(rec.score + 25, 100);
        else if (overlapRatio >= 0.5) rec.score = Math.min(rec.score + 15, 100);
      }

      if (rec.originalLanguage === primaryLang && primaryLang !== "en") {
        rec.score = Math.min(rec.score + 10, 100);
      }
    }

    const sorted = Object.values(mergedMap)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((m, i) => ({ ...m, rank: i + 1 }));

    const mlCount = sorted.filter(m => m.source === "ml" || m.source === "both").length;
    const tmdbCount = sorted.filter(m => m.source === "tmdb" || m.source === "both").length;

    res.json({
      success: true,
      source_movies: movies.map(m => m.title),
      engine: "dynamic-tfidf-v2",
      candidates_analyzed: enrichedCandidates.length,
      total: sorted.length,
      ml_count: mlCount,
      tmdb_count: tmdbCount,
      recommendations: sorted,
    });
  } catch (error) {
    console.error("Multi v2 error:", error);
    res.status(500).json({ success: false, message: "Failed" });
  }
});


// Legacy endpoint
router.get("/ml/movies", async (req, res) => {
  res.json({
    success: true,
    total: 0,
    note: "v2 dynamic engine — no static movie list. Coverage: 800K+ TMDB movies.",
  });
});


module.exports = router;