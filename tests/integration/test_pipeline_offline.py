"""Offline pipeline integration test (no scrape, no DB)."""

import pytest

from talentdash.extraction.raw_record import extract_records
from talentdash.levels.mapper import map_level
from talentdash.pipeline.stages import stage_extract, stage_score, stage_validate  # noqa: E402
from talentdash.reporting.quality_report import QualityReport
from talentdash.validation.enums import DataSource, LevelStandardized
from talentdash.validation.schemas import SalaryIngestRecord, ScrapedRecord


@pytest.mark.asyncio
async def test_extract_validate_score_flow():
    report = QualityReport(run_id="test-run")
    scraped = [
        ScrapedRecord(
            company="Infosys",
            role="Software Engineer",
            salary_range="₹8-12 LPA",
            location="Bangalore",
            experience="3-5 years",
            source=DataSource.AMBITIONBOX,
        ),
        ScrapedRecord(
            company="TCS",
            role="Data Scientist",
            salary_range="15 LPA",
            location="Mumbai",
            experience="5 years",
            source=DataSource.GLASSDOOR,
        ),
    ]

    extracted = stage_extract(scraped, report)
    assert report.extracted == 2
    assert any(e.base_salary_inr for e in extracted)

    records = [
        SalaryIngestRecord(
            company=e.company or "unknown",
            role=e.role or "engineer",
            level_standardized=map_level(e.role, e.experience_years).level,
            location=e.location or "india",
            experience_years=e.experience_years or 0,
            base_salary=e.base_salary_inr or 1_000_000,
            confidence_score=0.6,
            source=e.source,
        )
        for e in extracted
        if e.company and e.base_salary_inr
    ]

    validated = stage_validate(records, report)
    assert report.validated >= 1

    extracted_map = {f"{e.company}:{e.role}:{e.source_url}": e for e in extracted if e.company}
    scored = stage_score(validated, extracted_map, report)
    assert all(0 <= r.confidence_score <= 1 for r in scored)
