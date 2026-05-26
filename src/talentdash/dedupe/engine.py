"""Production deduplication engine."""

from dataclasses import dataclass

from talentdash.config import get_settings
from talentdash.dedupe.fuzzy_company import companies_match
from talentdash.dedupe.hash_keys import build_dedupe_key
from talentdash.observability import get_logger
from talentdash.storage.repository import SalaryRepository
from talentdash.validation.schemas import SalaryIngestRecord

log = get_logger(__name__)


@dataclass
class DedupeResult:
    is_duplicate: bool
    dedupe_hash: str
    matched_submission_id: str | None = None
    method: str = "hash"


class DedupeEngine:
    def __init__(self, repository: SalaryRepository | None = None) -> None:
        self._repo = repository or SalaryRepository()
        self._settings = get_settings()

    def compute_hash(self, record: SalaryIngestRecord) -> str:
        return build_dedupe_key(
            record.company,
            record.role,
            record.level_standardized.value,
            record.location,
            record.base_salary,
        )

    async def check(self, record: SalaryIngestRecord) -> DedupeResult:
        dedupe_hash = self.compute_hash(record)
        existing = await self._repo.find_by_dedupe_hash(dedupe_hash)
        if existing:
            return DedupeResult(
                is_duplicate=True,
                dedupe_hash=dedupe_hash,
                matched_submission_id=existing.id,
                method="hash",
            )

        recent = await self._repo.find_recent_by_fields(
            record.company,
            record.role,
            record.level_standardized.value,
            record.location,
            self._settings.dedupe_window_days,
        )

        for match in recent:
            if companies_match(record.company, match.companyNormalized):
                match_hash = build_dedupe_key(
                    match.companyNormalized,
                    match.role,
                    match.levelStandardized,
                    match.location,
                    match.baseSalary,
                )
                if match_hash == dedupe_hash:
                    return DedupeResult(
                        is_duplicate=True,
                        dedupe_hash=dedupe_hash,
                        matched_submission_id=match.id,
                        method="fuzzy_fields",
                    )

        return DedupeResult(is_duplicate=False, dedupe_hash=dedupe_hash)

    async def filter_unique(
        self,
        records: list[SalaryIngestRecord],
        run_id: str | None = None,
    ) -> tuple[list[SalaryIngestRecord], int]:
        unique: list[SalaryIngestRecord] = []
        duplicates = 0

        for record in records:
            result = await self.check(record)
            if result.is_duplicate:
                duplicates += 1
                await self._repo.log_duplicate(
                    run_id,
                    result.dedupe_hash,
                    result.matched_submission_id,
                    record.model_dump(mode="json"),
                )
                log.info("duplicate_skipped", hash=result.dedupe_hash[:12])
            else:
                unique.append(
                    record.model_copy(update={"dedupe_hash": result.dedupe_hash})
                )

        return unique, duplicates
