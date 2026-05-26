"""Transaction helpers for batch operations."""

from collections.abc import Awaitable, Callable
from typing import TypeVar

from tenacity import retry, stop_after_attempt, wait_exponential_jitter

T = TypeVar("T")


@retry(stop=stop_after_attempt(3), wait=wait_exponential_jitter(initial=0.5, max=4))
async def with_db_retry(fn: Callable[[], Awaitable[T]]) -> T:
    return await fn()
