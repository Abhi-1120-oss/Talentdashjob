"""Data quality reporting module."""

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from talentdash.config import get_settings


@dataclass
class QualityReport:
    run_id: str
    scraped: int = 0
    extracted: int = 0
    normalized: int = 0
    validated: int = 0
    stored: int = 0
    rejected: int = 0
    duplicates: int = 0
    human_review: int = 0
    parsing_failures: int = 0
    normalization_failures: int = 0
    null_field_pct: dict[str, float] = field(default_factory=dict)
    confidence_distribution: dict[str, int] = field(default_factory=dict)
    rejection_reasons: dict[str, int] = field(default_factory=dict)

    def record_rejection(self, reason: str) -> None:
        self.rejected += 1
        self.rejection_reasons[reason] = self.rejection_reasons.get(reason, 0) + 1

    def record_confidence(self, score: float) -> None:
        if score < 0.5:
            bucket = "0.0-0.5"
        elif score < 0.7:
            bucket = "0.5-0.7"
        elif score < 0.9:
            bucket = "0.7-0.9"
        else:
            bucket = "0.9-1.0"
        self.confidence_distribution[bucket] = (
            self.confidence_distribution.get(bucket, 0) + 1
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "counts": {
                "scraped": self.scraped,
                "extracted": self.extracted,
                "normalized": self.normalized,
                "validated": self.validated,
                "stored": self.stored,
                "rejected": self.rejected,
                "duplicates": self.duplicates,
                "human_review": self.human_review,
                "parsing_failures": self.parsing_failures,
                "normalization_failures": self.normalization_failures,
            },
            "null_field_pct": self.null_field_pct,
            "confidence_distribution": self.confidence_distribution,
            "rejection_reasons": self.rejection_reasons,
        }

    def print_console(self) -> None:
        d = self.to_dict()
        print("\n=== TalentDash Quality Report ===")
        print(f"Run ID: {self.run_id}")
        for k, v in d["counts"].items():
            print(f"  {k}: {v}")
        if self.confidence_distribution:
            print("Confidence distribution:")
            for bucket, count in sorted(self.confidence_distribution.items()):
                print(f"  {bucket}: {count}")
        if self.rejection_reasons:
            print("Top rejection reasons:")
            for reason, count in sorted(
                self.rejection_reasons.items(), key=lambda x: -x[1]
            )[:5]:
                print(f"  {reason}: {count}")
        print("================================\n")

    def export_json(self) -> Path:
        settings = get_settings()
        reports_dir = Path(settings.reports_dir)
        reports_dir.mkdir(parents=True, exist_ok=True)
        path = reports_dir / f"{self.run_id}.json"
        path.write_text(json.dumps(self.to_dict(), indent=2), encoding="utf-8")
        return path
