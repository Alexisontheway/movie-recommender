import { useLocation, Link } from 'react-router-dom';
import RecommendationList from '../components/RecommendationList';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Results() {
  const location = useLocation();
  const recommendations = location.state?.recommendations || [];
  const hiddenGems = location.state?.hiddenGems || 0;

  // Split AND re-number each section from #1
  const gemMovies = recommendations
    .filter(m => m.isHiddenGem)
    .map((m, i) => ({ ...m, rank: i + 1 }));

  const mainMovies = recommendations
    .filter(m => !m.isHiddenGem)
    .map((m, i) => ({ ...m, rank: i + 1 }));

  const topMatch = recommendations[0];

  return (
    <div className="app-page">
      <Header />

      <main className="page-content">
        {recommendations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <h1 className="page-title">No Recommendations Yet</h1>
            <p className="page-subtitle">Take the quiz first to get personalized results.</p>
            <Link to="/quiz">
              <button className="primary-button">🎬 Take the Quiz</button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Banner */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              padding: '24px 32px',
              marginBottom: '32px',
              border: '1px solid var(--border)'
            }}>
              <h1 className="page-title" style={{ marginBottom: '12px' }}>
                Your Recommendations
              </h1>

              <div style={{
                display: 'flex',
                gap: '32px',
                flexWrap: 'wrap',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem'
              }}>
                <span>🎬 <strong style={{ color: 'white' }}>{recommendations.length}</strong> movies matched</span>
                <span>📊 <strong style={{ color: 'white' }}>250+</strong> movies analyzed</span>
                {hiddenGems > 0 && (
                  <span>💎 <strong style={{ color: 'white' }}>{hiddenGems}</strong> hidden gems found</span>
                )}
                {topMatch && (
                  <span>🏆 Best match: <strong style={{ color: 'var(--green)' }}>{topMatch.matchScore}%</strong></span>
                )}
              </div>
            </div>

            {/* Hidden Gems Section */}
            {gemMovies.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>
                  💎 Hidden Gems — Movies You Probably Haven't Seen
                </h2>
                <RecommendationList recommendations={gemMovies} />
              </div>
            )}

            {/* Top Picks — re-numbered, no duplicates */}
            {mainMovies.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>
                  🎯 Top Picks For You
                </h2>
                <RecommendationList recommendations={mainMovies} />
              </div>
            )}

            {/* Actions */}
            <div style={{ textAlign: 'center', marginTop: '48px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/quiz">
                <button className="primary-button">🔄 Retake Quiz</button>
              </Link>
              <Link to="/">
                <button className="primary-button" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  🏠 Back to Home
                </button>
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}