"""Heuristic resume parser: extracts email, skills, experience and education."""
import re

from app.models.schemas import ParsedResume

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
YEARS_RE = re.compile(r"(\d{1,2})\+?\s+years?", re.IGNORECASE)
DEGREE_RE = re.compile(r"(B\.?Sc|M\.?Sc|B\.?A|M\.?A|Ph\.?D|Bachelor|Master)[^\n,;]*", re.IGNORECASE)

KNOWN_SKILLS = {
    "python", "typescript", "javascript", "go", "rust", "java", "react", "postgresql",
    "kubernetes", "docker", "terraform", "machine learning", "sql", "aws", "graphql",
}


def extract_skills(text: str) -> list[str]:
    lowered = text.lower()
    found = [s for s in KNOWN_SKILLS if re.search(rf"(?<![a-z]){re.escape(s)}(?![a-z])", lowered)]
    return sorted(found)


def parse_resume(text: str) -> ParsedResume:
    email = EMAIL_RE.search(text)
    years = [int(m.group(1)) for m in YEARS_RE.finditer(text)]
    return ParsedResume(
        email=email.group(0) if email else None,
        skills=extract_skills(text),
        years_experience=max(years, default=0),
        education=[m.group(0).strip() for m in DEGREE_RE.finditer(text)],
    )
