"""Enumeration types for ingestion validation."""

from enum import Enum


class LevelStandardized(str, Enum):
    INTERN = "intern"
    L3 = "l3"
    L4 = "l4"
    L5 = "l5"
    L6 = "l6"
    L7 = "l7"
    SDE_I = "sde-i"
    SDE_II = "sde-ii"
    SDE_III = "sde-iii"
    STAFF = "staff"
    PRINCIPAL = "principal"
    MANAGER = "manager"
    DIRECTOR = "director"
    UNKNOWN = "unknown"


class DataSource(str, Enum):
    AMBITIONBOX = "ambitionbox"
    GLASSDOOR = "glassdoor"
    API = "api"
    MANUAL = "manual"


class RejectionReason(str, Enum):
    MISSING_REQUIRED = "missing_required"
    INVALID_ENUM = "invalid_enum"
    INVALID_SALARY = "invalid_salary"
    INVALID_EXPERIENCE = "invalid_experience"
    INVALID_CONFIDENCE = "invalid_confidence"
    MALFORMED_RANGE = "malformed_range"
    VALIDATION_ERROR = "validation_error"
    DUPLICATE = "duplicate"
    LOW_CONFIDENCE = "low_confidence"
