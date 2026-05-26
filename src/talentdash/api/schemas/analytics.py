"""Analytics API response schemas."""

from pydantic import BaseModel


class AnalyticsBucket(BaseModel):
    label: str
    count: int
    avg_lpa: float | None = None


class AnalyticsResponse(BaseModel):
    lpa_histogram: list[AnalyticsBucket]
    by_level: list[AnalyticsBucket]
    by_location: list[AnalyticsBucket]
    by_role: list[AnalyticsBucket]
    company_leaderboard: list[AnalyticsBucket]
