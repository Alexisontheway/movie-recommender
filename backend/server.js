// ===========================
// 🎬 Movie Recommender Server
// ===========================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔑 TMDB Key loaded:', process.env.TMDB_API_KEY ? 'YES ✅' : 'NO ❌');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const healthRoutes = require('./routes/health');
const movieRoutes = require('./routes/movies');
const recommendationRoutes = require('./routes/recommendations');
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
const favoritesRoutes = require('./routes/favorites');
const ratingsRoutes = require('./routes/ratings');

// Use routes
app.use('/api/health', healthRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ratings', ratingsRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: '🎬 Movie Recommender API is running!',
        version: '2.1.0',
        endpoints: {
            health: '/api/health',
            movies: '/api/movies',
            recommendations: '/api/recommendations/generate',
            auth: '/api/auth/signup | /api/auth/login | /api/auth/me',
            discover: '/api/recommendations/ml/hybrid/:movieId',
            watchlist: '/api/watchlist',
            favorites: '/api/favorites',
            ratings: '/api/ratings'
        }
    });
});

// Start
app.listen(PORT, () => {
    console.log(`🎬 Server is running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`🔖 Watchlist: http://localhost:${PORT}/api/watchlist`);
    console.log(`❤️  Favorites: http://localhost:${PORT}/api/favorites`);
    console.log(`⭐ Ratings: http://localhost:${PORT}/api/ratings`);
});