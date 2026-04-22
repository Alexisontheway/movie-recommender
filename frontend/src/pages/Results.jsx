import { useLocation, Link } from 'react-router-dom';
import RecommendationList from '../components/RecommendationList';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Results() {
  const location = useLocation();
  const recommendations = location.state?.recommendations || [];

  return (
    <div className="app-page">
      <Header />

      <main className="page-content">
        <h1 className="page-title">Your Recommendations</h1>

        {recommendations.length === 0 ? (
          <>
            <p>No recommendations found.</p>
            <Link to="/quiz">Go back to quiz</Link>
          </>
        ) : (
          <RecommendationList recommendations={recommendations} />
        )}
      </main>

      <Footer />
    </div>
  );
}