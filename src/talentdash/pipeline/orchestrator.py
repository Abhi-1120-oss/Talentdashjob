"""Pipeline orchestrator wiring all stages."""

from talentdash.observability import bind_run_id, configure_logging, get_logger, new_run_id
from talentdash.pipeline.lineage import PipelineLineage
from talentdash.pipeline.stages import (
    stage_dedupe,
    stage_extract,
    stage_normalize,
    stage_score,
    stage_scrape,
    stage_store,
    stage_validate,
)
from talentdash.reporting.quality_report import QualityReport
from talentdash.storage.prisma_client import disconnect_prisma
from talentdash.storage.repository import SalaryRepository

log = get_logger(__name__)


class PipelineOrchestrator:
    def __init__(self, run_id: str | None = None) -> None:
        self.run_id = run_id or new_run_id()
        self.repo = SalaryRepository()
        self.lineage = PipelineLineage(self.run_id)
        self.report = QualityReport(run_id=self.run_id)

    async def run(self, skip_scrape: bool = False) -> QualityReport:
        bind_run_id(self.run_id)
        log.info("pipeline_start", run_id=self.run_id)

        try:
            await self.repo.create_ingestion_run(self.run_id)

            if skip_scrape:
                scraped = []
            else:
                scraped = await stage_scrape(self.report)
                self.lineage.add("scrape", len(scraped))

            extracted = stage_extract(scraped, self.report)
            self.lineage.add("extract", len(extracted))

            extracted_map = {
                f"{e.company}:{e.role}:{e.source_url}": e
                for e in extracted
                if e.company and e.role
            }

            normalized = await stage_normalize(extracted, self.report, self.run_id)
            self.lineage.add("normalize", len(normalized))

            validated = stage_validate(normalized, self.report)
            self.lineage.add("validate", len(validated))

            unique = await stage_dedupe(validated, self.report, self.run_id)
            self.lineage.add("dedupe", len(unique), duplicates=self.report.duplicates)

            scored = stage_score(unique, extracted_map, self.report)
            self.lineage.add("score", len(scored))

            await stage_store(scored, self.report, self.run_id, self.repo)
            self.lineage.add("store", self.report.stored)

            metrics = {
                **self.report.to_dict(),
                "lineage": self.lineage.to_dict(),
            }
            await self.repo.complete_ingestion_run(self.run_id, "completed", metrics)

            self.report.print_console()
            self.report.export_json()
            log.info("pipeline_complete", run_id=self.run_id, stored=self.report.stored)
            return self.report

        except Exception as e:
            log.error("pipeline_failed", run_id=self.run_id, error=str(e))
            await self.repo.complete_ingestion_run(
                self.run_id,
                "failed",
                {"error": str(e), **self.report.to_dict()},
            )
            raise
        finally:
            await disconnect_prisma()


async def run_pipeline(skip_scrape: bool = False) -> QualityReport:
    configure_logging()
    orchestrator = PipelineOrchestrator()
    return await orchestrator.run(skip_scrape=skip_scrape)
