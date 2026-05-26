"""Dedupe hash generation utilities."""

import hashlib
import json


def salary_bucket(base_salary: float) -> str:
    if base_salary <= 0:
        return "unknown"
    bucket = int(base_salary // 500_000) * 500_000
    return str(bucket)


def build_dedupe_key(
    company: str,
    role: str,
    level: str,
    location: str,
    base_salary: float,
) -> str:
    payload = {
        "company": company.strip().lower(),
        "role": role.strip().lower(),
        "level": level.strip().lower(),
        "location": location.strip().lower(),
        "salary_bucket": salary_bucket(base_salary),
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()
