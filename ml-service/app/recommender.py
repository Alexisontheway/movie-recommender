"""
Dynamic Real-Time Content-Based Recommender Engine v2.0
=======================================================
Replaces the static 4,800-movie similarity matrix with on-the-fly TF-IDF
vectorization over a live candidate pool fetched from TMDB.

Architecture:
  1. Node backend fetches ~150 candidate movies from TMDB (similar, discover, trending)
  2. Backend POSTs the candidate pool + source movie metadata to this service
  3. This service builds a temporary TF-IDF matrix (150 x features) in <50ms
  4. Computes cosine similarity between the source movie and all candidates
  5. Returns ranked recommendations sorted by ML similarity score

Memory: <1 MB per request (no persistent matrix)
Latency: <100ms per request
Coverage: Every movie on TMDB (~800,000+)
"""

import threading

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class DynamicRecommender:
    """Stateless recommender — no preloaded data, no pickle files."""

    def __init__(self):
        self.request_count = 0
        # FastAPI runs sync endpoints in a threadpool — guard the counter.
        self._lock = threading.Lock()

    @staticmethod
    def _build_soup(movie: dict) -> str:
        """Build a weighted feature string from movie metadata.

        Genres and director are repeated for emphasis (they carry more
        signal than a single keyword token).
        """
        genres = movie.get("genres", "")
        keywords = movie.get("keywords", "")
        cast = movie.get("cast", "")
        director = movie.get("director", "")
        overview = movie.get("overview", "")

        parts = [
            genres, genres,       # double-weight genres
            keywords,
            cast,
            director, director,  # double-weight director
            overview,
        ]
        return " ".join(str(p) for p in parts if p)

    def recommend(
        self,
        source_movie: dict,
        candidates: list[dict],
        n: int = 15,
    ) -> dict:
        """Run real-time TF-IDF + cosine similarity on a candidate pool.

        Args:
            source_movie: Dict with keys (title, genres, keywords, cast, director, overview)
            candidates: List of dicts, each with the same keys + id, vote_average, etc.
            n: Number of top results to return

        Returns:
            Dict with ranked recommendations and metadata.
        """
        with self._lock:
            self.request_count += 1

        if not candidates:
            return {"error": "No candidates provided", "recommendations": []}

        # Build feature soups
        source_soup = self._build_soup(source_movie)
        candidate_soups = [self._build_soup(c) for c in candidates]

        # Prepend the source movie soup so it occupies index 0
        all_soups = [source_soup] + candidate_soups

        # Vectorize with TF-IDF
        tfidf = TfidfVectorizer(
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),    # unigrams + bigrams for richer similarity
            min_df=1,
            max_df=0.95,
        )

        try:
            tfidf_matrix = tfidf.fit_transform(all_soups)
        except ValueError:
            # All documents are empty / no features extracted
            return {"error": "Insufficient metadata for ML analysis", "recommendations": []}

        # Compute cosine similarity between source (index 0) and all candidates
        source_vector = tfidf_matrix[0:1]
        candidate_vectors = tfidf_matrix[1:]
        similarities = cosine_similarity(source_vector, candidate_vectors).flatten()

        # Build scored results
        scored = []
        for i, sim_score in enumerate(similarities):
            candidate = candidates[i]
            scored.append({
                "id": candidate.get("id"),
                "title": candidate.get("title", "Unknown"),
                "genres": candidate.get("genres", ""),
                "vote_average": candidate.get("vote_average", 0),
                "popularity": candidate.get("popularity", 0),
                "similarity_score": round(float(sim_score), 4),
            })

        # Sort by similarity descending, take top n
        scored.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_results = scored[:n]

        return {
            "movie": source_movie.get("title", "Unknown"),
            "total_candidates": len(candidates),
            "features_extracted": tfidf_matrix.shape[1],
            "recommendations": top_results,
        }

    def get_stats(self) -> dict:
        return {
            "engine": "dynamic-tfidf-v2",
            "mode": "real-time",
            "coverage": "800K+ (TMDB live)",
            "memory": "<1MB per request",
            "requests_served": self.request_count,
        }