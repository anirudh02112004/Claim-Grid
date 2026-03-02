from typing import Literal

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    uid: str | None = None
    claim_amount: float = Field(..., ge=0)
    policy_tenure_months: int = Field(..., ge=0)
    previous_claims_count: int = Field(..., ge=0)
    hospital_trust_score: float = Field(..., ge=0.0, le=1.0)
    days_since_policy_start: int = Field(..., ge=0)
    patient_age: int | None = Field(default=None, ge=0, le=120)
    policy_type: str | None = None
    disease_name: str | None = None


class PredictResponse(BaseModel):
    base_fraud_probability: float = Field(..., ge=0.0, le=1.0)
    fraud_probability: float = Field(..., ge=0.0, le=1.0)
    risk_label: Literal["LOW_RISK", "HIGH_RISK"]
    policy_type: str
    disease_name: str
    patient_age: int = Field(..., ge=0, le=120)
    disease_authorization_status: Literal["AUTHORIZED", "NOT_AUTHORIZED"]
    age_susceptibility_status: Literal[
        "HIGH_SUSCEPTIBILITY", "MEDIUM_SUSCEPTIBILITY", "LOW_SUSCEPTIBILITY"
    ]
    medical_adjustment: float
    medical_notes: list[str]


class ClaimOptionDisease(BaseModel):
    name: str
    authorized_policy_types: list[str]


class ClaimOptionsResponse(BaseModel):
    policy_types: list[str]
    diseases: list[ClaimOptionDisease]


class PatientClaimDefaults(BaseModel):
    claim_amount: float
    policy_tenure_months: int
    hospital_trust_score: float
    days_since_policy_start: int


class PatientProfileResponse(BaseModel):
    uid: str
    name: str
    company_name: str
    age: int
    gender: str
    policy_type: str
    coverage: float
    premium: float
    authorized_diseases: list[str]
    claim_defaults: PatientClaimDefaults


class HospitalProfileResponse(BaseModel):
    hosp_id: str
    hospital_name: str
    city: str
    trust_score: float = Field(..., ge=0.0, le=1.0)
    specialty: str


class HospitalRegistrySummaryResponse(BaseModel):
    record_count: int
    city_count: int
    specialty_count: int
    sample_hosp_ids: list[str]


class TopDisease(BaseModel):
    disease: str
    count: int


class RiskProfile(BaseModel):
    uid: str
    name: str
    company_name: str
    policy_type: str
    age: int
    premium: float
    risk_score: float
    risk_label: Literal["LOW", "MEDIUM", "HIGH"]
    risk_drivers: list[str]


class PortfolioAnalysisResponse(BaseModel):
    record_count: int
    average_age: float
    average_premium: float
    total_premium: float
    average_coverage: float
    total_coverage: float
    company_distribution: dict[str, int]
    policy_type_distribution: dict[str, int]
    gender_distribution: dict[str, int]
    top_diseases: list[TopDisease]
    top_risk_profiles: list[RiskProfile]
    insights: list[str]
