from talentdash.dedupe.hash_keys import build_dedupe_key, salary_bucket


def test_salary_bucket():
    assert salary_bucket(1_200_000) == "1000000"
    assert salary_bucket(0) == "unknown"


def test_dedupe_hash_deterministic():
    h1 = build_dedupe_key("Google", "SWE", "l5", "bangalore", 2_500_000)
    h2 = build_dedupe_key("Google", "SWE", "l5", "bangalore", 2_500_000)
    assert h1 == h2
    assert len(h1) == 64


def test_dedupe_hash_differs_by_company():
    h1 = build_dedupe_key("Google", "SWE", "l5", "bangalore", 2_500_000)
    h2 = build_dedupe_key("Amazon", "SWE", "l5", "bangalore", 2_500_000)
    assert h1 != h2
