from __future__ import annotations

import json
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator

app = FastAPI(title="PayoutProof Demo API", version="0.1.0")
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "demo.json"


class AuditRequest(BaseModel):
    insurer_offer: Annotated[float, Field(gt=0, le=250_000)]
    mileage: Annotated[int, Field(ge=0, le=500_000)]
    excluded_ids: list[str] = Field(default_factory=list, max_length=3)

    @field_validator("excluded_ids")
    @classmethod
    def unique_ids(cls, value: list[str]) -> list[str]:
        if len(value) != len(set(value)):
            raise ValueError("excluded_ids must be unique")
        return value


def load_fixture() -> dict:
    try:
        return json.loads(DATA_PATH.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError("demo fixture unavailable") from exc


def analyze(request: AuditRequest, fixture: dict) -> dict:
    excluded = set(request.excluded_ids)
    known_ids = {item["id"] for item in fixture["comparables"]}
    unknown = excluded - known_ids
    if unknown:
        raise ValueError(f"unknown comparable: {sorted(unknown)[0]}")

    comparables = [item for item in fixture["comparables"] if item["id"] not in excluded]
    if len(comparables) < 2:
        raise ValueError("at least two comparables are required")

    target_year = fixture["vehicle"]["year"]
    mileage_rate = fixture["adjustments"]["mileageDollarsPerMile"]
    year_rate = fixture["adjustments"]["yearDollars"]
    trim_adjustments = fixture["adjustments"]["trim"]
    adjusted = []
    for comp in comparables:
        mileage_adjustment = (comp["mileage"] - request.mileage) * mileage_rate
        year_adjustment = (target_year - comp["year"]) * year_rate
        trim_adjustment = trim_adjustments.get(comp["trim"], 0)
        adjusted_price = round(comp["price"] + mileage_adjustment + year_adjustment + trim_adjustment)
        adjusted.append({**comp, "adjustedPrice": adjusted_price})

    ordered = sorted(item["adjustedPrice"] for item in adjusted)
    midpoint = len(ordered) // 2
    market_value = (
        ordered[midpoint]
        if len(ordered) % 2
        else round((ordered[midpoint - 1] + ordered[midpoint]) / 2)
    )
    gap = round(market_value - request.insurer_offer)
    gap_percent = round((gap / request.insurer_offer) * 100, 1)
    confidence = "strong" if len(adjusted) >= 4 else "directional"
    return {
        "marketValue": market_value,
        "offer": request.insurer_offer,
        "potentialGap": gap,
        "gapPercent": gap_percent,
        "confidence": confidence,
        "comparables": adjusted,
        "nextStep": "Ask the adjuster to explain each valuation adjustment in writing." if gap > 0 else "Review the valuation inputs before deciding whether to challenge the offer.",
        "disclaimer": fixture["disclaimer"],
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/demo")
def demo() -> dict:
    try:
        return load_fixture()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/audit")
def audit(request: AuditRequest) -> dict:
    try:
        return analyze(request, load_fixture())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
