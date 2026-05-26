from talentdash.dedupe.hash_keys import build_dedupe_key, salary_bucket

__all__ = ["DedupeEngine", "DedupeResult", "build_dedupe_key", "salary_bucket"]


def __getattr__(name: str):
    if name == "DedupeEngine":
        from talentdash.dedupe.engine import DedupeEngine
        return DedupeEngine
    if name == "DedupeResult":
        from talentdash.dedupe.engine import DedupeResult
        return DedupeResult
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
