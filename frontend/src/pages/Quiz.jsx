import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRecommendations from '../hooks/useRecommendations';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Quiz.css';

export default function Quiz() {
  const navigate = useNavigate();
  const { generateRecommendations, loading, error } = useRecommendations();

  const [formData, setFormData] = useState({
    genres: [],
    tone: 'exciting',
    era: 'recent',
    minRating: 7,
    subscriptions: ['netflix'],
  });

  const genresList = [
    'action',
    'adventure',
    'comedy',
    'drama',
    'thriller',
    'science fiction',
    'horror',
    'romance',
  ];

  const handleGenreChange = (genre) => {
    setFormData((prev) => {
      const exists = prev.genres.includes(genre);

      return {
        ...prev,
        genres: exists
          ? prev.genres.filter((g) => g !== genre)
          : [...prev.genres, genre],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await generateRecommendations(formData);

    if (data && data.recommendations) {
      navigate('/results', {
        state: {
          recommendations: data.recommendations,
          quizAnswers: formData,
        },
      });
    }
  };

  return (
    <div className="app-page">
      <Header />

      <main className="page-content">
        <h1 className="page-title">Movie Quiz</h1>
        <p className="page-subtitle">Choose your preferences and get movie recommendations.</p>

        <form className="quiz-form" onSubmit={handleSubmit}>
          <div className="quiz-section">
            <h3>Select Genres</h3>
            <div className="genre-grid">
              {genresList.map((genre) => (
                <label key={genre} className="genre-item">
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreChange(genre)}
                  />
                  {' '}{genre}
                </label>
              ))}
            </div>
          </div>

          <div className="quiz-section">
            <h3>Tone</h3>
            <select
              className="quiz-select"
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            >
              <option value="exciting">Exciting</option>
              <option value="dark">Dark</option>
              <option value="funny">Funny</option>
              <option value="romantic">Romantic</option>
              <option value="thought-provoking">Thought-provoking</option>
            </select>
          </div>

          <div className="quiz-section">
            <h3>Era</h3>
            <select
              className="quiz-select"
              value={formData.era}
              onChange={(e) => setFormData({ ...formData, era: e.target.value })}
            >
              <option value="recent">Recent</option>
              <option value="modern">Modern</option>
              <option value="retro">Retro</option>
              <option value="classic">Classic</option>
            </select>
          </div>

          <div className="quiz-section">
            <h3>Minimum Rating</h3>
            <input
              className="quiz-input"
              type="number"
              min="1"
              max="10"
              value={formData.minRating}
              onChange={(e) =>
                setFormData({ ...formData, minRating: Number(e.target.value) })
              }
            />
          </div>

          <div className="quiz-section">
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? 'Generating...' : 'Get Recommendations'}
            </button>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </main>

      <Footer />
    </div>
  );
}