// Security middleware and helpers — added during the 2026-08-09 security review.
// Small, dependency-free, in-memory implementations sized for a single
// maintainer's one-instance deploy: auth rate limiting, CORS origin
// allowlisting, basic security headers, and a URL-scheme guard for outbound
// links. No external services.

// ─── Security headers ─────────────────────────────────────────────────────────

function securityHeaders() {
    return function securityHeadersMiddleware(req, res, next) {
        res.set({
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        });
        next();
    };
}

// ─── Rate limiting (in-memory) ────────────────────────────────────────────────

class RateLimiter {
    // windowMs: reset window; max: requests allowed per window per key.
    // In-memory and per-process — resets on restart, which is acceptable for
    // a single-instance deploy; it blunts brute-force/credential-stuffing.
    constructor({ windowMs = 15 * 60 * 1000, max = 40 } = {}) {
        this.windowMs = windowMs;
        this.max = max;
        this.hits = new Map(); // key -> { count, resetAt }
    }

    check(key) {
        const now = Date.now();
        const entry = this.hits.get(key);

        if (!entry || entry.resetAt <= now) {
            this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
            return { allowed: true, remaining: this.max - 1 };
        }

        if (entry.count >= this.max) {
            return { allowed: false, remaining: 0 };
        }

        entry.count += 1;
        return { allowed: true, remaining: this.max - entry.count };
    }
}

function rateLimit({ windowMs, max, keyFn = (req) => req.ip } = {}) {
    const limiter = new RateLimiter({ windowMs, max });
    return function rateLimitMiddleware(req, res, next) {
        const { allowed, remaining } = limiter.check(keyFn(req));
        res.set('X-RateLimit-Remaining', String(Math.max(remaining, 0)));
        if (!allowed) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.'
            });
        }
        next();
    };
}

// ─── CORS origin allowlist ────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
    'https://movie-recommender-priyanshualex-2451s-projects.vercel.app',
    'https://movie-recommender.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
];

// Allow: known exact origins, any https *.vercel.app (production + previews),
// and localhost dev servers. Everything else is refused. A missing Origin
// (curl, server-to-server, same-origin) passes.
function isAllowedOrigin(origin) {
    if (!origin) return true;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    if (/^https:\/\/([a-z0-9-]+\.)+vercel\.app$/.test(origin)) return true;
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
    return false;
}

// ─── URL scheme guard ─────────────────────────────────────────────────────────

// Only http(s) links. Used to sanitize watch-provider URLs before they reach
// the client, so a poisoned value can't become a javascript:/data: sink.
function isSafeHref(url) {
    return typeof url === 'string' && /^https?:\/\/[^\s<>"']+$/i.test(url);
}

module.exports = { securityHeaders, RateLimiter, rateLimit, isAllowedOrigin, isSafeHref };
