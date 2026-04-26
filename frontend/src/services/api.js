import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('movie_recommender_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

export const mlApi = {
  getStatus: () => api.get('/recommendations/ml/status'),
  search: (query) => api.get(`/recommendations/search?q=${encodeURIComponent(query)}`),
  getHybrid: (movieId, title, count = 10) =>
    api.get(`/recommendations/ml/hybrid/${movieId}?title=${encodeURIComponent(title)}&count=${count}`),
  getMultiple: (movies, count = 5) =>
    api.post('/recommendations/ml/multi', { movies, count }),
  getAllMovies: () => api.get('/recommendations/ml/movies'),
};

export default api;