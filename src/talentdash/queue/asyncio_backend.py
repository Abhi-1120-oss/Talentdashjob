"""In-process asyncio queue backend."""

import asyncio
import json
from collections import defaultdict

from talentdash.queue.interface import QueueBackend, QueueMessage


class AsyncioQueueBackend(QueueBackend):
    def __init__(self) -> None:
        self._queues: dict[str, asyncio.Queue[str]] = defaultdict(asyncio.Queue)
        self._inflight: dict[str, QueueMessage] = {}

    async def enqueue(self, queue_name: str, message: QueueMessage) -> None:
        await self._queues[queue_name].put(json.dumps({
            "job_type": message.job_type,
            "payload": message.payload,
            "attempt": message.attempt,
        }))

    async def dequeue(self, queue_name: str, timeout: float = 5.0) -> QueueMessage | None:
        try:
            raw = await asyncio.wait_for(self._queues[queue_name].get(), timeout=timeout)
            msg = QueueMessage(**json.loads(raw))
            self._inflight[queue_name] = msg
            return msg
        except asyncio.TimeoutError:
            return None

    async def ack(self, queue_name: str, message: QueueMessage) -> None:
        self._inflight.pop(queue_name, None)

    async def nack(self, queue_name: str, message: QueueMessage) -> None:
        self._inflight.pop(queue_name, None)
        message.attempt += 1
        await self.enqueue("retry", message)

    async def close(self) -> None:
        pass
