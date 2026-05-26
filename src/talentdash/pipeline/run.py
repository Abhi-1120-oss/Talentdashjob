"""CLI entrypoint for pipeline execution."""

import argparse
import asyncio

from talentdash.pipeline.orchestrator import run_pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="TalentDash ingestion pipeline")
    parser.add_argument(
        "--skip-scrape",
        action="store_true",
        help="Skip scraping stage (useful for normalize-only runs)",
    )
    args = parser.parse_args()
    asyncio.run(run_pipeline(skip_scrape=args.skip_scrape))


if __name__ == "__main__":
    main()
