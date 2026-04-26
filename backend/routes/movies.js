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
        res.json({ message: '🎬 Popular movies!', count: formatted.length, movies: formatted });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch movies', error: error.message });
    }
});

// GET /api/movies/search?q=batman — Search movies
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Please provide a search query (?q=...)' });
        const movies = await tmdbService.searchMovies(q);
        const formatted = movies.map(m => tmdbService.formatMovie(m));
        res.json({ message: `🔍 Search results for "${q}"`, query: q, count: formatted.length, movies: formatted });
    } catch (error) {
        res.status(500).json({ message: '❌ Search failed', error: error.message });
    }
});

// GET /api/movies/genre/:genreName — Get movies by genre
router.get('/genre/:genreName', async (req, res) => {
    try {
        const { genreName } = req.params;
        const movies = await tmdbService.getMoviesByGenre(genreName);
        const formatted = movies.map(m => tmdbService.formatMovie(m));
        res.json({ message: `🎬 ${genreName} movies!`, genre: genreName, count: formatted.length, movies: formatted });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch movies', error: error.message });
    }
});

// GET /api/movies/:id — Full movie details (NEW)
router.get('/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const details = await tmdbService.getMovieDetails(movieId);

        if (!details) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        // Extract trailer
        let trailer = null;
        if (details.videos && details.videos.results) {
            const yt = details.videos.results.find(
                v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
            );
            if (yt) trailer = { key: yt.key, name: yt.name, url: `https://www.youtube.com/watch?v=${yt.key}` };
        }

        // Extract cast (top 12)
        let cast = [];
        if (details.credits && details.credits.cast) {
            cast = details.credits.cast.slice(0, 12).map(c => ({
                id: c.id,
                name: c.name,
                character: c.character,
                photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
            }));
        }

        // Extract director
        let director = null;
        if (details.credits && details.credits.crew) {
            const d = details.credits.crew.find(c => c.job === 'Director');
            if (d) director = { id: d.id, name: d.name, photo: d.profile_path ? `https://image.tmdb.org/t/p/w185${d.profile_path}` : null };
        }

        // Extract similar movies
        let similar = [];
        if (details.similar && details.similar.results) {
            similar = details.similar.results
                .filter(m => m.poster_path && m.vote_average > 0)
                .slice(0, 8)
                .map(m => tmdbService.formatMovie(m));
        }

        // Watch providers (US)
        let watchProviders = null;
        if (details['watch/providers'] && details['watch/providers'].results) {
            const wpData = details['watch/providers'].results.US || details['watch/providers'].results.IN || null;
            if (wpData) {
                watchProviders = {
                    link: wpData.link || null,
                    flatrate: wpData.flatrate || null,
                    rent: wpData.rent || null,
                    buy: wpData.buy || null
                };
            }
        }

        const movie = {
            id: details.id,
            title: details.title,
            tagline: details.tagline || null,
            overview: details.overview,
            rating: details.vote_average,
            voteCount: details.vote_count,
            releaseDate: details.release_date,
            year: details.release_date ? details.release_date.split('-')[0] : 'N/A',
            runtime: details.runtime,
            budget: details.budget,
            revenue: details.revenue,
            status: details.status,
            originalLanguage: details.original_language,
            poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null,
            genres: details.genres || [],
            genreIds: details.genres ? details.genres.map(g => g.id) : [],
            trailer,
            cast,
            director,
            similar,
            watchProviders,
            popularity: details.popularity
        };

        res.json({ success: true, movie });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch movie details', error: error.message });
    }
});

module.exports = router;