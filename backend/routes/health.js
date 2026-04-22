const express = require('express');
const router = express.Router();

// GET /api/health
router.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: '🟢 Server is healthy!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;