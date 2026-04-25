const express = require("express");
const router = express.Router();
const tmdbService = require("../services/tmdbService");
const scoringService = require("../services/scoringService");
const userProfileService = require("../services/userProfileService");
const mlService = require("../services/mlService");
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

// FIX 2: Filter out non-movie content
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

// Quiz-based recommendations - FIX 2 applied
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
    res.status(500).json({ success: false, message: "Failed to generate recommendations", error: error.message });
  }
});

// ML Status
router.get("/ml/status", async (req, res) => {
  const available = await mlService.isAvailable();
  res.json({ ml_service: available ? "online" : "offline", url: ML_SERVICE_URL });
});

// ML Movies
router.get("/ml/movies", async (req, res) => {
  try {
    const response = await fetch(ML_SERVICE_URL + "/movies");
    if (!response.ok) return res.status(503).json({ success: false });
    const data = await response.json();
    res.json({ success: true, ...data });
  } catch (e) { res.status(503).json({ success: false }); }
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

// FIX 1: Enrich ML result — try ID first, then title search fallback
async function enrichMLResult(rec) {
  try {
    let details = null;

    // Attempt 1: TMDB by ID
    if (rec.id) {
      try {
        const d = await tmdbService.getMovieDetails(rec.id);
        if (d && d.title && d.poster_path) details = d;
      } catch(e) {
        console.log("TMDB ID lookup failed for " + rec.id + ", trying title...");
      }
    }

    // Attempt 2: Search TMDB by title (fallback)
    if (!details && rec.title) {
      try {
        await tmdbService.delay(150);
        const searchResults = await tmdbService.searchMovies(rec.title);
        if (searchResults && searchResults.length > 0) {
          const exact = searchResults.find(m =>
            m.title.toLowerCase() === rec.title.toLowerCase()
          );
          const best = exact || searchResults[0];
          try {
            const full = await tmdbService.getMovieDetails(best.id);
            if (full && full.title) details = full;
            else details = best;
          } catch(e) {
            details = best;
          }
        }
      } catch(e) {
        console.log("Title search failed for: " + rec.title);
      }
    }

    if (!details) return null;
    if (details.vote_count && details.vote_count < 50) return null;
    if (details.vote_average && details.vote_average < 5.0) return null;
    if (!details.poster_path) return null;

    const f = tmdbService.formatMovie(details);
    return {
      ...f,
      similarity_score: rec.similarity_score || 0,
      source: "ml",
      score: Math.round((rec.similarity_score || 0.5) * 200)
    };
  } catch(e) {
    console.log("enrichMLResult error: " + e.message);
    return null;
  }
}

// HYBRID Recommendations (ML + TMDB) - FIX 1 applied
router.get("/ml/hybrid/:movieId", async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const movieTitle = req.query.title;
    const count = parseInt(req.query.count) || 10;
    console.log("Hybrid request: " + movieTitle + " (ID: " + movieId + ")");

    let sourceMovie = null;
    try { sourceMovie = await tmdbService.getMovieDetails(movieId); } catch(e) {}
    const sourceGenreIds = sourceMovie && sourceMovie.genres ? sourceMovie.genres.map(g => g.id) : [];
    const sourceLang = sourceMovie ? sourceMovie.original_language : "en";

    const mlPromise = movieTitle ? mlService.getRecommendations(movieTitle, count) : Promise.resolve(null);
    const tmdbPromise = tmdbService.getSimilarMovies(movieId).catch(() => []);
    const [mlResult, tmdbSimilar] = await Promise.all([mlPromise, tmdbPromise]);

    const mlMovies = [];
    let mlAvailable = false;
    if (mlResult && mlResult.recommendations && mlResult.recommendations.length > 0) {
      mlAvailable = true;
      for (const rec of mlResult.recommendations) {
        const enriched = await enrichMLResult(rec);
        if (enriched) mlMovies.push(enriched);
        await tmdbService.delay(200);
      }
    }

    const tmdbMovies = (tmdbSimilar || []).filter(m => m.poster_path && m.vote_count >= 50 && m.vote_average >= 5.0 && m.overview && m.overview.length >= 20).slice(0, 15).map(movie => {
      const f = tmdbService.formatMovie(movie);
      let score = movie.vote_average * 4.8 + Math.min(movie.popularity / 10, 15);
      const movieGenres = movie.genre_ids || [];
      const overlap = movieGenres.filter(g => sourceGenreIds.includes(g)).length;
      if (sourceGenreIds.length > 0) score += (overlap / sourceGenreIds.length) * 20;
      if (movie.original_language === sourceLang) score += 10;
      if (movie.vote_count > 1000) score += 7; else if (movie.vote_count > 500) score += 5; else if (movie.vote_count > 100) score += 3;
      return { ...f, source: "tmdb", score: Math.min(Math.round(score), 100) };
    });

    const mergedMap = {};
    for (const m of mlMovies) mergedMap[m.id] = m;
    for (const m of tmdbMovies) {
      if (mergedMap[m.id]) { mergedMap[m.id].source = "both"; mergedMap[m.id].score = Math.min(mergedMap[m.id].score + 15, 100); }
      else mergedMap[m.id] = m;
    }
    delete mergedMap[parseInt(movieId)];

    const merged = Object.values(mergedMap).sort((a, b) => b.score - a.score).slice(0, 20).map((m, i) => ({ ...m, rank: i + 1 }));
    const mlCount = merged.filter(m => m.source === "ml" || m.source === "both").length;
    const tmdbCount = merged.filter(m => m.source === "tmdb" || m.source === "both").length;
    const bothCount = merged.filter(m => m.source === "both").length;

    res.json({ success: true, source_movie: movieTitle, source_movie_id: movieId, ml_available: mlAvailable, total: merged.length, ml_count: mlCount, tmdb_count: tmdbCount, both_count: bothCount, recommendations: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get recommendations", error: error.message });
  }
});

// MULTI-MOVIE Hybrid - FIX 1, 2, 4 applied
router.post("/ml/multi", async (req, res) => {
  try {
    const { movies, count } = req.body;
    if (!movies || !Array.isArray(movies) || movies.length === 0) return res.status(400).json({ success: false, message: "Please provide movies" });
    console.log("Multi-movie request for " + movies.length + " movies");

    const allSourceGenres = [];
    const allSourceLangs = [];
    for (const movie of movies) {
      try {
        const d = await tmdbService.getMovieDetails(movie.id);
        if (d && d.genres) allSourceGenres.push(...d.genres.map(g => g.id));
        if (d) allSourceLangs.push(d.original_language);
        await tmdbService.delay(200);
      } catch(e) {}
    }
    const uniqueSourceGenres = [...new Set(allSourceGenres)];
    const langCounts = {};
    allSourceLangs.forEach(l => { langCounts[l] = (langCounts[l] || 0) + 1; });
    const primaryLang = Object.keys(langCounts).sort((a, b) => langCounts[b] - langCounts[a])[0] || "en";
    console.log("Source genres: " + uniqueSourceGenres + " | Primary lang: " + primaryLang);

    let allRecs = [];
    for (const movie of movies) {
      // TMDB Similar
      try {
        const similar = await tmdbService.getSimilarMovies(movie.id);
        const filtered = similar.filter(m => {
          if (!m.poster_path) return false;
          if (!m.vote_count || m.vote_count < 50) return false;
          if (!m.vote_average || m.vote_average < 5.0) return false;
          if (!m.overview || m.overview.length < 20) return false;
          if (!isRealMovie(m)) return false;
          return true;
        }).slice(0, 10).map(m => {
          let score = m.vote_average * 4.8 + Math.min(m.popularity / 10, 15);
          const movieGenres = m.genre_ids || [];
          const overlap = movieGenres.filter(g => uniqueSourceGenres.includes(g)).length;
          if (uniqueSourceGenres.length > 0) score += (overlap / Math.min(uniqueSourceGenres.length, 5)) * 25;
          if (m.original_language === primaryLang) score += 12;
          if (m.vote_count > 1000) score += 7; else if (m.vote_count > 500) score += 5; else if (m.vote_count > 100) score += 3;
          return { ...tmdbService.formatMovie(m), source: "tmdb", ml_source: movie.title, score: Math.min(Math.round(score), 100) };
        });
        allRecs.push(...filtered);
      } catch(e) {}

      // FIX 1: ML results with title-based enrichment
      try {
        const mlResult = await mlService.getRecommendations(movie.title, count || 5);
        if (mlResult && mlResult.recommendations) {
          for (const rec of mlResult.recommendations) {
            if (rec.vote_average && rec.vote_average < 5.0) continue;
            const enriched = await enrichMLResult(rec);
            if (enriched) {
              enriched.ml_source = movie.title;
              allRecs.push(enriched);
            }
            await tmdbService.delay(150);
          }
        }
      } catch(e) {
        console.log("ML failed for " + movie.title + ": " + e.message);
      }
      await tmdbService.delay(500);
    }

    // Deduplicate
    const unique = {};
    const sourceIds = movies.map(m => m.id);
    for (const rec of allRecs) {
      if (sourceIds.includes(rec.id)) continue;
      if (!isRealMovie(rec)) continue;
      if (!unique[rec.id] || rec.score > unique[rec.id].score) unique[rec.id] = rec;
      else if (unique[rec.id] && rec.source !== unique[rec.id].source) {
        unique[rec.id].source = "both";
        unique[rec.id].score = Math.min(unique[rec.id].score + 10, 100);
      }
    }

    // FIX 4: Strong genre penalty/boost
    for (const id in unique) {
      const rec = unique[id];
      const recGenres = rec.genreIds || [];
      const genreOverlap = recGenres.filter(g => uniqueSourceGenres.includes(g)).length;
      const overlapRatio = uniqueSourceGenres.length > 0 ? genreOverlap / Math.min(uniqueSourceGenres.length, 4) : 0;

      if (uniqueSourceGenres.length > 0) {
        if (genreOverlap === 0) {
          rec.score = Math.max(rec.score - 45, 0);
        } else if (overlapRatio < 0.25) {
          rec.score = Math.max(rec.score - 25, 0);
        } else if (overlapRatio >= 0.75) {
          rec.score = Math.min(rec.score + 25, 100);
        } else if (overlapRatio >= 0.5) {
          rec.score = Math.min(rec.score + 15, 100);
        }
      }

      // Language bonus
      if (rec.originalLanguage === primaryLang && primaryLang !== "en") {
        rec.score = Math.min(rec.score + 10, 100);
      }
    }

    const sorted = Object.values(unique).sort((a, b) => b.score - a.score).slice(0, 20).map((m, i) => ({ ...m, rank: i + 1 }));
    const mlCount = sorted.filter(m => m.source === "ml" || m.source === "both").length;
    const tmdbCount = sorted.filter(m => m.source === "tmdb" || m.source === "both").length;

    res.json({ success: true, source_movies: movies.map(m => m.title), total: sorted.length, ml_count: mlCount, tmdb_count: tmdbCount, recommendations: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed", error: error.message });
  }
});

module.exports = router;