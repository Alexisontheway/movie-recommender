// Request-timing logging for the recommendation endpoint (backlog T0-1).
//
// Logs every request's duration and periodically reports a rolling p50/p95 so
// percentiles are visible while the server runs. The per-request lines are the
// durable record for computing p50/p95 over a few days of traffic; the rolling
// in-memory window is just a near-real-time view and intentionally resets on
// process restart.

const ROLLING_WINDOW = 200;  // keep the last N durations in memory
const SUMMARY_EVERY = 50;    // log a percentile summary every N requests

const recentDurations = [];
let totalRequests = 0;

// Nearest-rank percentile computation, exported for tests.
// Returns an object like { p50: 3, p95: 100 } (keys built from `percentiles`),
// with null values when `values` is empty.
function computePercentiles(values, percentiles) {
    const result = {};
    for (const p of percentiles) result['p' + p] = null;

    if (!Array.isArray(values) || values.length === 0) return result;

    const sorted = [...values].sort((a, b) => a - b);
    for (const p of percentiles) {
        const rank = Math.min(
            sorted.length - 1,
            Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)
        );
        result['p' + p] = sorted[rank];
    }
    return result;
}

// Measures each request and logs duration on response finish.
function timingMiddleware(req, res, next) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

        recentDurations.push(durationMs);
        if (recentDurations.length > ROLLING_WINDOW) recentDurations.shift();
        totalRequests += 1;

        console.log(`⏱ [timing] ${req.method} ${req.originalUrl} → ${res.statusCode} in ${durationMs.toFixed(1)}ms`);

        if (totalRequests % SUMMARY_EVERY === 0) {
            const stats = computePercentiles(recentDurations, [50, 95]);
            console.log(`⏱ [timing] summary: last ${recentDurations.length} reqs, total ${totalRequests} — p50: ${stats.p50}ms, p95: ${stats.p95}ms`);
        }
    });

    next();
}

module.exports = { timingMiddleware, computePercentiles };
