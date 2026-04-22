import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRecommendations from '../hooks/useRecommendations';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Quiz.css';

const TOTAL_STEPS = 8;

const GENRES = [
  { id: 'action', label: 'Action', icon: '💥' },
  { id: 'adventure', label: 'Adventure', icon: '🗺️' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'drama', label: 'Drama', icon: '🎭' },
  { id: 'thriller', label: 'Thriller', icon: '😰' },
  { id: 'science fiction', label: 'Sci-Fi', icon: '🚀' },
  { id: 'horror', label: 'Horror', icon: '👻' },
  { id: 'romance', label: 'Romance', icon: '💕' },
  { id: 'animation', label: 'Animation', icon: '✨' },
  { id: 'crime', label: 'Crime', icon: '🔍' },
  { id: 'fantasy', label: 'Fantasy', icon: '🧙' },
  { id: 'documentary', label: 'Documentary', icon: '📹' },
  { id: 'mystery', label: 'Mystery', icon: '🕵️' },
  { id: 'war', label: 'War', icon: '⚔️' },
  { id: 'western', label: 'Western', icon: '🤠' },
  { id: 'history', label: 'History', icon: '📜' },
];

const TONES = [
  { id: 'exciting', label: 'Exciting', icon: '⚡', desc: 'Adrenaline rush, edge of your seat' },
  { id: 'dark', label: 'Dark', icon: '🌑', desc: 'Intense, gritty, heavy themes' },
  { id: 'funny', label: 'Funny', icon: '😂', desc: 'Lighthearted, laugh out loud' },
  { id: 'romantic', label: 'Romantic', icon: '💕', desc: 'Love stories, heartwarming' },
  { id: 'thought-provoking', label: 'Thought-provoking', icon: '🧠', desc: 'Makes you think deeply' },
  { id: 'scary', label: 'Scary', icon: '😱', desc: 'Fear, suspense, horror' },
  { id: 'feel-good', label: 'Feel-good', icon: '☀️', desc: 'Uplifting, happy ending' },
  { id: 'epic', label: 'Epic', icon: '👑', desc: 'Grand scale, sweeping stories' },
];

const ERAS = [
  { id: 'recent', label: 'Recent', icon: '🆕', desc: '2020 - Present' },
  { id: 'modern', label: 'Modern', icon: '📱', desc: '2000 - 2019' },
  { id: 'retro', label: 'Retro', icon: '📼', desc: '1980 - 1999' },
  { id: 'classic', label: 'Classic', icon: '🎞️', desc: 'Before 1980' },
  { id: 'any', label: 'Any Era', icon: '🌀', desc: 'Surprise me!' },
];

const LANGUAGES = [
  { id: 'any', label: 'Any Language', icon: '🌍', desc: 'Show me everything' },
  { id: 'en', label: 'English', icon: '🇺🇸', desc: 'Hollywood & more' },
  { id: 'korean', label: 'Korean', icon: '🇰🇷', desc: 'K-Cinema gems' },
  { id: 'japanese', label: 'Japanese', icon: '🇯🇵', desc: 'Anime & Japanese cinema' },
  { id: 'french', label: 'French', icon: '🇫🇷', desc: 'French arthouse & more' },
  { id: 'spanish', label: 'Spanish', icon: '🇪🇸', desc: 'Latin & Spanish cinema' },
  { id: 'indian', label: 'Indian', icon: '🇮🇳', desc: 'Bollywood & beyond' },
  { id: 'chinese', label: 'Chinese', icon: '🇨🇳', desc: 'Chinese cinema' },
];

const DURATIONS = [
  { id: 'short', label: 'Quick Watch', icon: '⚡', desc: 'Under 90 minutes' },
  { id: 'medium', label: 'Standard', icon: '🎬', desc: '90 - 120 minutes' },
  { id: 'long', label: 'Long Epic', icon: '🍿', desc: 'Over 2 hours' },
  { id: 'any', label: 'Any Length', icon: '🌀', desc: "Doesn't matter" },
];

const COMPLEXITY = [
  { id: 'easy', label: 'Easy & Fun', icon: '😊', desc: 'Light, entertaining, no brainpower needed' },
  { id: 'medium', label: 'Balanced', icon: '⚖️', desc: 'Some depth but still enjoyable' },
  { id: 'complex', label: 'Deep & Complex', icon: '🧠', desc: 'Layered plots, makes you think' },
  { id: 'masterpiece', label: 'Masterpiece Level', icon: '🏆', desc: 'Award-winning, cinematic art' },
];

const PLATFORMS = [
  { id: 'netflix', label: 'Netflix', icon: '🔴' },
  { id: 'prime', label: 'Prime Video', icon: '🔵' },
  { id: 'disney', label: 'Disney+', icon: '🏰' },
  { id: 'hbo', label: 'HBO Max', icon: '🟣' },
  { id: 'apple', label: 'Apple TV+', icon: '🍎' },
  { id: 'free', label: 'Free / Open', icon: '🆓' },
  { id: 'any', label: 'Any Platform', icon: '🌐' },
];

export default function Quiz() {
  const navigate = useNavigate();
  const { generateRecommendations, loading } = useRecommendations();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    genres: [],
    tone: '',
    era: '',
    language: '',
    duration: '',
    complexity: '',
    minRating: 7,
    favoriteMovie: null,
    subscriptions: [],
  });

  // Movie search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Movie search with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/movies/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data.movies ? data.movies.slice(0, 6) : []);
      } catch (err) {
        console.error('Search error:', err);
      }
      setSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleGenre = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const togglePlatform = (platform) => {
    setFormData((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.includes(platform)
        ? prev.subscriptions.filter((p) => p !== platform)
        : [...prev.subscriptions, platform],
    }));
  };

  const selectMovie = (movie) => {
    setFormData((prev) => ({ ...prev, favoriteMovie: movie }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeMovie = () => {
    setFormData((prev) => ({ ...prev, favoriteMovie: null }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.genres.length > 0;
      case 2: return formData.tone !== '';
      case 3: return formData.era !== '';
      case 4: return formData.language !== '';
      case 5: return formData.duration !== '';
      case 6: return formData.complexity !== '';
      case 7: return true; // rating always has value
      case 8: return true; // favorite movie is optional
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const data = await generateRecommendations(formData);

    if (data && data.recommendations) {
      navigate('/results', {
        state: {
          recommendations: data.recommendations,
          quizAnswers: formData,
          hiddenGems: data.hiddenGems,
        },
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">What genres do you enjoy?</h2>
            <p className="quiz-question-subtitle">Select one or more genres you're in the mood for.</p>

            <div className="genre-grid">
              {GENRES.map((genre) => (
                <div
                  key={genre.id}
                  className={`genre-item ${formData.genres.includes(genre.id) ? 'selected' : ''}`}
                  onClick={() => toggleGenre(genre.id)}
                >
                  <span className="genre-icon">{genre.icon}</span>
                  <span>{genre.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">What mood are you in?</h2>
            <p className="quiz-question-subtitle">Pick the tone that matches how you want to feel.</p>

            <div className="option-grid">
              {TONES.map((tone) => (
                <div
                  key={tone.id}
                  className={`option-card ${formData.tone === tone.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, tone: tone.id })}
                >
                  <div className="option-icon">{tone.icon}</div>
                  <div className="option-label">{tone.label}</div>
                  <div className="option-desc">{tone.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">What era of movies?</h2>
            <p className="quiz-question-subtitle">Do you prefer newer releases or timeless classics?</p>

            <div className="option-grid">
              {ERAS.map((era) => (
                <div
                  key={era.id}
                  className={`option-card ${formData.era === era.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, era: era.id })}
                >
                  <div className="option-icon">{era.icon}</div>
                  <div className="option-label">{era.label}</div>
                  <div className="option-desc">{era.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">Any language preference?</h2>
            <p className="quiz-question-subtitle">Explore cinema from around the world.</p>

            <div className="option-grid">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.id}
                  className={`option-card ${formData.language === lang.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, language: lang.id })}
                >
                  <div className="option-icon">{lang.icon}</div>
                  <div className="option-label">{lang.label}</div>
                  <div className="option-desc">{lang.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">How much time do you have?</h2>
            <p className="quiz-question-subtitle">Pick your preferred movie length.</p>

            <div className="option-grid">
              {DURATIONS.map((dur) => (
                <div
                  key={dur.id}
                  className={`option-card ${formData.duration === dur.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, duration: dur.id })}
                >
                  <div className="option-icon">{dur.icon}</div>
                  <div className="option-label">{dur.label}</div>
                  <div className="option-desc">{dur.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">How complex do you want it?</h2>
            <p className="quiz-question-subtitle">From easy popcorn fun to deep cinematic art.</p>

            <div className="option-grid">
              {COMPLEXITY.map((comp) => (
                <div
                  key={comp.id}
                  className={`option-card ${formData.complexity === comp.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, complexity: comp.id })}
                >
                  <div className="option-icon">{comp.icon}</div>
                  <div className="option-label">{comp.label}</div>
                  <div className="option-desc">{comp.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">Minimum rating?</h2>
            <p className="quiz-question-subtitle">Only show movies rated above this score.</p>

            <div className="rating-slider-wrapper">
              <div className="rating-value">⭐ {formData.minRating}</div>
              <input
                type="range"
                min="4"
                max="9"
                step="0.5"
                value={formData.minRating}
                onChange={(e) =>
                  setFormData({ ...formData, minRating: parseFloat(e.target.value) })
                }
                className="rating-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>4.0</span>
                <span>9.0</span>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="quiz-question">
            <h2 className="quiz-question-title">Got a favorite movie?</h2>
            <p className="quiz-question-subtitle">
              Tell us a movie you love and we'll find similar ones. This is optional.
            </p>

            <div className="movie-search-wrapper">
              <input
                type="text"
                className="movie-search-input"
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {searching && (
                <div className="search-results-dropdown">
                  <div style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                    Searching...
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => selectMovie(movie)}
                    >
                      {movie.poster && (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="search-result-poster"
                        />
                      )}
                      <div className="search-result-info">
                        <div className="search-result-title">{movie.title}</div>
                        <div className="search-result-year">
                          {movie.year} &middot; ⭐ {movie.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formData.favoriteMovie && (
              <div className="selected-movie">
                {formData.favoriteMovie.poster && (
                  <img
                    src={formData.favoriteMovie.poster}
                    alt={formData.favoriteMovie.title}
                    className="selected-movie-poster"
                  />
                )}
                <div className="selected-movie-info">
                  <div className="selected-movie-title">
                    {formData.favoriteMovie.title}
                  </div>
                  <div className="selected-movie-meta">
                    {formData.favoriteMovie.year} &middot; ⭐{' '}
                    {formData.favoriteMovie.rating}
                  </div>
                </div>
                <button className="remove-movie" onClick={removeMovie}>
                  ✕
                </button>
              </div>
            )}

            <p className="skip-text" onClick={handleSubmit}>
              Skip and get recommendations →
            </p>
          </div>
        );

      default:
        return null;
    }
  };

    const movieFacts = [
    "The longest movie ever made is over 35 days long 🎬",
    "The first movie ever made was in 1888 📽️",
    "Parasite was the first non-English film to win Best Picture 🏆",
    "Studio Ghibli has never made a sequel 🎨",
    "The Lord of the Rings trilogy was filmed all at once in New Zealand 🇳🇿",
    "Keanu Reeves gave away most of his Matrix salary to the crew 🤝",
    "The sound of the T-Rex in Jurassic Park is a baby elephant mixed with a tiger 🦖",
    "Christopher Nolan doesn't use a cell phone or email 📵",
  ];

  const [fact] = useState(movieFacts[Math.floor(Math.random() * movieFacts.length)]);

  if (loading) {
    return (
      <div className="app-page">
        <Header />
        <main className="page-content">
          <div className="quiz-loading">
            <div className="quiz-loading-spinner"></div>
            <p className="quiz-loading-text">
              Analyzing 300+ movies to find your perfect matches...
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginTop: '24px',
              fontStyle: 'italic',
              maxWidth: '400px',
              margin: '24px auto 0'
            }}>
              🎬 Did you know? {fact}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
    

  return (
    <div className="app-page">
      <Header />

      <main className="page-content">
        <div className="quiz-wizard">
          <p className="progress-text">
            Step {step} of {TOTAL_STEPS}
          </p>

          <div className="quiz-progress">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`progress-step ${
                  i + 1 < step ? 'completed' : i + 1 === step ? 'active' : ''
                }`}
              />
            ))}
          </div>

          {renderStep()}

          <div className="quiz-nav">
            {step > 1 ? (
              <button className="quiz-nav-back" onClick={handleBack}>
                ← Back
              </button>
            ) : (
              <div></div>
            )}

            {step < TOTAL_STEPS ? (
              <button
                className="quiz-nav-next"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next →
              </button>
            ) : (
              <button className="quiz-nav-next" onClick={handleSubmit}>
                🎬 Get Recommendations
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}