const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// GET — Get user's ratings
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_ratings WHERE user_id = \$1 ORDER BY rated_at DESC',
            [req.user.id]
        );
        res.json({ success: true, count: result.rows.length, ratings: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get ratings' });
    }
});

// POST — Rate a movie (1-5 stars), upsert
router.post('/rate', requireAuth, async (req, res) => {
    try {
        const { movie_id, rating, review } = req.body;

        if (!movie_id || !rating) {
            return res.status(400).json({ success: false, message: 'Movie ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Check if already rated
        const existing = await pool.query(
            'SELECT id FROM user_ratings WHERE user_id = \$1 AND movie_id = \$2',
            [req.user.id, movie_id]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing rating
            result = await pool.query(
                `UPDATE user_ratings SET rating = \$1, review = \$2, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = \$3 AND movie_id = \$4 RETURNING *`,
                [rating, review || null, req.user.id, movie_id]
            );
            res.json({ success: true, message: 'Rating updated', item: result.rows[0] });
        } else {
            // Create new rating
            result = await pool.query(
                `INSERT INTO user_ratings (user_id, movie_id, rating, review)
                 VALUES (\$1, \$2, \$3, \$4) RETURNING *`,
                [req.user.id, movie_id, rating, review || null]
            );
            res.status(201).json({ success: true, message: 'Movie rated', item: result.rows[0] });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to rate movie' });
    }
});

// DELETE — Remove rating
router.delete('/remove/:movieId', requireAuth, async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const result = await pool.query(
            'DELETE FROM user_ratings WHERE user_id = \$1 AND movie_id = \$2 RETURNING *',
            [req.user.id, movieId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Rating not found' });
        }

        res.json({ success: true, message: 'Rating removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove rating' });
    }
});

module.exports = router;