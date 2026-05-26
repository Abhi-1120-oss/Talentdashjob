"""FastAPI middleware."""

import time
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from talentdash.observability import get_logger, get_metrics
from talentdash.observability.tracing import bind_request_id

log = get_logger(__name__)


class RequestTracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid4())
        bind_request_id(request_id)
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        get_metrics().inc("api.requests")
        log.info(
            "request_complete",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=round(duration_ms, 2),
            request_id=request_id,
        )
        response.headers["X-Request-ID"] = request_id
        return response
