from pathlib import Path
from typing import Dict, Tuple

import joblib
import pandas as pd

from .config import FEATURE_COLUMNS, RISK_THRESHOLD
from .model import predict_risk


class FraudScoringService:
    """Inference service wrapper around the trained fraud model."""

    def __init__(self, model, threshold: float = RISK_THRESHOLD):
        self.model = model
        self.threshold = threshold

    @classmethod
    def from_joblib(cls, model_path: Path, threshold: float = RISK_THRESHOLD):
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model not found at {model_path}. Train the model before starting the API."
            )
        model = joblib.load(model_path)
        return cls(model=model, threshold=threshold)

    def predict(self, features: Dict[str, float]) -> Tuple[float, str]:
        frame = pd.DataFrame([features], columns=FEATURE_COLUMNS)
        return predict_risk(self.model, frame, self.threshold)

    def decide_claim(self, risk_label: str) -> str:
        return "APPROVED" if risk_label == "LOW_RISK" else "REJECTED"

    def predict_with_decision(self, features: Dict[str, float]) -> Tuple[float, str, str]:
        probability, risk_label = self.predict(features)
        decision = self.decide_claim(risk_label)
        return probability, risk_label, decision
