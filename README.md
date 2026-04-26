# 🎬 Movie Recommender

### AI-Powered Movie Discovery Platform

*Discover your next favorite movie with machine learning, a personality quiz, and a library of 800,000+ films.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-blue?style=for-the-badge)](https://movie-recommender-priyanshualex-2451s-projects.vercel.app)
[![API](https://img.shields.io/badge/⚡_API-Live_Server-green?style=for-the-badge)](https://movie-recommender-api-zsgy.onrender.com)
[![GitHub](https://img.shields.io/badge/📦_Repo-GitHub-black?style=for-the-badge)](https://github.com/Alexisontheway/movie-recommender)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)

---

</div>

## 🎥 What Is This?

Movie Recommender is a **full-stack web application** that helps you discover movies you'll actually enjoy. It combines:

- 🧠 **Machine Learning** — Content-based filtering using cosine similarity on 4,800+ movies
- 🎯 **Smart Quiz** — A 5-question personality quiz that maps to your taste
- 🔍 **TMDB Integration** — Real-time access to 800,000+ movies with posters, trailers, and cast info
- 👤 **User Accounts** — Save your watchlist, favorites, and star ratings

> **Not just another movie app** — this one actually learns what you like.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 ML-Powered Discovery
Enter 1-5 movies you love. The ML engine analyzes genres, keywords, cast, and crew using **cosine similarity** to find movies with the highest content overlap. Results are enriched with live TMDB data.

</td>
<td width="50%">

### 🎯 Personality Quiz
Answer 5 quick questions about your mood, preferred genre, and era. The scoring algorithm weighs genre match (50pts), rating quality (20pts), era preference (15pts), and more to curate 20 personalized picks.

</td>
</tr>
<tr>
<td width="50%">

### 🎬 Movie Detail Pages
Click any movie to see the full breakdown — HD backdrop, YouTube trailer, full cast with photos, where to watch (Netflix, Prime, etc.), budget/revenue, and 8 similar movies.

</td>
<td width="50%">

### 👤 User Profiles
Create an account, build your **Watchlist** 🔖, mark **Favorites** ❤️, rate movies ⭐ 1-5 stars, and get recommendations based on your saved movies.

</td>
</tr>
<tr>
<td width="50%">

### 🔍 Global Search
Search any movie from any page using the header search bar. Debounced search with instant dropdown results, poster thumbnails, and one-click navigation to detail pages.

</td>
<td width="50%">

### 📱 Mobile Responsive
Fully responsive design that works on desktop, tablet, and mobile. Action buttons (save, favorite, rate) are always accessible with touch-friendly interactions.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│                     │         │                      │
│   React.js          │────────▶│   Express.js         │
│   Frontend          │  REST   │   Backend API        │
│                     │  API    │                      │
│   ◦ Vercel          │         │   ◦ Render           │
│   ◦ Port 3000       │         │   ◦ Port 5000        │
│                     │         │                      │
└─────────────────────┘         └──────┬───────┬───────┘
                                       │       │
                                       ▼       ▼
                          ┌────────────┐ ┌────────────┐
                          │            │ │            │
                          │ PostgreSQL │ │  TMDB API  │
                          │ (Neon)     │ │  800K+     │
                          │            │ │  movies    │
                          │ ◦ Users    │ │            │
                          │ ◦ Lists    │ └────────────┘
                          │ ◦ Ratings  │
                          └────────────┘
                                ▲
                                │
                          ┌─────┴──────┐
                          │            │
                          │  FastAPI   │
                          │  ML Engine │
                          │            │
                          │ ◦ Render   │
                          │ ◦ sklearn  │
                          │ ◦ 4,800   │
                          │   movies   │
                          └────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js, React Router, Context API | Single-page app with client-side routing |
| **Styling** | CSS3, Custom Properties, Responsive | Dark theme, mobile-first, animations |
| **Backend** | Node.js, Express.js | REST API, business logic, route handling |
| **Auth** | JWT, bcrypt | Secure token-based authentication |
| **ML Engine** | Python, FastAPI, scikit-learn, pandas | Content-based recommendation model |
| **Database** | PostgreSQL (Neon) | Users, watchlist, favorites, ratings |
| **External API** | TMDB (The Movie Database) | Movie data, posters, trailers, cast |
| **Hosting** | Vercel (frontend), Render (backend + ML) | Production deployment with CI/CD |

---

## 🧠 How the ML Engine Works

```
Input: "Schindler's List"
   │
   ▼
┌─────────────────────────────┐
│  Feature Extraction         │
│  ◦ Genres: Drama, History   │
│  ◦ Keywords: holocaust,     │
│    genocide, war            │
│  ◦ Cast: Liam Neeson...     │
│  ◦ Director: Spielberg      │
│  ◦ Overview: TF-IDF vectors │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Cosine Similarity Matrix   │
│  Compare against 4,800      │
│  movie vectors              │
│                             │
│  similarity = cos(θ)        │
│  between feature vectors    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Top N Results              │
│  ◦ The Pianist (0.89)       │
│  ◦ Life Is Beautiful (0.84) │
│  ◦ The Boy in Striped       │
│    Pajamas (0.81)           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  TMDB Enrichment            │
│  ◦ Add poster, year         │
│  ◦ Add overview, trailer    │
│  ◦ Quality filter           │
│  ◦ Genre penalty/boost      │
└─────────────────────────────┘
```

---

## 🎯 Scoring Algorithm

The quiz recommendation engine scores each movie on a **100-point scale**:

| Factor | Max Points | How It Works |
|--------|-----------|-------------|
| **Genre Match** | 50 pts | Jaccard similarity between user's preferred genres and movie genres |
| **Rating Quality** | 20 pts | TMDB rating tiers: 8.5+ → 20pts, 8.0+ → 18pts, down to 0pts |
| **Era Preference** | 15 pts | Exact match → 15pts, ±5 years → 8pts, mismatch → 3pts |
| **Hidden Gem** | 5 pts | High rating (7.5+) + moderate votes (200-2000) + non-English |
| **Popularity** | 5 pts | General audience reach from TMDB popularity score |
| **Trust Score** | 5 pts | Vote count reliability: 5000+ → 5pts, 100+ → 2pts |

**Filters applied:**
- ❌ Concert films, comedy specials, YouTuber documentaries
- ❌ Movies with < 50 votes or < 5.0 rating
- ❌ Movies without posters or overviews
- ✅ Genre penalty (-45pts) for zero genre overlap in multi-movie mode
- ✅ Language bonus (+10pts) when input language matches output

---

## 📁 Project Structure

```
movie-recommender/
│
├── 🖥️ frontend/                  React.js Application
│   └── src/
│       ├── components/
│       │   ├── Header.jsx         # Global nav + search bar
│       │   ├── MovieCard.jsx      # Cards with save/fav/rate buttons
│       │   ├── RecommendationList.jsx
│       │   └── Footer.jsx
│       ├── context/
│       │   ├── AuthContext.js     # Login state management
│       │   └── MovieContext.js    # Watchlist/favorites/ratings state
│       ├── pages/
│       │   ├── Home.jsx           # Hero + features + trending
│       │   ├── Quiz.jsx           # 5-question quiz flow
│       │   ├── Results.jsx        # Split: Hidden Gems + Top Picks
│       │   ├── Discover.jsx       # ML-powered single/multi mode
│       │   ├── MovieDetail.jsx    # Full movie page + trailer
│       │   ├── Profile.jsx        # User lists + recommend button
│       │   ├── Login.jsx          # Auth
│       │   ├── Signup.jsx         # Auth
│       │   └── NotFound.jsx       # 404 page
│       ├── services/
│       │   ├── api.js             # Axios instance
│       │   └── authService.js     # Token management
│       └── styles/
│           ├── App.css            # Global + search + responsive
│           ├── MovieCard.css      # Cards + action buttons
│           ├── MovieDetail.css    # Detail page + trailer modal
│           ├── Discover.css       # ML discovery page
│           └── Auth.css           # Login/signup forms
│
├── ⚙️ backend/                    Express.js API
│   ├── config/
│   │   └── database.js           # PostgreSQL + Neon SSL
│   ├── middleware/
│   │   └── auth.js               # JWT verify + generate
│   ├── models/
│   │   └── User.js               # User CRUD + bcrypt
│   ├── routes/
│   │   ├── auth.js               # POST /signup, /login, GET /me
│   │   ├── movies.js             # GET /, /search, /genre, /:id
│   │   ├── recommendations.js    # POST /generate, /ml/multi
│   │   ├── watchlist.js          # GET, POST, DELETE
│   │   ├── favorites.js          # GET, POST, DELETE
│   │   └── ratings.js            # GET, POST, DELETE
│   ├── services/
│   │   ├── tmdbService.js        # TMDB API wrapper (15+ methods)
│   │   ├── mlService.js          # ML service client
│   │   ├── scoringService.js     # Quiz scoring algorithm
│   │   └── userProfileService.js # Quiz profile builder
│   └── server.js                 # Express app entry point
│
├── 🧠 ml-service/                 Python ML Engine
│   ├── app/
│   │   ├── main.py               # FastAPI server + endpoints
│   │   ├── recommender.py        # Cosine similarity engine
│   │   └── data_loader.py        # Dataset processing pipeline
│   ├── data/
│   │   ├── tmdb_5000_movies.csv  # Movie metadata
│   │   └── tmdb_5000_credits.csv # Cast & crew data
│   └── requirements.txt
│
└── 🗄️ database/
    ├── schema.sql                # Table definitions
    └── seed.sql                  # Initial data
```

---

## 📡 API Reference

### 🔐 Authentication
```
POST /api/auth/signup     → Create account
POST /api/auth/login      → Get JWT token
GET  /api/auth/me         → Get current user (requires token)
```

### 🎬 Movies
```
GET  /api/movies          → Popular movies
GET  /api/movies/:id      → Full details (cast, trailer, providers, similar)
GET  /api/movies/search?q → Search by title
GET  /api/movies/genre/:n → Filter by genre
```

### 🧠 Recommendations
```
POST /api/recommendations/generate           → Quiz-based (20 results)
GET  /api/recommendations/ml/hybrid/:id      → Single movie hybrid
POST /api/recommendations/ml/multi           → Multi-movie (up to 5)
GET  /api/recommendations/search?q           → Quick search
GET  /api/recommendations/ml/status          → ML engine health
```

### 👤 User Features *(auth required)*
```
GET    /api/watchlist              → Get watchlist
POST   /api/watchlist/add         → Add movie
DELETE /api/watchlist/remove/:id   → Remove movie

GET    /api/favorites              → Get favorites
POST   /api/favorites/add         → Add movie
DELETE /api/favorites/remove/:id   → Remove movie

GET    /api/ratings                → Get ratings
POST   /api/ratings/rate          → Rate 1-5 stars (upsert)
DELETE /api/ratings/remove/:id     → Remove rating
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+ · Python 3.10+ · PostgreSQL 14+
- [TMDB API Key](https://www.themoviedb.org/settings/api) (free)

### 1. Clone
```bash
git clone https://github.com/Alexisontheway/movie-recommender.git
cd movie-recommender
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
DATABASE_URL=postgresql://user:pass@localhost:5432/movie_recommender
JWT_SECRET=your-secret-key
ML_SERVICE_URL=http://127.0.0.1:8000
PORT=5000
```

```bash
node server.js
# 🎬 Server running on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# React app on http://localhost:3000
```

### 4. ML Service
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# ML engine on http://localhost:8000
```

### 5. Database
```sql
-- Run in psql or pgAdmin:
CREATE DATABASE movie_recommender;
-- Then run the schema from database/schema.sql
```

---

## 🗄️ Database Schema

```sql
users        (id, username, email, password_hash, avatar_url, created_at)
watchlist     (id, user_id→users, movie_id, title, poster, rating, year, added_at)
favorites    (id, user_id→users, movie_id, title, poster, rating, year, added_at)
user_ratings (id, user_id→users, movie_id, rating[1-5], review, rated_at)
quiz_history (id, user_id→users, answers[JSONB], created_at)
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [movie-recommender.vercel.app](https://movie-recommender-priyanshualex-2451s-projects.vercel.app) |
| Backend API | Render | [movie-recommender-api.onrender.com](https://movie-recommender-api-zsgy.onrender.com) |
| Database | Neon | PostgreSQL (cloud) |
| ML Engine | Render | Python FastAPI service |

---

## 🛣️ Roadmap

- [x] Quiz-based recommendation engine
- [x] TMDB API integration (800K+ movies)
- [x] ML service — cosine similarity on 4,800 movies
- [x] Hybrid recommendations (ML + TMDB combined)
- [x] JWT authentication with bcrypt
- [x] Watchlist, Favorites, Star Ratings
- [x] Movie detail pages with YouTube trailers
- [x] Cast photos, where to watch, budget/revenue
- [x] Global search bar with instant results
- [x] User profile with tabbed lists
- [x] "Recommend from Favorites" smart feature
- [x] Trending movies on homepage
- [x] Mobile responsive design
- [x] 404 error page
- [x] Deployed to production (Vercel + Render + Neon)
- [ ] Social sharing (share recommendation lists)
- [ ] Expand ML dataset (international films)
- [ ] Dark/Light theme toggle
- [ ] Advanced filtering (year range, rating range)

---

## 👨‍💻 Author

<div align="center">

**Priyanshu Alex**

[![GitHub](https://img.shields.io/badge/GitHub-@Alexisontheway-black?style=flat-square&logo=github)](https://github.com/Alexisontheway)

*Built with ☕ and a lot of movie nights.*

</div>

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

**⭐ Star this repo if you found it useful!**

*Made with React · Node.js · Python · PostgreSQL · TMDB API*

</div>
```

---

