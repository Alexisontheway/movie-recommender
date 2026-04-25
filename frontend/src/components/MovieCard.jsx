import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';
import '../styles/MovieCard.css';

export default function MovieCard({ movie }) {
    const { user } = useAuth();
    const movies = useMovies();
    const [showRating, setShowRating] = useState(false);
    const [hoverStar, setHoverStar] = useState(0);
    const [actionFeedback, setActionFeedback] = useState('');

    // Safe checks — movies context might not be available
    const inWatchlist = movies ? movies.isInWatchlist(movie.id) : false;
    const inFavorites = movies ? movies.isInFavorites(movie.id) : false;
    const userRating = movies ? movies.getUserRating(movie.id) : 0;

    const showFeedback = (msg) => {
        setActionFeedback(msg);
        setTimeout(() => setActionFeedback(''), 2000);
    };

    const handleWatchlist = async () => {
        if (!user) return showFeedback('Login to save!');
        const result = await movies.toggleWatchlist(movie);
        if (result.success) {
            showFeedback(inWatchlist ? 'Removed!' : 'Saved! 🔖');
        }
    };

    const handleFavorite = async () => {
        if (!user) return showFeedback('Login to favorite!');
        const result = await movies.toggleFavorite(movie);
        if (result.success) {
            showFeedback(inFavorites ? 'Unfavorited' : 'Favorited! ❤️');
        }
    };

    const handleRate = async (starValue) => {
        if (!user) return showFeedback('Login to rate!');
        // If clicking same rating, remove it
        if (userRating === starValue) {
            await movies.removeRating(movie.id);
            showFeedback('Rating removed');
        } else {
            await movies.rateMovie(movie.id, starValue);
            showFeedback(`Rated ${starValue}⭐`);
        }
        setShowRating(false);
    };

    return (
        <div className={`movie-card ${movie.isMLPowered ? 'ml-powered' : ''} ${movie.isTopPick ? 'top-pick' : ''}`}>
            {movie.poster && (
                <div className="poster-container">
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster"
                    />
                    {/* Action buttons overlay on poster */}
                    {user && (
                        <div className="poster-actions">
                            <button
                                className={`action-btn watchlist-btn ${inWatchlist ? 'active' : ''}`}
                                onClick={handleWatchlist}
                                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            >
                                {inWatchlist ? '🔖' : '📑'}
                            </button>
                            <button
                                className={`action-btn favorite-btn ${inFavorites ? 'active' : ''}`}
                                onClick={handleFavorite}
                                title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                                {inFavorites ? '❤️' : '🤍'}
                            </button>
                            <button
                                className={`action-btn rate-btn ${userRating > 0 ? 'active' : ''}`}
                                onClick={() => setShowRating(!showRating)}
                                title="Rate this movie"
                            >
                                {userRating > 0 ? `${userRating}⭐` : '⭐'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="movie-info">
                {/* Feedback toast */}
                {actionFeedback && (
                    <div className="action-feedback">{actionFeedback}</div>
                )}

                {/* Star rating popup */}
                {showRating && (
                    <div className="star-rating-popup">
                        {[1, 2, 3, 4, 5].map(star => (
                            <span
                                key={star}
                                className={`star ${star <= (hoverStar || userRating) ? 'star-filled' : 'star-empty'}`}
                                onClick={() => handleRate(star)}
                                onMouseEnter={() => setHoverStar(star)}
                                onMouseLeave={() => setHoverStar(0)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                )}

                {/* Badges */}
                <div className="movie-badges">
                    {movie.isHiddenGem && (
                        <span className="badge hidden-gem-badge">💎 Hidden Gem</span>
                    )}
                    {movie.isTopPick && (
                        <span className="badge top-pick-badge">⭐ Top Pick</span>
                    )}
                    {movie.isMLPowered && !movie.isTopPick && (
                        <span className="badge ml-badge">🧠 ML Pick</span>
                    )}
                    {movie.isTMDB && !movie.isTopPick && (
                        <span className="badge tmdb-badge">🎬 TMDB Pick</span>
                    )}
                </div>

                <h3 className="movie-title">
                    #{movie.rank} {movie.title}
                </h3>

                {/* Similarity score bar for ML results */}
                {movie.similarity_score ? (
                    <div className="similarity-container">
                        <div className="similarity-bar">
                            <div
                                className="similarity-fill"
                                style={{ width: `${Math.min(Math.round(movie.similarity_score * 200), 100)}%` }}
                            ></div>
                        </div>
                        <span className="similarity-text">
                            🧠 {Math.min(Math.round(movie.similarity_score * 200), 100)}% similar
                        </span>
                    </div>
                ) : movie.score ? (
                    <div className="similarity-container">
                        <div className="similarity-bar">
                            <div
                                className="similarity-fill tmdb-fill"
                                style={{ width: `${Math.min(movie.score, 100)}%` }}
                            ></div>
                        </div>
                        <span className="similarity-text tmdb-score-text">
                            🎬 {Math.min(movie.score, 100)}% relevance
                        </span>
                    </div>
                ) : movie.matchScore ? (
                    <span className="movie-match">🎯 {movie.matchScore}% match</span>
                ) : null}

                <p className="movie-rating">
                    ⭐ {movie.rating?.toFixed?.(1) || movie.rating} &middot; {movie.year || 'N/A'}
                </p>

                <p className="movie-overview">
                    {movie.overview
                        ? movie.overview.length > 150
                            ? movie.overview.substring(0, 150) + '...'
                            : movie.overview
                        : 'No overview available.'}
                </p>
            </div>
        </div>
    );
}