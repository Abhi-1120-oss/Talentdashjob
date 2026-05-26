"""FastAPI dependencies."""

from fastapi import Header, HTTPException, status

from talentdash.config import get_settings
from talentdash.observability.tracing import get_request_id, new_request_id


async def verify_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    settings = get_settings()
    if not settings.api_key:
        return
    if not x_api_key or x_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )


def get_or_create_request_id(x_request_id: str | None = Header(default=None)) -> str:
    if x_request_id:
        return x_request_id
    existing = get_request_id()
    return existing or new_request_id()
