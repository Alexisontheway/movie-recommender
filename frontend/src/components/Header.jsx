import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <h2 style={{ margin: 0 }}>🎬 Movie Recommender</h2>

      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/quiz">Quiz</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}