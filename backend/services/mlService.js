// ===========================
// 🧠 ML Service Client - Hybrid Edition
// Combines ML + TMDB for best results
// ===========================

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

class MLService {

    async isAvailable() {
        try {
            const response = await fetch(`${ML_SERVICE_URL}/`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async getRecommendations(movieTitle, count = 10) {
        try {
            const encodedTitle = encodeURIComponent(movieTitle);
            const url = `${ML_SERVICE_URL}/recommend/${encodedTitle}?n=${count}`;
            const response = await fetch(url);

            if (!response.ok) return null;

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('ML Service request failed:', error.message);
            return null;
        }
    }

    async getMultipleRecommendations(movieTitles, countEach = 5) {
        const allRecs = [];

        for (const title of movieTitles) {
            const result = await this.getRecommendations(title, countEach);
            if (result && result.recommendations) {
                const tagged = result.recommendations.map(rec => ({
                    ...rec,
                    ml_source: title,
                    source: 'ml'
                }));
                allRecs.push(...tagged);
            }
        }

        const unique = {};
        for (const rec of allRecs) {
            if (!unique[rec.id] || rec.similarity_score > unique[rec.id].similarity_score) {
                unique[rec.id] = rec;
            }
        }

        return Object.values(unique).sort(
            (a, b) => b.similarity_score - a.similarity_score
        );
    }
}

module.exports = new MLService();