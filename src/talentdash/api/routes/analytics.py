"""Analytics API for charts dashboard."""

from fastapi import APIRouter

from talentdash.api.schemas.analytics import AnalyticsResponse
from talentdash.storage.query_repository import SalaryQueryRepository

router = APIRouter(prefix="/api/v1", tags=["public"])
_query = SalaryQueryRepository()


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics() -> AnalyticsResponse:
    """Aggregated compensation data for Insights charts."""
    data = await _query.get_analytics()
    return AnalyticsResponse.model_validate(data)
