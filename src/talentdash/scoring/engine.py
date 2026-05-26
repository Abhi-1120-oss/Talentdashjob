"""Weighted confidence scoring engine."""

from pathlib import Path
from typing import Any

import yaml

from talentdash.config import get_settings
from talentdash.validation.enums import DataSource
from talentdash.validation.schemas import ExtractedRecord, SalaryIngestRecord

WEIGHTS_PATH = Path(__file__).parent / "weights.yaml"


def _load_weights() -> dict[str, Any]:
    with open(WEIGHTS_PATH) as f:
        return yaml.safe_load(f)


class ConfidenceScorer:
    def __init__(self) -> None:
        self._weights = _load_weights()
        self._settings = get_settings()

    def score(
        self,
        record: SalaryIngestRecord,
        *,
        extracted: ExtractedRecord | None = None,
        level_confidence: float = 0.5,
        is_duplicate: bool = False,
        validation_passed: bool = True,
    ) -> tuple[float, dict[str, float]]:
        breakdown: dict[str, float] = {}

        required = ["company", "role", "location", "base_salary"]
        filled = sum(1 for f in required if getattr(record, f, None))
        breakdown["field_completeness"] = filled / len(required)

        breakdown["extraction_confidence"] = extracted.extraction_confidence if extracted else 0.5

        llm_conf = min(1.0, record.confidence_score)
        breakdown["llm_confidence"] = llm_conf

        salary_ok = 1.0 if record.base_salary > 0 else 0.0
        if extracted and extracted.base_min_lpa and extracted.base_max_lpa:
            if extracted.base_min_lpa <= extracted.base_max_lpa:
                salary_ok = 1.0
            else:
                salary_ok = 0.3
        breakdown["salary_consistency"] = salary_ok

        breakdown["level_inference"] = level_confidence

        source_weights = self._weights.get("source_weights", {})
        breakdown["source_reliability"] = source_weights.get(
            record.source.value, 0.7
        )

        breakdown["validation_quality"] = 1.0 if validation_passed else 0.0
        breakdown["dedupe_uniqueness"] = 0.0 if is_duplicate else 1.0

        total = 0.0
        for key in [
            "field_completeness",
            "extraction_confidence",
            "llm_confidence",
            "salary_consistency",
            "level_inference",
            "source_reliability",
            "validation_quality",
            "dedupe_uniqueness",
        ]:
            weight = self._weights.get(key, 0.1)
            total += weight * breakdown.get(key, 0.0)

        final = min(1.0, max(0.0, total))
        return final, breakdown

    def apply_to_record(
        self,
        record: SalaryIngestRecord,
        **kwargs: Any,
    ) -> SalaryIngestRecord:
        score, breakdown = self.score(record, **kwargs)
        needs_review = score < self._settings.human_review_threshold
        return record.model_copy(
            update={
                "confidence_score": score,
                "confidence_breakdown": breakdown,
                "needs_human_review": needs_review or record.needs_human_review,
            }
        )
