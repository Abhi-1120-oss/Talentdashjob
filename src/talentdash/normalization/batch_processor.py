"""Async batch normalization with per-record retry."""

import asyncio

from talentdash.config import get_settings
from talentdash.extraction.salary_parser import lpa_to_inr
from talentdash.levels.mapper import map_level, parse_level_enum
from talentdash.normalization.llm_client import LLMNormalizerClient
from talentdash.observability import get_logger, get_metrics
from talentdash.validation.enums import LevelStandardized
from talentdash.validation.schemas import ExtractedRecord, LLMNormalizedRecord, SalaryIngestRecord

log = get_logger(__name__)


def _fallback_from_extraction(record: ExtractedRecord) -> LLMNormalizedRecord | None:
    if not record.company or not record.role:
        return None
    base = record.base_salary_inr
    if not base and record.base_min_lpa:
        avg_lpa = record.base_min_lpa
        if record.base_max_lpa:
            avg_lpa = (record.base_min_lpa + record.base_max_lpa) / 2
        base = lpa_to_inr(avg_lpa)
    if not base or base <= 0:
        return None

    level_result = map_level(record.role, record.experience_years)
    return LLMNormalizedRecord(
        company=record.company.lower().strip(),
        role=record.role,
        level_standardized=level_result.level.value,
        location=record.location or "india",
        experience_years=record.experience_years or 0.0,
        base_salary=base,
        bonus=0.0,
        stock=0.0,
        llm_confidence=max(0.2, record.extraction_confidence * 0.5),
        source=record.source,
        source_url=record.source_url,
    )


def to_ingest_record(
    normalized: LLMNormalizedRecord,
    *,
    run_id: str | None = None,
    extraction_confidence: float = 0.0,
    level_confidence: float = 0.0,
) -> SalaryIngestRecord:
    level = parse_level_enum(normalized.level_standardized)
    if level == LevelStandardized.UNKNOWN and normalized.role:
        level = map_level(normalized.role, normalized.experience_years).level

    confidence = min(
        1.0,
        (normalized.llm_confidence * 0.5) + (extraction_confidence * 0.3) + (level_confidence * 0.2),
    )

    return SalaryIngestRecord(
        company=normalized.company,
        role=normalized.role,
        level_standardized=level,
        location=normalized.location,
        experience_years=normalized.experience_years,
        base_salary=normalized.base_salary,
        bonus=normalized.bonus,
        stock=normalized.stock,
        confidence_score=confidence,
        source=normalized.source,
        source_url=normalized.source_url,
        run_id=run_id,
        needs_human_review=confidence < 0.5,
    )


class NormalizationEngine:
    def __init__(self) -> None:
        self._client = LLMNormalizerClient()

    async def normalize_all(
        self, records: list[ExtractedRecord], run_id: str | None = None
    ) -> tuple[list[SalaryIngestRecord], int, int]:
        settings = get_settings()
        batch_size = settings.llm_batch_size
        ingest_records: list[SalaryIngestRecord] = []
        failures = 0
        fallbacks = 0

        for i in range(0, len(records), batch_size):
            batch = records[i : i + batch_size]
            results = await self._client.normalize_batch(batch)

            for j, (extracted, llm_result) in enumerate(zip(batch, results)):
                final = llm_result
                if final is None:
                    final = await self._retry_single(extracted)
                if final is None:
                    final = _fallback_from_extraction(extracted)
                    if final:
                        fallbacks += 1
                        get_metrics().inc("normalization.fallbacks")
                    else:
                        failures += 1
                        get_metrics().inc("normalization.failures")
                        continue

                level_result = map_level(final.role, final.experience_years)
                ingest = to_ingest_record(
                    final,
                    run_id=run_id,
                    extraction_confidence=extracted.extraction_confidence,
                    level_confidence=level_result.confidence,
                )
                ingest_records.append(ingest)

        log.info(
            "normalization_complete",
            total=len(records),
            success=len(ingest_records),
            failures=failures,
            fallbacks=fallbacks,
        )
        return ingest_records, failures, fallbacks

    async def _retry_single(self, record: ExtractedRecord, max_retries: int = 2) -> LLMNormalizedRecord | None:
        for attempt in range(max_retries):
            result = await self._client.normalize_single(record)
            if result:
                return result
            await asyncio.sleep(1.0 * (attempt + 1))
        return None
