const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false
});

pool.on('connect', () => {
    console.log('✅ Database connected at:', new Date().toISOString());
});

pool.on('error', (err) => {
    console.error('❌ Database error:', err.message);
});

module.exports = pool;