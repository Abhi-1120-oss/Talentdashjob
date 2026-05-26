"""Rate limiting utilities for scrapers."""

import asyncio
import random
import time
from collections import defaultdict

from talentdash.config import get_settings


class AdaptiveRateLimiter:
    def __init__(self, domain: str):
        self.domain = domain
        self._semaphore: asyncio.Semaphore | None = None
        self._error_count = 0
        self._last_success = time.time()
        self._extra_delay = 0.0

    def _get_semaphore(self) -> asyncio.Semaphore:
        if self._semaphore is None:
            settings = get_settings()
            self._semaphore = asyncio.Semaphore(settings.scrape_max_concurrent)
        return self._semaphore

    async def acquire(self) -> None:
        settings = get_settings()
        async with self._get_semaphore():
            delay = random.uniform(
                settings.scrape_delay_min_sec + self._extra_delay,
                settings.scrape_delay_max_sec + self._extra_delay,
            )
            await asyncio.sleep(delay)

    def record_success(self) -> None:
        self._last_success = time.time()
        self._error_count = max(0, self._error_count - 1)
        self._extra_delay = max(0.0, self._extra_delay - 0.5)

    def record_error(self, status_code: int | None = None) -> None:
        self._error_count += 1
        if status_code in (403, 429):
            self._extra_delay = min(30.0, self._extra_delay + 2.0 * self._error_count)

    @property
    def last_success(self) -> float:
        return self._last_success


_limiters: dict[str, AdaptiveRateLimiter] = defaultdict(lambda: AdaptiveRateLimiter("default"))


def get_rate_limiter(domain: str) -> AdaptiveRateLimiter:
    if domain not in _limiters:
        _limiters[domain] = AdaptiveRateLimiter(domain)
    return _limiters[domain]
