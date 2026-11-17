from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/healthz").json() == {"ok": True}


def test_parse_endpoint():
    res = client.post("/v1/resumes/parse", json={"text": "5 years of Go and Docker"})
    assert res.status_code == 200
    assert res.json()["years_experience"] == 5
