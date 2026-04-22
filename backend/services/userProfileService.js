 // ===========================
// 👤 User Profile Service
// ===========================

function buildUserProfile(quizAnswers) {
    return {
        genres: quizAnswers.genres || [],
        tone: quizAnswers.tone || 'any',
        era: quizAnswers.era || 'any',
        minRating: quizAnswers.minRating || 6,
        subscriptions: quizAnswers.subscriptions || [],
        complexity: quizAnswers.complexity || 'medium'
    };
}

function getToneGenres(tone) {
    const toneMap = {
        'feel-good': ['comedy', 'family', 'animation'],
        'dark': ['thriller', 'horror', 'crime'],
        'thought-provoking': ['drama', 'documentary', 'mystery'],
        'exciting': ['action', 'adventure', 'science fiction'],
        'romantic': ['romance', 'drama', 'comedy'],
        'scary': ['horror', 'thriller', 'mystery'],
        'funny': ['comedy', 'animation', 'family'],
        'epic': ['adventure', 'fantasy', 'war'],
        'any': []
    };

    return toneMap[tone.toLowerCase()] || [];
}

function getExpandedGenres(quizAnswers) {
    const userGenres = quizAnswers.genres || [];
    const toneGenres = getToneGenres(quizAnswers.tone || 'any');
    const allGenres = [...new Set([...userGenres, ...toneGenres])];
    return allGenres;
}

module.exports = {
    buildUserProfile,
    getToneGenres,
    getExpandedGenres
};
