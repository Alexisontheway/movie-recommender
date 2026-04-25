from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.recommender import ContentBasedRecommender
from app.data_loader import load_and_process_data
import os

recommender = ContentBasedRecommender()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not recommender.load_model():
        print("No saved model found. Building from scratch...")
        if not os.path.exists("data/movies_processed.csv"):
            load_and_process_data()
        recommender.load_data()
        recommender.build_model()
    yield
    print("Shutting down ML Service...")


app = FastAPI(
    title="Movie Recommender ML Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ML Service is running!", "version": "1.0.0"}


@app.get("/recommend/{movie_title}")
def get_recommendations(movie_title: str, n: int = 10):
    result = recommender.recommend(movie_title, n=n)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.get("/movies")
def get_all_movies():
    if recommender.df is not None:
        movies = recommender.df[["id", "title", "genres", "vote_average"]].to_dict("records")
        return {"total": len(movies), "movies": movies}
    return {"total": 0, "movies": []}


@app.post("/rebuild")
def rebuild_model():
    try:
        load_and_process_data()
        recommender.load_data()
        recommender.build_model()
        return {"status": "Model rebuilt successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))