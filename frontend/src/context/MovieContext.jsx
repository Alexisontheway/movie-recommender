import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

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

    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('movie_recommender_token');
        if (!token) {
            setWatchlist([]);
            setFavorites([]);
            setRatings([]);
            return;
        }
        setLoading(true);
        try {
            const [wRes, fRes, rRes] = await Promise.all([
                api.get('/watchlist'),
                api.get('/favorites'),
                api.get('/ratings')
            ]);

            if (wRes.data.success) setWatchlist(wRes.data.watchlist);
            if (fRes.data.success) setFavorites(fRes.data.favorites);
            if (rRes.data.success) setRatings(rRes.data.ratings);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        }
        setLoading(false);
    }, [isLoggedIn]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const isInWatchlist = (movieId) => watchlist.some(m => m.movie_id === movieId);

    const toggleWatchlist = async (movie) => {
        const token = localStorage.getItem('movie_recommender_token');
        if (!token) return { success: false, message: 'Please login first' };

        if (isInWatchlist(movie.id)) {
            try {
                const res = await api.delete(`/watchlist/remove/${movie.id}`);
                if (res.data.success) {
                    setWatchlist(prev => prev.filter(m => m.movie_id !== movie.id));
                }
                return res.data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        } else {
            try {
                const res = await api.post('/watchlist/add', {
                    movie_id: movie.id,
                    movie_title: movie.title,
                    movie_poster: movie.poster,
                    movie_rating: movie.rating,
                    movie_year: movie.year
                });
                if (res.data.success) {
                    setWatchlist(prev => [res.data.item, ...prev]);
                }
                return res.data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        }
    };

    const isInFavorites = (movieId) => favorites.some(m => m.movie_id === movieId);

    const toggleFavorite = async (movie) => {
        const token = localStorage.getItem('movie_recommender_token');
        if (!token) return { success: false, message: 'Please login first' };

        if (isInFavorites(movie.id)) {
            try {
                const res = await api.delete(`/favorites/remove/${movie.id}`);
                if (res.data.success) {
                    setFavorites(prev => prev.filter(m => m.movie_id !== movie.id));
                }
                return res.data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        } else {
            try {
                const res = await api.post('/favorites/add', {
                    movie_id: movie.id,
                    movie_title: movie.title,
                    movie_poster: movie.poster,
                    movie_rating: movie.rating,
                    movie_year: movie.year
                });
                if (res.data.success) {
                    setFavorites(prev => [res.data.item, ...prev]);
                }
                return res.data;
            } catch (err) {
                return { success: false, message: 'Network error' };
            }
        }
    };

    const getUserRating = (movieId) => {
        const r = ratings.find(r => r.movie_id === movieId);
        return r ? r.rating : 0;
    };

    const rateMovie = async (movieId, rating) => {
        const token = localStorage.getItem('movie_recommender_token');
        if (!token) return { success: false, message: 'Please login first' };

        try {
            const res = await api.post('/ratings/rate', { movie_id: movieId, rating });
            if (res.data.success) {
                setRatings(prev => {
                    const existing = prev.findIndex(r => r.movie_id === movieId);
                    if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = res.data.item;
                        return updated;
                    }
                    return [res.data.item, ...prev];
                });
            }
            return res.data;
        } catch (err) {
            return { success: false, message: 'Network error' };
        }
    };

    const removeRating = async (movieId) => {
        const token = localStorage.getItem('movie_recommender_token');
        if (!token) return { success: false, message: 'Please login first' };

        try {
            const res = await api.delete(`/ratings/remove/${movieId}`);
            if (res.data.success) {
                setRatings(prev => prev.filter(r => r.movie_id !== movieId));
            }
            return res.data;
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