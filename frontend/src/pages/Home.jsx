import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="app-page">
      <Header />

      <main className="page-content">
        <h1 className="page-title">🎬 Movie Recommender</h1>
        <p className="page-subtitle">Find movies based on your taste.</p>

        <Link to="/quiz">
          <button className="primary-button">Take the Quiz</button>
        </Link>
      </main>

      <Footer />
    </div>
  );
}