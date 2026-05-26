"""Abstract queue backend interface."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class QueueMessage:
    job_type: str
    payload: dict[str, Any]
    attempt: int = 0


class QueueBackend(ABC):
    @abstractmethod
    async def enqueue(self, queue_name: str, message: QueueMessage) -> None:
        ...

    @abstractmethod
    async def dequeue(self, queue_name: str, timeout: float = 5.0) -> QueueMessage | None:
        ...

    @abstractmethod
    async def ack(self, queue_name: str, message: QueueMessage) -> None:
        ...

    @abstractmethod
    async def nack(self, queue_name: str, message: QueueMessage) -> None:
        ...

    @abstractmethod
    async def close(self) -> None:
        ...
