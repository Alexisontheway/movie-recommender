// ===========================
// 🎯 Scoring Service
// ===========================

const { GENRE_MAP } = require('./tmdbService');

function scoreMovie(movie, userPreferences) {
    let score = 0;
    let maxScore = 0;

    const genreScore = calculateGenreScore(movie, userPreferences.genres);
    score += genreScore;
    maxScore += 40;

    const ratingScore = calculateRatingScore(movie, userPreferences.minRating);
    score += ratingScore;
    maxScore += 20;

    const eraScore = calculateEraScore(movie, userPreferences.era);
    score += eraScore;
    maxScore += 20;

    const popularityScore = calculatePopularityScore(movie);
    score += popularityScore;
    maxScore += 10;

    const trustScore = calculateTrustScore(movie);
    score += trustScore;
    maxScore += 10;

    const percentage = Math.round((score / maxScore) * 100);

    return {
        ...movie,
        matchScore: percentage,
        scoreBreakdown: {
            genre: genreScore,
            rating: ratingScore,
            era: eraScore,
            popularity: popularityScore,
            trust: trustScore
        }
    };
}

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

function calculateRatingScore(movie, minRating) {
    minRating = minRating || 6;
    const rating = movie.vote_average || movie.rating || 0;

    if (rating >= 8) return 20;
    if (rating >= 7) return 15;
    if (rating >= minRating) return 10;
    if (rating >= 5) return 5;
    return 0;
}

function calculateEraScore(movie, preferredEra) {
    if (!preferredEra) return 10;

    const releaseDate = movie.release_date || movie.releaseDate;
    if (!releaseDate) return 5;

    const year = parseInt(releaseDate.split('-')[0]);

    const eraRanges = {
        'classic': [1920, 1979],
        'retro': [1980, 1999],
        'modern': [2000, 2019],
        'recent': [2020, 2030],
        'any': [1920, 2030]
    };

    const range = eraRanges[preferredEra.toLowerCase()] || eraRanges['any'];

    if (year >= range[0] && year <= range[1]) return 20;
    if (Math.abs(year - range[0]) <= 5 || Math.abs(year - range[1]) <= 5) return 10;
    return 5;
}

function calculatePopularityScore(movie) {
    const popularity = movie.popularity || 0;

    if (popularity >= 100) return 10;
    if (popularity >= 50) return 7;
    if (popularity >= 20) return 5;
    return 3;
}

function calculateTrustScore(movie) {
    const voteCount = movie.vote_count || movie.voteCount || 0;

    if (voteCount >= 5000) return 10;
    if (voteCount >= 1000) return 8;
    if (voteCount >= 500) return 6;
    if (voteCount >= 100) return 4;
    return 2;
}

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