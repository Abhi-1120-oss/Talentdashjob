"""Fuzzy company name matching."""

from rapidfuzz import fuzz

from talentdash.config import get_settings


def companies_match(a: str, b: str, threshold: float | None = None) -> bool:
    settings = get_settings()
    thresh = threshold if threshold is not None else settings.fuzzy_company_threshold
    if not a or not b:
        return False
    return fuzz.ratio(a.lower().strip(), b.lower().strip()) / 100.0 >= thresh
