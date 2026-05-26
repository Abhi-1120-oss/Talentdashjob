"""Raw record extraction orchestration."""

from talentdash.extraction.html_fallback import extract_from_scraped
from talentdash.validation.schemas import ExtractedRecord, ScrapedRecord


def extract_records(scraped: list[ScrapedRecord]) -> list[ExtractedRecord]:
    results: list[ExtractedRecord] = []
    for record in scraped:
        try:
            results.append(extract_from_scraped(record))
        except Exception:
            results.append(
                ExtractedRecord(
                    source=record.source,
                    source_url=record.source_url,
                    scraped_at=record.scraped_at,
                    extraction_confidence=0.0,
                )
            )
    return results
