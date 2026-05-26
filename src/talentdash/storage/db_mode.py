"""Detect whether real database is available."""

_db_available: bool | None = None
_using_mock: bool = False


def is_using_mock() -> bool:
    return _using_mock


def set_db_available(available: bool, mock: bool = False) -> None:
    global _db_available, _using_mock
    _db_available = available
    _using_mock = mock


async def check_database() -> bool:
    global _db_available, _using_mock
    if _db_available is not None:
        return _db_available

    try:
        from talentdash.storage.prisma_client import get_prisma
        import asyncio

        db = await get_prisma()
        await asyncio.wait_for(db.query_raw("SELECT 1"), timeout=3.0)
        _db_available = True
        _using_mock = False
        return True
    except Exception:
        from talentdash.storage.prisma_client import disconnect_prisma
        await disconnect_prisma()
        _db_available = False
        _using_mock = True
        return False
