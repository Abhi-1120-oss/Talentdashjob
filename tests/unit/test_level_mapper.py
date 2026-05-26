from talentdash.levels.mapper import map_level
from talentdash.validation.enums import LevelStandardized


def test_senior_software_engineer():
    result = map_level("Senior Software Engineer", 6.0)
    assert result.level == LevelStandardized.L5
    assert result.confidence >= 0.7


def test_sde_ii():
    result = map_level("SDE II", 3.0)
    assert result.level == LevelStandardized.SDE_II


def test_staff_engineer():
    result = map_level("Staff Engineer", 10.0)
    assert result.level == LevelStandardized.STAFF


def test_experience_fallback():
    result = map_level("Engineer", 1.0)
    assert result.level in (LevelStandardized.L3, LevelStandardized.L4, LevelStandardized.UNKNOWN)
