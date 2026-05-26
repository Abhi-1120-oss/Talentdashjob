"""Validation helpers and rejection reporting."""

from pydantic import ValidationError

from talentdash.observability import get_logger
from talentdash.validation.enums import RejectionReason
from talentdash.validation.exceptions import ValidationException
from talentdash.validation.schemas import SalaryIngestRecord

log = get_logger(__name__)


def validate_ingest_record(data: dict) -> SalaryIngestRecord:
    try:
        return SalaryIngestRecord.model_validate(data)
    except ValidationError as e:
        reason = RejectionReason.VALIDATION_ERROR
        for err in e.errors():
            loc = ".".join(str(x) for x in err.get("loc", []))
            if "enum" in err.get("type", ""):
                reason = RejectionReason.INVALID_ENUM
            elif "base_salary" in loc:
                reason = RejectionReason.INVALID_SALARY
            elif "experience" in loc:
                reason = RejectionReason.INVALID_EXPERIENCE
            elif "confidence" in loc:
                reason = RejectionReason.INVALID_CONFIDENCE
        raise ValidationException(reason, str(e)) from e
