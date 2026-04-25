 const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'rishu001',
    host: 'localhost',
    port: 5433,
    database: 'movie_recommender'
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected at:', res.rows[0].now);
    }
});

module.exports = pool;
