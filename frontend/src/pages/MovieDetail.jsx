import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/MovieDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const movies = useMovies();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [hoverStar, setHoverStar] = useState(0);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchMovieDetails();
        window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchMovieDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/movies/${id}`);
            const data = await res.json();
            if (data.success) {
                setMovie(data.movie);
            } else {
                setError('Movie not found');
            }
        } catch (err) {
            setError('Failed to load movie details');
        }
        setLoading(false);
    };

    const showFeedback = (msg) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(''), 2500);
    };

    const handleWatchlist = async () => {
        if (!user) return showFeedback('Login to save!');
        const result = await movies.toggleWatchlist(movie);
        if (result.success) {
            showFeedback(movies.isInWatchlist(movie.id) ? 'Removed from watchlist' : 'Added to watchlist! 🔖');
        }
    };

    const handleFavorite = async () => {
        if (!user) return showFeedback('Login to favorite!');
        const result = await movies.toggleFavorite(movie);
        if (result.success) {
            showFeedback(movies.isInFavorites(movie.id) ? 'Unfavorited' : 'Added to favorites! ❤️');
        }
    };

    const handleRate = async (star) => {
        if (!user) return showFeedback('Login to rate!');
        const currentRating = movies.getUserRating(movie.id);
        if (currentRating === star) {
            await movies.removeRating(movie.id);
            showFeedback('Rating removed');
        } else {
            await movies.rateMovie(movie.id, star);
            showFeedback(`Rated ${star}⭐`);
        }
    };

    const formatRuntime = (mins) => {
        if (!mins) return 'N/A';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const formatMoney = (amount) => {
        if (!amount || amount === 0) return null;
        if (amount >= 1000000000) return `
$$
{(amount / 1000000000).toFixed(1)}B`;
        if (amount >= 1000000) return `
$$
{(amount / 1000000).toFixed(1)}M`;
        return `$${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="app-page">
                <Header />
                <main className="page-content">
                    <div className="detail-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading movie details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="app-page">
                <Header />
                <main className="page-content">
                    <div className="detail-error">
                        <h1>😔 {error || 'Movie not found'}</h1>
                        <button className="primary-button" onClick={() => navigate(-1)}>⬅️ Go Back</button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const inWatchlist = movies ? movies.isInWatchlist(movie.id) : false;
    const inFavorites = movies ? movies.isInFavorites(movie.id) : false;
    const userRating = movies ? movies.getUserRating(movie.id) : 0;

    return (
        <div className="app-page">
            <Header />

            <main className="detail-page">
                {/* Backdrop */}
                {movie.backdrop && (
                    <div className="detail-backdrop">
                        <img src={movie.backdrop} alt="" />
                        <div className="backdrop-overlay"></div>
                    </div>
                )}

                {/* Feedback Toast */}
                {feedback && <div className="detail-feedback">{feedback}</div>}

                {/* Main Content */}
                <div className="detail-content">
                    {/* Top Section: Poster + Info */}
                    <div className="detail-top">
                        <div className="detail-poster-section">
                            {movie.poster ? (
                                <img src={movie.poster} alt={movie.title} className="detail-poster" />
                            ) : (
                                <div className="detail-poster-placeholder">🎬</div>
                            )}

                            {/* Action Buttons */}
                            {user && (
                                <div className="detail-actions">
                                    <button
                                        className={`detail-action-btn ${inWatchlist ? 'active' : ''}`}
                                        onClick={handleWatchlist}
                                    >
                                        {inWatchlist ? '🔖 In Watchlist' : '📑 Add to Watchlist'}
                                    </button>
                                    <button
                                        className={`detail-action-btn fav-btn ${inFavorites ? 'active' : ''}`}
                                        onClick={handleFavorite}
                                    >
                                        {inFavorites ? '❤️ Favorited' : '🤍 Add to Favorites'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="detail-info">
                            {/* Back Button */}
                            <button className="back-btn" onClick={() => navigate(-1)}>
                                ⬅️ Back
                            </button>

                            {/* Title */}
                            <h1 className="detail-title">{movie.title}</h1>

                            {movie.tagline && (
                                <p className="detail-tagline">"{movie.tagline}"</p>
                            )}

                            {/* Meta Row */}
                            <div className="detail-meta">
                                <span className="detail-rating">⭐ {movie.rating?.toFixed(1)}</span>
                                <span className="detail-votes">({movie.voteCount?.toLocaleString()} votes)</span>
                                <span className="detail-year">{movie.year}</span>
                                <span className="detail-runtime">{formatRuntime(movie.runtime)}</span>
                                <span className="detail-lang">{movie.originalLanguage?.toUpperCase()}</span>
                            </div>

                            {/* Genres */}
                            <div className="detail-genres">
                                {movie.genres?.map(g => (
                                    <span key={g.id} className="genre-tag">{g.name}</span>
                                ))}
                            </div>

                            {/* User Rating */}
                            {user && (
                                <div className="detail-user-rating">
                                    <span className="rating-label">Your Rating:</span>
                                    <div className="star-row">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                className={`detail-star ${star <= (hoverStar || userRating) ? 'star-filled' : 'star-empty'}`}
                                                onClick={() => handleRate(star)}
                                                onMouseEnter={() => setHoverStar(star)}
                                                onMouseLeave={() => setHoverStar(0)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    {userRating > 0 && <span className="rated-text">You rated this {userRating}/5</span>}
                                </div>
                            )}

                            {/* Overview */}
                            <div className="detail-overview">
                                <h3>Overview</h3>
                                <p>{movie.overview || 'No overview available.'}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="detail-grid">
                                {movie.director && (
                                    <div className="detail-grid-item">
                                        <span className="grid-label">Director</span>
                                        <span className="grid-value">{movie.director.name}</span>
                                    </div>
                                )}
                                {movie.status && (
                                    <div className="detail-grid-item">
                                        <span className="grid-label">Status</span>
                                        <span className="grid-value">{movie.status}</span>
                                    </div>
                                )}
                                {formatMoney(movie.budget) && (
                                    <div className="detail-grid-item">
                                        <span className="grid-label">Budget</span>
                                        <span className="grid-value">{formatMoney(movie.budget)}</span>
                                    </div>
                                )}
                                {formatMoney(movie.revenue) && (
                                    <div className="detail-grid-item">
                                        <span className="grid-label">Revenue</span>
                                        <span className="grid-value">{formatMoney(movie.revenue)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Trailer Button */}
                            {movie.trailer && (
                                <button className="trailer-btn" onClick={() => setShowTrailer(true)}>
                                    ▶️ Watch Trailer
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Trailer Modal */}
                    {showTrailer && movie.trailer && (
                        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
                            <div className="trailer-container" onClick={e => e.stopPropagation()}>
                                <button className="trailer-close" onClick={() => setShowTrailer(false)}>✕</button>
                                <iframe
                                    src={`https://www.youtube.com/embed/${movie.trailer.key}?autoplay=1`}
                                    title={movie.trailer.name}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    className="trailer-iframe"
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {/* Cast Section */}
                    {movie.cast && movie.cast.length > 0 && (
                        <div className="detail-section">
                            <h2 className="section-title">🎭 Cast</h2>
                            <div className="cast-grid">
                                {movie.cast.map(actor => (
                                    <div key={actor.id} className="cast-card">
                                        {actor.photo ? (
                                            <img src={actor.photo} alt={actor.name} className="cast-photo" />
                                        ) : (
                                            <div className="cast-photo-placeholder">👤</div>
                                        )}
                                        <p className="cast-name">{actor.name}</p>
                                        <p className="cast-character">{actor.character}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                                        {/* Watch Providers */}
                    {movie.watchProviders && (
                        <div className="detail-section">
                            <h2 className="section-title">📺 Where to Watch</h2>
                            <div className="providers-row">
                                {movie.watchProviders.flatrate && movie.watchProviders.flatrate.map(p => (
                                    <a
                                        key={p.provider_id}
                                        href={movie.watchProviders.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="provider-badge"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                            alt={p.provider_name}
                                            className="provider-logo"
                                        />
                                        <span>{p.provider_name}</span>
                                    </a>
                                ))}
                                {movie.watchProviders.rent && movie.watchProviders.rent.slice(0, 4).map(p => (
                                    <a
                                        key={p.provider_id}
                                        href={movie.watchProviders.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="provider-badge rent"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                            alt={p.provider_name}
                                            className="provider-logo"
                                        />
                                        <span>{p.provider_name} (Rent)</span>
                                    </a>
                                ))}
                                {movie.watchProviders.buy && movie.watchProviders.buy.slice(0, 4).map(p => (
                                    <a
                                        key={p.provider_id}
                                        href={movie.watchProviders.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="provider-badge buy"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                            alt={p.provider_name}
                                            className="provider-logo"
                                        />
                                        <span>{p.provider_name} (Buy)</span>
                                    </a>
                                ))}
                            </div>
                            <p className="provider-attribution">
                                Data provided by <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer">JustWatch</a>
                            </p>
                        </div>
                    )}

                    {/* Similar Movies */}
                    {movie.similar && movie.similar.length > 0 && (
                        <div className="detail-section">
                            <h2 className="section-title">🎯 Similar Movies</h2>
                            <div className="similar-grid">
                                {movie.similar.map(m => (
                                    <Link to={`/movie/${m.id}`} key={m.id} className="similar-card">
                                        {m.poster && (
                                            <img src={m.poster} alt={m.title} className="similar-poster" />
                                        )}
                                        <div className="similar-info">
                                            <p className="similar-title">{m.title}</p>
                                            <p className="similar-meta">⭐ {m.rating?.toFixed(1)} · {m.year}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}