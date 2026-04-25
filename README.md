# 🎬 Movie Recommender — AI-Powered Movie Discovery Platform

A full-stack movie recommendation platform that combines **Machine Learning** with the **TMDB API** to deliver personalized movie suggestions. Features a quiz-based recommendation engine, ML-powered discovery, user authentication, watchlist, favorites, and star ratings.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

---

## 🌟 Features

### 🧠 ML-Powered Discovery
- **Single Movie Mode** — Enter any movie, get hybrid recommendations from both ML engine + TMDB
- **Multi-Movie Mode** — Add up to 5 movies, get recommendations based on combined taste profile
- **4,800+ movies** in the ML brain trained on content-based filtering (cosine similarity)

### 🎯 Smart Quiz
- **5-question personality quiz** that maps to genre preferences, era, and mood
- Intelligent scoring system with genre matching (50pts), rating quality (20pts), era preference (15pts)
- Concert films, niche documentaries, and non-movie content automatically filtered out

### 👤 User Accounts
- **JWT Authentication** — Secure signup/login with encrypted passwords (bcrypt)
- **Watchlist** 🔖 — Save movies to watch later
- **Favorites** ❤️ — Heart the movies you love
- **Star Ratings** ⭐ — Rate movies 1-5 stars
- **Profile Page** — View all your saved movies with tabbed interface

### 🔍 Intelligent Filtering
- Genre-aware scoring — movies matching your input genres get boosted
- Language-aware — Hindi input movies prioritize Hindi recommendations
- Quality filters — minimum vote count, rating thresholds, no low-quality content
- Concert/documentary filter — blocks BTS concerts, comedy specials, YouTuber docs

---

## 🏗️ Architecture
┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ │ │ │ │ │
│ React.js │────▶│ Express.js │────▶│ PostgreSQL │
│ Frontend │ │ Backend API │ │ Database │
│ (Port 3000) │ │ (Port 5000) │ │ │
│ │ │ │ └─────────────────┘
└─────────────────┘ │ │
│ │────▶ TMDB API
│ │ (Movie Data)
└──────────────────┘
│
▼
┌──────────────────┐
│ FastAPI │
│ ML Service │
│ (Port 8000) │
│ Python/Sklearn │
└──────────────────┘



---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, React Router, Context API, CSS3 |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **ML Service** | Python, FastAPI, scikit-learn, pandas, cosine similarity |
| **Database** | PostgreSQL (users, watchlist, favorites, ratings) |
| **External API** | TMDB (The Movie Database) — 800K+ movies |
| **Auth** | bcrypt password hashing, JWT tokens (7-day expiry) |

---

## 📁 Project Structure
movie-recommender/
├── backend/
│ ├── config/
│ │ └── database.js # PostgreSQL connection
│ ├── middleware/
│ │ └── auth.js # JWT auth middleware
│ ├── models/
│ │ └── User.js # User model with bcrypt
│ ├── routes/
│ │ ├── auth.js # Login/Signup endpoints
│ │ ├── recommendations.js # Quiz + ML + Hybrid recommendations
│ │ ├── watchlist.js # Watchlist CRUD
│ │ ├── favorites.js # Favorites CRUD
│ │ └── ratings.js # Movie ratings CRUD
│ ├── services/
│ │ ├── tmdbService.js # TMDB API integration
│ │ ├── mlService.js # ML service client
│ │ ├── scoringService.js # Movie scoring algorithm
│ │ └── userProfileService.js# Quiz profile builder
│ └── server.js
│
├── frontend/
│ └── src/
│ ├── components/
│ │ ├── Header.jsx
│ │ ├── MovieCard.jsx # Cards with watchlist/fav/rate buttons
│ │ └── RecommendationList.jsx
│ ├── context/
│ │ ├── AuthContext.js # Authentication state
│ │ └── MovieContext.js # Watchlist/favorites/ratings state
│ ├── pages/
│ │ ├── Home.jsx
│ │ ├── Quiz.jsx
│ │ ├── Results.jsx # Split Hidden Gems + Top Picks
│ │ ├── Discover.jsx # ML-powered discovery
│ │ ├── Profile.jsx # User profile with tabs
│ │ ├── Login.jsx
│ │ └── Signup.jsx
│ └── services/
│ ├── api.js
│ └── authService.js
│
├── ml-service/
│ ├── app/
│ │ ├── main.py # FastAPI server
│ │ ├── recommender.py # ML recommendation engine
│ │ └── data_loader.py # Dataset processing
│ ├── data/
│ │ ├── tmdb_5000_movies.csv
│ │ └── tmdb_5000_credits.csv
│ └── requirements.txt
│
└── database/
├── schema.sql
└── seed.sql



---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- TMDB API Key [Get one here](https://www.themoviedb.org/settings/api)

### 1. Clone the repo
```bash
git clone https://github.com/Alexisontheway/movie-recommender.git
cd movie-recommender
2. Backend Setup
bash
cd backend
npm install
Create backend/.env:



env
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
DATABASE_URL=postgresql://user:password@localhost:5432/movie_recommender
JWT_SECRET=your-secret-key
PORT=5000



bash
node server.js


3. Frontend Setup
bash
cd frontend
npm install
npm start


4. ML Service Setup
bash
cd ml-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000


5. Database Setup
bash
psql -U your_user -d movie_recommender -f database/schema.sql
📡 API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/signup	Create new account
POST	/api/auth/login	Login
GET	/api/auth/me	Get current user profile
Recommendations
Method	Endpoint	Description
POST	/api/recommendations/generate	Quiz-based recommendations
GET	/api/recommendations/ml/hybrid/:movieId	Single movie hybrid recs
POST	/api/recommendations/ml/multi	Multi-movie recommendations
GET	/api/recommendations/search?q=	Search movies
GET	/api/recommendations/ml/status	ML service health check
User Features (Auth Required)
Method	Endpoint	Description
GET	/api/watchlist	Get user's watchlist
POST	/api/watchlist/add	Add to watchlist
DELETE	/api/watchlist/remove/:movieId	Remove from watchlist
GET	/api/favorites	Get user's favorites
POST	/api/favorites/add	Add to favorites
DELETE	/api/favorites/remove/:movieId	Remove from favorites
GET	/api/ratings	Get user's ratings
POST	/api/ratings/rate	Rate a movie (1-5)
DELETE	/api/ratings/remove/:movieId	Remove rating
🧠 How the ML Engine Works
Dataset: TMDB 5000 Movies + Credits
Feature Extraction: Genres, keywords, cast, crew, overview (TF-IDF)
Similarity Matrix: Cosine similarity between all movie pairs
Hybrid Approach: ML results enriched with live TMDB data (poster, year, overview)
Fallback: If ML doesn't have a movie, TMDB similar movies fill the gap
🎯 Scoring Algorithm
Factor	Weight	Description
Genre Match	50 pts	How well movie genres align with user preference
Rating Quality	20 pts	TMDB rating (8.5+ = full score)
Era Preference	15 pts	Matches user's preferred decade
Hidden Gem Bonus	5 pts	High rating + moderate votes + underrated
Popularity	5 pts	General audience reach
Trust Score	5 pts	Vote count reliability
🗄️ Database Schema
sql
-- Users table
users (id, username, email, password_hash, avatar_url, created_at)

-- User features
watchlist (id, user_id, movie_id, movie_title, movie_poster, movie_rating, movie_year, added_at)
favorites (id, user_id, movie_id, movie_title, movie_poster, movie_rating, movie_year, added_at)
user_ratings (id, user_id, movie_id, rating, review, rated_at, updated_at)
quiz_history (id, user_id, answers, created_at)
