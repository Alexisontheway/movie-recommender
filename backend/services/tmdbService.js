// ===========================
// 🎬 TMDB Service - Fetches Movie Data
// ===========================

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create axios instance with timeout
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

// 🔄 Helper function with retry
async function fetchWithRetry(url, params = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await tmdbApi.get(url, { params });
            return response.data;
        } catch (error) {
            console.log(`⚠️ Attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) throw error;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// 1️⃣ Get popular movies
async function getPopularMovies(page = 1) {
    const data = await fetchWithRetry('/movie/popular', { page });
    return data.results;
}

// 2️⃣ Search movies by genre
async function getMoviesByGenre(genreName, page = 1) {
    const genreId = GENRE_MAP[genreName.toLowerCase()];
    if (!genreId) {
        throw new Error(`Unknown genre: ${genreName}`);
    }

    const data = await fetchWithRetry('/discover/movie', {
        with_genres: genreId,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        page
    });
    return data.results;
}

// 3️⃣ Search movies by multiple genres
async function getMoviesByMultipleGenres(genreNames, page = 1) {
    const genreIds = genreNames
        .map(name => GENRE_MAP[name.toLowerCase()])
        .filter(id => id !== undefined);

    if (genreIds.length === 0) {
        throw new Error('No valid genres provided');
    }

    const data = await fetchWithRetry('/discover/movie', {
        with_genres: genreIds.join(','),
        sort_by: 'vote_average.desc',
        'vote_count.gte': 50,
        page
    });
    return data.results;
}

// 4️⃣ Get movie details
async function getMovieDetails(movieId) {
    const data = await fetchWithRetry(`/movie/${movieId}`, {
        append_to_response: 'credits,keywords,watch/providers'
    });
    return data;
}

// 5️⃣ Search movies by keyword
async function searchMovies(query) {
    const data = await fetchWithRetry('/search/movie', { query });
    return data.results;
}

// 6️⃣ Get top rated movies
async function getTopRatedMovies(page = 1) {
    const data = await fetchWithRetry('/movie/top_rated', { page });
    return data.results;
}

// 7️⃣ Format movie data
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
        voteCount: movie.vote_count
    };
}

module.exports = {
    getPopularMovies,
    getMoviesByGenre,
    getMoviesByMultipleGenres,
    getMovieDetails,
    searchMovies,
    getTopRatedMovies,
    formatMovie,
    GENRE_MAP
};