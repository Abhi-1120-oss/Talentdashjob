"""Queue backend factory."""

from talentdash.config import get_settings
from talentdash.queue.asyncio_backend import AsyncioQueueBackend
from talentdash.queue.interface import QueueBackend
from talentdash.queue.redis_backend import RedisQueueBackend


def create_queue_backend() -> QueueBackend:
    settings = get_settings()
    if settings.queue_backend == "redis":
        return RedisQueueBackend()
    return AsyncioQueueBackend()
