from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.resume_parser import parse_resume
from app.models.schemas import ParsedResume

router = APIRouter(tags=["resumes"])


class ParseRequest(BaseModel):
    text: str


@router.post("/resumes/parse", response_model=ParsedResume)
def parse(req: ParseRequest) -> ParsedResume:
    if len(req.text) > 200_000:
        raise HTTPException(status_code=413, detail="Resume text too large")
    return parse_resume(req.text)
