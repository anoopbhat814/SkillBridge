from enum import IntEnum

from pydantic import BaseModel, Field


class Level(IntEnum):
    BEGINNER = 1
    INTERMEDIATE = 2
    ADVANCED = 3
    EXPERT = 4


class SkillEntry(BaseModel):
    name: str
    level: Level = Level.INTERMEDIATE
    verified: bool = False


class Requirement(BaseModel):
    name: str
    min_level: Level = Level.INTERMEDIATE
    required: bool = True


class CandidateInput(BaseModel):
    years_experience: int = Field(ge=0, default=0)
    skills: list[SkillEntry]


class JobInput(BaseModel):
    title: str
    requirements: list[Requirement]
    min_years: int = 0


class MatchResponse(BaseModel):
    score: float = Field(ge=0, le=1)
    matched: list[str]
    missing: list[str]
    explanation: str


class ParsedResume(BaseModel):
    email: str | None = None
    skills: list[str]
    years_experience: int
    education: list[str]
