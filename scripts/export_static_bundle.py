"""Export mock API data to frontend/public/data/bundle.json for Vercel CDN deploy."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from talentdash.api.utils.formatting import record_to_public
from talentdash.storage import mock_data

OUT = ROOT / "frontend" / "public" / "data" / "bundle.json"


def main() -> None:
    salaries = [record_to_public(r) for r in mock_data.get_all_records()]
    for row in salaries:
        row["created_at"] = row["created_at"].isoformat().replace("+00:00", "Z")

    summaries, _ = mock_data.company_summaries(page=1, page_size=100)

    bundle = {
        "salaries": salaries,
        "filters": mock_data.get_filters(),
        "stats": mock_data.platform_stats(),
        "companies": summaries,
        "analytics": mock_data.get_analytics(),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(bundle, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(salaries)} records to {OUT}")


if __name__ == "__main__":
    main()
