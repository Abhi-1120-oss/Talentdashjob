"""Application settings loaded from environment."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = Field(
        default="postgresql://talentdash:talentdash@localhost:5432/talentdash?schema=public",
        alias="DATABASE_URL",
    )
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    queue_backend: Literal["asyncio", "redis"] = Field(default="asyncio", alias="QUEUE_BACKEND")
    redis_url: str = Field(default="redis://localhost:6379", alias="REDIS_URL")
    dedupe_window_days: int = Field(default=30, alias="DEDUPE_WINDOW_DAYS")
    human_review_threshold: float = Field(default=0.65, alias="HUMAN_REVIEW_THRESHOLD")
    scrape_max_concurrent: int = Field(default=3, alias="SCRAPE_MAX_CONCURRENT")
    scrape_delay_min_sec: float = Field(default=1.0, alias="SCRAPE_DELAY_MIN_SEC")
    scrape_delay_max_sec: float = Field(default=3.0, alias="SCRAPE_DELAY_MAX_SEC")
    scrape_headless: bool = Field(default=True, alias="SCRAPE_HEADLESS")
    scrape_sources: str = Field(
        default="ambitionbox,glassdoor",
        alias="SCRAPE_SOURCES",
    )
    scrape_roles: str = Field(
        default="Software Engineer,Data Scientist",
        alias="SCRAPE_ROLES",
    )

    @property
    def scrape_sources_list(self) -> list[str]:
        return [s.strip() for s in self.scrape_sources.split(",") if s.strip()]

    @property
    def scrape_roles_list(self) -> list[str]:
        return [s.strip() for s in self.scrape_roles.split(",") if s.strip()]

    api_key: str = Field(default="", alias="API_KEY")
    cors_origins: str = Field(default="*", alias="CORS_ORIGINS")
    api_base_url: str = Field(default="http://localhost:8000", alias="API_BASE_URL")

    @property
    def cors_origins_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    llm_model: str = Field(default="gpt-4o-mini", alias="LLM_MODEL")
    llm_batch_size: int = Field(default=10, alias="LLM_BATCH_SIZE")
    insert_batch_size: int = Field(default=50, alias="INSERT_BATCH_SIZE")
    fuzzy_company_threshold: float = Field(default=0.92, alias="FUZZY_COMPANY_THRESHOLD")
    reports_dir: str = Field(default="reports", alias="REPORTS_DIR")

    # Playwright
    navigation_timeout_ms: int = Field(default=30000, alias="NAVIGATION_TIMEOUT_MS")
    max_scrape_retries: int = Field(default=3, alias="MAX_SCRAPE_RETRIES")
    user_agents: list[str] = Field(
        default_factory=lambda: [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ]
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
