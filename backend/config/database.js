const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isProduction = process.env.DATABASE_URL && (
    process.env.DATABASE_URL.includes('neon.tech') ||
    process.env.DATABASE_URL.includes('render.com') ||
    process.env.DATABASE_URL.includes('supabase')
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('connect', () => {
    console.log('✅ Database connected at:', new Date().toISOString());
});

pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);
});

module.exports = pool;