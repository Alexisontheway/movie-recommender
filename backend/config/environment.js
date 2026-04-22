// ===========================
// 🔧 Environment Configuration
// ===========================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    port: process.env.PORT || 5000,
    tmdb: {
        apiKey: process.env.TMDB_API_KEY,
        baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
    }
};

// Check if API key exists
if (!config.tmdb.apiKey) {
    console.error('❌ TMDB_API_KEY is missing in .env file!');
    console.error('   Make sure backend/.env has: TMDB_API_KEY=your_key_here');
    process.exit(1);
}

console.log('✅ Config loaded! API Key found.');

module.exports = config;