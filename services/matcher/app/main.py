from fastapi import FastAPI

from app.api import match, resumes

app = FastAPI(title="SkillBridge Matcher", version="0.4.0")
app.include_router(match.router, prefix="/v1")
app.include_router(resumes.router, prefix="/v1")


@app.get("/healthz")
def healthz() -> dict[str, bool]:
    return {"ok": True}
