"""Composable pipeline stage functions."""

from __future__ import annotations

from typing import TYPE_CHECKING

from talentdash.extraction.raw_record import extract_records
from talentdash.levels.mapper import map_level
from talentdash.normalization.batch_processor import NormalizationEngine
from talentdash.observability import get_logger
from talentdash.reporting.quality_report import QualityReport
from talentdash.scoring.engine import ConfidenceScorer
from talentdash.scrapers.orchestrator import run_scrapers
from talentdash.validation.exceptions import ValidationException
from talentdash.validation.middleware import validate_ingest_record
from talentdash.validation.schemas import ExtractedRecord, SalaryIngestRecord, ScrapedRecord

if TYPE_CHECKING:
    from talentdash.storage.repository import SalaryRepository

log = get_logger(__name__)


async def stage_scrape(report: QualityReport) -> list[ScrapedRecord]:
    records = await run_scrapers()
    report.scraped = len(records)
    return records


def stage_extract(scraped: list[ScrapedRecord], report: QualityReport) -> list[ExtractedRecord]:
    extracted = extract_records(scraped)
    report.extracted = len(extracted)
    low_conf = sum(1 for e in extracted if e.extraction_confidence < 0.3)
    report.parsing_failures = low_conf

    null_counts: dict[str, int] = {"company": 0, "role": 0, "location": 0, "salary": 0}
    for e in extracted:
        if not e.company:
            null_counts["company"] += 1
        if not e.role:
            null_counts["role"] += 1
        if not e.location:
            null_counts["location"] += 1
        if not e.base_salary_inr:
            null_counts["salary"] += 1
    total = len(extracted) or 1
    report.null_field_pct = {k: v / total for k, v in null_counts.items()}
    return extracted


async def stage_normalize(
    extracted: list[ExtractedRecord],
    report: QualityReport,
    run_id: str,
) -> list[SalaryIngestRecord]:
    engine = NormalizationEngine()
    records, failures, _ = await engine.normalize_all(extracted, run_id=run_id)
    report.normalized = len(records)
    report.normalization_failures = failures
    return records


def stage_validate(
    records: list[SalaryIngestRecord],
    report: QualityReport,
) -> list[SalaryIngestRecord]:
    validated: list[SalaryIngestRecord] = []
    for rec in records:
        try:
            validated.append(validate_ingest_record(rec.model_dump(mode="json")))
        except ValidationException as e:
            report.record_rejection(e.reason.value)
            log.warning("validation_rejected", reason=e.reason.value)
    report.validated = len(validated)
    return validated


async def stage_dedupe(
    records: list[SalaryIngestRecord],
    report: QualityReport,
    run_id: str,
) -> list[SalaryIngestRecord]:
    from talentdash.dedupe.engine import DedupeEngine

    engine = DedupeEngine()
    unique, dupes = await engine.filter_unique(records, run_id=run_id)
    report.duplicates = dupes
    return unique


def stage_score(
    records: list[SalaryIngestRecord],
    extracted_map: dict[str, ExtractedRecord],
    report: QualityReport,
) -> list[SalaryIngestRecord]:
    scorer = ConfidenceScorer()
    scored: list[SalaryIngestRecord] = []
    for rec in records:
        key = f"{rec.company}:{rec.role}:{rec.source_url}"
        extracted = extracted_map.get(key)
        level_conf = map_level(rec.role, rec.experience_years).confidence
        updated = scorer.apply_to_record(
            rec,
            extracted=extracted,
            level_confidence=level_conf,
            validation_passed=True,
        )
        report.record_confidence(updated.confidence_score)
        if updated.needs_human_review:
            report.human_review += 1
        scored.append(updated)
    return scored


async def stage_store(
    records: list[SalaryIngestRecord],
    report: QualityReport,
    run_id: str,
    repo: "SalaryRepository",
) -> list[str]:
    for rec in records:
        rec.run_id = run_id
    ids = await repo.insert_batch(records)
    report.stored = len(ids)

    for rec in records:
        if rec.needs_human_review:
            await repo.enqueue_human_review(
                run_id,
                rec.model_dump(mode="json"),
                "low_confidence",
            )
    return ids
