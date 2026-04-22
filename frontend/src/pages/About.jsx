import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="app-page">
      <Header />

      <main className="page-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="page-title">About This Project</h1>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--border)',
          lineHeight: '1.7'
        }}>
          <h2 style={{ marginBottom: '12px' }}>🎬 What is Movie Recommender?</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            A full-stack movie recommendation app that uses a quiz-based system
            to suggest personalized movies. Take an 8-question quiz about your
            preferences and get smart recommendations powered by real-time data.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--border)',
          lineHeight: '1.7'
        }}>
          <h2 style={{ marginBottom: '12px' }}>🛠️ How It Works</h2>
          <ol style={{ color: 'var(--text-secondary)', paddingLeft: '20px' }}>
            <li>You take an 8-step quiz about your movie preferences</li>
            <li>Backend fetches 300+ movies from multiple sources</li>
            <li>Our scoring algorithm rates each movie based on your answers</li>
            <li>Hidden gem detection finds underrated movies you'll love</li>
            <li>Top 15-20 personalized recommendations are returned</li>
          </ol>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--border)',
          lineHeight: '1.7'
        }}>
          <h2 style={{ marginBottom: '12px' }}>⚙️ Tech Stack</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '12px'
          }}>
            {[
              { label: 'Frontend', tech: 'React, React Router', icon: '⚛️' },
              { label: 'Backend', tech: 'Node.js, Express', icon: '🟢' },
              { label: 'API', tech: 'TMDB (1M+ movies)', icon: '🎬' },
              { label: 'Algorithm', tech: 'Custom scoring engine', icon: '🧠' },
              { label: 'Styling', tech: 'Custom CSS, Dark theme', icon: '🎨' },
              { label: 'Deployment', tech: 'Vercel + Render', icon: '🚀' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'var(--bg-card)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.tech}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          padding: '32px',
          border: '1px solid var(--border)',
          lineHeight: '1.7'
        }}>
          <h2 style={{ marginBottom: '12px' }}>✨ Key Features</h2>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px' }}>
            <li>8-step interactive quiz wizard</li>
            <li>300+ movies analyzed per recommendation</li>
            <li>💎 Hidden gem detection for underrated movies</li>
            <li>International cinema (Korean, Japanese, French, Spanish, Indian)</li>
            <li>Favorite movie matching — find similar films</li>
            <li>Smart scoring: genre, rating, era, complexity, language</li>
            <li>Real-time data from TMDB API</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}