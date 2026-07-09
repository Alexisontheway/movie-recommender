// ===========================
// 🧠 ML Service Client v2.0 — Dynamic Engine
// Sends candidate pools to the real-time TF-IDF engine
// ===========================

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

class MLService {

    /**
     * Health check — pings the ML service root endpoint.
     * Returns an object with status details or null if offline.
     */
    async getStatus() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`${ML_SERVICE_URL}/`, {
                signal: controller.signal
            });

            clearTimeout(timeout);
            if (!response.ok) return null;

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('ML Service health check failed:', error.message);
            return null;
        }
    }

    /**
     * Check if the ML service is reachable.
     */
    async isAvailable() {
        const status = await this.getStatus();
        return status !== null;
    }

    /**
     * Send a source movie + candidate pool to the dynamic ML engine.
     * 
     * @param {Object} sourceMovie - Source movie metadata
     * @param {Object[]} candidates - Array of candidate movie metadata objects
     * @param {number} count - Number of results to return
     * @returns {Object|null} ML recommendations or null on failure
     */
    async getDynamicRecommendations(sourceMovie, candidates, count = 15) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const payload = {
                source: {
                    id: sourceMovie.id || null,
                    title: sourceMovie.title || '',
                    genres: sourceMovie.genres || '',
                    keywords: sourceMovie.keywords || '',
                    cast: sourceMovie.cast || '',
                    director: sourceMovie.director || '',
                    overview: sourceMovie.overview || '',
                    vote_average: sourceMovie.vote_average || 0,
                    popularity: sourceMovie.popularity || 0,
                },
                candidates: candidates.map(c => ({
                    id: c.id || null,
                    title: c.title || '',
                    genres: c.genres || '',
                    keywords: c.keywords || '',
                    cast: c.cast || '',
                    director: c.director || '',
                    overview: c.overview || '',
                    vote_average: c.vote_average || 0,
                    popularity: c.popularity || 0,
                })),
                count: count,
            };

            const response = await fetch(`${ML_SERVICE_URL}/recommend/dynamic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeout);
            if (!response.ok) return null;

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('ML Dynamic request failed:', error.message);
            return null;
        }
    }
}

module.exports = new MLService();