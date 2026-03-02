from __future__ import annotations

from io import BytesIO
from typing import Dict, List

import pandas as pd

REQUIRED_FIELDS = {
    "hosp_id": ["hospital_id", "hosp_id", "hospital id"],
    "hospital_name": ["hospital_name", "hospital name", "name"],
    "city": ["city", "location", "hospital_city"],
    "trust_score": ["trust_score", "trust score", "hospital_trust_score"],
    "specialty": ["specialty", "speciality", "department"],
}


def _normalize_col(name: str) -> str:
    return " ".join(name.strip().lower().replace("_", " ").split())


def _resolve_columns(df: pd.DataFrame) -> Dict[str, str]:
    normalized = {_normalize_col(col): col for col in df.columns}
    resolved: Dict[str, str] = {}
    missing: List[str] = []

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
        raise ValueError("Missing required columns in hospital file: " + ", ".join(sorted(missing)))

    return resolved


def _strip_city_suffix(name: str, city_candidates: set[str]) -> str:
    cleaned = " ".join(str(name).strip().split())
    if not cleaned:
        return cleaned

    lowered = cleaned.lower()
    for city in sorted(city_candidates, key=len, reverse=True):
        city_clean = " ".join(str(city).strip().split())
        if not city_clean:
            continue
        city_lower = city_clean.lower()
        if lowered == city_lower:
            return cleaned
        if lowered.endswith(f" {city_lower}"):
            return cleaned[: -(len(city_clean) + 1)].strip()
    return cleaned


def build_hospital_registry_from_excel_bytes(excel_bytes: bytes) -> Dict[str, Dict[str, object]]:
    try:
        df = pd.read_excel(BytesIO(excel_bytes), engine="openpyxl")
    except ImportError as exc:
        raise ValueError("openpyxl is required to read .xlsx files. Install dependencies from requirements.txt.") from exc
    except Exception as exc:
        raise ValueError(f"Unable to read hospital Excel file: {exc}") from exc

    if df.empty:
        raise ValueError("Hospital Excel file is empty")

    columns = _resolve_columns(df)
    city_candidates = {
        str(value).strip()
        for value in df[columns["city"]].dropna().tolist()
        if str(value).strip()
    }

    trust = pd.to_numeric(df[columns["trust_score"]], errors="coerce")
    if trust.isna().all():
        raise ValueError("Column 'trust_score' does not contain numeric values")
    trust = trust.fillna(trust.median()).clip(lower=0.0, upper=1.0)

    registry: Dict[str, Dict[str, object]] = {}
    for idx, row in df.iterrows():
        hosp_id = str(row[columns["hosp_id"]]).strip().upper()
        if not hosp_id:
            continue
        hospital_name = _strip_city_suffix(row[columns["hospital_name"]], city_candidates)
        profile = {
            "hosp_id": hosp_id,
            "hospital_name": hospital_name,
            "city": str(row[columns["city"]]).strip(),
            "trust_score": round(float(trust.iloc[idx]), 2),
            "specialty": str(row[columns["specialty"]]).strip(),
        }
        registry[hosp_id] = profile

    if not registry:
        raise ValueError("No valid hospital records found in uploaded file")

    return registry


def summarize_hospital_registry(registry: Dict[str, Dict[str, object]]) -> Dict[str, object]:
    specialties = {str(v.get("specialty", "")).strip() for v in registry.values() if v.get("specialty")}
    cities = {str(v.get("city", "")).strip() for v in registry.values() if v.get("city")}
    sample_ids = sorted(registry.keys())[:8]
    return {
        "record_count": len(registry),
        "city_count": len(cities),
        "specialty_count": len(specialties),
        "sample_hosp_ids": sample_ids,
    }
