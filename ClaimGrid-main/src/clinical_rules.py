from __future__ import annotations

from typing import Dict, List, Tuple

POLICY_AUTHORIZED_DISEASES = {
    "Individual": {
        "Viral Fever",
        "Dengue",
        "Malaria",
        "Typhoid",
        "Pneumonia",
        "Fracture",
        "Appendicitis",
        "Gallbladder Stones",
    },
    "Family Floater": {
        "Viral Fever",
        "Dengue",
        "Malaria",
        "Typhoid",
        "Pneumonia",
        "Fracture",
        "Appendicitis",
        "Gallbladder Stones",
        "Hernia",
        "Maternity / Childbirth",
    },
    "Critical Care": {
        "Cancer",
        "Coronary Artery Disease",
        "Stroke",
        "Chronic Kidney Disease",
        "Diabetes Mellitus",
        "Hypertension",
    },
    "Senior Citizen": {
        "Diabetes Mellitus",
        "Hypertension",
        "Coronary Artery Disease",
        "Stroke",
        "Chronic Kidney Disease",
        "Cataract",
        "Pneumonia",
    },
}

# disease -> list of (min_age, max_age, susceptibility_level)
DISEASE_AGE_PROFILE = {
    "Viral Fever": [(0, 12, "MEDIUM"), (13, 50, "HIGH"), (51, 120, "MEDIUM")],
    "Dengue": [(0, 12, "MEDIUM"), (13, 45, "HIGH"), (46, 120, "MEDIUM")],
    "Malaria": [(0, 15, "MEDIUM"), (16, 50, "HIGH"), (51, 120, "MEDIUM")],
    "Typhoid": [(0, 15, "MEDIUM"), (16, 45, "HIGH"), (46, 120, "LOW")],
    "Pneumonia": [(0, 10, "HIGH"), (11, 49, "LOW"), (50, 120, "HIGH")],
    "Fracture": [(0, 20, "MEDIUM"), (21, 49, "LOW"), (50, 120, "HIGH")],
    "Appendicitis": [(0, 9, "LOW"), (10, 35, "HIGH"), (36, 120, "LOW")],
    "Gallbladder Stones": [(0, 24, "LOW"), (25, 60, "HIGH"), (61, 120, "MEDIUM")],
    "Hernia": [(0, 29, "LOW"), (30, 70, "HIGH"), (71, 120, "MEDIUM")],
    "Maternity / Childbirth": [(0, 19, "LOW"), (20, 40, "HIGH"), (41, 120, "LOW")],
    "Cancer": [(0, 39, "LOW"), (40, 54, "MEDIUM"), (55, 120, "HIGH")],
    "Coronary Artery Disease": [(0, 39, "LOW"), (40, 54, "MEDIUM"), (55, 120, "HIGH")],
    "Stroke": [(0, 44, "LOW"), (45, 59, "MEDIUM"), (60, 120, "HIGH")],
    "Chronic Kidney Disease": [(0, 39, "LOW"), (40, 54, "MEDIUM"), (55, 120, "HIGH")],
    "Diabetes Mellitus": [(0, 34, "LOW"), (35, 49, "MEDIUM"), (50, 120, "HIGH")],
    "Hypertension": [(0, 29, "LOW"), (30, 44, "MEDIUM"), (45, 120, "HIGH")],
    "Cataract": [(0, 39, "LOW"), (40, 54, "MEDIUM"), (55, 120, "HIGH")],
}

_POLICY_LOOKUP = {policy.lower(): policy for policy in POLICY_AUTHORIZED_DISEASES}
_DISEASE_LOOKUP = {disease.lower(): disease for disease in DISEASE_AGE_PROFILE}


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _canonical_policy(policy_type: str) -> str:
    policy_key = (policy_type or "").strip().lower()
    if policy_key not in _POLICY_LOOKUP:
        allowed = ", ".join(POLICY_AUTHORIZED_DISEASES.keys())
        raise ValueError(f"Unknown policy_type '{policy_type}'. Allowed values: {allowed}")
    return _POLICY_LOOKUP[policy_key]


def _canonical_disease(disease_name: str) -> str:
    disease_key = (disease_name or "").strip().lower()
    if disease_key not in _DISEASE_LOOKUP:
        allowed = ", ".join(sorted(DISEASE_AGE_PROFILE.keys()))
        raise ValueError(f"Unknown disease_name '{disease_name}'. Allowed values: {allowed}")
    return _DISEASE_LOOKUP[disease_key]


def _susceptibility_for_age(disease: str, age: int) -> str:
    for min_age, max_age, level in DISEASE_AGE_PROFILE[disease]:
        if min_age <= age <= max_age:
            return level
    return "LOW"


def list_claim_options() -> Dict[str, object]:
    diseases = []
    for disease in sorted(DISEASE_AGE_PROFILE.keys()):
        authorized_policies = [
            policy
            for policy, disease_set in POLICY_AUTHORIZED_DISEASES.items()
            if disease in disease_set
        ]
        diseases.append(
            {
                "name": disease,
                "authorized_policy_types": authorized_policies,
            }
        )

    return {
        "policy_types": sorted(POLICY_AUTHORIZED_DISEASES.keys()),
        "diseases": diseases,
    }


def apply_medical_context(
    base_probability: float,
    policy_type: str,
    disease_name: str,
    patient_age: int,
) -> Dict[str, object]:
    canonical_policy = _canonical_policy(policy_type)
    canonical_disease = _canonical_disease(disease_name)

    authorized = canonical_disease in POLICY_AUTHORIZED_DISEASES[canonical_policy]
    susceptibility = _susceptibility_for_age(canonical_disease, int(patient_age))

    adjustment = 0.0
    notes: List[str] = []

    if authorized:
        notes.append(f"{canonical_disease} is authorized under {canonical_policy}.")
    else:
        adjustment += 0.18
        notes.append(f"{canonical_disease} is not authorized under {canonical_policy}.")

    if susceptibility == "HIGH":
        adjustment -= 0.05
        notes.append(f"Age {patient_age} is in HIGH susceptibility band for {canonical_disease}.")
    elif susceptibility == "MEDIUM":
        adjustment += 0.02
        notes.append(f"Age {patient_age} is in MEDIUM susceptibility band for {canonical_disease}.")
    else:
        adjustment += 0.10
        notes.append(f"Age {patient_age} is in LOW susceptibility band for {canonical_disease}.")

    if not authorized and susceptibility == "HIGH":
        adjustment += 0.05
        notes.append("Authorization mismatch despite expected age susceptibility.")

    adjusted_probability = _clamp(base_probability + adjustment)

    return {
        "policy_type": canonical_policy,
        "disease_name": canonical_disease,
        "patient_age": int(patient_age),
        "disease_authorization_status": "AUTHORIZED" if authorized else "NOT_AUTHORIZED",
        "age_susceptibility_status": f"{susceptibility}_SUSCEPTIBILITY",
        "medical_adjustment": round(adjustment, 4),
        "base_fraud_probability": round(base_probability, 6),
        "adjusted_fraud_probability": round(adjusted_probability, 6),
        "medical_notes": notes,
    }
