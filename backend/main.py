"""QueryShield AI — FastAPI application entry point.

Run: uvicorn backend.main:app --reload
Docs: http://127.0.0.1:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import settings
from backend.database.db import init_users_table
from backend.routes.auth_routes import router as auth_router
from backend.routes.meta_routes import router as meta_router
from backend.routes.query_routes import router as query_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks before the server begins accepting requests."""
    init_users_table()   # idempotent — safe to call on every restart
    yield


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allows the Vite dev server (port 5173) to send the Authorization header.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(query_router)
app.include_router(meta_router)


@app.get("/", tags=["Health"])
def health_check():
    """Returns API health status."""
    return {
        "status":  "ok",
        "message": f"{settings.APP_TITLE} is running",
        "version": settings.APP_VERSION,
        "docs":    "http://127.0.0.1:8000/docs",
    }
