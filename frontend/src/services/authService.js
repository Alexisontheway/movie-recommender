import api from './api';

const TOKEN_KEY = 'movie_recommender_token';
const USER_KEY = 'movie_recommender_user';

const authService = {
    // Signup
    async signup(username, email, password) {
        const res = await api.post('/auth/signup', { username, email, password });
        if (res.data.success) {
            localStorage.setItem(TOKEN_KEY, res.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
        return res.data;
    },

    // Login
    async login(email, password) {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success) {
            localStorage.setItem(TOKEN_KEY, res.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
        return res.data;
    },

    // Logout
    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Get stored token
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    // Get stored user
    getUser() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Check if logged in
    isLoggedIn() {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    // Get profile from server
    async getProfile() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const res = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                this.logout();
            }
            return null;
        }
    }
};

export default authService;