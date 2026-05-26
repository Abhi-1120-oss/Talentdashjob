"""Self-contained mock salary data for Vercel serverless (no Prisma)."""

from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import NAMESPACE_DNS, uuid5

SAMPLES = [
    ("google", "Software Engineer", "l5", "bangalore", 6.0, 3_500_000, 500_000, 1_000_000, "ambitionbox"),
    ("google", "Software Engineer", "l4", "hyderabad", 3.0, 2_200_000, 200_000, 400_000, "glassdoor"),
    ("microsoft", "Software Engineer", "l5", "bangalore", 7.0, 3_800_000, 600_000, 800_000, "ambitionbox"),
    ("amazon", "Software Engineer", "sde-ii", "bangalore", 4.0, 2_800_000, 300_000, 600_000, "ambitionbox"),
    ("flipkart", "Software Engineer", "l4", "bangalore", 4.0, 2_500_000, 250_000, 500_000, "glassdoor"),
    ("infosys", "Software Engineer", "l3", "pune", 2.0, 900_000, 50_000, 0, "ambitionbox"),
    ("tcs", "Data Scientist", "l4", "mumbai", 5.0, 1_800_000, 100_000, 200_000, "glassdoor"),
    ("swiggy", "Data Scientist", "l5", "bangalore", 6.0, 3_200_000, 400_000, 700_000, "ambitionbox"),
    ("zomato", "Data Scientist", "l4", "delhi", 4.0, 2_400_000, 200_000, 300_000, "ambitionbox"),
    ("razorpay", "Software Engineer", "l5", "bangalore", 5.0, 3_000_000, 350_000, 900_000, "glassdoor"),
    ("phonepe", "Software Engineer", "l4", "mumbai", 3.0, 2_100_000, 150_000, 400_000, "ambitionbox"),
    ("wipro", "Software Engineer", "l3", "chennai", 2.0, 800_000, 0, 0, "glassdoor"),
]

INR_PER_LPA = 100_000
_CACHE: list | None = None


def _stable_id(company: str, role: str, level: str) -> str:
    return str(uuid5(NAMESPACE_DNS, f"{company}-{role}-{level}"))


def _row(company, role, level, location, exp, base, bonus, stock, source):
    total = base + bonus + stock
    return SimpleNamespace(
        id=_stable_id(company, role, level),
        companyNormalized=company,
        role=role,
        levelStandardized=level,
        location=location,
        experienceYears=exp,
        baseSalary=float(base),
        bonus=float(bonus),
        stock=float(stock),
        totalCompensation=float(total),
        confidenceScore=0.82,
        source=source,
        sourceUrl=f"https://example.com/{company}/{role}",
        createdAt=datetime.now(timezone.utc),
    )


def get_all_records() -> list:
    global _CACHE
    if _CACHE is None:
        _CACHE = [_row(*s) for s in SAMPLES]
    return _CACHE


def record_to_public(row) -> dict:
    base = float(row.baseSalary)
    bonus = float(row.bonus)
    stock = float(row.stock)
    total = float(row.totalCompensation)
    return {
        "id": row.id,
        "company": row.companyNormalized,
        "role": row.role,
        "level": row.levelStandardized,
        "location": row.location,
        "experience_years": float(row.experienceYears),
        "base_salary_inr": base,
        "base_salary_lpa": round(base / INR_PER_LPA, 2),
        "bonus_inr": bonus,
        "stock_inr": stock,
        "total_compensation_inr": total,
        "total_compensation_lpa": round(total / INR_PER_LPA, 2),
        "confidence_score": float(row.confidenceScore),
        "source": row.source,
        "source_url": row.sourceUrl,
        "created_at": row.createdAt.isoformat(),
    }


def _matches(row, **filters) -> bool:
    if filters.get("company") and filters["company"].lower() not in row.companyNormalized.lower():
        return False
    if filters.get("role") and filters["role"].lower() not in row.role.lower():
        return False
    if filters.get("level") and row.levelStandardized != filters["level"].lower():
        return False
    if filters.get("location") and filters["location"].lower() not in row.location.lower():
        return False
    if filters.get("min_total_inr") and row.totalCompensation < filters["min_total_inr"]:
        return False
    if filters.get("max_total_inr") and row.totalCompensation > filters["max_total_inr"]:
        return False
    return True


def search(**kwargs) -> tuple[list, int]:
    rows = [r for r in get_all_records() if _matches(r, **kwargs)]
    page = kwargs.get("page", 1)
    page_size = kwargs.get("page_size", 20)
    sort = kwargs.get("sort", "created_at_desc")

    if sort == "total_desc":
        rows.sort(key=lambda r: r.totalCompensation, reverse=True)
    elif sort == "total_asc":
        rows.sort(key=lambda r: r.totalCompensation)
    elif sort == "confidence_desc":
        rows.sort(key=lambda r: r.confidenceScore, reverse=True)

    total = len(rows)
    start = (page - 1) * page_size
    return rows[start : start + page_size], total


def get_by_id(record_id: str):
    for r in get_all_records():
        if r.id == record_id:
            return r
    return None


def get_by_ids(ids: list[str]) -> tuple[list, list[str]]:
    by_id = {r.id: r for r in get_all_records()}
    found, missing = [], []
    for record_id in ids:
        row = by_id.get(record_id)
        if row:
            found.append(row)
        else:
            missing.append(record_id)
    return found, missing


def get_filters() -> dict:
    rows = get_all_records()
    return {
        "roles": sorted({r.role for r in rows}),
        "levels": sorted({r.levelStandardized for r in rows}),
        "locations": sorted({r.location for r in rows}),
        "companies": sorted({r.companyNormalized for r in rows}),
    }


def company_summaries(page: int = 1, page_size: int = 20) -> tuple[list[dict], int]:
    by_company: dict[str, list] = {}
    for r in get_all_records():
        by_company.setdefault(r.companyNormalized, []).append(r)

    summaries = []
    for company, recs in sorted(by_company.items()):
        lpa_vals = [r.totalCompensation / INR_PER_LPA for r in recs]
        role_counts: dict[str, int] = {}
        for r in recs:
            role_counts[r.role] = role_counts.get(r.role, 0) + 1
        summaries.append({
            "company": company,
            "record_count": len(recs),
            "avg_total_lpa": round(sum(lpa_vals) / len(lpa_vals), 2),
            "min_total_lpa": round(min(lpa_vals), 2),
            "max_total_lpa": round(max(lpa_vals), 2),
            "top_roles": sorted(role_counts, key=role_counts.get, reverse=True)[:3],
        })

    total = len(summaries)
    start = (page - 1) * page_size
    return summaries[start : start + page_size], total


def platform_stats() -> dict:
    rows = get_all_records()
    by_source: dict[str, int] = {}
    by_location: dict[str, int] = {}
    for r in rows:
        by_source[r.source] = by_source.get(r.source, 0) + 1
        by_location[r.location] = by_location.get(r.location, 0) + 1
    return {
        "total_records": len(rows),
        "total_companies": len({r.companyNormalized for r in rows}),
        "avg_confidence": 0.82,
        "records_by_source": by_source,
        "records_by_location": by_location,
    }


def get_analytics() -> dict:
    rows = get_all_records()
    hist: dict[str, list[float]] = {}
    by_level: dict[str, list[float]] = {}
    by_location: dict[str, int] = {}
    by_role: dict[str, int] = {}
    by_company: dict[str, list[float]] = {}

    for r in rows:
        lpa = r.totalCompensation / INR_PER_LPA
        bucket = _lpa_bucket(lpa)
        hist.setdefault(bucket, []).append(lpa)
        by_level.setdefault(r.levelStandardized, []).append(lpa)
        by_location[r.location] = by_location.get(r.location, 0) + 1
        by_role[r.role] = by_role.get(r.role, 0) + 1
        by_company.setdefault(r.companyNormalized, []).append(lpa)

    def _hist_buckets() -> list[dict]:
        order = ["0-10 LPA", "10-20 LPA", "20-30 LPA", "30-40 LPA", "40-50 LPA", "50+ LPA"]
        result = []
        for label in order:
            vals = hist.get(label, [])
            if vals:
                result.append({"label": label, "count": len(vals), "avg_lpa": round(sum(vals) / len(vals), 2)})
        return result

    return {
        "lpa_histogram": _hist_buckets(),
        "by_level": [
            {"label": k, "count": len(v), "avg_lpa": round(sum(v) / len(v), 2)}
            for k, v in sorted(by_level.items())
        ],
        "by_location": [
            {"label": k, "count": v, "avg_lpa": None}
            for k, v in sorted(by_location.items(), key=lambda x: -x[1])[:10]
        ],
        "by_role": [
            {"label": k, "count": v, "avg_lpa": None}
            for k, v in sorted(by_role.items(), key=lambda x: -x[1])[:10]
        ],
        "company_leaderboard": [
            {"label": k, "count": len(v), "avg_lpa": round(sum(v) / len(v), 2)}
            for k, v in sorted(by_company.items(), key=lambda x: -sum(x[1]) / len(x[1]))[:10]
        ],
    }


def _lpa_bucket(lpa: float) -> str:
    edges = [0, 10, 20, 30, 40, 50, 100]
    for i in range(len(edges) - 1):
        if lpa < edges[i + 1]:
            return f"{edges[i]}-{edges[i + 1]} LPA"
    return "50+ LPA"
