import os

import pytest

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("OPENAI_API_KEY", "test-key")
os.environ.setdefault("API_KEY", "test-key")
os.environ.setdefault("QUEUE_BACKEND", "asyncio")


@pytest.fixture
def sample_scraped_record():
    from talentdash.validation.enums import DataSource
    from talentdash.validation.schemas import ScrapedRecord

    return ScrapedRecord(
        company="Wipro",
        role="Software Engineer",
        salary_range="₹10-15 LPA",
        location="Hyderabad",
        experience="4 years",
        source=DataSource.AMBITIONBOX,
    )
