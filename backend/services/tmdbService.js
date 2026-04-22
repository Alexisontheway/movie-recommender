// ===========================
// 🎬 TMDB Service - Expanded Edition
// ===========================

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const tmdbApi = axios.create({
    baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    timeout: 15000,
    params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US'
    },
    headers: {
        'Accept': 'application/json'
    }
});

console.log('🔑 TMDB API Key loaded:', process.env.TMDB_API_KEY ? 'YES ✅' : 'NO ❌');

// 🎭 TMDB Genre IDs
const GENRE_MAP = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'history': 36,
    'horror': 27,
    'music': 10402,
    'mystery': 9648,
    'romance': 10749,
    'science fiction': 878,
    'sci-fi': 878,
    'thriller': 53,
    'war': 10752,
    'western': 37
};

// Helper: wait between API calls
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 🔄 Fetch with retry
async function fetchWithRetry(url, params = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await tmdbApi.get(url, { params });
            return response.data;
        } catch (error) {
            console.log(`⚠️ Attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) throw error;
            await delay(1000 * (i + 1));
        }
    }
}

// 🔄 Fetch multiple pages
async function fetchMultiplePages(url, params = {}, pages = 3) {
    let allResults = [];

    for (let page = 1; page <= pages; page++) {
        try {
            const data = await fetchWithRetry(url, { ...params, page });
            allResults = [...allResults, ...data.results];
            console.log(`   📄 Page ${page}: got ${data.results.length} movies`);
            if (page < pages) await delay(800);
        } catch (err) {
            console.log(`   ⚠️ Page ${page} failed, continuing...`);
        }
    }

    return allResults;
}

// 1️⃣ Get popular movies (multiple pages)
async function getPopularMovies(pages = 3) {
    console.log('🔥 Fetching popular movies...');
    return await fetchMultiplePages('/movie/popular', {}, pages);
}

// 2️⃣ Get top rated movies (multiple pages)
async function getTopRatedMovies(pages = 3) {
    console.log('⭐ Fetching top rated movies...');
    return await fetchMultiplePages('/movie/top_rated', {}, pages);
}

// 3️⃣ Get movies by genre (multiple pages)
async function getMoviesByGenre(genreName, pages = 2) {
    const genreId = GENRE_MAP[genreName.toLowerCase()];
    if (!genreId) throw new Error(`Unknown genre: ${genreName}`);

    console.log(`🎭 Fetching ${genreName} movies...`);
    return await fetchMultiplePages('/discover/movie', {
        with_genres: genreId,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 50,
    }, pages);
}

// 4️⃣ Get movies by multiple genres
async function getMoviesByMultipleGenres(genreNames, pages = 2) {
    const genreIds = genreNames
        .map(name => GENRE_MAP[name.toLowerCase()])
        .filter(id => id !== undefined);

    if (genreIds.length === 0) throw new Error('No valid genres provided');

    console.log(`🎭 Fetching multi-genre movies...`);
    return await fetchMultiplePages('/discover/movie', {
        with_genres: genreIds.join(','),
        sort_by: 'vote_average.desc',
        'vote_count.gte': 50,
    }, pages);
}

// 5️⃣ 🌟 NEW: Get hidden gems (high rating, low popularity)
async function getHiddenGems(pages = 3) {
    console.log('💎 Fetching hidden gems...');
    return await fetchMultiplePages('/discover/movie', {
        sort_by: 'vote_average.desc',
        'vote_count.gte': 50,
        'vote_count.lte': 1000,
        'vote_average.gte': 7.0,
    }, pages);
}

// 6️⃣ 🌟 NEW: Get underrated classics
async function getUnderratedClassics(pages = 2) {
    console.log('🏛️ Fetching underrated classics...');
    return await fetchMultiplePages('/discover/movie', {
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        'vote_count.lte': 2000,
        'vote_average.gte': 7.5,
        'release_date.lte': '2010-12-31',
    }, pages);
}

// 7️⃣ 🌟 NEW: Get international cinema
async function getInternationalCinema(language, pages = 2) {
    const langMap = {
        'korean': 'ko',
        'japanese': 'ja',
        'french': 'fr',
        'spanish': 'es',
        'indian': 'hi',
        'german': 'de',
        'italian': 'it',
        'chinese': 'zh',
    };

    const langCode = langMap[language.toLowerCase()] || language;
    console.log(`🌍 Fetching ${language} cinema...`);

    return await fetchMultiplePages('/discover/movie', {
        with_original_language: langCode,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 50,
        'vote_average.gte': 7.0,
    }, pages);
}

// 8️⃣ 🌟 NEW: Get trending movies this week
async function getTrendingMovies() {
    console.log('📈 Fetching trending movies...');
    const data = await fetchWithRetry('/trending/movie/week');
    return data.results;
}

// 9️⃣ Search movies
async function searchMovies(query) {
    const data = await fetchWithRetry('/search/movie', { query });
    return data.results;
}

// 🔟 Get movie details
async function getMovieDetails(movieId) {
    const data = await fetchWithRetry(`/movie/${movieId}`, {
        append_to_response: 'credits,keywords,watch/providers,similar'
    });
    return data;
}

// 1️⃣1️⃣ 🌟 NEW: Get similar movies
async function getSimilarMovies(movieId) {
    const data = await fetchWithRetry(`/movie/${movieId}/similar`);
    return data.results;
}

// Format movie data
function formatMovie(movie) {
    return {
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average,
        releaseDate: movie.release_date,
        year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
        overview: movie.overview,
        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        backdrop: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
        genreIds: movie.genre_ids || [],
        popularity: movie.popularity,
        voteCount: movie.vote_count,
        originalLanguage: movie.original_language
    };
}

module.exports = {
    getPopularMovies,
    getTopRatedMovies,
    getMoviesByGenre,
    getMoviesByMultipleGenres,
    getHiddenGems,
    getUnderratedClassics,
    getInternationalCinema,
    getTrendingMovies,
    searchMovies,
    getMovieDetails,
    getSimilarMovies,
    fetchMultiplePages,
    formatMovie,
    GENRE_MAP,
    delay
};