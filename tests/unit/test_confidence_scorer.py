from talentdash.scoring.engine import ConfidenceScorer
from talentdash.validation.enums import DataSource, LevelStandardized
from talentdash.validation.schemas import ExtractedRecord, SalaryIngestRecord


def test_confidence_score_range():
    scorer = ConfidenceScorer()
    record = SalaryIngestRecord(
        company="flipkart",
        role="Software Engineer",
        level_standardized=LevelStandardized.L4,
        location="bangalore",
        experience_years=4.0,
        base_salary=1800000.0,
        confidence_score=0.7,
        source=DataSource.AMBITIONBOX,
    )
    extracted = ExtractedRecord(
        company="flipkart",
        role="Software Engineer",
        extraction_confidence=0.8,
    )
    score, breakdown = scorer.score(record, extracted=extracted, level_confidence=0.85)
    assert 0.0 <= score <= 1.0
    assert "field_completeness" in breakdown
