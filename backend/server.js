 // ===========================
// 🎬 Movie Recommender Server
// ===========================

// 1. Import packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 2. Load environment variables from .env file
dotenv.config();

console.log('🔑 TMDB Key loaded:', process.env.TMDB_API_KEY ? 'YES ✅' : 'NO ❌');

// 3. Create the Express app
const app = express();

// 4. Set the port (use .env value or default 5000)
const PORT = process.env.PORT || 5000;

// 5. Middleware (security guards)
app.use(cors());              // Allow frontend to talk to backend
app.use(express.json());      // Parse JSON request bodies

// 6. Import routes (doors into the kitchen)
const healthRoutes = require('./routes/health');
const movieRoutes = require('./routes/movies');
const recommendationRoutes = require('./routes/recommendations');

// 7. Use routes
app.use('/api/health', healthRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 8. Home route (just to test)
app.get('/', (req, res) => {
    res.json({
        message: '🎬 Movie Recommender API is running!',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            movies: '/api/movies',
            recommendations: '/api/recommendations/generate'
        }
    });
});

// 9. Start the server
app.listen(PORT, () => {
    console.log(`🎬 Server is running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
