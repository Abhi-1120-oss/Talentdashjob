import pytest

from talentdash.extraction.salary_parser import parse_salary_range


@pytest.mark.parametrize(
    "text,min_lpa,max_lpa",
    [
        ("₹10-15 LPA", 10.0, 15.0),
        ("10 – 15 LPA", 10.0, 15.0),
        ("12 LPA", 12.0, 12.0),
        ("15 to 20 lakhs", 15.0, 20.0),
    ],
)
def test_parse_salary_range_lpa(text, min_lpa, max_lpa):
    result = parse_salary_range(text)
    assert result.base_min_lpa == min_lpa
    assert result.base_max_lpa == max_lpa
    assert result.base_salary_inr is not None
    assert result.confidence >= 0.5


def test_parse_salary_empty():
    result = parse_salary_range(None)
    assert result.base_min_lpa is None
    assert result.confidence == 0.0
