import logging
import os
from pathlib import Path
from typing import Optional

from .db import fetch_claim_features, update_claim_score
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .clinical_rules import apply_medical_context, list_claim_options
from .config import (
    DEFAULT_HOSPITAL_REGISTRY_PATH,
    DEFAULT_MODEL_PATH,
    DEFAULT_PATIENT_REGISTRY_PATH,
    HOSPITAL_REGISTRY_PATH_ENV,
    MODEL_PATH_ENV,
    PATIENT_REGISTRY_PATH_ENV,
)
from .hospital_registry import (
    build_hospital_registry_from_excel_bytes,
    summarize_hospital_registry,
)
from .portfolio_analysis import (
    analyze_portfolio_csv_bytes,
    build_patient_registry_from_csv_bytes,
)
from .schemas import (
    ClaimOptionsResponse,
    HospitalProfileResponse,
    HospitalRegistrySummaryResponse,
    PatientProfileResponse,
    PortfolioAnalysisResponse,
    PredictRequest,
    PredictResponse,
)
from .service import FraudScoringService

BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = BASE_DIR / "web"
FEATURE_FIELDS = [
    "claim_amount",
    "policy_tenure_months",
    "previous_claims_count",
    "hospital_trust_score",
    "days_since_policy_start",
]

app = FastAPI(title="Fraud Detection API", version="1.8.0")
if WEB_DIR.exists():
    app.mount("/web", StaticFiles(directory=str(WEB_DIR)), name="web")

_service: Optional[FraudScoringService] = None
_patient_registry: dict[str, dict] = {}
_hospital_registry: dict[str, dict] = {}
_hospital_registry_source: Optional[Path] = None
logger = logging.getLogger(__name__)


def resolve_model_path() -> Path:
    return Path(os.getenv(MODEL_PATH_ENV, str(DEFAULT_MODEL_PATH)))


def resolve_registry_path() -> Path:
    return Path(os.getenv(PATIENT_REGISTRY_PATH_ENV, str(DEFAULT_PATIENT_REGISTRY_PATH)))


def resolve_hospital_registry_path() -> Path:
    return Path(
        os.getenv(HOSPITAL_REGISTRY_PATH_ENV, str(DEFAULT_HOSPITAL_REGISTRY_PATH))
    )


def _load_patient_registry_from_disk(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    csv_bytes = path.read_bytes()
    return build_patient_registry_from_csv_bytes(csv_bytes)


def _load_hospital_registry_from_disk(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    return build_hospital_registry_from_excel_bytes(path.read_bytes())


def _hospital_registry_candidate_paths() -> list[Path]:
    configured = resolve_hospital_registry_path()
    defaults = [configured, Path.home() / "Downloads" / "claimgrid_hospitals_120_records.xlsx"]
    unique: list[Path] = []
    seen: set[str] = set()
    for candidate in defaults:
        key = str(candidate.resolve()) if candidate.exists() else str(candidate)
        if key in seen:
            continue
        seen.add(key)
        unique.append(candidate)
    return unique


def _load_first_available_hospital_registry() -> tuple[dict[str, dict], Optional[Path]]:
    for candidate in _hospital_registry_candidate_paths():
        if not candidate.exists():
            continue
        try:
            return _load_hospital_registry_from_disk(candidate), candidate
        except Exception as exc:
            logger.warning("Failed to load hospital registry from %s: %s", candidate, exc)
    return {}, None


def _risk_from_probability(probability: float) -> str:
    assert _service is not None
    return "LOW_RISK" if probability < _service.threshold else "HIGH_RISK"


def _require_medical_context(payload: PredictRequest) -> tuple[int, str, str]:
    missing = []
    if payload.patient_age is None:
        missing.append("patient_age")
    if not payload.policy_type:
        missing.append("policy_type")
    if not payload.disease_name:
        missing.append("disease_name")

    if missing:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "patient_age, policy_type, and disease_name are required for evaluation.",
                "missing_fields": missing,
            },
        )

    return int(payload.patient_age), str(payload.policy_type), str(payload.disease_name)


@app.on_event("startup")
def startup_event():
    global _service, _patient_registry, _hospital_registry, _hospital_registry_source
    _service = FraudScoringService.from_joblib(resolve_model_path())

    registry_path = resolve_registry_path()
    try:
        _patient_registry = _load_patient_registry_from_disk(registry_path)
    except Exception as exc:
        _patient_registry = {}
        logger.warning("Failed to load patient registry from %s: %s", registry_path, exc)

    _hospital_registry, _hospital_registry_source = _load_first_available_hospital_registry()


@app.get("/", include_in_schema=False)
def web_index():
    index_path = WEB_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Web UI not found")
    return FileResponse(index_path)


@app.get("/health")
def health_check():
    configured_hospital_registry_path = resolve_hospital_registry_path()
    candidate_paths = _hospital_registry_candidate_paths()
    return {
        "status": "ok",
        "model_loaded": _service is not None,
        "patient_registry_count": len(_patient_registry),
        "hospital_registry_count": len(_hospital_registry),
        "hospital_registry_config_path": str(configured_hospital_registry_path),
        "hospital_registry_source_path": str(_hospital_registry_source) if _hospital_registry_source else None,
        "hospital_registry_file_exists": configured_hospital_registry_path.exists(),
        "hospital_registry_candidate_paths": [str(p) for p in candidate_paths],
    }


@app.get("/claim-options", response_model=ClaimOptionsResponse)
def claim_options():
    return ClaimOptionsResponse(**list_claim_options())


@app.get("/patient-profile/{uid}", response_model=PatientProfileResponse)
def patient_profile(uid: str):
    if not _patient_registry:
        raise HTTPException(
            status_code=404,
            detail="Patient registry is empty. Upload portfolio CSV first.",
        )

    key = uid.strip().upper()
    if key not in _patient_registry:
        prefix = key[:3]
        suggestions = [
            candidate
            for candidate in sorted(_patient_registry.keys())
            if candidate.startswith(prefix)
        ][:8]
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"UID '{uid}' not found in loaded registry.",
                "registry_size": len(_patient_registry),
                "suggested_uids": suggestions,
            },
        )

    return PatientProfileResponse(**_patient_registry[key])


@app.get("/hospital-profile/{hosp_id}", response_model=HospitalProfileResponse)
def hospital_profile(hosp_id: str):
    global _hospital_registry, _hospital_registry_source
    if not _hospital_registry:
        _hospital_registry, _hospital_registry_source = _load_first_available_hospital_registry()

    if not _hospital_registry:
        candidates = _hospital_registry_candidate_paths()
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Hospital registry is empty. Upload hospital XLSX first.",
                "candidate_registry_paths": [str(p) for p in candidates],
                "candidate_file_exists": {str(p): p.exists() for p in candidates},
            },
        )

    key = hosp_id.strip().upper()
    if key not in _hospital_registry:
        prefix = key[:4]
        suggestions = [
            candidate
            for candidate in sorted(_hospital_registry.keys())
            if candidate.startswith(prefix)
        ][:8]
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"Hospital ID '{hosp_id}' not found in loaded registry.",
                "registry_size": len(_hospital_registry),
                "suggested_hosp_ids": suggestions,
            },
        )

    return HospitalProfileResponse(**_hospital_registry[key])


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    if _service is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    patient_age, policy_type, disease_name = _require_medical_context(payload)

    payload_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    model_features = {key: payload_dict[key] for key in FEATURE_FIELDS}

    base_probability, _ = _service.predict(model_features)
    try:
        medical_result = apply_medical_context(
            base_probability=base_probability,
            policy_type=policy_type,
            disease_name=disease_name,
            patient_age=patient_age,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    final_probability = float(medical_result["adjusted_fraud_probability"])
    risk_label = _risk_from_probability(final_probability)

    return PredictResponse(
        base_fraud_probability=float(medical_result["base_fraud_probability"]),
        fraud_probability=final_probability,
        risk_label=risk_label,
        policy_type=str(medical_result["policy_type"]),
        disease_name=str(medical_result["disease_name"]),
        patient_age=int(medical_result["patient_age"]),
        disease_authorization_status=str(medical_result["disease_authorization_status"]),
        age_susceptibility_status=str(medical_result["age_susceptibility_status"]),
        medical_adjustment=float(medical_result["medical_adjustment"]),
        medical_notes=list(medical_result["medical_notes"]),
    )


@app.post("/analyze-portfolio-csv", response_model=PortfolioAnalysisResponse)
async def analyze_portfolio_csv(file: UploadFile = File(...)):
    if file.content_type not in {
        "text/csv",
        "application/csv",
        "application/vnd.ms-excel",
        "application/octet-stream",
    }:
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV")

    try:
        csv_bytes = await file.read()
        analysis = analyze_portfolio_csv_bytes(csv_bytes)
        registry = build_patient_registry_from_csv_bytes(csv_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to analyze CSV: {exc}") from exc

    global _patient_registry
    _patient_registry = registry

    registry_path = resolve_registry_path()
    try:
        registry_path.parent.mkdir(parents=True, exist_ok=True)
        registry_path.write_bytes(csv_bytes)
    except OSError as exc:
        logger.warning("Failed to persist patient registry to %s: %s", registry_path, exc)

    return PortfolioAnalysisResponse(**analysis)


@app.post(
    "/analyze-hospitals-xlsx",
    response_model=HospitalRegistrySummaryResponse,
)
async def analyze_hospitals_xlsx(file: UploadFile = File(...)):
    if file.content_type not in {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/octet-stream",
        "application/vnd.ms-excel",
    }:
        raise HTTPException(status_code=400, detail="Uploaded file must be an XLSX")

    try:
        xlsx_bytes = await file.read()
        registry = build_hospital_registry_from_excel_bytes(xlsx_bytes)
        summary = summarize_hospital_registry(registry)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to analyze XLSX: {exc}") from exc

    global _hospital_registry, _hospital_registry_source
    _hospital_registry = registry

    registry_path = resolve_hospital_registry_path()
    try:
        registry_path.parent.mkdir(parents=True, exist_ok=True)
        registry_path.write_bytes(xlsx_bytes)
        _hospital_registry_source = registry_path
    except OSError as exc:
        logger.warning("Failed to persist hospital registry to %s: %s", registry_path, exc)

    return HospitalRegistrySummaryResponse(**summary)

@app.post("/score-claim/{claim_id}")
def score_claim(claim_id: int):
    if _service is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    features = fetch_claim_features(claim_id)

    if not features:
        raise HTTPException(status_code=404, detail="Claim not found")

    model_features = {k: features[k] for k in FEATURE_FIELDS}

    base_probability, _ = _service.predict(model_features)

    final_probability = float(base_probability)

    update_claim_score(claim_id, final_probability)

    return {
        "claim_id": claim_id,
        "fraud_probability": final_probability,
        "status_updated": True
    }