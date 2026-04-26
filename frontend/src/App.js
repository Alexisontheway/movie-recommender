import './styles/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import About from './pages/About';
import Discover from './pages/Discover';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import MovieDetail from './pages/MovieDetail';

function App() {
    return (
        <AuthProvider>
            <MovieProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/quiz" element={<Quiz />} />
                        <Route path="/results" element={<Results />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/discover" element={<Discover />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/movie/:id" element={<MovieDetail />} />
                    </Routes>
                </BrowserRouter>
            </MovieProvider>
        </AuthProvider>
    );
}

export default App;