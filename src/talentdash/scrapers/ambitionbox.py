"""AmbitionBox salary scraper."""

from datetime import datetime
from urllib.parse import quote_plus

from playwright.async_api import Browser, Page, async_playwright

from talentdash.config import get_settings
from talentdash.observability import get_logger, get_metrics
from talentdash.scrapers.base import BaseScraper
from talentdash.scrapers.rate_limit import get_rate_limiter
from talentdash.scrapers.retry_middleware import with_retry
from talentdash.validation.enums import DataSource
from talentdash.validation.schemas import ScrapedRecord

log = get_logger(__name__)

ROLE_URLS = {
    "Software Engineer": "https://www.ambitionbox.com/salaries/software-engineer-salary",
    "Data Scientist": "https://www.ambitionbox.com/salaries/data-scientist-salary",
}


class AmbitionBoxScraper(BaseScraper):
    source = DataSource.AMBITIONBOX
    domain = "ambitionbox.com"

    def __init__(self) -> None:
        self._browser: Browser | None = None
        self._playwright = None

    async def _ensure_browser(self) -> Browser:
        if self._browser is None:
            self._playwright = await async_playwright().start()
            settings = get_settings()
            self._browser = await self._playwright.chromium.launch(headless=settings.scrape_headless)
        return self._browser

    async def _scrape_page(self, page: Page, role: str, page_num: int) -> list[ScrapedRecord]:
        records: list[ScrapedRecord] = []
        selectors = [
            ".salary-card",
            "[class*='salary']",
            ".company-salary-card",
            "article",
        ]

        cards = []
        for sel in selectors:
            cards = await page.query_selector_all(sel)
            if cards:
                break

        for card in cards:
            try:
                company_el = await card.query_selector(
                    ".company-name, [class*='company'], h3, h4"
                )
                salary_el = await card.query_selector(
                    ".salary, [class*='salary'], [class*='ctc']"
                )
                loc_el = await card.query_selector(".location, [class*='location']")
                exp_el = await card.query_selector(".experience, [class*='exp']")

                company = await company_el.inner_text() if company_el else None
                salary_range = await salary_el.inner_text() if salary_el else None
                location = await loc_el.inner_text() if loc_el else None
                experience = await exp_el.inner_text() if exp_el else None

                if not company and not salary_range:
                    continue

                records.append(
                    ScrapedRecord(
                        company=company.strip() if company else None,
                        role=role,
                        salary_range=salary_range.strip() if salary_range else None,
                        location=location.strip() if location else None,
                        experience=experience.strip() if experience else None,
                        source_url=page.url,
                        scraped_at=datetime.utcnow(),
                        source=self.source,
                    )
                )
            except Exception as e:
                log.warning("card_parse_failed", source="ambitionbox", error=str(e))
                get_metrics().inc("scraper.record_failures")

        log.info("page_scraped", source="ambitionbox", role=role, page=page_num, count=len(records))
        return records

    async def scrape(self, roles: list[str]) -> list[ScrapedRecord]:
        settings = get_settings()
        limiter = get_rate_limiter(self.domain)
        all_records: list[ScrapedRecord] = []
        browser = await self._ensure_browser()

        for role in roles:
            base_url = ROLE_URLS.get(role, f"https://www.ambitionbox.com/salaries/{quote_plus(role)}-salary")

            async def _navigate(p: Page) -> None:
                await p.goto(base_url, timeout=settings.navigation_timeout_ms, wait_until="domcontentloaded")

            for page_num in range(1, 4):
                await limiter.acquire()
                context = await browser.new_context(
                    user_agent=settings.user_agents[page_num % len(settings.user_agents)]
                )
                page = await context.new_page()
                try:
                    await with_retry(lambda: _navigate(page), label=f"ambitionbox_{role}_p{page_num}")

                    content = await page.content()
                    if "captcha" in content.lower() or "blocked" in content.lower():
                        limiter.record_error(403)
                        get_metrics().inc("scraper.blocks")
                        log.warning("scraper_blocked", source="ambitionbox", role=role)
                        break

                    limiter.record_success()
                    records = await self._scrape_page(page, role, page_num)
                    all_records.extend(records)
                    get_metrics().inc("scraper.records", len(records))

                    next_btn = await page.query_selector(
                        "a.next, button.next, [aria-label='Next'], .pagination-next"
                    )
                    if not next_btn:
                        break
                    await next_btn.click()
                    await page.wait_for_timeout(1500)
                except Exception as e:
                    limiter.record_error()
                    log.error("scrape_page_failed", source="ambitionbox", role=role, error=str(e))
                    get_metrics().inc("scraper.page_failures")
                finally:
                    await context.close()

        return all_records

    async def close(self) -> None:
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None
