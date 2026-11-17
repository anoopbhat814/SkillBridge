"""Weighted skill-overlap scoring between a candidate and a job."""
from app.models.schemas import CandidateInput, JobInput, MatchResponse

VERIFIED_BONUS = 1.1
REQUIRED_WEIGHT = 2.0
OPTIONAL_WEIGHT = 1.0


def _skill_credit(candidate_level: int, required_level: int) -> float:
    """Full credit when level is met, partial credit when one step short."""
    if candidate_level >= required_level:
        return 1.0
    gap = required_level - candidate_level
    return max(0.0, 1.0 - 0.4 * gap)


def score_match(candidate: CandidateInput, job: JobInput) -> MatchResponse:
    by_name = {s.name.lower(): s for s in candidate.skills}
    total = earned = 0.0
    matched: list[str] = []
    missing: list[str] = []

    for req in job.requirements:
        weight = REQUIRED_WEIGHT if req.required else OPTIONAL_WEIGHT
        total += weight
        have = by_name.get(req.name.lower())
        if have is None:
            missing.append(req.name)
            continue
        credit = _skill_credit(int(have.level), int(req.min_level))
        if have.verified:
            credit = min(1.0, credit * VERIFIED_BONUS)
        earned += weight * credit
        matched.append(req.name)

    base = earned / total if total else 0.0
    if job.min_years and candidate.years_experience < job.min_years:
        base *= 0.85
    score = round(min(1.0, base), 4)
    explanation = f"Matched {len(matched)} of {len(job.requirements)} requirements."
    return MatchResponse(score=score, matched=matched, missing=missing, explanation=explanation)
