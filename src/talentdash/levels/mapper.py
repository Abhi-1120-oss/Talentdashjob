"""Hybrid level standardization engine."""

from dataclasses import dataclass

from talentdash.levels.rules import EXPERIENCE_BUMPS, LEVEL_RULES
from talentdash.validation.enums import LevelStandardized


@dataclass
class LevelMappingResult:
    level: LevelStandardized
    confidence: float
    method: str


def _experience_fallback(years: float | None) -> LevelMappingResult:
    if years is None:
        return LevelMappingResult(LevelStandardized.UNKNOWN, 0.3, "default")
    for low, high, level in EXPERIENCE_BUMPS:
        if low <= years < high:
            return LevelMappingResult(level, 0.55, "experience_heuristic")
    return LevelMappingResult(LevelStandardized.UNKNOWN, 0.3, "default")


def map_level(title: str | None, experience_years: float | None = None) -> LevelMappingResult:
    if not title or not title.strip():
        return _experience_fallback(experience_years)

    normalized = title.strip().lower()
    best: LevelMappingResult | None = None

    for rule in LEVEL_RULES:
        if rule.pattern.search(normalized):
            conf = rule.confidence
            if rule.min_experience is not None and experience_years is not None:
                if experience_years < rule.min_experience:
                    conf *= 0.8
            candidate = LevelMappingResult(rule.level, conf, "rule_table")
            if best is None or candidate.confidence > best.confidence:
                best = candidate

    if best and best.confidence >= 0.7:
        return best

    exp_result = _experience_fallback(experience_years)
    if best and best.confidence > exp_result.confidence:
        return best
    return exp_result


def parse_level_enum(value: str | None) -> LevelStandardized:
    if not value:
        return LevelStandardized.UNKNOWN
    try:
        return LevelStandardized(value.strip().lower())
    except ValueError:
        result = map_level(value)
        return result.level
