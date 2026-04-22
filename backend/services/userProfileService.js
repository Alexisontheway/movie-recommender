// ===========================
// 👤 User Profile Service - Enhanced
// ===========================

function buildUserProfile(quizAnswers) {
    return {
        genres: quizAnswers.genres || [],
        tone: quizAnswers.tone || 'any',
        era: quizAnswers.era || 'any',
        language: quizAnswers.language || 'any',
        duration: quizAnswers.duration || 'any',
        complexity: quizAnswers.complexity || 'medium',
        minRating: quizAnswers.minRating || 6,
        subscriptions: quizAnswers.subscriptions || [],
        favoriteMovie: quizAnswers.favoriteMovie || null
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

function getComplexityGenres(complexity) {
    const complexityMap = {
        'easy': ['comedy', 'animation', 'family', 'adventure'],
        'medium': ['action', 'thriller', 'romance', 'fantasy'],
        'complex': ['drama', 'mystery', 'crime', 'science fiction'],
        'masterpiece': ['drama', 'history', 'war', 'documentary'],
    };

    return complexityMap[complexity.toLowerCase()] || [];
}

function getExpandedGenres(quizAnswers) {
    const userGenres = quizAnswers.genres || [];
    const toneGenres = getToneGenres(quizAnswers.tone || 'any');
    const complexityGenres = getComplexityGenres(quizAnswers.complexity || 'medium');

    const allGenres = [...new Set([...userGenres, ...toneGenres, ...complexityGenres])];
    return allGenres;
}

module.exports = {
    buildUserProfile,
    getToneGenres,
    getComplexityGenres,
    getExpandedGenres
};