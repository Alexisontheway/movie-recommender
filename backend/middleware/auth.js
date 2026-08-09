const jwt = require('jsonwebtoken');

// JWT signing secret. Required in production — there is deliberately NO
// committed fallback: the old hardcoded fallback was public in this repo, so
// anyone who knew it could forge a token for any user. In development only,
// an insecure fallback is allowed so local runs work without env setup, and
// it logs a loud warning so it can't be missed.
function loadJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (secret) return secret;

    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }

    console.warn('⚠️  JWT_SECRET not set — using an insecure development-only secret. Set JWT_SECRET in any real deployment.');
    return 'movie-recommender-dev-only-secret';
}

const JWT_SECRET = loadJwtSecret();

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