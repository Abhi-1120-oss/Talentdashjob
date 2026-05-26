"""Public API response schemas for web and mobile clients."""

from datetime import datetime

from pydantic import BaseModel, Field


class SalaryPublic(BaseModel):
    """Single salary record — stable contract for web, iOS, Android."""

    id: str
    company: str
    role: str
    level: str
    location: str
    experience_years: float
    base_salary_inr: float
    base_salary_lpa: float
    bonus_inr: float
    stock_inr: float
    total_compensation_inr: float
    total_compensation_lpa: float
    confidence_score: float
    source: str
    source_url: str | None = None
    created_at: datetime

    model_config = {"json_schema_extra": {"example": {
        "id": "uuid",
        "company": "google",
        "role": "Software Engineer",
        "level": "l5",
        "location": "bangalore",
        "experience_years": 6,
        "base_salary_inr": 3500000,
        "base_salary_lpa": 35.0,
        "bonus_inr": 500000,
        "stock_inr": 1000000,
        "total_compensation_inr": 5000000,
        "total_compensation_lpa": 50.0,
        "confidence_score": 0.85,
        "source": "ambitionbox",
        "created_at": "2024-05-01T12:00:00Z",
    }}}


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class SalaryListResponse(BaseModel):
    data: list[SalaryPublic]
    meta: PaginationMeta


class CompareSalariesResponse(BaseModel):
    """Batch fetch for side-by-side compare (1–3 offers)."""

    data: list[SalaryPublic]
    missing_ids: list[str] = Field(default_factory=list)


class CompanySummary(BaseModel):
    company: str
    record_count: int
    avg_total_lpa: float
    min_total_lpa: float
    max_total_lpa: float
    top_roles: list[str]


class CompanyListResponse(BaseModel):
    data: list[CompanySummary]
    meta: PaginationMeta


class FilterOptions(BaseModel):
    roles: list[str]
    levels: list[str]
    locations: list[str]
    companies: list[str]


class PlatformStats(BaseModel):
    total_records: int
    total_companies: int
    avg_confidence: float
    records_by_source: dict[str, int]
    records_by_location: dict[str, int]


class ApiInfo(BaseModel):
    name: str = "TalentDash"
    version: str = "0.1.0"
    platforms: list[str] = Field(
        default_factory=lambda: ["web", "mobile", "android", "ios"]
    )
    docs_url: str = "/docs"
    openapi_url: str = "/openapi.json"
    web_app_url: str = "/app"
