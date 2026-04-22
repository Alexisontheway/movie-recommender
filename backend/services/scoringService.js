// ===========================
// 🎯 Scoring Service - Enhanced Edition
// ===========================

const { GENRE_MAP } = require('./tmdbService');

function scoreMovie(movie, userPreferences) {
    let score = 0;
    let maxScore = 0;

    // 1️⃣ Genre Match (40 points max)
    const genreScore = calculateGenreScore(movie, userPreferences.genres);
    score += genreScore;
    maxScore += 40;

    // 2️⃣ Rating (20 points max)
    const ratingScore = calculateRatingScore(movie, userPreferences.minRating);
    score += ratingScore;
    maxScore += 20;

    // 3️⃣ Era Match (15 points max) — reduced from 20
    const eraScore = calculateEraScore(movie, userPreferences.era);
    score += eraScore;
    maxScore += 15;

    // 4️⃣ 💎 Hidden Gem Bonus (15 points max) — NEW
    const gemScore = calculateHiddenGemScore(movie);
    score += gemScore;
    maxScore += 15;

    // 5️⃣ Popularity (5 points max) — reduced from 10
    const popularityScore = calculatePopularityScore(movie);
    score += popularityScore;
    maxScore += 5;

    // 6️⃣ Trust Score (5 points max) — reduced from 10
    const trustScore = calculateTrustScore(movie);
    score += trustScore;
    maxScore += 5;

    const percentage = Math.round((score / maxScore) * 100);

    return {
        ...movie,
        matchScore: percentage,
        isHiddenGem: gemScore >= 12,
        scoreBreakdown: {
            genre: genreScore,
            rating: ratingScore,
            era: eraScore,
            hiddenGem: gemScore,
            popularity: popularityScore,
            trust: trustScore
        }
    };
}

// 🎭 Genre matching
function calculateGenreScore(movie, preferredGenres) {
    if (!preferredGenres || preferredGenres.length === 0) return 20;

    const preferredIds = preferredGenres
        .map(g => GENRE_MAP[g.toLowerCase()])
        .filter(id => id !== undefined);

    const movieGenreIds = movie.genre_ids || movie.genreIds || [];
    const matches = movieGenreIds.filter(id => preferredIds.includes(id)).length;
    const matchRatio = matches / preferredIds.length;

    return Math.round(matchRatio * 40);
}

// ⭐ Rating scoring
function calculateRatingScore(movie, minRating) {
    minRating = minRating || 6;
    const rating = movie.vote_average || movie.rating || 0;

    if (rating >= 8.5) return 20;
    if (rating >= 8.0) return 18;
    if (rating >= 7.5) return 15;
    if (rating >= 7.0) return 12;
    if (rating >= minRating) return 8;
    if (rating >= 5) return 4;
    return 0;
}

// 📅 Era preference
function calculateEraScore(movie, preferredEra) {
    if (!preferredEra || preferredEra === 'any') return 8;

    const releaseDate = movie.release_date || movie.releaseDate;
    if (!releaseDate) return 4;

    const year = parseInt(releaseDate.split('-')[0]);

    const eraRanges = {
        'classic': [1920, 1979],
        'retro': [1980, 1999],
        'modern': [2000, 2019],
        'recent': [2020, 2030],
    };

    const range = eraRanges[preferredEra.toLowerCase()];
    if (!range) return 8;

    if (year >= range[0] && year <= range[1]) return 15;
    if (Math.abs(year - range[0]) <= 5 || Math.abs(year - range[1]) <= 5) return 8;
    return 3;
}

// 💎 Hidden Gem Bonus — NEW
function calculateHiddenGemScore(movie) {
    const rating = movie.vote_average || movie.rating || 0;
    const voteCount = movie.vote_count || movie.voteCount || 0;
    const popularity = movie.popularity || 0;

    let gemScore = 0;

    // High rating + low vote count = hidden gem
    if (rating >= 7.5 && voteCount <= 1000) gemScore += 6;
    if (rating >= 7.0 && voteCount <= 500) gemScore += 4;

    // High rating + low popularity = underrated
    if (rating >= 7.0 && popularity < 20) gemScore += 3;

    // International film bonus
    const language = movie.original_language || '';
    if (language !== 'en' && rating >= 7.0) gemScore += 2;

    return Math.min(gemScore, 15);
}

// 🔥 Popularity — now lower weight
function calculatePopularityScore(movie) {
    const popularity = movie.popularity || 0;

    if (popularity >= 100) return 5;
    if (popularity >= 50) return 4;
    if (popularity >= 20) return 3;
    return 2;
}

// 🛡️ Trust score
function calculateTrustScore(movie) {
    const voteCount = movie.vote_count || movie.voteCount || 0;

    if (voteCount >= 5000) return 5;
    if (voteCount >= 1000) return 4;
    if (voteCount >= 500) return 3;
    if (voteCount >= 100) return 2;
    return 1;
}

// 🎯 Score and sort
function scoreAndRankMovies(movies, userPreferences, limit) {
    limit = limit || 10;
    const scoredMovies = movies.map(movie => scoreMovie(movie, userPreferences));
    scoredMovies.sort((a, b) => b.matchScore - a.matchScore);
    return scoredMovies.slice(0, limit);
}

module.exports = {
    scoreMovie,
    scoreAndRankMovies
};