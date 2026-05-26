"""Ingestion API routes."""

from fastapi import APIRouter, Depends

from talentdash.api.deps import get_or_create_request_id, verify_api_key
from talentdash.dedupe.engine import DedupeEngine
from talentdash.levels.mapper import map_level
from talentdash.observability import get_logger
from talentdash.scoring.engine import ConfidenceScorer
from talentdash.storage.repository import SalaryRepository
from talentdash.validation.exceptions import DuplicateRecordException, ValidationException
from talentdash.validation.middleware import validate_ingest_record
from talentdash.validation.schemas import IngestBatchRequest, IngestBatchResponse, IngestItemResult

log = get_logger(__name__)
router = APIRouter(prefix="/api", tags=["ingest"])
_repo = SalaryRepository()
_dedupe = DedupeEngine(_repo)
_scorer = ConfidenceScorer()


@router.post("/ingest-salary", response_model=IngestBatchResponse)
async def ingest_salary(
    body: IngestBatchRequest,
    _: None = Depends(verify_api_key),
    request_id: str = Depends(get_or_create_request_id),
) -> IngestBatchResponse:
    results: list[IngestItemResult] = []
    accepted = rejected = duplicate = 0
    to_store = []

    for idx, raw_record in enumerate(body.records):
        try:
            record = validate_ingest_record(raw_record.model_dump(mode="json"))
            dedupe_result = await _dedupe.check(record)
            if dedupe_result.is_duplicate:
                duplicate += 1
                await _repo.log_duplicate(
                    record.run_id,
                    dedupe_result.dedupe_hash,
                    dedupe_result.matched_submission_id,
                    record.model_dump(mode="json"),
                )
                results.append(
                    IngestItemResult(index=idx, status="duplicate", reason="duplicate_record")
                )
                continue

            level_conf = map_level(record.role, record.experience_years).confidence
            record = _scorer.apply_to_record(
                record.model_copy(update={"dedupe_hash": dedupe_result.dedupe_hash}),
                level_confidence=level_conf,
                validation_passed=True,
            )
            to_store.append(record)
            results.append(IngestItemResult(index=idx, status="accepted"))

        except ValidationException as e:
            rejected += 1
            await _repo.log_rejection(raw_record.run_id, "api", e.reason.value)
            results.append(
                IngestItemResult(index=idx, status="rejected", reason=e.reason.value)
            )
        except DuplicateRecordException as e:
            duplicate += 1
            results.append(
                IngestItemResult(index=idx, status="duplicate", reason=str(e))
            )
        except Exception as e:
            rejected += 1
            results.append(
                IngestItemResult(index=idx, status="rejected", reason=str(e))
            )

    if to_store:
        ids = await _repo.insert_batch(to_store)
        accepted = len(ids)
        id_iter = iter(ids)
        for r in results:
            if r.status == "accepted":
                r.record_id = next(id_iter, None)

    log.info(
        "ingest_batch_complete",
        request_id=request_id,
        accepted=accepted,
        rejected=rejected,
        duplicate=duplicate,
    )

    return IngestBatchResponse(
        request_id=request_id,
        accepted=accepted,
        rejected=rejected,
        duplicate=duplicate,
        results=results,
    )
