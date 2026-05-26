"""
Vercel serverless API — self-contained mock read endpoints (no src/ bundle required).
"""

import math

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from _mock_data import (
    company_summaries,
    get_all_records,
    get_analytics,
    get_by_id,
    get_by_ids,
    get_filters,
    platform_stats,
    record_to_public,
    search,
)

app = FastAPI(title="TalentDash API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _pagination(page: int, page_size: int, total: int) -> dict:
    total_pages = max(1, math.ceil(total / page_size)) if total else 1
    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


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


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "database": "mock (Vercel serverless)",
        "record_count": len(get_all_records()),
        "platforms": ["web", "mobile", "android", "ios"],
    }


@app.get("/api/v1/salaries")
async def list_salaries(
    company: str | None = None,
    role: str | None = None,
    level: str | None = None,
    location: str | None = None,
    min_lpa: float | None = Query(None, ge=0),
    max_lpa: float | None = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = "created_at_desc",
):
    min_inr = min_lpa * 100_000 if min_lpa is not None else None
    max_inr = max_lpa * 100_000 if max_lpa is not None else None
    rows, total = search(
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
    return {
        "data": [record_to_public(r) for r in rows],
        "meta": _pagination(page, page_size, total),
    }


@app.get("/api/v1/salaries/compare")
async def compare_salaries(ids: str = Query(...)):
    unique = _parse_compare_ids(ids)
    if not unique:
        raise HTTPException(status_code=422, detail="At least one id is required")
    if len(unique) > 3:
        raise HTTPException(status_code=422, detail="Maximum 3 ids allowed")
    rows, missing = get_by_ids(unique)
    return {
        "data": [record_to_public(r) for r in rows],
        "missing_ids": missing,
    }


@app.get("/api/v1/salaries/{record_id}")
async def get_salary(record_id: str):
    row = get_by_id(record_id)
    if not row:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return record_to_public(row)


@app.get("/api/v1/companies")
async def list_companies(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    summaries, total = company_summaries(page=page, page_size=page_size)
    return {"data": summaries, "meta": _pagination(page, page_size, total)}


@app.get("/api/v1/companies/{company}/salaries")
async def company_salaries(company: str, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    rows, total = search(company=company, page=page, page_size=page_size)
    return {
        "data": [record_to_public(r) for r in rows],
        "meta": _pagination(page, page_size, total),
    }


@app.get("/api/v1/filters")
async def get_filter_options():
    return get_filters()


@app.get("/api/v1/stats")
async def get_stats():
    return platform_stats()


@app.get("/api/v1/analytics")
async def get_analytics_route():
    return get_analytics()


handler = Mangum(app, lifespan="off")
