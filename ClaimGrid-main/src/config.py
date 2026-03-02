from pathlib import Path

FEATURE_COLUMNS = [
    "claim_amount",
    "policy_tenure_months",
    "previous_claims_count",
    "hospital_trust_score",
    "days_since_policy_start",
]

TARGET_COLUMN = "fraud_flag"
RISK_THRESHOLD = 0.30
MODEL_PATH_ENV = "FRAUD_MODEL_PATH"
PATIENT_REGISTRY_PATH_ENV = "PATIENT_REGISTRY_CSV_PATH"
HOSPITAL_REGISTRY_PATH_ENV = "HOSPITAL_REGISTRY_XLSX_PATH"

DEFAULT_MODEL_PATH = Path("models") / "fraud_pipeline.joblib"
DEFAULT_PATIENT_REGISTRY_PATH = Path("data") / "patient_registry.csv"
DEFAULT_HOSPITAL_REGISTRY_PATH = Path("data") / "hospital_registry.xlsx"
