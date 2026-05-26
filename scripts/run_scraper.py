#!/usr/bin/env python3
"""Standalone scraper script."""

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from talentdash.observability import configure_logging, get_logger
from talentdash.scrapers.orchestrator import run_scrapers

log = get_logger(__name__)


async def main() -> None:
    configure_logging()
    records = await run_scrapers()
    output = [r.model_dump(mode="json") for r in records]
    out_path = Path("reports") / "scraped_output.json"
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(output, indent=2, default=str), encoding="utf-8")
    log.info("scrape_complete", count=len(records), path=str(out_path))
    print(f"Scraped {len(records)} records -> {out_path}")


if __name__ == "__main__":
    asyncio.run(main())
