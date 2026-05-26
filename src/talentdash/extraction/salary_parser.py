"""Salary parsing utilities for Indian compensation formats."""

import re
from dataclasses import dataclass

LPA_PATTERN = re.compile(
    r"(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:[-–—to]+\s*(\d+(?:\.\d+)?))?\s*(?:lpa|lakhs?|l\.?p\.?a\.?)?",
    re.IGNORECASE,
)
CR_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:[-–—to]+\s*(\d+(?:\.\d+)?))?\s*(?:cr|crore)",
    re.IGNORECASE,
)
PLAIN_RANGE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:[-–—to]+\s*(\d+(?:\.\d+)?))",
    re.IGNORECASE,
)


@dataclass
class ParsedSalary:
    base_min_lpa: float | None
    base_max_lpa: float | None
    base_salary_inr: float | None
    confidence: float
    raw: str


def lpa_to_inr(lpa: float) -> float:
    return lpa * 100_000


def parse_salary_range(text: str | None) -> ParsedSalary:
    if not text or not str(text).strip():
        return ParsedSalary(None, None, None, 0.0, text or "")

    raw = str(text).strip()
    confidence = 0.5

    m = LPA_PATTERN.search(raw)
    if m:
        low = float(m.group(1))
        high = float(m.group(2)) if m.group(2) else low
        base_inr = lpa_to_inr((low + high) / 2)
        return ParsedSalary(low, high, base_inr, 0.9, raw)

    m = CR_PATTERN.search(raw)
    if m:
        low = float(m.group(1)) * 100
        high = float(m.group(2)) * 100 if m.group(2) else low
        base_inr = lpa_to_inr((low + high) / 2)
        return ParsedSalary(low, high, base_inr, 0.85, raw)

    m = PLAIN_RANGE.search(raw)
    if m:
        low = float(m.group(1))
        high = float(m.group(2))
        if low < 100:
            base_inr = lpa_to_inr((low + high) / 2)
            return ParsedSalary(low, high, base_inr, 0.6, raw)

    nums = re.findall(r"\d+(?:\.\d+)?", raw)
    if nums:
        val = float(nums[0])
        if val < 100:
            return ParsedSalary(val, val, lpa_to_inr(val), 0.4, raw)
        return ParsedSalary(val / 100_000, val / 100_000, val, 0.4, raw)

    return ParsedSalary(None, None, None, 0.1, raw)
