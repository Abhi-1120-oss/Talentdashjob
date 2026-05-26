"""Retry middleware for scraper operations."""

import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar

from talentdash.config import get_settings
from talentdash.observability import get_logger

log = get_logger(__name__)
T = TypeVar("T")


async def with_retry(
    fn: Callable[[], Awaitable[T]],
    *,
    max_retries: int | None = None,
    base_delay: float = 2.0,
    label: str = "operation",
) -> T:
    settings = get_settings()
    retries = max_retries if max_retries is not None else settings.max_scrape_retries
    last_exc: Exception | None = None

    for attempt in range(retries + 1):
        try:
            return await fn()
        except Exception as e:
            last_exc = e
            if attempt >= retries:
                break
            delay = base_delay * (2**attempt)
            log.warning("retry_attempt", label=label, attempt=attempt + 1, delay=delay, error=str(e))
            await asyncio.sleep(delay)

    assert last_exc is not None
    raise last_exc
