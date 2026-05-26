"""FastAPI application entrypoint."""

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles

from talentdash.api.middleware import RequestTracingMiddleware
from talentdash.api.routes.analytics import router as analytics_router
from talentdash.api.routes.ingest import router as ingest_router
from talentdash.api.routes.public import router as public_router
from talentdash.api.spa import FRONTEND_DIST, create_spa_router, setup_spa
from talentdash.config import get_settings
from talentdash.observability import configure_logging, get_metrics
from talentdash.storage.prisma_client import disconnect_prisma, get_prisma

WEB_DIR = Path(__file__).parent.parent.parent.parent / "web"
_spa_mounted = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    from talentdash.storage.db_mode import check_database, is_using_mock

    await check_database()
    if is_using_mock():
        import structlog
        structlog.get_logger().warning(
            "database_unavailable_using_mock_data",
            hint="Install Docker and run scripts/start_dev.ps1 for real PostgreSQL",
        )
    yield
    await disconnect_prisma()


settings = get_settings()

app = FastAPI(
    title="TalentDash API",
    version="0.1.0",
    description=(
        "India-first compensation intelligence API. "
        "Accessible from web, mobile web, Android, and iOS via REST JSON."
    ),
    lifespan=lifespan,
    openapi_tags=[
        {"name": "public", "description": "Read API for web & mobile clients"},
        {"name": "ingest", "description": "Salary ingestion (requires API key)"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestTracingMiddleware)

app.include_router(public_router)
app.include_router(analytics_router)
app.include_router(ingest_router)

_spa_ready = setup_spa(app)

if not _spa_ready and WEB_DIR.exists():
    app.mount("/app", StaticFiles(directory=str(WEB_DIR), html=True), name="web-legacy")


@app.get("/api")
async def api_root():
    return {
        "service": "TalentDash",
        "version": "0.1.0",
        "web_app": "/" if _spa_ready else "/app",
        "api_v1": "/api/v1",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


if not _spa_ready:

    @app.get("/")
    async def root():
        return {
            "service": "TalentDash",
            "version": "0.1.0",
            "platforms": ["web", "mobile", "android", "ios"],
            "web_app": "/app",
            "api_v1": "/api/v1",
            "docs": "/docs",
            "openapi": "/openapi.json",
            "health": "/health",
            "hint": "Run: cd frontend && npm run build",
        }


@app.get("/health")
async def health():
    from talentdash.storage.db_mode import check_database, is_using_mock
    from talentdash.storage import mock_data

    await check_database()
    if is_using_mock():
        return {
            "status": "ok",
            "database": "mock (sample data - no PostgreSQL required)",
            "record_count": len(mock_data.get_all_records()),
            "frontend": "ready" if _spa_ready else "build required",
            "platforms": ["web", "mobile", "android", "ios"],
        }

    db_status = "ok"
    record_count = None
    try:
        db = await get_prisma()
        await asyncio.wait_for(db.query_raw("SELECT 1"), timeout=3.0)
        record_count = await asyncio.wait_for(
            db.salarysubmission.count(where={"needsHumanReview": False}),
            timeout=3.0,
        )
    except asyncio.TimeoutError:
        db_status = "error: database connection timed out (3s)"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "record_count": record_count,
        "frontend": "ready" if _spa_mounted else "build required",
        "platforms": ["web", "mobile", "android", "ios"],
    }


@app.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    return get_metrics().prometheus_text()


if _spa_ready:
    app.include_router(create_spa_router())
