"""
Vercel serverless entry — public read API + analytics (mock data).
Full pipeline/scrapers run locally or on a long-running host (Render, Railway, etc.).
"""

import os
import sys
from pathlib import Path

# src/ on PYTHONPATH for talentdash imports
_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT / "src"))

# Mock mode only — no Prisma/Postgres on Vercel serverless
os.environ.setdefault("DATABASE_URL", "postgresql://skip@127.0.0.1:5432/skip")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from talentdash.api.routes.analytics import router as analytics_router
from talentdash.api.routes.public import router as public_router
from talentdash.storage import db_mode
from talentdash.storage import mock_data

db_mode.set_db_available(False, mock=True)

app = FastAPI(
    title="TalentDash API",
    version="0.1.0",
    description="Serverless read API (mock sample data)",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router)
app.include_router(analytics_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "database": "mock (Vercel serverless)",
        "record_count": len(mock_data.get_all_records()),
        "platforms": ["web", "mobile", "android", "ios"],
    }


@app.get("/api")
async def api_root():
    return {
        "service": "TalentDash",
        "version": "0.1.0",
        "api_v1": "/api/v1",
        "mode": "vercel-serverless-mock",
    }


handler = Mangum(app, lifespan="off")
