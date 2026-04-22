// ===========================
// 🎯 Recommendations Route
// ===========================

const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const scoringService = require('../services/scoringService');
const userProfileService = require('../services/userProfileService');

// Helper: wait between API calls to avoid ECONNRESET
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// POST /api/recommendations/generate
router.post('/generate', async (req, res) => {
    try {
        const quizAnswers = req.body;
        console.log('📝 Quiz answers received:', quizAnswers);

        // Step 1: Build user profile from quiz
        const userProfile = userProfileService.buildUserProfile(quizAnswers);
        console.log('👤 User profile built:', userProfile);

        // Step 2: Get expanded genres
        const expandedGenres = userProfileService.getExpandedGenres(quizAnswers);
        console.log('🎭 Expanded genres:', expandedGenres);

        // Step 3: Fetch movies from TMDB (one at a time to avoid ECONNRESET)
        let allMovies = [];

        // Fetch genre movies
        if (expandedGenres.length > 0) {
            try {
                console.log('🔍 Fetching genre movies...');
                const genreMovies = await tmdbService.getMoviesByMultipleGenres(expandedGenres, 1);
                allMovies = [...allMovies, ...genreMovies];
                console.log(`   ✅ Got ${genreMovies.length} genre movies`);
            } catch (err) {
                console.log('   ⚠️ Genre fetch failed, continuing...');
            }

            // Wait before next call
            await delay(1000);

            try {
                const genreMoviesPage2 = await tmdbService.getMoviesByMultipleGenres(expandedGenres, 2);
                allMovies = [...allMovies, ...genreMoviesPage2];
                console.log(`   ✅ Got ${genreMoviesPage2.length} more genre movies`);
            } catch (err) {
                console.log('   ⚠️ Genre page 2 fetch failed, continuing...');
            }
        }

        // Wait before next call
        await delay(1000);

        // Fetch popular movies
        try {
            console.log('🔍 Fetching popular movies...');
            const popularMovies = await tmdbService.getPopularMovies(1);
            allMovies = [...allMovies, ...popularMovies];
            console.log(`   ✅ Got ${popularMovies.length} popular movies`);
        } catch (err) {
            console.log('   ⚠️ Popular fetch failed, continuing...');
        }

        // Wait before next call
        await delay(1000);

        // Fetch top rated movies
        try {
            console.log('🔍 Fetching top rated movies...');
            const topRatedMovies = await tmdbService.getTopRatedMovies(1);
            allMovies = [...allMovies, ...topRatedMovies];
            console.log(`   ✅ Got ${topRatedMovies.length} top rated movies`);
        } catch (err) {
            console.log('   ⚠️ Top rated fetch failed, continuing...');
        }

        // Remove duplicates
        const uniqueMovies = allMovies.filter((movie, index, self) =>
            index === self.findIndex(m => m.id === movie.id)
        );

        console.log(`🎬 Total unique movies: ${uniqueMovies.length}`);

        // Step 4: Score and rank
        if (uniqueMovies.length === 0) {
            return res.json({
                success: false,
                message: '❌ Could not fetch movies. Please try again.',
                recommendations: []
            });
        }

        const recommendations = scoringService.scoreAndRankMovies(
            uniqueMovies,
            userProfile,
            10
        );

        // Step 5: Format for frontend
        const formattedRecommendations = recommendations.map((movie, index) => {
            const formatted = tmdbService.formatMovie(movie);
            formatted.matchScore = movie.matchScore;
            formatted.rank = index + 1;
            return formatted;
        });

        console.log('✅ Sending', formattedRecommendations.length, 'recommendations');

        res.json({
            success: true,
            message: '🎯 Here are your personalized recommendations!',
            count: formattedRecommendations.length,
            userProfile,
            recommendations: formattedRecommendations
        });

    } catch (error) {
        console.error('❌ Recommendation error:', error.message);
        res.status(500).json({
            success: false,
            message: '❌ Failed to generate recommendations',
            error: error.message
        });
    }
});

module.exports = router;