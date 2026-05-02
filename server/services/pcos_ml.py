import os
from pathlib import Path

import numpy as np

try:
    import joblib
except ImportError:  # pragma: no cover - handled by graceful fallback
    joblib = None


MODEL_DIR = Path(__file__).resolve().parents[1] / "ml_models"
MODEL_PATH = MODEL_DIR / "pcos_model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
IMPUTER_PATH = MODEL_DIR / "imputer.pkl"
FEATURES_PATH = MODEL_DIR / "feature_names.pkl"

_artifacts = None


def _load_artifacts():
    global _artifacts
    if _artifacts is not None:
        return _artifacts

    if not joblib:
        return None

    required = [MODEL_PATH, SCALER_PATH, IMPUTER_PATH, FEATURES_PATH]
    if not all(path.exists() for path in required):
        return None

    _artifacts = {
        "model": joblib.load(MODEL_PATH),
        "scaler": joblib.load(SCALER_PATH),
        "imputer": joblib.load(IMPUTER_PATH),
        "features": joblib.load(FEATURES_PATH),
    }
    return _artifacts


def is_model_available():
    return _load_artifacts() is not None


def predict_pcos(user_input):
    artifacts = _load_artifacts()
    if not artifacts:
        raise RuntimeError("PCOS ML model is not available.")

    row = [user_input.get(feature, np.nan) for feature in artifacts["features"]]
    arr = np.array(row, dtype=float).reshape(1, -1)
    arr = artifacts["imputer"].transform(arr)
    arr = artifacts["scaler"].transform(arr)

    risk_prob = float(artifacts["model"].predict_proba(arr)[0][1])
    risk_label = "High" if risk_prob >= 0.7 else "Medium" if risk_prob >= 0.4 else "Low"
    probability = round(risk_prob * 100, 1)

    return {
        "riskLevel": risk_label,
        "probability": probability,
        "score": round(probability / 10, 1),
    }
