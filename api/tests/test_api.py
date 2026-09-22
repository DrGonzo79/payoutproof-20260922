import json
from pathlib import Path

from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


def test_health_and_demo_fixture():
    assert client.get("/health").json() == {"status": "ok"}
    response = client.get("/demo")
    assert response.status_code == 200
    assert len(response.json()["comparables"]) == 4


def test_audit_returns_explainable_gap():
    response = client.post("/audit", json={"insurer_offer": 25400, "mileage": 54800})
    assert response.status_code == 200
    result = response.json()
    assert result["potentialGap"] > 3000
    assert result["confidence"] == "strong"
    assert all("adjustedPrice" in item for item in result["comparables"])


def test_excluding_comparable_changes_confidence():
    response = client.post("/audit", json={"insurer_offer": 25400, "mileage": 54800, "excluded_ids": ["PP-104"]})
    assert response.status_code == 200
    assert response.json()["confidence"] == "directional"


def test_rejects_invalid_offer_and_unknown_comparable():
    assert client.post("/audit", json={"insurer_offer": 0, "mileage": 54800}).status_code == 422
    response = client.post("/audit", json={"insurer_offer": 25000, "mileage": 54800, "excluded_ids": ["fake"]})
    assert response.status_code == 422
    assert "unknown comparable" in response.json()["detail"]


def test_fixture_failure_is_visible(monkeypatch, tmp_path: Path):
    monkeypatch.setattr(main, "DATA_PATH", tmp_path / "missing.json")
    response = client.post("/audit", json={"insurer_offer": 25000, "mileage": 54800})
    assert response.status_code == 503
    assert response.json()["detail"] == "demo fixture unavailable"
