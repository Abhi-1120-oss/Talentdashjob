"""LLM output validation schemas."""

from pydantic import BaseModel, Field

from talentdash.validation.schemas import LLMNormalizedRecord


class LLMBatchResponse(BaseModel):
    records: list[LLMNormalizedRecord] = Field(default_factory=list)
