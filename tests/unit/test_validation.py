import pytest
from pydantic import ValidationError

from talentdash.validation.enums import LevelStandardized
from talentdash.validation.schemas import SalaryIngestRecord


def test_valid_record():
    record = SalaryIngestRecord(
        company="Google",
        role="Software Engineer",
        level_standardized=LevelStandardized.L5,
        location="bangalore",
        experience_years=5.0,
        base_salary=2500000.0,
        bonus=200000.0,
        stock=500000.0,
        confidence_score=0.85,
    )
    assert record.company == "google"
    assert record.total_compensation == 3200000.0


def test_rejects_invalid_experience():
    with pytest.raises(ValidationError):
        SalaryIngestRecord(
            company="test",
            role="engineer",
            level_standardized=LevelStandardized.L4,
            location="mumbai",
            experience_years=55.0,
            base_salary=1000000.0,
            confidence_score=0.5,
        )


def test_rejects_zero_salary():
    with pytest.raises(ValidationError):
        SalaryIngestRecord(
            company="test",
            role="engineer",
            level_standardized=LevelStandardized.L4,
            location="mumbai",
            experience_years=3.0,
            base_salary=0,
            confidence_score=0.5,
        )
