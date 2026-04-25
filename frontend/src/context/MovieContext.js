import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MovieContext = createContext();

export function useMovies() {
    return useContext(MovieContext);
}

export function MovieProvider({ children }) {
    const { isLoggedIn } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Read token directly from localStorage (correct key!)
    const getToken = () => localStorage.getItem('movie_recommender_token');

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    }), []);

    // Fetch all user data on login
    const fetchUserData = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setWatchlist([]);
            setFavorites([]);
            setRatings([]);
            return;
        }
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
            const [wRes, fRes, rRes] = await Promise.all([
                fetch(`${API_URL}/watchlist`, { headers }),
                fetch(`${API_URL}/favorites`, { headers }),
                fetch(`${API_URL}/ratings`, { headers })
            ]);
            const wData = await wRes.json();
            const fData = await fRes.json();
            const rData = await rRes.json();

            if (wData.success) setWatchlist(wData.watchlist);
            if (fData.success) setFavorites(fData.favorites);
            if (rData.success) setRatings(rData.ratings);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Watchlist helpers
    const isInWatchlist = (movieId) => watchlist.some(m => m.movie_id === movieId);

    const toggleWatchlist = async (movie) => {
        const token = getToken();
        if (!token) return { success: false, message: 'Please login first' };

        if (isInWatchlist(movie.id)) {
            try {
                const res = await fetch(`${API_URL}/watchlist/remove/${movie.id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                });
                const data = await res.json();
                if (data.success) {
                    setWatchlist(prev => prev.filter(m => m.movie_id !== movie.id));
                }
                return data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        } else {
            try {
                const res = await fetch(`${API_URL}/watchlist/add`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        movie_id: movie.id,
                        movie_title: movie.title,
                        movie_poster: movie.poster,
                        movie_rating: movie.rating,
                        movie_year: movie.year
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setWatchlist(prev => [data.item, ...prev]);
                }
                return data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        }
    };

    // Favorites helpers
    const isInFavorites = (movieId) => favorites.some(m => m.movie_id === movieId);

    const toggleFavorite = async (movie) => {
        const token = getToken();
        if (!token) return { success: false, message: 'Please login first' };

        if (isInFavorites(movie.id)) {
            try {
                const res = await fetch(`${API_URL}/favorites/remove/${movie.id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                });
                const data = await res.json();
                if (data.success) {
                    setFavorites(prev => prev.filter(m => m.movie_id !== movie.id));
                }
                return data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        } else {
            try {
                const res = await fetch(`${API_URL}/favorites/add`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        movie_id: movie.id,
                        movie_title: movie.title,
                        movie_poster: movie.poster,
                        movie_rating: movie.rating,
                        movie_year: movie.year
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setFavorites(prev => [data.item, ...prev]);
                }
                return data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        }
    };

    // Ratings helpers
    const getUserRating = (movieId) => {
        const r = ratings.find(r => r.movie_id === movieId);
        return r ? r.rating : 0;
    };

    const rateMovie = async (movieId, rating) => {
        const token = getToken();
        if (!token) return { success: false, message: 'Please login first' };

        try {
            const res = await fetch(`${API_URL}/ratings/rate`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ movie_id: movieId, rating })
            });
            const data = await res.json();
            if (data.success) {
                setRatings(prev => {
                    const existing = prev.findIndex(r => r.movie_id === movieId);
                    if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = data.item;
                        return updated;
                    }
                    return [data.item, ...prev];
                });
            }
            return data;
        } catch (err) {
            return { success: false, message: 'Network error' };
        }
    };

    const removeRating = async (movieId) => {
        const token = getToken();
        if (!token) return { success: false, message: 'Please login first' };

        try {
            const res = await fetch(`${API_URL}/ratings/remove/${movieId}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setRatings(prev => prev.filter(r => r.movie_id !== movieId));
            }
            return data;
        } catch (err) {
            return { success: false, message: 'Network error' };
        }
    };

    const value = {
        watchlist, favorites, ratings, loading,
        isInWatchlist, toggleWatchlist,
        isInFavorites, toggleFavorite,
        getUserRating, rateMovie, removeRating,
        refreshData: fetchUserData
    };

    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );
}