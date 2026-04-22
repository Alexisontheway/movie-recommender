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

export default api;
