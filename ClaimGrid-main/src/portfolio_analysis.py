from __future__ import annotations

from datetime import datetime
from io import StringIO
import re
from typing import Dict, List

import pandas as pd

REQUIRED_FIELDS = {
    "uid": ["uid"],
    "name": ["name"],
    "age": ["age"],
    "gender": ["gender"],
    "policy_type": ["policy type", "policy_type"],
    "coverage": ["coverage", "sum insured", "coverage amount"],
    "premium": ["premium", "premium amount"],
    "authorized_diseases": ["authorized diseases", "authorized_diseases", "diseases"],
}

COMPANY_FIELD_ALIASES = [
    "insurance company",
    "company",
    "insurer",
    "company name",
    "insurance provider",
]

CRITICAL_DISEASE_MARKERS = {
    "cancer",
    "stroke",
    "coronary artery disease",
    "chronic kidney disease",
    "diabetes mellitus",
    "hypertension",
}

UID_PREFIX_COMPANY_MAP = {
    "ACK": "ACKO Insurance",
    "DIG": "Digit Insurance",
    "HDF": "HDFC ERGO",
    "SBI": "SBI General Insurance",
    "REL": "Reliance General Insurance",
}


def _normalize_col(name: str) -> str:
    return " ".join(name.strip().lower().replace("_", " ").split())


def _resolve_columns(df: pd.DataFrame) -> Dict[str, str]:
    normalized = {_normalize_col(col): col for col in df.columns}
    resolved: Dict[str, str] = {}

    missing = []
    for logical_name, aliases in REQUIRED_FIELDS.items():
        found_col = None
        for alias in aliases:
            alias_norm = _normalize_col(alias)
            if alias_norm in normalized:
                found_col = normalized[alias_norm]
                break

        if found_col is None:
            missing.append(logical_name)
        else:
            resolved[logical_name] = found_col

    if missing:
        raise ValueError(
            "Missing required columns in CSV: " + ", ".join(sorted(missing))
        )

    return resolved


def _resolve_optional_column(df: pd.DataFrame, aliases: List[str]) -> str | None:
    normalized = {_normalize_col(col): col for col in df.columns}
    for alias in aliases:
        alias_norm = _normalize_col(alias)
        if alias_norm in normalized:
            return normalized[alias_norm]
    return None


def _split_diseases(value: str) -> List[str]:
    if not isinstance(value, str):
        return []
    chunks = [chunk.strip() for chunk in value.split(";")]
    return [chunk for chunk in chunks if chunk]


def _derive_company_name(uid: str, explicit_name: str | None = None) -> str:
    if explicit_name and explicit_name.strip() and explicit_name.strip().lower() != "nan":
        return explicit_name.strip()

    match = re.match(r"([A-Za-z]{2,5})", str(uid).strip())
    if not match:
        return "Unknown Company"

    prefix = match.group(1).upper()
    if prefix in UID_PREFIX_COMPANY_MAP:
        return UID_PREFIX_COMPANY_MAP[prefix]
    return f"{prefix} Insurance"


def _to_numeric(series: pd.Series, field_name: str) -> pd.Series:
    numeric = pd.to_numeric(series, errors="coerce")
    if numeric.isna().all():
        raise ValueError(f"Column '{field_name}' does not contain numeric values")
    return numeric.fillna(numeric.median())


def _risk_label(score: float) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def _score_profile(
    age: float,
    policy_type: str,
    premium: float,
    coverage: float,
    disease_list: List[str],
    premium_median: float,
    coverage_median: float,
):
    score = 0.0
    drivers: List[str] = []

    if age >= 60:
        score += 30
        drivers.append("Age 60+")
    elif age >= 50:
        score += 20
        drivers.append("Age 50-59")
    elif age >= 40:
        score += 10
        drivers.append("Age 40-49")

    policy_norm = (policy_type or "").strip().lower()
    if policy_norm == "critical care":
        score += 22
        drivers.append("Critical Care policy")
    elif policy_norm == "senior citizen":
        score += 25
        drivers.append("Senior Citizen policy")
    elif policy_norm == "family floater":
        score += 10
        drivers.append("Family Floater policy")
    elif policy_norm:
        score += 5

    if premium_median > 0:
        premium_ratio = premium / premium_median
        if premium_ratio >= 1.5:
            score += 20
            drivers.append("Premium significantly above median")
        elif premium_ratio >= 1.2:
            score += 10
            drivers.append("Premium above median")

    if coverage_median > 0 and coverage / coverage_median >= 1.5:
        score += 10
        drivers.append("High coverage amount")

    disease_count = len(disease_list)
    if disease_count >= 9:
        score += 20
        drivers.append("High number of authorized diseases")
    elif disease_count >= 7:
        score += 12
        drivers.append("Multiple authorized diseases")
    elif disease_count >= 5:
        score += 6

    critical_hits = 0
    for disease in disease_list:
        disease_norm = disease.strip().lower()
        if disease_norm in CRITICAL_DISEASE_MARKERS:
            critical_hits += 1

    if critical_hits:
        critical_boost = min(24, critical_hits * 4)
        score += critical_boost
        drivers.append(f"Critical disease indicators ({critical_hits})")

    return min(100.0, score), drivers


def _infer_tenure_months_from_uid(uid: str) -> int:
    digits = re.findall(r"\d+", str(uid))
    if not digits:
        return 24

    first = digits[0]
    if len(first) < 2:
        return 24

    year_two = int(first[:2])
    start_year = 2000 + year_two
    now_year = datetime.now().year
    months = max(1, (now_year - start_year) * 12)
    return min(120, months)


def _default_hospital_trust(policy_type: str) -> float:
    mapping = {
        "individual": 0.82,
        "family floater": 0.78,
        "critical care": 0.72,
        "senior citizen": 0.68,
    }
    return mapping.get((policy_type or "").strip().lower(), 0.75)


def _build_working_dataframe(csv_bytes: bytes) -> pd.DataFrame:
    text = csv_bytes.decode("utf-8-sig", errors="replace")
    df = pd.read_csv(StringIO(text))

    if df.empty:
        raise ValueError("CSV file is empty")

    columns = _resolve_columns(df)
    explicit_company_col = _resolve_optional_column(df, COMPANY_FIELD_ALIASES)

    age = _to_numeric(df[columns["age"]], "age")
    premium = _to_numeric(df[columns["premium"]], "premium")
    coverage = _to_numeric(df[columns["coverage"]], "coverage")

    working = pd.DataFrame(
        {
            "uid": df[columns["uid"]].astype(str).str.strip(),
            "name": df[columns["name"]].astype(str).str.strip(),
            "age": age,
            "gender": df[columns["gender"]].astype(str).str.strip().str.title(),
            "policy_type": df[columns["policy_type"]].astype(str).str.strip(),
            "coverage": coverage,
            "premium": premium,
            "authorized_diseases": df[columns["authorized_diseases"]].astype(str),
        }
    )

    if explicit_company_col:
        explicit_company_series = df[explicit_company_col].astype(str)
    else:
        explicit_company_series = pd.Series([""] * len(working))

    working["company_name"] = [
        _derive_company_name(uid, company)
        for uid, company in zip(working["uid"], explicit_company_series)
    ]

    return working


def build_patient_registry_from_csv_bytes(csv_bytes: bytes) -> Dict[str, Dict[str, object]]:
    working = _build_working_dataframe(csv_bytes)

    registry: Dict[str, Dict[str, object]] = {}
    for row in working.itertuples(index=False):
        tenure_months = _infer_tenure_months_from_uid(row.uid)
        default_claim_amount = min(float(row.coverage), max(2000.0, float(row.premium) * 1.1))
        default_trust = _default_hospital_trust(row.policy_type)

        profile = {
            "uid": row.uid,
            "name": row.name,
            "company_name": row.company_name,
            "age": int(round(float(row.age))),
            "gender": row.gender,
            "policy_type": row.policy_type,
            "coverage": float(row.coverage),
            "premium": float(row.premium),
            "authorized_diseases": _split_diseases(row.authorized_diseases),
            "claim_defaults": {
                "claim_amount": round(default_claim_amount, 2),
                "policy_tenure_months": int(tenure_months),
                "hospital_trust_score": round(default_trust, 2),
                "days_since_policy_start": int(tenure_months * 30),
            },
        }

        registry[row.uid.upper()] = profile

    return registry


def analyze_portfolio_csv_bytes(csv_bytes: bytes) -> Dict[str, object]:
    working = _build_working_dataframe(csv_bytes)

    disease_series = working["authorized_diseases"].apply(_split_diseases)
    disease_counts: Dict[str, int] = {}
    for diseases in disease_series:
        for disease in diseases:
            disease_counts[disease] = disease_counts.get(disease, 0) + 1

    premium_median = float(working["premium"].median())
    coverage_median = float(working["coverage"].median())

    risk_profiles = []
    for row in working.itertuples(index=False):
        diseases = _split_diseases(row.authorized_diseases)
        score, drivers = _score_profile(
            age=float(row.age),
            policy_type=row.policy_type,
            premium=float(row.premium),
            coverage=float(row.coverage),
            disease_list=diseases,
            premium_median=premium_median,
            coverage_median=coverage_median,
        )
        risk_profiles.append(
            {
                "uid": row.uid,
                "name": row.name,
                "company_name": row.company_name,
                "policy_type": row.policy_type,
                "age": int(round(float(row.age))),
                "premium": float(row.premium),
                "risk_score": round(score, 1),
                "risk_label": _risk_label(score),
                "risk_drivers": drivers[:3],
            }
        )

    risk_profiles_sorted = sorted(
        risk_profiles,
        key=lambda item: (item["risk_score"], item["premium"]),
        reverse=True,
    )

    policy_dist = (
        working["policy_type"].value_counts().sort_values(ascending=False).to_dict()
    )
    gender_dist = (
        working["gender"].replace({"": "Unknown"}).value_counts().to_dict()
    )
    company_dist = (
        working["company_name"].replace({"": "Unknown Company"}).value_counts().to_dict()
    )

    top_diseases = [
        {"disease": disease, "count": count}
        for disease, count in sorted(
            disease_counts.items(), key=lambda item: item[1], reverse=True
        )[:8]
    ]

    high_count = sum(1 for item in risk_profiles if item["risk_label"] == "HIGH")
    medium_count = sum(1 for item in risk_profiles if item["risk_label"] == "MEDIUM")

    insights = [
        f"{high_count} profile(s) are marked HIGH risk and {medium_count} are MEDIUM risk by heuristic scoring.",
        f"Most common policy type: {max(policy_dist, key=policy_dist.get)} ({max(policy_dist.values())} records).",
        f"Most represented insurer: {max(company_dist, key=company_dist.get)} ({max(company_dist.values())} records).",
    ]

    if top_diseases:
        insights.append(
            f"Most frequently authorized condition: {top_diseases[0]['disease']} ({top_diseases[0]['count']} records)."
        )

    return {
        "record_count": int(len(working)),
        "average_age": round(float(working["age"].mean()), 1),
        "average_premium": round(float(working["premium"].mean()), 2),
        "total_premium": round(float(working["premium"].sum()), 2),
        "average_coverage": round(float(working["coverage"].mean()), 2),
        "total_coverage": round(float(working["coverage"].sum()), 2),
        "company_distribution": company_dist,
        "policy_type_distribution": policy_dist,
        "gender_distribution": gender_dist,
        "top_diseases": top_diseases,
        "top_risk_profiles": risk_profiles_sorted[:10],
        "insights": insights,
    }
