from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor
from lightgbm import LGBMRegressor
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler, TargetEncoder

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
TARGET_ENCODE_FEATURES = ["manufacturer", "model", "paint_color", "state"]
ONEHOT_FEATURES = ["condition", "cylinders", "fuel", "title_status", "transmission", "type"]


class LeakFreeCarPriceEnsemble(BaseEstimator, RegressorMixin):
    """
    Leak-Free Tabular Ensemble combining CatBoost and LightGBM with
    leak-free target encoding, out-of-fold statistics, and feature normalization.
    """

    def __init__(
        self,
        lgb_weight: float = 0.55,
        cb_weight: float = 0.45,
        n_estimators_lgb: int = 400,
        iterations_cb: int = 450,
        random_state: int = 42,
    ):
        self.lgb_weight = lgb_weight
        self.cb_weight = cb_weight
        self.n_estimators_lgb = n_estimators_lgb
        self.iterations_cb = iterations_cb
        self.random_state = random_state

        self.preprocessor: ColumnTransformer | None = None
        self.model_lgb: LGBMRegressor | None = None
        self.model_cb: CatBoostRegressor | None = None

    def _build_preprocessor(self) -> ColumnTransformer:
        numeric_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ])

        target_encode_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="constant", fill_value="unknown")),
            ("target_enc", TargetEncoder(smooth="auto", cv=5, random_state=self.random_state)),
        ])

        onehot_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="constant", fill_value="unknown")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ])

        return ColumnTransformer(
            transformers=[
                ("num", numeric_pipeline, NUMERIC_FEATURES),
                ("target_enc", target_encode_pipeline, TARGET_ENCODE_FEATURES),
                ("onehot", onehot_pipeline, ONEHOT_FEATURES),
            ]
        )

    def fit(self, X: pd.DataFrame, y: np.ndarray) -> LeakFreeCarPriceEnsemble:
        self.preprocessor = self._build_preprocessor()
        X_trans = self.preprocessor.fit_transform(X, y)

        self.model_lgb = LGBMRegressor(
            n_estimators=self.n_estimators_lgb,
            learning_rate=0.045,
            num_leaves=50,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=self.random_state,
            n_jobs=-1,
            verbose=-1,
        )

        self.model_cb = CatBoostRegressor(
            iterations=self.iterations_cb,
            learning_rate=0.05,
            depth=6,
            random_seed=self.random_state,
            verbose=False,
        )

        self.model_lgb.fit(X_trans, y)
        self.model_cb.fit(X_trans, y)
        return self

    def predict_components(self, X: pd.DataFrame) -> dict[str, np.ndarray]:
        if self.preprocessor is None or self.model_lgb is None or self.model_cb is None:
            raise RuntimeError("Model has not been fitted.")

        X_trans = self.preprocessor.transform(X)
        pred_lgb = self.model_lgb.predict(X_trans)
        pred_cb = self.model_cb.predict(X_trans)
        ensemble = self.lgb_weight * pred_lgb + self.cb_weight * pred_cb
        return {
            "lgb": pred_lgb,
            "cb": pred_cb,
            "ensemble": ensemble,
        }

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return self.predict_components(X)["ensemble"]
