"""SPA static file serving with fallback."""

from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

FRONTEND_DIST = Path(__file__).parent.parent.parent.parent / "frontend" / "dist"

API_PREFIXES = ("api/", "docs", "redoc", "openapi.json", "health", "metrics")


def setup_spa(app: FastAPI) -> bool:
    """Configure React static assets. Returns True if dist exists."""
    if not FRONTEND_DIST.exists() or not (FRONTEND_DIST / "index.html").exists():
        return False

    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="spa-assets")

    @app.get("/app")
    async def redirect_legacy_app():
        return RedirectResponse(url="/", status_code=302)

    @app.get("/favicon.svg", include_in_schema=False)
    async def favicon():
        return FileResponse(FRONTEND_DIST / "favicon.svg")

    @app.get("/", include_in_schema=False)
    async def spa_index():
        return FileResponse(FRONTEND_DIST / "index.html")

    return True


def create_spa_router() -> APIRouter:
    """Catch-all router — must be included LAST on the app."""
    router = APIRouter(include_in_schema=False)

    @router.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        if full_path.startswith(API_PREFIXES) or full_path == "api":
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")

    return router
