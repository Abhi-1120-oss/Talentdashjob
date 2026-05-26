"""Async Prisma client singleton."""

import asyncio
import os

from prisma import Prisma

from talentdash.observability import get_logger

log = get_logger(__name__)

_client: Prisma | None = None
_connect_lock = asyncio.Lock()
CONNECT_TIMEOUT_SEC = 5.0


async def get_prisma() -> Prisma:
    global _client
    async with _connect_lock:
        if _client is None:
            _client = Prisma()
            try:
                await asyncio.wait_for(_client.connect(), timeout=CONNECT_TIMEOUT_SEC)
            except Exception as e:
                _client = None
                log.error("prisma_connect_failed", error=str(e))
                raise
        return _client


async def disconnect_prisma() -> None:
    global _client
    if _client is not None:
        try:
            await _client.disconnect()
        except Exception:
            pass
        _client = None


def reset_prisma_for_tests() -> None:
    """Reset client between tests."""
    global _client
    _client = None
    os.environ.setdefault(
        "DATABASE_URL",
        "postgresql://talentdash:talentdash@localhost:5432/talentdash?schema=public",
    )