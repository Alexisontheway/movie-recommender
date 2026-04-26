import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Home() {
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            const res = await fetch(`${API_URL}/movies`);
            const data = await res.json();
            if (data.movies) {
                setTrending(data.movies.slice(0, 12));
            }
        } catch (err) {
            console.error('Failed to fetch trending:', err);
        }
        setLoading(false);
    };

    return (
        <div className="app-page">
            <Header />

            <main className="page-content">
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px 40px',
                    background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.08) 0%, transparent 100%)',
                    borderRadius: 'var(--radius)',
                    marginBottom: '48px'
                }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2, #e50914)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🎬 Movie Recommender
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '600px',
                        margin: '0 auto 32px',
                        lineHeight: '1.6'
                    }}>
                        Discover your next favorite movie with AI-powered recommendations,
                        a personality quiz, and a library of 800,000+ films.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/quiz">
                            <button className="primary-button" style={{
                                padding: '14px 32px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #e50914, #b20710)'
                            }}>
                                🎯 Take the Quiz
                            </button>
                        </Link>
                        <Link to="/discover">
                            <button className="primary-button" style={{
                                padding: '14px 32px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)'
                            }}>
                                🧠 ML Discovery
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '48px'
                }}>
                    {[
                        {
                            icon: '🎯',
                            title: 'Personality Quiz',
                            desc: '5 questions to understand your taste, then 20 handpicked recommendations',
                            link: '/quiz',
                            color: '#e50914'
                        },
                        {
                            icon: '🧠',
                            title: 'ML-Powered Discovery',
                            desc: 'Enter movies you love, our AI finds similar ones using cosine similarity',
                            link: '/discover',
                            color: '#667eea'
                        },
                        {
                            icon: '🔖',
                            title: 'Watchlist & Favorites',
                            desc: 'Save movies, rate them, and get recommendations based on your taste',
                            link: '/profile',
                            color: '#f59e0b'
                        },
                        {
                            icon: '🎬',
                            title: 'Movie Details',
                            desc: 'Trailers, cast, where to watch, budget, similar movies — everything in one place',
                            link: '/discover',
                            color: '#10b981'
                        }
                    ].map((feature, i) => (
                        <Link to={feature.link} key={i} style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '24px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                height: '100%'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = feature.color;
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{feature.icon}</div>
                                <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.1rem' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                                    {feature.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Trending Movies */}
                <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🔥 Trending This Week</h2>
                        <Link to="/discover" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.9rem' }}>
                            See more →
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            Loading trending movies...
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '16px'
                        }}>
                            {trending.map(movie => (
                                <div
                                    key={movie.id}
                                    onClick={() => navigate(`/movie/${movie.id}`)}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {movie.poster ? (
                                        <img
                                            src={movie.poster}
                                            alt={movie.title}
                                            style={{
                                                width: '100%',
                                                height: '240px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '240px',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem'
                                        }}>🎬</div>
                                    )}
                                    <div style={{ padding: '8px 4px' }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: 'white',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {movie.title}
                                        </p>
                                        <p style={{
                                            margin: '4px 0 0',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            ⭐ {movie.rating?.toFixed(1)} · {movie.year}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '48px',
                    flexWrap: 'wrap',
                    padding: '32px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    marginBottom: '32px'
                }}>
                    {[
                        { value: '800K+', label: 'Movies in TMDB' },
                        { value: '4,800', label: 'ML Brain Movies' },
                        { value: '20+', label: 'Genres Supported' },
                        { value: '∞', label: 'Recommendations' }
                    ].map((stat, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}