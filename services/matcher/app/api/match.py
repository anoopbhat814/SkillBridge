from fastapi import APIRouter
from pydantic import BaseModel

from app.core.scoring import score_match
from app.models.schemas import CandidateInput, JobInput, MatchResponse

router = APIRouter(tags=["match"])


class MatchRequest(BaseModel):
    candidate: CandidateInput
    job: JobInput


@router.post("/match/score", response_model=MatchResponse)
def score(req: MatchRequest) -> MatchResponse:
    return score_match(req.candidate, req.job)
