// ===========================
// 🎬 Movies Route
// ===========================

const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');

// GET /api/movies — Get popular movies
router.get('/', async (req, res) => {
    try {
        const movies = await tmdbService.getPopularMovies();
        const formatted = movies.map(m => tmdbService.formatMovie(m));

        res.json({
            message: '🎬 Popular movies!',
            count: formatted.length,
            movies: formatted
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch movies',
            error: error.message
        });
    }
});

// GET /api/movies/search?q=batman — Search movies
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ 
                message: 'Please provide a search query (?q=...)' 
            });
        }

        const movies = await tmdbService.searchMovies(q);
        const formatted = movies.map(m => tmdbService.formatMovie(m));

        res.json({
            message: `🔍 Search results for "${q}"`,
            query: q,
            count: formatted.length,
            movies: formatted
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Search failed',
            error: error.message
        });
    }
});

// GET /api/movies/genre/:genreName — Get movies by genre
router.get('/genre/:genreName', async (req, res) => {
    try {
        const { genreName } = req.params;
        const movies = await tmdbService.getMoviesByGenre(genreName);
        const formatted = movies.map(m => tmdbService.formatMovie(m));

        res.json({
            message: `🎬 ${genreName} movies!`,
            genre: genreName,
            count: formatted.length,
            movies: formatted
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch movies',
            error: error.message
        });
    }
});

module.exports = router;