import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
    return (
        <div className="app-page">
            <Header />

            <main className="page-content" style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '6rem', marginBottom: '16px' }}>🎬</div>
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    404
                </h1>
                <h2 style={{ marginBottom: '12px', color: 'white' }}>
                    This scene doesn't exist
                </h2>
                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '32px',
                    maxWidth: '400px',
                    margin: '0 auto 32px',
                    lineHeight: '1.6'
                }}>
                    Looks like this page got cut from the final edit. 
                    Let's get you back to the main feature.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/">
                        <button className="primary-button" style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)'
                        }}>
                            🏠 Back to Home
                        </button>
                    </Link>
                    <Link to="/discover">
                        <button className="primary-button" style={{
                            background: 'linear-gradient(135deg, #e50914, #b20710)'
                        }}>
                            🧠 Discover Movies
                        </button>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}