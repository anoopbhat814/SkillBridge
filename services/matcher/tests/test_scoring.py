from app.core.scoring import score_match
from app.models.schemas import CandidateInput, JobInput, Level, Requirement, SkillEntry


def _job(*reqs: Requirement, min_years: int = 0) -> JobInput:
    return JobInput(title="Engineer", requirements=list(reqs), min_years=min_years)


def test_perfect_match():
    cand = CandidateInput(skills=[SkillEntry(name="Python", level=Level.ADVANCED)])
    res = score_match(cand, _job(Requirement(name="python", min_level=Level.ADVANCED)))
    assert res.score == 1.0
    assert res.missing == []


def test_missing_required_skill_lowers_score():
    cand = CandidateInput(skills=[SkillEntry(name="Python")])
    res = score_match(cand, _job(Requirement(name="Python"), Requirement(name="Go")))
    assert 0 < res.score < 1
    assert res.missing == ["Go"]


def test_experience_penalty():
    cand = CandidateInput(years_experience=1, skills=[SkillEntry(name="Go")])
    res = score_match(cand, _job(Requirement(name="Go"), min_years=5))
    assert res.score == 0.85
