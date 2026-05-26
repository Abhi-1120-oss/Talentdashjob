"""HTML/text fallback extraction."""

import re
from typing import Any

from bs4 import BeautifulSoup

from talentdash.extraction.location_cleaner import clean_location
from talentdash.extraction.salary_parser import parse_salary_range
from talentdash.validation.enums import DataSource
from talentdash.validation.schemas import ExtractedRecord, ScrapedRecord

EXPERIENCE_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:[-–—to]+\s*(\d+(?:\.\d+)?))?\s*(?:\+)?\s*(?:years?|yrs?|yoe)",
    re.IGNORECASE,
)


def extract_experience(text: str | None) -> tuple[float | None, float]:
    if not text:
        return None, 0.0
    m = EXPERIENCE_PATTERN.search(text)
    if m:
        low = float(m.group(1))
        high = float(m.group(2)) if m.group(2) else low
        return (low + high) / 2, 0.85
    nums = re.findall(r"(\d+)\s*(?:year|yr)", text, re.I)
    if nums:
        return float(nums[0]), 0.5
    return None, 0.0


def _safe_text(el: Any) -> str | None:
    if el is None:
        return None
    t = el.get_text(strip=True) if hasattr(el, "get_text") else str(el).strip()
    return t or None


def extract_from_scraped(record: ScrapedRecord) -> ExtractedRecord:
    field_confidence: dict[str, float] = {}
    company = (record.company or "").strip() or None
    role = (record.role or "").strip() or None
    if company:
        field_confidence["company"] = 0.9
    if role:
        field_confidence["role"] = 0.9

    location, loc_conf = clean_location(record.location)
    field_confidence["location"] = loc_conf

    exp, exp_conf = extract_experience(record.experience)
    field_confidence["experience"] = exp_conf

    parsed = parse_salary_range(record.salary_range)
    field_confidence["salary"] = parsed.confidence

    if record.raw_html:
        try:
            soup = BeautifulSoup(record.raw_html, "lxml")
            if not company:
                for sel in [".company", "[data-company]", "h2", "h3"]:
                    el = soup.select_one(sel)
                    if el:
                        company = _safe_text(el)
                        field_confidence["company"] = 0.6
                        break
        except Exception:
            pass

    confidences = [v for v in field_confidence.values() if v > 0]
    extraction_confidence = sum(confidences) / len(confidences) if confidences else 0.0

    return ExtractedRecord(
        company=company,
        role=role,
        location=location,
        experience_years=exp,
        base_min_lpa=parsed.base_min_lpa,
        base_max_lpa=parsed.base_max_lpa,
        base_salary_inr=parsed.base_salary_inr,
        salary_range_raw=parsed.raw,
        source_url=record.source_url,
        source=record.source,
        scraped_at=record.scraped_at,
        extraction_confidence=extraction_confidence,
        field_confidence=field_confidence,
        parser_hints={"salary_parser_confidence": parsed.confidence},
    )
