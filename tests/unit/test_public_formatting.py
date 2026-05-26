from types import SimpleNamespace

from talentdash.api.utils.formatting import inr_to_lpa, record_to_public


def test_inr_to_lpa():
    assert inr_to_lpa(2_500_000) == 25.0


def test_record_to_public():
    row = SimpleNamespace(
        id="abc-123",
        companyNormalized="google",
        role="Software Engineer",
        levelStandardized="l5",
        location="bangalore",
        experienceYears=6.0,
        baseSalary=3_000_000.0,
        bonus=500_000.0,
        stock=500_000.0,
        totalCompensation=4_000_000.0,
        confidenceScore=0.85,
        source="ambitionbox",
        sourceUrl="https://example.com",
        createdAt="2024-05-01T12:00:00",
    )
    result = record_to_public(row)
    assert result["company"] == "google"
    assert result["total_compensation_lpa"] == 40.0
    assert result["base_salary_lpa"] == 30.0
