"""Redis queue backend for multi-worker scaling."""

import json

import redis.asyncio as aioredis

from talentdash.config import get_settings
from talentdash.queue.interface import QueueBackend, QueueMessage


class RedisQueueBackend(QueueBackend):
    def __init__(self) -> None:
        settings = get_settings()
        self._redis = aioredis.from_url(settings.redis_url, decode_responses=True)
        self._visibility_timeout = 300

    def _key(self, queue_name: str) -> str:
        return f"talentdash:queue:{queue_name}"

    async def enqueue(self, queue_name: str, message: QueueMessage) -> None:
        payload = json.dumps({
            "job_type": message.job_type,
            "payload": message.payload,
            "attempt": message.attempt,
        })
        await self._redis.lpush(self._key(queue_name), payload)

    async def dequeue(self, queue_name: str, timeout: float = 5.0) -> QueueMessage | None:
        result = await self._redis.brpop(self._key(queue_name), timeout=int(timeout))
        if not result:
            return None
        _, raw = result
        data = json.loads(raw)
        return QueueMessage(**data)

    async def ack(self, queue_name: str, message: QueueMessage) -> None:
        pass

    async def nack(self, queue_name: str, message: QueueMessage) -> None:
        message.attempt += 1
        await self.enqueue("retry", message)

    async def close(self) -> None:
        await self._redis.close()
