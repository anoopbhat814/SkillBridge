from app.core.resume_parser import parse_resume

SAMPLE = """
Jordan Lee - jordan.lee@example.com
Senior engineer with 8 years of experience in Python, Kubernetes and PostgreSQL.
M.Sc. Computer Science, University of Leeds
"""


def test_parses_email_and_skills():
    parsed = parse_resume(SAMPLE)
    assert parsed.email == "jordan.lee@example.com"
    assert {"python", "kubernetes", "postgresql"} <= set(parsed.skills)


def test_parses_years_and_education():
    parsed = parse_resume(SAMPLE)
    assert parsed.years_experience == 8
    assert any("Computer Science" in e for e in parsed.education)


def test_empty_resume():
    parsed = parse_resume("")
    assert parsed.skills == [] and parsed.email is None
