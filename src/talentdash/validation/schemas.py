"""Strict Pydantic schemas for ingestion validation."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator

from talentdash.validation.enums import DataSource, LevelStandardized


class ScrapedRecord(BaseModel):
    company: str | None = None
    role: str | None = None
    salary_range: str | None = None
    location: str | None = None
    experience: str | None = None
    source_url: str | None = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    source: DataSource = DataSource.AMBITIONBOX
    raw_html: str | None = None


class ExtractedRecord(BaseModel):
    company: str | None = None
    role: str | None = None
    location: str | None = None
    experience_years: float | None = None
    base_min_lpa: float | None = None
    base_max_lpa: float | None = None
    base_salary_inr: float | None = None
    salary_range_raw: str | None = None
    source_url: str | None = None
    source: DataSource = DataSource.AMBITIONBOX
    scraped_at: datetime | None = None
    extraction_confidence: float = 0.0
    field_confidence: dict[str, float] = Field(default_factory=dict)
    parser_hints: dict[str, Any] = Field(default_factory=dict)


class LLMNormalizedRecord(BaseModel):
    company: str
    role: str
    level_standardized: str | None = None
    location: str
    experience_years: float
    base_salary: float
    bonus: float = 0.0
    stock: float = 0.0
    llm_confidence: float = 0.5
    source: DataSource = DataSource.AMBITIONBOX
    source_url: str | None = None

    @field_validator("company")
    @classmethod
    def normalize_company(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("experience_years")
    @classmethod
    def validate_experience(cls, v: float) -> float:
        if v < 0 or v > 50:
            raise ValueError("experience_years must be between 0 and 50")
        return v

    @field_validator("base_salary")
    @classmethod
    def validate_base(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("base_salary must be > 0")
        return v


class SalaryIngestRecord(BaseModel):
    company: str
    role: str
    level_standardized: LevelStandardized
    location: str
    experience_years: float
    base_salary: float
    bonus: float = 0.0
    stock: float = 0.0
    total_compensation: float | None = None
    confidence_score: float = 0.0
    source: DataSource = DataSource.API
    source_url: str | None = None
    dedupe_hash: str | None = None
    run_id: str | None = None
    needs_human_review: bool = False
    confidence_breakdown: dict[str, float] | None = None

    @field_validator("company")
    @classmethod
    def normalize_company(cls, v: str) -> str:
        normalized = v.strip().lower()
        if len(normalized) < 2:
            raise ValueError("company must be at least 2 characters")
        return normalized

    @field_validator("experience_years")
    @classmethod
    def validate_experience(cls, v: float) -> float:
        if v < 0 or v > 50:
            raise ValueError("experience_years must be between 0 and 50")
        return v

    @field_validator("base_salary")
    @classmethod
    def validate_base(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("base_salary must be > 0")
        return v

    @field_validator("confidence_score")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if v < 0.0 or v > 1.0:
            raise ValueError("confidence_score must be between 0.0 and 1.0")
        return v

    @field_validator("bonus", "stock")
    @classmethod
    def validate_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("bonus and stock must be non-negative")
        return v

    @model_validator(mode="after")
    def compute_total_compensation(self) -> "SalaryIngestRecord":
        object.__setattr__(
            self,
            "total_compensation",
            self.base_salary + self.bonus + self.stock,
        )
        return self


class IngestBatchRequest(BaseModel):
    records: list[SalaryIngestRecord] = Field(..., min_length=1, max_length=100)


class IngestItemResult(BaseModel):
    index: int
    status: str
    record_id: str | None = None
    reason: str | None = None


class IngestBatchResponse(BaseModel):
    request_id: str
    accepted: int
    rejected: int
    duplicate: int
    results: list[IngestItemResult]
