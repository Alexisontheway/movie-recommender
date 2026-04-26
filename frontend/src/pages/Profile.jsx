import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Profile() {
    const { user } = useAuth();
    const { watchlist, favorites, ratings, loading, refreshData } = useMovies();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('watchlist');
    const [recLoading, setRecLoading] = useState(false);

    useEffect(() => {
        refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRecommendFromFavorites = async () => {
        if (favorites.length === 0) return;

        setRecLoading(true);
        try {
            const moviesToSend = favorites.slice(0, 5).map(f => ({
                id: f.movie_id,
                title: f.movie_title
            }));

            const token = localStorage.getItem('movie_recommender_token');
            const res = await fetch(`${API_URL}/recommendations/ml/multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ movies: moviesToSend, count: 5 })
            });

            const data = await res.json();
            if (data.success && data.recommendations) {
                navigate('/discover', {
                    state: {
                        fromFavorites: true,
                        recommendations: data.recommendations,
                        sourceMovies: moviesToSend.map(m => m.title)
                    }
                });
            }
        } catch (err) {
            console.error('Failed to get recommendations:', err);
        }
        setRecLoading(false);
    };

    const handleRecommendFromWatchlist = async () => {
        if (watchlist.length === 0) return;

        setRecLoading(true);
        try {
            const moviesToSend = watchlist.slice(0, 5).map(w => ({
                id: w.movie_id,
                title: w.movie_title
            }));

            const token = localStorage.getItem('movie_recommender_token');
            const res = await fetch(`${API_URL}/recommendations/ml/multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ movies: moviesToSend, count: 5 })
            });

            const data = await res.json();
            if (data.success && data.recommendations) {
                navigate('/discover', {
                    state: {
                        fromFavorites: true,
                        recommendations: data.recommendations,
                        sourceMovies: moviesToSend.map(m => m.title)
                    }
                });
            }
        } catch (err) {
            console.error('Failed to get recommendations:', err);
        }
        setRecLoading(false);
    };

    if (!user) {
        return (
            <div className="app-page">
                <Header />
                <main className="page-content" style={{ textAlign: 'center', padding: '80px 0' }}>
                    <h1 className="page-title">Please Login</h1>
                    <p className="page-subtitle">You need to be logged in to view your profile.</p>
                    <Link to="/login">
                        <button className="primary-button">🔐 Login</button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const tabs = [
        { id: 'watchlist', label: '🔖 Watchlist', count: watchlist.length },
        { id: 'favorites', label: '❤️ Favorites', count: favorites.length },
        { id: 'ratings', label: '⭐ Ratings', count: ratings.length },
    ];

    const activeList = activeTab === 'watchlist' ? watchlist
        : activeTab === 'favorites' ? favorites
        : ratings;

    return (
        <div className="app-page">
            <Header />

            <main className="page-content">
                {/* Profile Header */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                    padding: '32px',
                    marginBottom: '32px',
                    border: '1px solid var(--border)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 16px'
                    }}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="page-title" style={{ marginBottom: '8px' }}>
                        {user.username}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        {user.email}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{watchlist.length}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Watchlist</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{favorites.length}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Favorites</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{ratings.length}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rated</div>
                        </div>
                    </div>

                    {/* Recommend Buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {favorites.length >= 2 && (
                            <button
                                className="primary-button"
                                onClick={handleRecommendFromFavorites}
                                disabled={recLoading}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    opacity: recLoading ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {recLoading ? '⏳ Analyzing...' : '🧠 Recommend from Favorites'}
                            </button>
                        )}
                        {watchlist.length >= 2 && (
                            <button
                                className="primary-button"
                                onClick={handleRecommendFromWatchlist}
                                disabled={recLoading}
                                style={{
                                    background: 'linear-gradient(135deg, #01b4e4, #90cea1)',
                                    opacity: recLoading ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {recLoading ? '⏳ Analyzing...' : '🔖 Recommend from Watchlist'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '12px'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px 8px 0 0',
                                border: 'none',
                                background: activeTab === tab.id
                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                    : 'var(--bg-secondary)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? '700' : '400',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        Loading...
                    </div>
                ) : activeList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '16px' }}>
                            {activeTab === 'watchlist' ? '🔖' : activeTab === 'favorites' ? '❤️' : '⭐'}
                        </p>
                        <h2 style={{ marginBottom: '8px', color: 'white' }}>
                            No {activeTab} yet
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {activeTab === 'watchlist'
                                ? 'Save movies you want to watch later!'
                                : activeTab === 'favorites'
                                ? 'Heart the movies you love!'
                                : 'Rate movies to track what you\'ve seen!'}
                        </p>
                        <Link to="/discover">
                            <button className="primary-button">🧠 Discover Movies</button>
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        {activeList.map(item => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/movie/${item.movie_id}`)}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {(item.movie_poster) && (
                                    <img
                                        src={item.movie_poster}
                                        alt={item.movie_title}
                                        style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                                    />
                                )}
                                <div style={{ padding: '12px' }}>
                                    <h3 style={{ fontSize: '0.95rem', marginBottom: '6px', color: 'white' }}>
                                        {item.movie_title || item.title || 'Unknown'}
                                    </h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {item.movie_rating ? `⭐ ${Number(item.movie_rating).toFixed(1)}` : ''}
                                            {item.movie_year ? ` · ${item.movie_year}` : ''}
                                        </span>
                                        {activeTab === 'ratings' && (
                                            <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                                                {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}