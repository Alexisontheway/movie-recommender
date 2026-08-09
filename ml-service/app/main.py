"""
Movie Recommender ML Service v2.0 — Dynamic Real-Time Engine
=============================================================
No static CSV files. No pickle models. No 189MB similarity matrices.
Pure stateless, on-demand TF-IDF + Cosine Similarity.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from app.recommender import DynamicRecommender

# ─── Request Body Size Limit ──────────────────────────────────────────────────

MAX_BODY_BYTES = 2 * 1024 * 1024  # 2 MB — generous for ~200 movie metadata objects

class BodySizeLimitMiddleware:
    """Rejects request bodies larger than MAX_BODY_BYTES (Content-Length based)."""

    def __init__(self, app, max_bytes: int = MAX_BODY_BYTES):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        content_length = None
        for name, value in scope.get("headers", []):
            if name == b"content-length":
                try:
                    content_length = int(value)
                except ValueError:
                    content_length = None
                break

        if content_length is not None and content_length > self.max_bytes:
            response = JSONResponse(
                status_code=413,
                content={"detail": "Request body too large (max 2 MB)"},
            )
            await response(scope, receive, send)
            return

        await self.app(scope, receive, send)


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class MovieMetadata(BaseModel):
    id: int | None = None
    title: str = Field(default="", max_length=20_000)
    genres: str = Field(default="", max_length=20_000)
    keywords: str = Field(default="", max_length=50_000)
    cast: str = Field(default="", max_length=50_000)
    director: str = Field(default="", max_length=20_000)
    overview: str = Field(default="", max_length=100_000)
    vote_average: float = 0
    popularity: float = 0


class RecommendRequest(BaseModel):
    source: MovieMetadata
    candidates: list[MovieMetadata] = Field(default_factory=list, max_length=1000)
    count: int = Field(default=15, ge=1, le=200)


# ─── App Setup ─────────────────────────────────────────────────────────────────

recommender = DynamicRecommender()

app = FastAPI(
    title="Movie Recommender ML Service",
    description="Dynamic real-time TF-IDF engine — covers 800K+ TMDB movies",
    version="2.0.0",
)

# CORS — scoped to the app's own frontend + localhost dev. The service is meant
# for server-to-server calls from the Node backend (no Origin header), so this
# is hygiene rather than a functional requirement.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://movie-recommender-priyanshualex-2451s-projects.vercel.app",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Added last → outermost middleware: rejects oversized bodies before parsing.
app.add_middleware(BodySizeLimitMiddleware)


# ─── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check — used by the Node backend to determine ML status."""
    return {
        "status": "ML Service is running!",
        "version": "2.0.0",
        "engine": "dynamic-tfidf",
        "mode": "real-time",
        "coverage": "800K+ movies (TMDB live)",
    }


@app.get("/health")
def health():
    """Detailed health check with stats."""
    stats = recommender.get_stats()
    return {"status": "healthy", **stats}


@app.post("/recommend/dynamic")
def dynamic_recommend(request: RecommendRequest):
    """Core endpoint: accepts a source movie + candidate pool, returns ML-ranked results.

    The Node.js backend is responsible for:
      1. Fetching the source movie details from TMDB
      2. Building a candidate pool (~100-200 movies) from TMDB similar, discover, trending
      3. Extracting metadata (genres, keywords, cast, director, overview) for each

    This endpoint:
      1. Builds a temporary TF-IDF matrix from the candidate pool
      2. Computes cosine similarity between source and candidates
      3. Returns the top N results ranked by ML similarity score
    """
    source_dict = request.source.model_dump()
    candidates_dicts = [c.model_dump() for c in request.candidates]

    if len(candidates_dicts) == 0:
        raise HTTPException(status_code=400, detail="No candidates provided")

    result = recommender.recommend(
        source_movie=source_dict,
        candidates=candidates_dicts,
        n=request.count,
    )

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    return result


# ─── Legacy compatibility (v1 title-based lookup — now returns helpful error) ─

@app.get("/recommend/{movie_title}")
def legacy_recommend(movie_title: str, n: int = 10):
    """Legacy endpoint — informs callers to use the new dynamic endpoint."""
    return {
        "error": "Legacy endpoint deprecated. Use POST /recommend/dynamic instead.",
        "movie": movie_title,
        "recommendations": [],
        "migration": "The v2 engine no longer uses a static dataset. Send candidates via POST.",
    }


@app.get("/movies")
def get_movies():
    """Legacy endpoint — no static movie list in v2."""
    return {
        "total": 0,
        "movies": [],
        "note": "v2 engine is dynamic — movies are sourced live from TMDB (800K+ coverage)",
    }