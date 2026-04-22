const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.TMDB_API_KEY;
console.log('🔑 Using API Key:', API_KEY ? API_KEY.substring(0, 5) + '...' : 'MISSING!');

async function test() {
    try {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
        console.log('🌐 Fetching from TMDB...');
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('✅ SUCCESS! Got', response.data.results.length, 'movies');
        console.log('🎬 First movie:', response.data.results[0].title);
    } catch (error) {
        console.log('❌ FAILED!');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

test();