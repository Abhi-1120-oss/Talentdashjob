"""In-process metrics counters for observability."""

from collections import defaultdict
from dataclasses import dataclass, field
from threading import Lock


@dataclass
class MetricsRegistry:
    counters: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    gauges: dict[str, float] = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock)

    def inc(self, name: str, value: int = 1) -> None:
        with self._lock:
            self.counters[name] += value

    def set_gauge(self, name: str, value: float) -> None:
        with self._lock:
            self.gauges[name] = value

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "counters": dict(self.counters),
                "gauges": dict(self.gauges),
            }

    def prometheus_text(self) -> str:
        lines = []
        snap = self.snapshot()
        for name, value in snap["counters"].items():
            lines.append(f'talentdash_{name.replace(".", "_")}_total {value}')
        for name, value in snap["gauges"].items():
            lines.append(f'talentdash_{name.replace(".", "_")} {value}')
        return "\n".join(lines) + "\n"


_metrics = MetricsRegistry()


def get_metrics() -> MetricsRegistry:
    return _metrics
