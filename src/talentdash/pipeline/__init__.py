__all__ = ["PipelineOrchestrator", "run_pipeline"]


def __getattr__(name: str):
    if name in ("PipelineOrchestrator", "run_pipeline"):
        from talentdash.pipeline.orchestrator import PipelineOrchestrator, run_pipeline
        return PipelineOrchestrator if name == "PipelineOrchestrator" else run_pipeline
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
