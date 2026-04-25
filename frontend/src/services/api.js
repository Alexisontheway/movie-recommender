import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthApi = () => api.get('/health');

export const moviesApi = {
  getPopular: () => api.get('/movies'),
  search: (query) => api.get(`/movies/search?q=${encodeURIComponent(query)}`),
  getByGenre: (genre) => api.get(`/movies/genre/${encodeURIComponent(genre)}`),
};

export const recommendationsApi = {
  generate: (quizAnswers) => api.post('/recommendations/generate', quizAnswers),
};

// 🧠 ML + TMDB Hybrid API
export const mlApi = {
  getStatus: () => api.get('/recommendations/ml/status'),

  // Live search via TMDB (finds ANY movie worldwide)
  search: (query) => api.get(`/recommendations/search?q=${encodeURIComponent(query)}`),

  // Hybrid recommendations (ML + TMDB combined)
  getHybrid: (movieId, title, count = 10) =>
    api.get(`/recommendations/ml/hybrid/${movieId}?title=${encodeURIComponent(title)}&count=${count}`),

  // Multi-movie recommendations
  getMultiple: (movies, count = 5) =>
    api.post('/recommendations/ml/multi', { movies, count }),

  // Get all ML movies
  getAllMovies: () => api.get('/recommendations/ml/movies'),
};

export default api;