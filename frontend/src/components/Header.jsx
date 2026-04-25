import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <header className="site-header">
      <h2 style={{ margin: 0 }}>🎬 Movie Recommender</h2>

      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/quiz">Quiz</Link>
        <Link to="/discover">🧠 Discover</Link>
        <Link to="/about">About</Link>

        {isLoggedIn ? (
          <>
            <Link to="/profile" style={{ color: "#00d4ff", fontWeight: 600, textDecoration: "none" }}>
              👤 {user?.username}
            </Link>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ff4444",
                padding: "0.3rem 0.8rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              padding: "0.3rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
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