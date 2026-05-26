"""Queue worker process."""

import asyncio
import signal

from talentdash.observability import configure_logging, get_logger
from talentdash.queue.factory import create_queue_backend
from talentdash.queue.interface import QueueMessage

log = get_logger(__name__)

QUEUES = ["scrape", "extract", "normalize", "store", "retry", "human_review"]


class Worker:
    def __init__(self) -> None:
        self._backend = create_queue_backend()
        self._running = False
        self._handlers: dict[str, callable] = {}

    def register_handler(self, job_type: str, handler: callable) -> None:
        self._handlers[job_type] = handler

    async def _process_message(self, queue_name: str, message: QueueMessage) -> None:
        handler = self._handlers.get(message.job_type)
        if not handler:
            log.warning("no_handler", job_type=message.job_type)
            await self._backend.ack(queue_name, message)
            return
        try:
            await handler(message.payload)
            await self._backend.ack(queue_name, message)
        except Exception as e:
            log.error("job_failed", job_type=message.job_type, error=str(e))
            await self._backend.nack(queue_name, message)

    async def _poll_queue(self, queue_name: str) -> None:
        while self._running:
            message = await self._backend.dequeue(queue_name, timeout=2.0)
            if message:
                await self._process_message(queue_name, message)
            await asyncio.sleep(0.1)

    async def start(self) -> None:
        self._running = True
        log.info("worker_started", queues=QUEUES)
        tasks = [asyncio.create_task(self._poll_queue(q)) for q in QUEUES]
        while self._running:
            await asyncio.sleep(60)
            log.info("worker_heartbeat", queues=QUEUES)
        for t in tasks:
            t.cancel()

    async def stop(self) -> None:
        self._running = False
        await self._backend.close()
        log.info("worker_stopped")


async def run_worker() -> None:
    configure_logging()
    worker = Worker()

    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, lambda: asyncio.create_task(worker.stop()))
        except NotImplementedError:
            pass

    await worker.start()


def main() -> None:
    asyncio.run(run_worker())
