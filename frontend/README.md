# 🎬 Movie Recommender

A full-stack movie recommendation app that uses a quiz-based system to suggest personalized movies.

## Features
- Interactive quiz (genre, tone, era, rating)
- Smart scoring algorithm
- Real-time movie data from TMDB API
- Responsive dark-themed UI

## Tech Stack
- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, Axios
- **API:** TMDB (The Movie Database)

## How It Works
1. User takes a 5-question quiz
2. Backend fetches movies from TMDB
3. Scoring algorithm ranks each movie
4. Top 10 personalized recommendations returned

## Setup

### Backend
```bash
cd backend
npm install
# Create .env with your TMDB_API_KEY
npm start