"""Public read API for web, mobile, Android, and iOS clients."""

import math

from fastapi import APIRouter, HTTPException, Query

from talentdash.api.schemas.public import (
    ApiInfo,
    CompareSalariesResponse,
    CompanyListResponse,
    CompanySummary,
    FilterOptions,
    PaginationMeta,
    PlatformStats,
    SalaryListResponse,
    SalaryPublic,
)
from talentdash.api.utils.formatting import record_to_public
from talentdash.storage.db_mode import is_using_mock
from talentdash.storage.query_repository import SalaryQueryRepository

router = APIRouter(prefix="/api/v1", tags=["public"])
_query = SalaryQueryRepository()


def _pagination(page: int, page_size: int, total: int) -> PaginationMeta:
    total_pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginationMeta(
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


@router.get("/info", response_model=ApiInfo)
async def api_info() -> ApiInfo:
    """Platform metadata — use for app bootstrap on any client."""
    info = ApiInfo()
    if is_using_mock():
        info.name = "TalentDash (dev mock data)"
    return info


@router.get("/salaries", response_model=SalaryListResponse)
async def list_salaries(
    company: str | None = Query(None, description="Filter by company name"),
    role: str | None = Query(None, description="Filter by role"),
    level: str | None = Query(None, description="Filter by level (l4, l5, sde-ii)"),
    location: str | None = Query(None, description="Filter by location"),
    min_lpa: float | None = Query(None, ge=0, description="Minimum total comp in LPA"),
    max_lpa: float | None = Query(None, ge=0, description="Maximum total comp in LPA"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = Query(
        "created_at_desc",
        description="created_at_desc|created_at_asc|total_desc|total_asc|confidence_desc",
    ),
) -> SalaryListResponse:
    """Search salary records — primary endpoint for web and mobile apps."""
    min_inr = min_lpa * 100_000 if min_lpa is not None else None
    max_inr = max_lpa * 100_000 if max_lpa is not None else None

    rows, total = await _query.search_salaries(
        company=company,
        role=role,
        level=level,
        location=location,
        min_total_inr=min_inr,
        max_total_inr=max_inr,
        page=page,
        page_size=page_size,
        sort=sort,
    )
    data = [SalaryPublic.model_validate(record_to_public(r)) for r in rows]
    return SalaryListResponse(data=data, meta=_pagination(page, page_size, total))


def _parse_compare_ids(ids: str) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for part in ids.split(","):
        record_id = part.strip()
        if not record_id or record_id in seen:
            continue
        seen.add(record_id)
        unique.append(record_id)
    return unique


@router.get("/salaries/compare", response_model=CompareSalariesResponse)
async def compare_salaries(
    ids: str = Query(..., description="Comma-separated record IDs (1–3, unique)"),
) -> CompareSalariesResponse:
    """Fetch up to 3 salary records for side-by-side compare (preserves request order)."""
    unique = _parse_compare_ids(ids)
    if not unique:
        raise HTTPException(status_code=422, detail="At least one id is required")
    if len(unique) > 3:
        raise HTTPException(status_code=422, detail="Maximum 3 ids allowed")

    rows, missing = await _query.get_by_ids(unique)
    data = [SalaryPublic.model_validate(record_to_public(r)) for r in rows]
    return CompareSalariesResponse(data=data, missing_ids=missing)


@router.get("/salaries/{record_id}", response_model=SalaryPublic)
async def get_salary(record_id: str) -> SalaryPublic:
    """Get a single salary record by ID."""
    row = await _query.get_by_id(record_id)
    if not row:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return SalaryPublic.model_validate(record_to_public(row))


@router.get("/companies", response_model=CompanyListResponse)
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> CompanyListResponse:
    """Company-level salary summaries for browse/explore screens."""
    summaries, total = await _query.company_summaries(page=page, page_size=page_size)
    data = [CompanySummary.model_validate(s) for s in summaries]
    return CompanyListResponse(data=data, meta=_pagination(page, page_size, total))


@router.get("/companies/{company}/salaries", response_model=SalaryListResponse)
async def company_salaries(
    company: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> SalaryListResponse:
    """All salary records for a specific company."""
    rows, total = await _query.search_salaries(
        company=company,
        page=page,
        page_size=page_size,
    )
    data = [SalaryPublic.model_validate(record_to_public(r)) for r in rows]
    return SalaryListResponse(data=data, meta=_pagination(page, page_size, total))


@router.get("/filters", response_model=FilterOptions)
async def get_filters() -> FilterOptions:
    """Dropdown/filter options for UI (web + mobile)."""
    f = await _query.get_distinct_filters()
    return FilterOptions(**f)


@router.get("/stats", response_model=PlatformStats)
async def get_stats() -> PlatformStats:
    """Platform overview stats for dashboards."""
    stats = await _query.platform_stats()
    return PlatformStats.model_validate(stats)
