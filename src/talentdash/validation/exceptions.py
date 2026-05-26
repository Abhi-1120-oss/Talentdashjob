"""Custom validation exceptions."""

from talentdash.validation.enums import RejectionReason


class ValidationException(Exception):
    def __init__(self, reason: RejectionReason, message: str, field: str | None = None):
        self.reason = reason
        self.field = field
        super().__init__(message)


class DuplicateRecordException(Exception):
    def __init__(self, dedupe_hash: str, matched_id: str | None = None):
        self.dedupe_hash = dedupe_hash
        self.matched_id = matched_id
        super().__init__(f"Duplicate record: {dedupe_hash}")
