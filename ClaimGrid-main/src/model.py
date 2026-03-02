from typing import Dict, Tuple

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline


def build_model_pipeline(preprocessor) -> Pipeline:
    """Build end-to-end modeling pipeline."""
    model = LogisticRegression(max_iter=1000, solver="lbfgs")
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", model),
        ]
    )
    return pipeline


def evaluate_model(model: Pipeline, X_test, y_test) -> Dict[str, object]:
    """Compute classification metrics and confusion matrix."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    roc_auc = (
        float(roc_auc_score(y_test, y_prob))
        if np.unique(y_test).size > 1
        else float("nan")
    )

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "roc_auc": roc_auc,
    }

    cm = confusion_matrix(y_test, y_pred)
    metrics["confusion_matrix"] = cm.tolist()

    return metrics


def predict_risk(model: Pipeline, features, threshold: float) -> Tuple[float, str]:
    """Return fraud probability and risk label based on threshold."""
    probability = float(model.predict_proba(features)[:, 1][0])
    risk_label = "LOW_RISK" if probability < threshold else "HIGH_RISK"
    return probability, risk_label
