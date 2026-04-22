import MovieCard from './MovieCard';
import '../styles/MovieCard.css';

export default function RecommendationList({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return <p>No recommendations found.</p>;
  }

  return (
    <div className="movie-grid">
      {recommendations.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}