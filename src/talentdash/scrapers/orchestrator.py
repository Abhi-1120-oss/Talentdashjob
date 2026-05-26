"""Scraper orchestration across multiple sources."""

from talentdash.config import get_settings
from talentdash.observability import get_logger
from talentdash.scrapers.ambitionbox import AmbitionBoxScraper
from talentdash.scrapers.base import BaseScraper
from talentdash.scrapers.glassdoor import GlassdoorScraper
from talentdash.validation.enums import DataSource
from talentdash.validation.schemas import ScrapedRecord

log = get_logger(__name__)

SCRAPER_REGISTRY: dict[str, type[BaseScraper]] = {
    DataSource.AMBITIONBOX.value: AmbitionBoxScraper,
    DataSource.GLASSDOOR.value: GlassdoorScraper,
}


async def run_scrapers(sources: list[str] | None = None, roles: list[str] | None = None) -> list[ScrapedRecord]:
    settings = get_settings()
    sources = sources or settings.scrape_sources_list
    roles = roles or settings.scrape_roles_list
    all_records: list[ScrapedRecord] = []

    for source_name in sources:
        scraper_cls = SCRAPER_REGISTRY.get(source_name.lower())
        if not scraper_cls:
            log.warning("unknown_scraper", source=source_name)
            continue
        scraper = scraper_cls()
        try:
            log.info("scraper_start", source=source_name, roles=roles)
            records = await scraper.scrape(roles)
            all_records.extend(records)
            log.info("scraper_complete", source=source_name, count=len(records))
        except Exception as e:
            log.error("scraper_failed", source=source_name, error=str(e))
        finally:
            await scraper.close()

    return all_records
