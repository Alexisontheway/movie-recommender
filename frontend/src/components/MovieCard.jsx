import '../styles/MovieCard.css';

export default function MovieCard({ movie }) {
  return (
    <div className="movie-card">
      {movie.poster && (
        <img
          src={movie.poster}
          alt={movie.title}
          className="movie-poster"
        />
      )}

      <div className="movie-info">
        {movie.isHiddenGem && (
          <span className="hidden-gem-badge">💎 Hidden Gem</span>
        )}

        <h3 className="movie-title">
          #{movie.rank} {movie.title}
        </h3>

        <span className="movie-match">🎯 {movie.matchScore}% match</span>

        <p className="movie-rating">⭐ {movie.rating} &middot; {movie.year}</p>

        <p className="movie-overview">{movie.overview}</p>
      </div>
    </div>
  );
}