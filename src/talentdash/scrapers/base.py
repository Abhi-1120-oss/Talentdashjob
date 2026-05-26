"""Base scraper contract."""

from abc import ABC, abstractmethod

from talentdash.validation.enums import DataSource
from talentdash.validation.schemas import ScrapedRecord


class BaseScraper(ABC):
    source: DataSource
    domain: str

    @abstractmethod
    async def scrape(self, roles: list[str]) -> list[ScrapedRecord]:
        ...

    @abstractmethod
    async def close(self) -> None:
        ...
