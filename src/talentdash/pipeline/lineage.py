"""Data lineage tracking for pipeline runs."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class LineageRecord:
    run_id: str
    stage: str
    record_count: int
    metadata: dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class PipelineLineage:
    run_id: str
    records: list[LineageRecord] = field(default_factory=list)

    def add(self, stage: str, record_count: int, **metadata: Any) -> None:
        self.records.append(
            LineageRecord(
                run_id=self.run_id,
                stage=stage,
                record_count=record_count,
                metadata=metadata,
            )
        )

    def to_dict(self) -> dict:
        return {
            "run_id": self.run_id,
            "stages": [
                {
                    "stage": r.stage,
                    "record_count": r.record_count,
                    "metadata": r.metadata,
                    "timestamp": r.timestamp.isoformat(),
                }
                for r in self.records
            ],
        }
