# Fraud Detection Service

Modular ML pipeline and FastAPI web app for insurance claim fraud risk prediction.

## Project Structure

- `src/config.py`: constants, feature list, and risk threshold
- `src/preprocessing.py`: data loading and preprocessing pipeline
- `src/model.py`: model training, evaluation, and risk prediction utilities
- `src/service.py`: inference service wrapper around the trained model
- `src/clinical_rules.py`: disease authorization + age susceptibility rule engine
- `src/hospital_registry.py`: hospital XLSX parsing and `hosp_id` lookup registry
- `src/portfolio_analysis.py`: insurance CSV analytics, UID registry builder, and heuristic risk profiling
- `src/train.py`: training entrypoint and model persistence
- `src/schemas.py`: FastAPI request/response schemas
- `src/api.py`: FastAPI app with API routes and website serving
- `web/index.html`: web UI
- `web/styles.css`: UI styles
- `web/app.js`: browser logic for UID-based claim workflow + portfolio analysis

## Setup

```bash
pip install -r requirements.txt
```

## Train

```bash
python -m src.train --data_path data/claims.csv --model_path models/fraud_pipeline.joblib
```

## Run Website + API

```bash
python -m uvicorn src.api:app --reload
```

Open:

- Website: `http://127.0.0.1:8000/`
- API docs: `http://127.0.0.1:8000/docs`

## UID-Based Claim Flow

1. Upload portfolio CSV in **Insurance Portfolio Analyzer** (this loads the UID registry and persists it to `data/patient_registry.csv`).
2. Upload hospital XLSX (this loads hospital registry and persists it to `data/hospital_registry.xlsx`).
3. In **Manual Claim Entry**, enter `UID` and click **Fetch by UID**.
4. Enter `Hospital ID` and click **Fetch Hospital**.
5. System auto-fills patient/policy and hospital details (including trust score).
6. Enter only:
   - `Previous Claims Count`
   - `Disease`
7. Click **Evaluate Claim**.
8. On next server start, both registries are auto-loaded from disk.

## API Endpoints

### `POST /predict`

Predict fraud risk from claim features plus medical context factors:

- `uid` (optional metadata)
- `policy_type`
- `disease_name`
- `patient_age`

Final risk uses:

- base ML fraud probability
- disease authorization under selected policy
- age-group susceptibility for selected disease

### `GET /claim-options`

Returns policy types and disease list for dropdowns.

### `GET /patient-profile/{uid}`

Returns patient profile from currently loaded registry, including default claim feature values. If UID is missing, response includes helpful suggestions.

### `GET /hospital-profile/{hosp_id}`

Returns hospital profile from currently loaded hospital registry:

- hospital name
- city
- trust score
- specialty

If Hospital ID is missing, response includes similar ID suggestions.

### `POST /analyze-portfolio-csv`

Analyze insurance dataset CSV and refresh UID registry, returning:

- record and premium/coverage KPIs
- insurer/company distribution
- policy and gender distributions
- top disease frequencies
- top heuristic high-risk profiles with risk drivers
- generated insight bullets

Also persists the uploaded CSV as the current patient registry source for future restarts.

### `POST /analyze-hospitals-xlsx`

Loads hospital records from XLSX and persists them for future restarts.
