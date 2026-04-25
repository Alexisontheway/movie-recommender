const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// GET — Get user's favorites
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM favorites WHERE user_id = \$1 ORDER BY added_at DESC',
            [req.user.id]
        );
        res.json({ success: true, count: result.rows.length, favorites: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get favorites' });
    }
});

// POST — Add to favorites
router.post('/add', requireAuth, async (req, res) => {
    try {
        const { movie_id, movie_title, movie_poster, movie_rating, movie_year } = req.body;

        if (!movie_id || !movie_title) {
            return res.status(400).json({ success: false, message: 'Movie ID and title are required' });
        }

        const existing = await pool.query(
            'SELECT id FROM favorites WHERE user_id = \$1 AND movie_id = \$2',
            [req.user.id, movie_id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Movie already in favorites' });
        }

        const result = await pool.query(
            `INSERT INTO favorites (user_id, movie_id, movie_title, movie_poster, movie_rating, movie_year)
             VALUES (\$1, \$2, \$3, \$4, \$5, \$6)
             RETURNING *`,
            [req.user.id, movie_id, movie_title, movie_poster || null, movie_rating || null, movie_year || null]
        );

        res.status(201).json({ success: true, message: 'Added to favorites', item: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add to favorites' });
    }
});

// DELETE — Remove from favorites
router.delete('/remove/:movieId', requireAuth, async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const result = await pool.query(
            'DELETE FROM favorites WHERE user_id = \$1 AND movie_id = \$2 RETURNING *',
            [req.user.id, movieId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Movie not found in favorites' });
        }

        res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove from favorites' });
    }
});

module.exports = router;