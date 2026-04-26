from __future__ import annotations

from pathlib import Path
from typing import Any
import warnings

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


MODEL_PATH = Path(__file__).resolve().parent / "models" / "car_price_model.joblib"


class PriceRequest(BaseModel):
    brand: str | None = Field(default=None, alias="manufacturer")
    manufacturer: str | None = None
    model: str | None = None
    year: int | float | str | None = None
    mileage: int | float | str | None = Field(default=None, alias="odometer")
    odometer: int | float | str | None = None
    condition: str | None = "good"
    cylinders: str | None = "unknown"
    fuel: str | None = None
    fuel_type: str | None = None
    title_status: str | None = "clean"
    transmission: str | None = "automatic"
    type: str | None = None
    category: str | None = None
    paint_color: str | None = "unknown"
    state: str | None = None
    location: str | None = None

    class Config:
        populate_by_name = True


app = FastAPI(title="Car Resale ML Backend")
model_bundle: dict[str, Any] | None = None


def normalize_text(value: Any, fallback: str = "unknown") -> str:
    if value is None:
        return fallback
    value = str(value).strip().lower()
    return value or fallback


def normalize_number(value: Any, fallback: float = 0) -> float:
    try:
        if value is None or value == "":
            return fallback
        return float(value)
    except (TypeError, ValueError):
        return fallback


def to_model_frame(payload: PriceRequest) -> pd.DataFrame:
    manufacturer = payload.manufacturer or payload.brand
    odometer = payload.odometer if payload.odometer is not None else payload.mileage
    fuel = payload.fuel or payload.fuel_type
    vehicle_type = payload.type or payload.category
    state = payload.state or payload.location

    return pd.DataFrame(
        [
            {
                "year": normalize_number(payload.year, 2018),
                "manufacturer": normalize_text(manufacturer),
                "model": normalize_text(payload.model),
                "condition": normalize_text(payload.condition, "good"),
                "cylinders": normalize_text(payload.cylinders),
                "fuel": normalize_text(fuel, "gas"),
                "odometer": normalize_number(odometer, 50000),
                "title_status": normalize_text(payload.title_status, "clean"),
                "transmission": normalize_text(payload.transmission, "automatic"),
                "type": normalize_text(vehicle_type, "sedan"),
                "paint_color": normalize_text(payload.paint_color),
                "state": normalize_text(state),
            }
        ]
    )


def load_model() -> None:
    global model_bundle
    if not MODEL_PATH.exists():
        model_bundle = None
        return
    model_bundle = joblib.load(MODEL_PATH)


@app.on_event("startup")
def startup() -> None:
    load_model()


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "success": True,
        "model_loaded": model_bundle is not None,
        "model_path": str(MODEL_PATH),
        "metrics": None if model_bundle is None else model_bundle.get("metrics"),
    }


@app.post("/reload")
def reload_model() -> dict[str, Any]:
    load_model()
    return health()


@app.post("/predict")
def predict_price(payload: PriceRequest) -> dict[str, Any]:
    if model_bundle is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not trained yet. Run: python ml_backend/train_model.py",
        )

    frame = to_model_frame(payload)
    pipeline = model_bundle["pipeline"]
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", message="X does not have valid feature names")
        pred_log = float(pipeline.predict(frame)[0])
    predicted_price = max(500, float(np.expm1(pred_log)))

    return {
        "success": True,
        "predictedPrice": round(predicted_price),
        "modelUsed": model_bundle.get("metrics", {}).get("model_name", "trained ML model"),
        "metrics": model_bundle.get("metrics"),
    }
