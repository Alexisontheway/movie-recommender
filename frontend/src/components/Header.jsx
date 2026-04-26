import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Header() {
    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef(null);
    const timerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`${API_URL}/recommendations/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success && data.results) {
                    setSearchResults(data.results.slice(0, 6));
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error('Search failed:', err);
            }
            setSearching(false);
        }, 400);

        return () => clearTimeout(timerRef.current);
    }, [searchQuery]);

    const handleResultClick = (movieId) => {
        setShowDropdown(false);
        setSearchQuery('');
        navigate(`/movie/${movieId}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchResults.length > 0) {
            handleResultClick(searchResults[0].id);
        }
        if (e.key === 'Escape') {
            setShowDropdown(false);
            setSearchQuery('');
        }
    };

    return (
        <header className="site-header">
            <Link to="/" style={{ textDecoration: 'none' }}>
                <h2 style={{ margin: 0, color: 'white' }}>🎬 Movie Recommender</h2>
            </Link>

            {/* Search Bar */}
            <div className="header-search" ref={searchRef}>
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search any movie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        className="header-search-input"
                    />
                    {searching && <span className="search-spinner"></span>}
                    {searchQuery && (
                        <button
                            className="search-clear"
                            onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Dropdown Results */}
                {showDropdown && searchResults.length > 0 && (
                    <div className="search-dropdown">
                        {searchResults.map(movie => (
                            <div
                                key={movie.id}
                                className="search-result-item"
                                onClick={() => handleResultClick(movie.id)}
                            >
                                {movie.poster ? (
                                    <img src={movie.poster} alt="" className="search-result-poster" />
                                ) : (
                                    <div className="search-result-poster-placeholder">🎬</div>
                                )}
                                <div className="search-result-info">
                                    <p className="search-result-title">{movie.title}</p>
                                    <p className="search-result-meta">
                                        ⭐ {movie.rating?.toFixed(1)} · {movie.year}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                    <div className="search-dropdown">
                        <div className="search-no-results">No movies found</div>
                    </div>
                )}
            </div>

            <nav className="site-nav">
                <Link to="/">Home</Link>
                <Link to="/quiz">Quiz</Link>
                <Link to="/discover">🧠 Discover</Link>
                <Link to="/about">About</Link>

                {isLoggedIn ? (
                    <>
                        <Link to="/profile" style={{ color: '#00d4ff', fontWeight: 600, textDecoration: 'none' }}>
                            👤 {user?.username}
                        </Link>
                        <button
                            onClick={logout}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#ff4444',
                                padding: '0.3rem 0.8rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            padding: '0.3rem 1rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}
                    >
                        🔐 Login
                    </Link>
                )}
            </nav>
        </header>
    );
}