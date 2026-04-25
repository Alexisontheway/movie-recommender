const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'movie-recommender-secret-key-2026';

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Middleware: Verify token (required)
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please login.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
}

// Middleware: Optional auth (doesn't block if no token)
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
}

module.exports = { generateToken, requireAuth, optionalAuth, JWT_SECRET };