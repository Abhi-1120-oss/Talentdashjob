"""Level mapping rule tables."""

import re
from dataclasses import dataclass

from talentdash.validation.enums import LevelStandardized


@dataclass
class LevelRule:
    pattern: re.Pattern[str]
    level: LevelStandardized
    confidence: float
    min_experience: float | None = None


LEVEL_RULES: list[LevelRule] = [
    LevelRule(re.compile(r"\bintern\b", re.I), LevelStandardized.INTERN, 0.95),
    LevelRule(re.compile(r"\bstaff\b", re.I), LevelStandardized.STAFF, 0.95),
    LevelRule(re.compile(r"\bprincipal\b", re.I), LevelStandardized.PRINCIPAL, 0.9),
    LevelRule(re.compile(r"\bdirector\b", re.I), LevelStandardized.DIRECTOR, 0.9),
    LevelRule(re.compile(r"\bmanager\b", re.I), LevelStandardized.MANAGER, 0.85),
    LevelRule(re.compile(r"\bsde\s*iii\b|\bsde\s*3\b", re.I), LevelStandardized.SDE_III, 0.95),
    LevelRule(re.compile(r"\bsde\s*ii\b|\bsde\s*2\b|\bsde-2\b", re.I), LevelStandardized.SDE_II, 0.95),
    LevelRule(re.compile(r"\bsde\s*i\b|\bsde\s*1\b|\bsde-1\b", re.I), LevelStandardized.SDE_I, 0.95),
    LevelRule(re.compile(r"\blead\s+data\s+scientist\b", re.I), LevelStandardized.L6, 0.9),
    LevelRule(re.compile(r"\blead\b", re.I), LevelStandardized.L6, 0.8),
    LevelRule(re.compile(r"\bsenior\b|\bsr\.?\b", re.I), LevelStandardized.L5, 0.85),
    LevelRule(re.compile(r"\bstaff\s+engineer\b", re.I), LevelStandardized.STAFF, 0.95),
    LevelRule(re.compile(r"\bsenior\s+software\s+engineer\b", re.I), LevelStandardized.L5, 0.9),
    LevelRule(re.compile(r"\bsoftware\s+engineer\s+ii\b", re.I), LevelStandardized.SDE_II, 0.9),
    LevelRule(re.compile(r"\bsoftware\s+engineer\b", re.I), LevelStandardized.L4, 0.7),
    LevelRule(re.compile(r"\bdata\s+scientist\b", re.I), LevelStandardized.L4, 0.65),
    LevelRule(re.compile(r"\bjunior\b|\bjr\.?\b", re.I), LevelStandardized.L3, 0.85),
    LevelRule(re.compile(r"\bassociate\b", re.I), LevelStandardized.L3, 0.75),
]

EXPERIENCE_BUMPS = [
    (0, 2, LevelStandardized.L3),
    (2, 5, LevelStandardized.L4),
    (5, 8, LevelStandardized.L5),
    (8, 12, LevelStandardized.L6),
    (12, 50, LevelStandardized.L7),
]
