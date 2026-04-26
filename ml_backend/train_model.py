from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder




DEFAULT_DATASET = Path("craigslist_vehicles.csv")
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "car_price_model.joblib"

FEATURE_COLUMNS = [
    "year",
    "manufacturer",
    "model",
    "condition",
    "cylinders",
    "fuel",
    "odometer",
    "title_status",
    "transmission",
    "type",
    "paint_color",
    "state",
]

NUMERIC_FEATURES = ["year", "odometer"]
CATEGORICAL_FEATURES = [column for column in FEATURE_COLUMNS if column not in NUMERIC_FEATURES]


def load_dataset(dataset_path: Path, rows: int) -> pd.DataFrame:
    df = pd.read_csv(
        dataset_path,
        usecols=["price", *FEATURE_COLUMNS],
        nrows=rows,
        low_memory=False,
    )
    df = df.dropna(subset=["price", "year"])
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df["odometer"] = pd.to_numeric(df["odometer"], errors="coerce")
    current_year = datetime.now().year

    df = df[
        (df["price"] >= 1000)
        & (df["price"] <= 200000)
        & (df["year"] >= 1980)
        & (df["year"] <= current_year + 1)
    ]

    df["odometer"] = df["odometer"].clip(lower=0, upper=400000)
    df[CATEGORICAL_FEATURES] = df[CATEGORICAL_FEATURES].fillna("unknown").astype(str).apply(
        lambda column: column.str.strip().str.lower().replace({"": "unknown"})
    )
    return df


def build_pipeline() -> Pipeline:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", min_frequency=20)),
        ]
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )
    model = LGBMRegressor(
        n_estimators=350,
        learning_rate=0.045,
        num_leaves=48,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
        n_jobs=-1,
    )
    return Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])


def train(dataset_path: Path, rows: int, output_path: Path) -> dict:
    df = load_dataset(dataset_path, rows)
    if len(df) < 1000:
        raise ValueError("Not enough valid rows to train the price model.")

    X = df[FEATURE_COLUMNS]
    y = np.log1p(df["price"])
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    pred_log = pipeline.predict(X_test)
    pred = np.expm1(pred_log)
    y_true = np.expm1(y_test)

    metrics = {
        "model_name": "LightGBM resale price model",
        "trained_rows": int(len(df)),
        "features": FEATURE_COLUMNS,
        "mae": float(mean_absolute_error(y_true, pred)),
        "r2": float(r2_score(y_true, pred)),
        "trained_at": datetime.now().isoformat(timespec="seconds"),
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "pipeline": pipeline,
            "metrics": metrics,
            "features": FEATURE_COLUMNS,
            "target_transform": "log1p",
        },
        output_path,
    )
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the car resale price model.")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--rows", type=int, default=60000)
    parser.add_argument("--output", type=Path, default=MODEL_PATH)
    args = parser.parse_args()

    metrics = train(args.dataset, args.rows, args.output)
    print(json.dumps(metrics, indent=2))
    print(f"Saved model to {args.output}")


if __name__ == "__main__":
    main()
