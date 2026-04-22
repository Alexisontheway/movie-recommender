// ===========================
// 🎯 Recommendations Route - Enhanced
// ===========================

const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const scoringService = require('../services/scoringService');
const userProfileService = require('../services/userProfileService');

// POST /api/recommendations/generate
router.post('/generate', async (req, res) => {
    try {
        const quizAnswers = req.body;
        console.log('\n📝 Quiz answers received:', quizAnswers);

        // Step 1: Build user profile
        const userProfile = userProfileService.buildUserProfile(quizAnswers);
        console.log('👤 User profile built');

        // Step 2: Get expanded genres
        const expandedGenres = userProfileService.getExpandedGenres(quizAnswers);
        console.log('🎭 Expanded genres:', expandedGenres);

        // Step 3: Fetch movies from multiple sources
        let allMovies = [];

        // Source 1: Genre matched movies
        if (expandedGenres.length > 0) {
            try {
                const genreMovies = await tmdbService.getMoviesByMultipleGenres(expandedGenres, 3);
                allMovies = [...allMovies, ...genreMovies];
            } catch (err) {
                console.log('⚠️ Genre fetch failed');
            }
            await tmdbService.delay(800);
        }

        // Source 2: Hidden gems
        try {
            const hiddenGems = await tmdbService.getHiddenGems(2);
            allMovies = [...allMovies, ...hiddenGems];
        } catch (err) {
            console.log('⚠️ Hidden gems fetch failed');
        }
        await tmdbService.delay(800);

        // Source 3: Underrated classics
        try {
            const classics = await tmdbService.getUnderratedClassics(2);
            allMovies = [...allMovies, ...classics];
        } catch (err) {
            console.log('⚠️ Classics fetch failed');
        }
        await tmdbService.delay(800);

        // Source 4: International cinema
                // Source 4: International cinema
        let languages = ['korean', 'japanese', 'french', 'spanish'];
        
        // If user has language preference, prioritize it
        if (userProfile.language && userProfile.language !== 'any' && userProfile.language !== 'en') {
            languages = [userProfile.language, ...languages.filter(l => l !== userProfile.language)];
        }

        // Source 5: Trending
        // Source: Similar to favorite movie
        if (userProfile.favoriteMovie && userProfile.favoriteMovie.id) {
            try {
                console.log(`❤️ Fetching movies similar to: ${userProfile.favoriteMovie.title}`);
                const similarMovies = await tmdbService.getSimilarMovies(userProfile.favoriteMovie.id);
                allMovies = [...allMovies, ...similarMovies];
                console.log(`   ✅ Got ${similarMovies.length} similar movies`);
            } catch (err) {
                console.log('⚠️ Similar movies fetch failed');
            }
            await tmdbService.delay(800);
        }

        // Source 6: Popular + Top rated
        try {
            const popular = await tmdbService.getPopularMovies(2);
            allMovies = [...allMovies, ...popular];
        } catch (err) {
            console.log('⚠️ Popular fetch failed');
        }
        await tmdbService.delay(800);

        try {
            const topRated = await tmdbService.getTopRatedMovies(2);
            allMovies = [...allMovies, ...topRated];
        } catch (err) {
            console.log('⚠️ Top rated fetch failed');
        }

        // Remove duplicates
        // Remove duplicates AND filter out bad data
        const uniqueMovies = allMovies
            .filter((movie, index, self) =>
                index === self.findIndex(m => m.id === movie.id)
            )
            .filter(movie => {
                // Remove movies with no rating
                if (!movie.vote_average || movie.vote_average === 0) return false;
                // Remove movies with no overview
                if (!movie.overview || movie.overview.length < 20) return false;
                // Remove movies with no poster
                if (!movie.poster_path) return false;
                return true;
            });

        console.log(`\n🎬 Total unique movies: ${uniqueMovies.length}`);

        if (uniqueMovies.length === 0) {
            return res.json({
                success: false,
                message: '❌ Could not fetch movies. Please try again.',
                recommendations: []
            });
        }

        // Score and rank — return top 20 instead of 10
        const recommendations = scoringService.scoreAndRankMovies(
            uniqueMovies,
            userProfile,
            20
        );

        // Format
        const formattedRecommendations = recommendations.map((movie, index) => {
            const formatted = tmdbService.formatMovie(movie);
            formatted.matchScore = movie.matchScore;
            formatted.isHiddenGem = movie.isHiddenGem;
            formatted.rank = index + 1;
            return formatted;
        });

        const hiddenGemCount = formattedRecommendations.filter(m => m.isHiddenGem).length;

        console.log(`✅ Sending ${formattedRecommendations.length} recommendations`);
        console.log(`💎 ${hiddenGemCount} hidden gems included\n`);

        res.json({
            success: true,
            message: '🎯 Here are your personalized recommendations!',
            count: formattedRecommendations.length,
            hiddenGems: hiddenGemCount,
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