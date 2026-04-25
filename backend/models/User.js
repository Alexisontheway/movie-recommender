 const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {

    // Create a new user
    static async create(username, email, password) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES (\$1, \$2, \$3)
            RETURNING id, username, email, created_at
        `;

        const result = await pool.query(query, [username, email, passwordHash]);
        return result.rows[0];
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = \$1';
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    // Find user by id
    static async findById(id) {
        const query = 'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = \$1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    // Find user by username
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = \$1';
        const result = await pool.query(query, [username]);
        return result.rows[0] || null;
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update profile
    static async updateProfile(id, updates) {
        const fields = [];
        const values = [];
        let counter = 1;

        if (updates.username) {
            fields.push(`username = 
$$
{counter}`);
            values.push(updates.username);
            counter++;
        }
        if (updates.email) {
            fields.push(`email =
$$
{counter}`);
            values.push(updates.email);
            counter++;
        }
        if (updates.avatar_url) {
            fields.push(`avatar_url = 
$$
{counter}`);
            values.push(updates.avatar_url);
            counter++;
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE users SET ${fields.join(', ')}
            WHERE id =
$$
{counter}
            RETURNING id, username, email, avatar_url, updated_at
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get user stats
    static async getStats(userId) {
        const watchlistCount = await pool.query(
            'SELECT COUNT(*) FROM watchlist WHERE user_id = \$1', [userId]
        );
        const favoritesCount = await pool.query(
            'SELECT COUNT(*) FROM favorites WHERE user_id = \$1', [userId]
        );
        const ratingsCount = await pool.query(
            'SELECT COUNT(*) FROM user_ratings WHERE user_id = \$1', [userId]
        );
        const quizCount = await pool.query(
            'SELECT COUNT(*) FROM quiz_history WHERE user_id = \$1', [userId]
        );

        return {
            watchlist: parseInt(watchlistCount.rows[0].count),
            favorites: parseInt(favoritesCount.rows[0].count),
            ratings: parseInt(ratingsCount.rows[0].count),
            quizzes: parseInt(quizCount.rows[0].count)
        };
    }
}

module.exports = User;
