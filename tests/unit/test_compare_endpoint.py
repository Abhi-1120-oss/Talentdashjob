import pytest
from httpx import ASGITransport, AsyncClient

from talentdash.api.main import app
from talentdash.storage import db_mode
from talentdash.storage.mock_data import get_all_records


@pytest.fixture(autouse=True)
def _mock_db():
    db_mode.set_db_available(False, mock=True)


@pytest.mark.asyncio
async def test_compare_salaries_valid_order():
    records = get_all_records()
    id1, id2 = records[0].id, records[2].id
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(f"/api/v1/salaries/compare?ids={id2},{id1}")
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) == 2
    assert body["data"][0]["id"] == id2
    assert body["data"][1]["id"] == id1
    assert body["missing_ids"] == []


@pytest.mark.asyncio
async def test_compare_salaries_partial_missing():
    records = get_all_records()
    valid_id = records[0].id
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            f"/api/v1/salaries/compare?ids={valid_id},missing-id-xyz"
        )
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) == 1
    assert body["data"][0]["id"] == valid_id
    assert body["missing_ids"] == ["missing-id-xyz"]


@pytest.mark.asyncio
async def test_compare_salaries_too_many_ids():
    records = get_all_records()
    ids = ",".join(r.id for r in records[:4])
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(f"/api/v1/salaries/compare?ids={ids}")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_compare_salaries_empty_ids():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/salaries/compare?ids=,,,")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_compare_dedupes_ids():
    records = get_all_records()
    record_id = records[0].id
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            f"/api/v1/salaries/compare?ids={record_id},{record_id}"
        )
    assert response.status_code == 200
    assert len(response.json()["data"]) == 1
