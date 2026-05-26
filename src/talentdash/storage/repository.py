"""Database repository for salary submissions and logs."""

from datetime import datetime, timedelta
from typing import Any

from talentdash.config import get_settings
from talentdash.observability import get_logger
from talentdash.storage.prisma_client import get_prisma
from talentdash.storage.transactions import with_db_retry
from talentdash.validation.schemas import SalaryIngestRecord

log = get_logger(__name__)


class SalaryRepository:
    async def create_ingestion_run(self, run_id: str) -> None:
        db = await get_prisma()
        await db.ingestionrun.create(
            data={"runId": run_id, "status": "running", "metrics": {}},
        )

    async def complete_ingestion_run(
        self, run_id: str, status: str, metrics: dict[str, Any]
    ) -> None:
        db = await get_prisma()
        await db.ingestionrun.update(
            where={"runId": run_id},
            data={"status": status, "metrics": metrics, "endedAt": datetime.utcnow()},
        )

    async def find_by_dedupe_hash(self, dedupe_hash: str) -> Any | None:
        db = await get_prisma()
        return await db.salarysubmission.find_unique(where={"dedupeHash": dedupe_hash})

    async def find_recent_by_fields(
        self,
        company: str,
        role: str,
        level: str,
        location: str,
        window_days: int | None = None,
    ) -> list[Any]:
        settings = get_settings()
        window = window_days or settings.dedupe_window_days
        cutoff = datetime.utcnow() - timedelta(days=window)
        db = await get_prisma()
        return await db.salarysubmission.find_many(
            where={
                "companyNormalized": company,
                "role": role,
                "levelStandardized": level,
                "location": location,
                "createdAt": {"gte": cutoff},
            },
            take=10,
        )

    async def insert_batch(self, records: list[SalaryIngestRecord]) -> list[str]:
        if not records:
            return []
        settings = get_settings()
        ids: list[str] = []

        async def _insert() -> list[str]:
            db = await get_prisma()
            batch_ids: list[str] = []
            for i in range(0, len(records), settings.insert_batch_size):
                chunk = records[i : i + settings.insert_batch_size]
                for rec in chunk:
                    created = await db.salarysubmission.create(
                        data={
                            "companyNormalized": rec.company,
                            "role": rec.role,
                            "levelStandardized": rec.level_standardized.value,
                            "location": rec.location,
                            "experienceYears": rec.experience_years,
                            "baseSalary": rec.base_salary,
                            "bonus": rec.bonus,
                            "stock": rec.stock,
                            "totalCompensation": rec.total_compensation or 0,
                            "confidenceScore": rec.confidence_score,
                            "confidenceBreakdown": rec.confidence_breakdown,
                            "source": rec.source.value,
                            "sourceUrl": rec.source_url,
                            "dedupeHash": rec.dedupe_hash or "",
                            "runId": rec.run_id,
                            "needsHumanReview": rec.needs_human_review,
                        }
                    )
                    batch_ids.append(created.id)
            return batch_ids

        ids = await with_db_retry(_insert)
        log.info("inserted_batch", count=len(ids))
        return ids

    async def log_rejection(
        self,
        run_id: str | None,
        stage: str,
        reason: str,
        payload: dict | None = None,
    ) -> None:
        db = await get_prisma()
        await db.rejectionlog.create(
            data={"runId": run_id, "stage": stage, "reason": reason, "payload": payload or {}},
        )

    async def log_duplicate(
        self,
        run_id: str | None,
        dedupe_hash: str,
        matched_id: str | None,
        payload: dict | None = None,
    ) -> None:
        db = await get_prisma()
        await db.duplicatelog.create(
            data={
                "runId": run_id,
                "dedupeHash": dedupe_hash,
                "matchedSubmissionId": matched_id,
                "payload": payload or {},
            },
        )

    async def enqueue_human_review(
        self, run_id: str | None, payload: dict, reason: str
    ) -> None:
        db = await get_prisma()
        await db.humanreviewqueue.create(
            data={"runId": run_id, "payload": payload, "reason": reason, "status": "pending"},
        )
