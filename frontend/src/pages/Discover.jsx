import { useState, useEffect, useRef } from 'react';
import { mlApi } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import '../styles/Discover.css';

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sourceMovie, setSourceMovie] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mlStatus, setMlStatus] = useState(null);
  const [error, setError] = useState('');
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [mode, setMode] = useState('single');
  const [stats, setStats] = useState(null);
  const suggestionsRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const statusRes = await mlApi.getStatus();
        setMlStatus(statusRes.data.ml_service);
      } catch (err) {
        setMlStatus('offline');
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Live TMDB search with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await mlApi.search(query);
        if (res.data.success) {
          setSuggestions(res.data.results);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  // Single movie: Hybrid recommendation
  const handleSelectMovie = async (movie) => {
    setSearchQuery(movie.title);
    setSuggestions([]);
    setSourceMovie(movie.title);
    setLoading(true);
    setError('');
    setRecommendations([]);
    setStats(null);

    try {
      const res = await mlApi.getHybrid(movie.id, movie.title, 15);
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
        setStats({
          total: res.data.total,
          mlCount: res.data.ml_count,
          tmdbCount: res.data.tmdb_count,
          bothCount: res.data.both_count,
          mlAvailable: res.data.ml_available
        });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Multi mode: Add movie
  const handleAddMovie = (movie) => {
    if (selectedMovies.length >= 5) return;
    if (selectedMovies.find((m) => m.id === movie.id)) return;
    setSelectedMovies([...selectedMovies, movie]);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleRemoveMovie = (movieId) => {
    setSelectedMovies(selectedMovies.filter((m) => m.id !== movieId));
  };

  // Multi mode: Get recommendations
  const handleMultiRecommend = async () => {
    if (selectedMovies.length === 0) return;
    setLoading(true);
    setError('');
    setRecommendations([]);
    setStats(null);

    try {
      const movies = selectedMovies.map((m) => ({ id: m.id, title: m.title }));
      const res = await mlApi.getMultiple(movies, 5);
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
        setSourceMovie(res.data.source_movies.join(', '));
        setStats({ total: res.data.total });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      if (mode === 'single') {
        handleSelectMovie(suggestions[0]);
      } else {
        handleAddMovie(suggestions[0]);
      }
    }
  };

  return (
    <div className="discover-page">
      <Header />

      <main className="discover-main">
        <div className="discover-hero">
          <h1 className="discover-title">
            <span className="brain-icon">🧠</span> ML-Powered Discovery
          </h1>
          <p className="discover-subtitle">
            Find your next favorite movie using machine learning — search any movie in the world
          </p>

          {mlStatus && (
            <span className={`ml-status ${mlStatus}`}>
              {mlStatus === 'online' ? '🟢 ML Engine Online' : '🔴 ML Engine Offline'}
              {mlStatus === 'online' && ' • 4,800 movies in ML brain'}
            </span>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'single' ? 'active' : ''}`}
            onClick={() => setMode('single')}
          >
            🎬 Single Movie
          </button>
          <button
            className={`mode-btn ${mode === 'multi' ? 'active' : ''}`}
            onClick={() => setMode('multi')}
          >
            🎭 Multiple Movies
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container" ref={suggestionsRef}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder={
                mode === 'single'
                  ? 'Search any movie... (e.g., Pather Panchali, Inception, Parasite)'
                  : 'Add movies you love... (up to 5)'
              }
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            {searching && <span className="search-spinner">⏳</span>}
          </div>

          {/* Suggestions Dropdown — Now from TMDB! */}
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((movie) => (
                <div
                  key={movie.id}
                  className="suggestion-item"
                  onClick={() =>
                    mode === 'single'
                      ? handleSelectMovie(movie)
                      : handleAddMovie(movie)
                  }
                >
                  <div className="suggestion-left">
                    {movie.poster && (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="suggestion-poster"
                      />
                    )}
                    <div>
                      <span className="suggestion-title">{movie.title}</span>
                      <span className="suggestion-meta">
                        ⭐ {movie.rating?.toFixed(1)} &middot; {movie.year} &middot; {movie.originalLanguage?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Movies (Multi Mode) */}
        {mode === 'multi' && selectedMovies.length > 0 && (
          <div className="selected-movies">
            <h3>Your Picks ({selectedMovies.length}/5):</h3>
            <div className="selected-tags">
              {selectedMovies.map((movie) => (
                <span key={movie.id} className="movie-tag">
                  {movie.poster && (
                    <img src={movie.poster} alt="" className="tag-poster" />
                  )}
                  {movie.title}
                  <button
                    className="tag-remove"
                    onClick={() => handleRemoveMovie(movie.id)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <button className="recommend-btn" onClick={handleMultiRecommend}>
              🧠 Get Recommendations
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>🧠 Analyzing with ML + TMDB...</p>
          </div>
        )}

        {/* Error */}
        {error && <div className="error-message">❌ {error}</div>}

        {/* Stats Bar */}
        {stats && (
          <div className="stats-bar">
            <span>📊 {stats.total} recommendations</span>
            {stats.mlCount > 0 && <span>🧠 {stats.mlCount} ML picks</span>}
            {stats.tmdbCount > 0 && <span>🎬 {stats.tmdbCount} TMDB picks</span>}
            {stats.bothCount > 0 && <span>⭐ {stats.bothCount} top picks</span>}
            {stats.mlAvailable === false && (
              <span className="stats-note">ℹ️ Movie not in ML dataset — using TMDB</span>
            )}
          </div>
        )}

        {/* Results */}
        {recommendations.length > 0 && (
          <div className="results-section">
            <h2 className="results-title">
              🎯 Movies similar to <span className="highlight">{sourceMovie}</span>
            </h2>

            <div className="results-grid">
              {recommendations.map((movie, index) => (
                <MovieCard
                  key={movie.id || index}
                  movie={{
                    ...movie,
                    rank: movie.rank || index + 1,
                    matchScore: movie.score || Math.round((movie.similarity_score || 0) * 100),
                    isMLPowered: movie.source === 'ml',
                    isTMDB: movie.source === 'tmdb',
                    isTopPick: movie.source === 'both',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}