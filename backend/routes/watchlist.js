const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// GET — Get user's watchlist
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM watchlist WHERE user_id = \$1 ORDER BY added_at DESC',
            [req.user.id]
        );
        res.json({ success: true, count: result.rows.length, watchlist: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get watchlist' });
    }
});

// POST — Add movie to watchlist
router.post('/add', requireAuth, async (req, res) => {
    try {
        const { movie_id, movie_title, movie_poster, movie_rating, movie_year } = req.body;

        if (!movie_id || !movie_title) {
            return res.status(400).json({ success: false, message: 'Movie ID and title are required' });
        }

        // Check if already in watchlist
        const existing = await pool.query(
            'SELECT id FROM watchlist WHERE user_id = \$1 AND movie_id = \$2',
            [req.user.id, movie_id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Movie already in watchlist' });
        }

        const result = await pool.query(
            `INSERT INTO watchlist (user_id, movie_id, movie_title, movie_poster, movie_rating, movie_year)
             VALUES (\$1, \$2, \$3, \$4, \$5, \$6)
             RETURNING *`,
            [req.user.id, movie_id, movie_title, movie_poster || null, movie_rating || null, movie_year || null]
        );

        res.status(201).json({ success: true, message: 'Added to watchlist', item: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add to watchlist' });
    }
});

// DELETE — Remove from watchlist
router.delete('/remove/:movieId', requireAuth, async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const result = await pool.query(
            'DELETE FROM watchlist WHERE user_id = \$1 AND movie_id = \$2 RETURNING *',
            [req.user.id, movieId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Movie not found in watchlist' });
        }

        res.json({ success: true, message: 'Removed from watchlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove from watchlist' });
    }
});

module.exports = router;