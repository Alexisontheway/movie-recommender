import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os


class ContentBasedRecommender:
    def __init__(self):
        self.df = None
        self.similarity_matrix = None
        self.tfidf_matrix = None
        self.indices = None

    def load_data(self, csv_path="data/movies_processed.csv"):
        self.df = pd.read_csv(csv_path)
        self.df = self.df.fillna("")
        print(f"Loaded {len(self.df)} movies")

    def _create_soup(self, row):
        parts = [
            row["genres"],
            row["genres"],
            row["keywords"],
            row["cast"],
            row["director"],
            row["director"],
            row["overview"]
        ]
        return " ".join(parts)

    def build_model(self):
        print("Building recommendation model...")
        self.df["soup"] = self.df.apply(self._create_soup, axis=1)
        tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
        self.tfidf_matrix = tfidf.fit_transform(self.df["soup"])
        self.similarity_matrix = cosine_similarity(
            self.tfidf_matrix, self.tfidf_matrix
        )
        self.indices = pd.Series(
            self.df.index, index=self.df["title"].str.lower()
        )
        print("Model built successfully!")
        self._save_model()

    def _save_model(self):
        model_data = {
            "similarity_matrix": self.similarity_matrix,
            "indices": self.indices,
            "df": self.df
        }
        with open("models/similarity.pkl", "wb") as f:
            pickle.dump(model_data, f)
        print("Model saved to models/similarity.pkl")

    def load_model(self):
        if os.path.exists("models/similarity.pkl"):
            with open("models/similarity.pkl", "rb") as f:
                model_data = pickle.load(f)
            self.similarity_matrix = model_data["similarity_matrix"]
            self.indices = model_data["indices"]
            self.df = model_data["df"]
            print("Model loaded from disk")
            return True
        return False

    def recommend(self, movie_title, n=10):
        title_lower = movie_title.lower()

        if title_lower not in self.indices:
            matches = [t for t in self.indices.index if title_lower in t]
            if matches:
                title_lower = matches[0]
            else:
                return {"error": "Movie not found: " + movie_title}

        idx = self.indices[title_lower]
        if isinstance(idx, pd.Series):
            idx = idx.iloc[0]

        sim_scores = list(enumerate(self.similarity_matrix[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:n + 1]

        recommendations = []
        for i, score in sim_scores:
            movie = self.df.iloc[i]
            recommendations.append({
                "id": int(movie["id"]),
                "title": movie["title"],
                "genres": movie["genres"],
                "vote_average": float(movie["vote_average"]),
                "similarity_score": round(float(score), 4)
            })

        return {
            "movie": movie_title,
            "recommendations": recommendations
        }
