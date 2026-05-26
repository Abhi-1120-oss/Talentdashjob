"""Location normalization utilities."""

import re

METRO_ALIASES = {
    "bengaluru": "bangalore",
    "bangalore": "bangalore",
    "blr": "bangalore",
    "mumbai": "mumbai",
    "bombay": "mumbai",
    "delhi": "delhi",
    "new delhi": "delhi",
    "ncr": "delhi",
    "gurgaon": "gurgaon",
    "gurugram": "gurgaon",
    "hyderabad": "hyderabad",
    "hyd": "hyderabad",
    "chennai": "chennai",
    "madras": "chennai",
    "pune": "pune",
    "kolkata": "kolkata",
    "noida": "noida",
    "remote": "remote",
    "india": "india",
}

NOISE_PATTERN = re.compile(r"\s+", re.MULTILINE)


def clean_location(text: str | None) -> tuple[str | None, float]:
    if not text or not str(text).strip():
        return None, 0.0

    raw = str(text).strip().lower()
    raw = re.sub(r"[^\w\s,-]", "", raw)
    raw = NOISE_PATTERN.sub(" ", raw).strip()

    for part in raw.split(","):
        part = part.strip()
        if part in METRO_ALIASES:
            return METRO_ALIASES[part], 0.95
        for alias, canonical in METRO_ALIASES.items():
            if alias in part:
                return canonical, 0.85

    if len(raw) >= 2:
        return raw[:100], 0.5
    return None, 0.0
