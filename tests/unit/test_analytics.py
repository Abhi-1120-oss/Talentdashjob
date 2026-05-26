import pytest

from talentdash.storage import db_mode
from talentdash.storage.mock_data import get_analytics
from talentdash.storage.query_repository import SalaryQueryRepository


def test_get_analytics_structure():
    data = get_analytics()
    assert "lpa_histogram" in data
    assert "by_level" in data
    assert "by_location" in data
    assert "company_leaderboard" in data
    assert len(data["lpa_histogram"]) >= 1
    assert len(data["by_level"]) >= 1
    assert data["company_leaderboard"][0]["avg_lpa"] > 0


@pytest.mark.asyncio
async def test_analytics_repository_uses_mock():
    db_mode.set_db_available(False, mock=True)
    repo = SalaryQueryRepository()
    data = await repo.get_analytics()
    assert len(data["company_leaderboard"]) >= 1
