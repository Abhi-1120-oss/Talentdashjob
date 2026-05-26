#!/usr/bin/env python3
"""Seed sample salary data for local dev and demos."""

import asyncio
import hashlib
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from talentdash.storage.prisma_client import disconnect_prisma, get_prisma

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


def _dedupe_hash(company: str, role: str, level: str, location: str, total: float) -> str:
    bucket = int(total // 500_000) * 500_000
    payload = f"{company}|{role}|{level}|{location}|{bucket}"
    return hashlib.sha256(payload.encode()).hexdigest()


async def seed() -> None:
    db = await get_prisma()
    existing = await db.salarysubmission.count()
    if existing > 0:
        print(f"Database already has {existing} records — skipping seed.")
        await disconnect_prisma()
        return

    run_id = str(uuid.uuid4())
    await db.ingestionrun.create(
        data={"runId": run_id, "status": "completed", "metrics": {"seeded": True}},
    )

    for row in SAMPLES:
        company, role, level, location, exp, base, bonus, stock, source = row
        total = base + bonus + stock
        await db.salarysubmission.create(
            data={
                "companyNormalized": company,
                "role": role,
                "levelStandardized": level,
                "location": location,
                "experienceYears": exp,
                "baseSalary": base,
                "bonus": bonus,
                "stock": stock,
                "totalCompensation": total,
                "confidenceScore": 0.82,
                "confidenceBreakdown": {"seed": 1.0},
                "source": source,
                "sourceUrl": f"https://example.com/{company}/{role}",
                "dedupeHash": _dedupe_hash(company, role, level, location, total),
                "runId": run_id,
                "needsHumanReview": False,
            },
        )

    count = await db.salarysubmission.count()
    print(f"Seeded {count} sample salary records.")
    await disconnect_prisma()


if __name__ == "__main__":
    asyncio.run(seed())
