"""Read-only queries for public API (web, mobile, iOS, Android)."""

from typing import Any

from talentdash.storage import mock_data
from talentdash.storage.db_mode import check_database, is_using_mock


class SalaryQueryRepository:
    async def _use_db(self) -> bool:
        return await check_database()

    async def count_salaries(self, where: dict[str, Any] | None = None) -> int:
        if not await self._use_db():
            return len(mock_data.get_all_records())
        from talentdash.storage.prisma_client import get_prisma
        db = await get_prisma()
        return await db.salarysubmission.count(where=where or {"needsHumanReview": False})

    async def search_salaries(
        self,
        *,
        company: str | None = None,
        role: str | None = None,
        level: str | None = None,
        location: str | None = None,
        min_total_inr: float | None = None,
        max_total_inr: float | None = None,
        page: int = 1,
        page_size: int = 20,
        sort: str = "created_at_desc",
    ) -> tuple[list[Any], int]:
        if is_using_mock():
            return mock_data.search(
                company=company,
                role=role,
                level=level,
                location=location,
                min_total_inr=min_total_inr,
                max_total_inr=max_total_inr,
                page=page,
                page_size=page_size,
                sort=sort,
            )

        from talentdash.storage.prisma_client import get_prisma
        db = await get_prisma()
        where: dict[str, Any] = {"needsHumanReview": False}

        if company:
            where["companyNormalized"] = {"contains": company.lower(), "mode": "insensitive"}
        if role:
            where["role"] = {"contains": role, "mode": "insensitive"}
        if level:
            where["levelStandardized"] = level.lower()
        if location:
            where["location"] = {"contains": location.lower(), "mode": "insensitive"}
        if min_total_inr is not None or max_total_inr is not None:
            tc: dict[str, float] = {}
            if min_total_inr is not None:
                tc["gte"] = min_total_inr
            if max_total_inr is not None:
                tc["lte"] = max_total_inr
            where["totalCompensation"] = tc

        order_map = {
            "created_at_desc": {"createdAt": "desc"},
            "created_at_asc": {"createdAt": "asc"},
            "total_desc": {"totalCompensation": "desc"},
            "total_asc": {"totalCompensation": "asc"},
            "confidence_desc": {"confidenceScore": "desc"},
        }
        order = order_map.get(sort, {"createdAt": "desc"})

        total = await db.salarysubmission.count(where=where)
        skip = max(0, (page - 1) * page_size)
        rows = await db.salarysubmission.find_many(
            where=where,
            skip=skip,
            take=min(page_size, 100),
            order=order,
        )
        return rows, total

    async def get_by_id(self, record_id: str) -> Any | None:
        if is_using_mock():
            return mock_data.get_by_id(record_id)
        from talentdash.storage.prisma_client import get_prisma
        db = await get_prisma()
        return await db.salarysubmission.find_unique(where={"id": record_id})

    async def get_by_ids(self, ids: list[str]) -> tuple[list[Any], list[str]]:
        if not ids:
            return [], []
        if is_using_mock():
            return mock_data.get_by_ids(ids)
        from talentdash.storage.prisma_client import get_prisma

        db = await get_prisma()
        rows = await db.salarysubmission.find_many(where={"id": {"in": ids}})
        by_id = {r.id: r for r in rows}
        found: list[Any] = []
        missing: list[str] = []
        for record_id in ids:
            row = by_id.get(record_id)
            if row:
                found.append(row)
            else:
                missing.append(record_id)
        return found, missing

    async def get_distinct_filters(self) -> dict[str, list[str]]:
        if is_using_mock():
            return mock_data.get_filters()
        from talentdash.storage.prisma_client import get_prisma
        db = await get_prisma()
        rows = await db.salarysubmission.find_many(
            where={"needsHumanReview": False},
            take=500,
            order={"createdAt": "desc"},
        )
        roles: set[str] = set()
        levels: set[str] = set()
        locations: set[str] = set()
        companies: set[str] = set()
        for r in rows:
            roles.add(r.role)
            levels.add(r.levelStandardized)
            locations.add(r.location)
            companies.add(r.companyNormalized)
        return {
            "roles": sorted(roles)[:50],
            "levels": sorted(levels),
            "locations": sorted(locations)[:50],
            "companies": sorted(companies)[:100],
        }

    async def company_summaries(self, page: int = 1, page_size: int = 20) -> tuple[list[dict], int]:
        if is_using_mock():
            return mock_data.company_summaries(page, page_size)

        from talentdash.storage.prisma_client import get_prisma
        db = await get_prisma()
        rows = await db.salarysubmission.find_many(
            where={"needsHumanReview": False},
            take=2000,
            order={"createdAt": "desc"},
        )
        by_company: dict[str, list[Any]] = {}
        for r in rows:
            by_company.setdefault(r.companyNormalized, []).append(r)

        summaries = []
        for company, recs in sorted(by_company.items()):
            totals = [float(r.totalCompensation) for r in recs]
            lpa_vals = [t / 100_000 for t in totals]
            role_counts: dict[str, int] = {}
            for r in recs:
                role_counts[r.role] = role_counts.get(r.role, 0) + 1
            top_roles = sorted(role_counts, key=role_counts.get, reverse=True)[:3]
            summaries.append({
                "company": company,
                "record_count": len(recs),
                "avg_total_lpa": round(sum(lpa_vals) / len(lpa_vals), 2),
                "min_total_lpa": round(min(lpa_vals), 2),
                "max_total_lpa": round(max(lpa_vals), 2),
                "top_roles": top_roles,
            })

        total = len(summaries)
        start = (page - 1) * page_size
        end = start + page_size
        return summaries[start:end], total

    async def get_analytics(self) -> dict:
        if is_using_mock():
            return mock_data.get_analytics()

        rows = await self._fetch_all_for_analytics()
        if not rows:
            return mock_data.get_analytics()
        return self._compute_analytics(rows)

    async def _fetch_all_for_analytics(self) -> list:
        from talentdash.storage.prisma_client import get_prisma
        db = await get_prisma()
        return await db.salarysubmission.find_many(
            where={"needsHumanReview": False},
            take=5000,
        )

    def _compute_analytics(self, rows: list) -> dict:
        import talentdash.storage.mock_data as md

        old_cache = md._CACHE
        md._CACHE = rows
        try:
            return md.get_analytics()
        finally:
            md._CACHE = old_cache

    async def platform_stats(self) -> dict:
        if is_using_mock():
            return mock_data.platform_stats()

        from talentdash.storage.prisma_client import get_prisma
        db = await get_prisma()
        rows = await db.salarysubmission.find_many(
            where={"needsHumanReview": False},
            take=5000,
        )
        if not rows:
            return mock_data.platform_stats()

        companies: set[str] = set()
        by_source: dict[str, int] = {}
        by_location: dict[str, int] = {}
        conf_sum = 0.0

        for r in rows:
            companies.add(r.companyNormalized)
            by_source[r.source] = by_source.get(r.source, 0) + 1
            by_location[r.location] = by_location.get(r.location, 0) + 1
            conf_sum += float(r.confidenceScore)

        top_locations = dict(sorted(by_location.items(), key=lambda x: -x[1])[:10])
        return {
            "total_records": len(rows),
            "total_companies": len(companies),
            "avg_confidence": round(conf_sum / len(rows), 3),
            "records_by_source": by_source,
            "records_by_location": top_locations,
        }
