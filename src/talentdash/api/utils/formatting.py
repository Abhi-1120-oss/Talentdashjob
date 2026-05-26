"""Formatting helpers for client-facing API responses."""

INR_PER_LPA = 100_000


def inr_to_lpa(amount_inr: float) -> float:
    return round(amount_inr / INR_PER_LPA, 2)


def record_to_public(row: object) -> dict:
    """Map Prisma SalarySubmission model to public dict."""
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
        "base_salary_lpa": inr_to_lpa(base),
        "bonus_inr": bonus,
        "stock_inr": stock,
        "total_compensation_inr": total,
        "total_compensation_lpa": inr_to_lpa(total),
        "confidence_score": float(row.confidenceScore),
        "source": row.source,
        "source_url": row.sourceUrl,
        "created_at": row.createdAt,
    }
