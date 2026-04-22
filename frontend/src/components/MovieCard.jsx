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

      <h3 className="movie-title">
        {movie.rank}. {movie.title}
      </h3>

      <p className="movie-meta">{movie.year}</p>
      <p className="movie-meta">⭐ {movie.rating}</p>
      <p className="movie-meta">🎯 {movie.matchScore}% match</p>
      <p className="movie-overview">{movie.overview}</p>
    </div>
  );
}