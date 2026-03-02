const manualForm = document.getElementById("manual-form");
const portfolioForm = document.getElementById("portfolio-form");
const hospitalForm = document.getElementById("hospital-form");

const statusEl = document.getElementById("status");
const resultCard = document.getElementById("result-card");

const sourcePill = document.getElementById("source-pill");
const baseProbabilityValue = document.getElementById("base-probability-value");
const probabilityValue = document.getElementById("probability-value");
const riskValue = document.getElementById("risk-value");
const decisionValue = document.getElementById("decision-value");
const diseaseAuthValue = document.getElementById("disease-auth-value");
const ageSusceptibilityValue = document.getElementById("age-susceptibility-value");
const medicalNotesView = document.getElementById("medical-notes-view");
const featuresView = document.getElementById("features-view");

const uidInput = document.getElementById("uid");
const uidFetchButton = document.getElementById("uid-fetch-btn");
const hospIdInput = document.getElementById("hosp_id");
const hospitalFetchButton = document.getElementById("hospital-fetch-btn");
const hospitalNameInput = document.getElementById("hospital_name");
const hospitalCityInput = document.getElementById("hospital_city");
const hospitalSpecialtyInput = document.getElementById("hospital_specialty");
const claimAmountInput = document.getElementById("claim_amount");
const patientAgeInput = document.getElementById("patient_age");
const policyTypeSelect = document.getElementById("policy_type");
const diseaseSelect = document.getElementById("disease_name");
const policyTenureInput = document.getElementById("policy_tenure_months");
const previousClaimsInput = document.getElementById("previous_claims_count");
const trustScoreInput = document.getElementById("hospital_trust_score");
const daysSinceStartInput = document.getElementById("days_since_policy_start");

const manualSubmit = document.getElementById("manual-submit");
const portfolioSubmit = document.getElementById("portfolio-submit");
const hospitalSubmit = document.getElementById("hospital-submit");

const analysisPanel = document.getElementById("portfolio-analysis");
const analysisDetails = document.getElementById("analysis-details");
const analysisRecordCount = document.getElementById("analysis-record-count");
const analysisAvgAge = document.getElementById("analysis-avg-age");
const analysisAvgPremium = document.getElementById("analysis-avg-premium");
const analysisTotalCoverage = document.getElementById("analysis-total-coverage");
const policyMixList = document.getElementById("policy-mix-list");
const diseaseList = document.getElementById("disease-list");
const riskTableBody = document.getElementById("risk-table-body");
const insightsList = document.getElementById("insights-list");
const companyChipStrip = document.getElementById("company-chip-strip");
const activeCompanyLabel = document.getElementById("active-company-label");

let currentPortfolioAnalysis = null;
let selectedCompany = "All Companies";
let claimOptions = null;
let currentPatientProfile = null;
let currentHospitalProfile = null;

const CLAIM_FEATURE_FIELDS = [
  "claim_amount",
  "policy_tenure_months",
  "previous_claims_count",
  "hospital_trust_score",
  "days_since_policy_start",
];

const MEDICAL_FIELDS = ["patient_age", "policy_type", "disease_name", "uid", "hosp_id"];

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function decisionFromRisk(riskLabel) {
  return riskLabel === "LOW_RISK" ? "APPROVED" : "REJECTED";
}

function clearMissingHighlights() {
  [...CLAIM_FEATURE_FIELDS, ...MEDICAL_FIELDS].forEach((field) => {
    const element = document.getElementById(field);
    if (element) {
      element.classList.remove("missing-field");
    }
  });
}

function highlightMissingFields(missingFields = []) {
  missingFields.forEach((field) => {
    const el = document.getElementById(field);
    if (el) {
      el.classList.add("missing-field");
    }
  });
}

function resetFetchedProfile() {
  currentPatientProfile = null;

  claimAmountInput.value = "";
  patientAgeInput.value = "";
  policyTypeSelect.value = "";
  policyTenureInput.value = "";
  if (!currentHospitalProfile) {
    trustScoreInput.value = "";
  }
  daysSinceStartInput.value = "";
  previousClaimsInput.value = "";
}

function resetHospitalProfile() {
  currentHospitalProfile = null;
  hospitalNameInput.value = "";
  hospitalCityInput.value = "";
  hospitalSpecialtyInput.value = "";
  trustScoreInput.value = "";
}

function getMedicalContext() {
  return {
    patient_age: Number(patientAgeInput.value),
    policy_type: policyTypeSelect.value,
    disease_name: diseaseSelect.value,
  };
}

function ensureMedicalContext() {
  const context = getMedicalContext();
  const missing = [];

  if (!uidInput.value.trim()) {
    missing.push("uid");
  }
  if (!currentPatientProfile) {
    missing.push("uid");
  }
  if (!hospIdInput.value.trim()) {
    missing.push("hosp_id");
  }
  if (!currentHospitalProfile) {
    missing.push("hosp_id");
  }
  if (!Number.isFinite(context.patient_age) || context.patient_age < 0) {
    missing.push("patient_age");
  }
  if (!context.policy_type) {
    missing.push("policy_type");
  }
  if (!context.disease_name) {
    missing.push("disease_name");
  }
  const trustScore = Number(trustScoreInput.value);
  if (!Number.isFinite(trustScore) || trustScore < 0 || trustScore > 1) {
    missing.push("hospital_trust_score");
  }

  if (missing.length > 0) {
    highlightMissingFields(missing);
    throw new Error("Fetch patient by UID and hospital by ID, then select disease and previous claims.");
  }

  return context;
}

function getManualPayload() {
  const context = ensureMedicalContext();
  return {
    uid: uidInput.value.trim().toUpperCase(),
    claim_amount: Number(claimAmountInput.value),
    policy_tenure_months: Number(policyTenureInput.value),
    previous_claims_count: Number(previousClaimsInput.value),
    hospital_trust_score: Number(trustScoreInput.value),
    days_since_policy_start: Number(daysSinceStartInput.value),
    ...context,
  };
}

function prettifyFeatureKey(key) {
  const normalized = String(key || "").replaceAll("_", " ").trim();
  if (!normalized) {
    return "-";
  }
  return normalized.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatFeatureValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "-";
    }
    if (Math.abs(value) < 1 && value !== 0) {
      return value.toFixed(3);
    }
    if (Number.isInteger(value)) {
      return value.toLocaleString("en-IN");
    }
    return value.toFixed(2);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function renderMedicalNotes(notes) {
  medicalNotesView.innerHTML = "";
  if (!Array.isArray(notes) || notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "placeholder-value";
    empty.textContent = "No medical notes available.";
    medicalNotesView.appendChild(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "notes-list";
  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "notes-item";
    item.textContent = String(note);
    list.appendChild(item);
  });
  medicalNotesView.appendChild(list);
}

function renderParsedFeatures(features) {
  featuresView.innerHTML = "";
  if (!features || typeof features !== "object") {
    const empty = document.createElement("p");
    empty.className = "placeholder-value";
    empty.textContent = "No parsed features available.";
    featuresView.appendChild(empty);
    return;
  }

  const container = document.createElement("div");
  container.className = "feature-grid";
  Object.entries(features).forEach(([key, value]) => {
    const card = document.createElement("article");
    card.className = "feature-item";

    const keyEl = document.createElement("p");
    keyEl.className = "feature-key";
    keyEl.textContent = prettifyFeatureKey(key);

    const valueEl = document.createElement("p");
    valueEl.className = "feature-value";
    valueEl.textContent = formatFeatureValue(value);

    card.appendChild(keyEl);
    card.appendChild(valueEl);
    container.appendChild(card);
  });

  featuresView.appendChild(container);
}

function renderResult(source, payload) {
  resultCard.classList.remove("hidden");

  sourcePill.textContent = source.replaceAll("-", " ");
  baseProbabilityValue.textContent = `${(payload.base_fraud_probability * 100).toFixed(2)}%`;
  probabilityValue.textContent = `${(payload.fraud_probability * 100).toFixed(2)}%`;
  riskValue.textContent = payload.risk_label;

  const decision = payload.claim_decision || decisionFromRisk(payload.risk_label);
  decisionValue.textContent = decision;

  diseaseAuthValue.textContent = payload.disease_authorization_status || "-";
  ageSusceptibilityValue.textContent = payload.age_susceptibility_status || "-";

  const isApproved = decision === "APPROVED";
  decisionValue.classList.toggle("ok", isApproved);
  decisionValue.classList.toggle("bad", !isApproved);

  riskValue.classList.toggle("ok", payload.risk_label === "LOW_RISK");
  riskValue.classList.toggle("bad", payload.risk_label !== "LOW_RISK");

  const medicalNotes = payload.medical_notes || [];
  renderMedicalNotes(medicalNotes);

  const features = payload.extracted_features || payload.submitted_features || null;
  renderParsedFeatures(features);
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function riskTagClass(label) {
  const normalized = String(label || "").toLowerCase();
  if (normalized === "high") {
    return "high";
  }
  if (normalized === "medium") {
    return "medium";
  }
  return "low";
}

function renderCompanyStrip(companyDistribution = {}) {
  companyChipStrip.innerHTML = "";
  const companies = Object.keys(companyDistribution);
  if (companies.length === 0) {
    companyChipStrip.classList.add("hidden");
    activeCompanyLabel.textContent = "Insurer View: All Companies";
    return;
  }

  companyChipStrip.classList.remove("hidden");

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = `company-chip ${selectedCompany === "All Companies" ? "active" : ""}`;
  allButton.textContent = "All Companies";
  allButton.addEventListener("click", () => {
    selectedCompany = "All Companies";
    renderPortfolioAnalysis(currentPortfolioAnalysis);
  });
  companyChipStrip.appendChild(allButton);

  companies.forEach((company) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `company-chip ${selectedCompany === company ? "active" : ""}`;
    chip.textContent = `${company} (${companyDistribution[company]})`;
    chip.addEventListener("click", () => {
      selectedCompany = company;
      renderPortfolioAnalysis(currentPortfolioAnalysis);
    });
    companyChipStrip.appendChild(chip);
  });

  activeCompanyLabel.textContent = `Insurer View: ${selectedCompany}`;
}

function renderRiskRows(profiles = []) {
  riskTableBody.innerHTML = "";
  const filteredProfiles = profiles.filter((profile) => {
    if (selectedCompany === "All Companies") {
      return true;
    }
    return profile.company_name === selectedCompany;
  });

  filteredProfiles.forEach((profile) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${profile.uid}</td>
      <td>${profile.name}</td>
      <td>${profile.company_name}</td>
      <td>${profile.policy_type}</td>
      <td><span class="tag ${riskTagClass(profile.risk_label)}">${profile.risk_label}</span></td>
      <td>${profile.risk_score}</td>
      <td>${(profile.risk_drivers || []).join(", ")}</td>
    `;
    riskTableBody.appendChild(row);
  });
}

function renderPortfolioAnalysis(data) {
  if (!data) {
    return;
  }

  currentPortfolioAnalysis = data;
  analysisPanel.classList.remove("hidden");
  analysisDetails.classList.remove("hidden");

  renderCompanyStrip(data.company_distribution || {});

  analysisRecordCount.textContent = String(data.record_count);
  analysisAvgAge.textContent = `${data.average_age} years`;
  analysisAvgPremium.textContent = formatCurrency(data.average_premium);
  analysisTotalCoverage.textContent = formatCurrency(data.total_coverage);

  policyMixList.innerHTML = "";
  Object.entries(data.policy_type_distribution).forEach(([policy, count]) => {
    const li = document.createElement("li");
    li.textContent = `${policy}: ${count}`;
    policyMixList.appendChild(li);
  });

  diseaseList.innerHTML = "";
  data.top_diseases.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.disease}: ${item.count}`;
    diseaseList.appendChild(li);
  });

  renderRiskRows(data.top_risk_profiles || []);

  insightsList.innerHTML = "";
  data.insights.forEach((insight) => {
    const li = document.createElement("li");
    li.textContent = insight;
    insightsList.appendChild(li);
  });
}

function populateClaimOptions(options) {
  claimOptions = options;

  policyTypeSelect.innerHTML = '<option value="">Select policy type</option>';
  diseaseSelect.innerHTML = '<option value="">Select disease</option>';

  options.policy_types.forEach((policy) => {
    const option = document.createElement("option");
    option.value = policy;
    option.textContent = policy;
    policyTypeSelect.appendChild(option);
  });

  options.diseases.forEach((disease) => {
    const option = document.createElement("option");
    option.value = disease.name;
    option.textContent = disease.name;
    diseaseSelect.appendChild(option);
  });
}

function populateDiseasesForProfile(profile) {
  if (!claimOptions) {
    return;
  }

  const authorizedSet = new Set(
    (profile.authorized_diseases || []).map((d) => String(d).trim().toLowerCase())
  );

  diseaseSelect.innerHTML = '<option value="">Select disease</option>';

  const diseaseNames = claimOptions.diseases.map((d) => d.name);
  const ordered = [...diseaseNames].sort((a, b) => {
    const aAuth = authorizedSet.has(a.toLowerCase()) ? 0 : 1;
    const bAuth = authorizedSet.has(b.toLowerCase()) ? 0 : 1;
    if (aAuth !== bAuth) {
      return aAuth - bAuth;
    }
    return a.localeCompare(b);
  });

  ordered.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = authorizedSet.has(name.toLowerCase())
      ? `${name} (Authorized)`
      : `${name}`;
    diseaseSelect.appendChild(option);
  });
}

function applyPatientProfile(profile) {
  currentPatientProfile = profile;
  clearMissingHighlights();

  uidInput.value = profile.uid;
  claimAmountInput.value = String(profile.claim_defaults.claim_amount);
  patientAgeInput.value = String(profile.age);
  policyTypeSelect.value = profile.policy_type;
  policyTenureInput.value = String(profile.claim_defaults.policy_tenure_months);
  trustScoreInput.value = currentHospitalProfile
    ? String(currentHospitalProfile.trust_score)
    : String(profile.claim_defaults.hospital_trust_score);
  daysSinceStartInput.value = String(profile.claim_defaults.days_since_policy_start);

  populateDiseasesForProfile(profile);
}

function applyHospitalProfile(profile) {
  currentHospitalProfile = profile;
  clearMissingHighlights();

  hospIdInput.value = profile.hosp_id;
  hospitalNameInput.value = profile.hospital_name;
  hospitalCityInput.value = profile.city;
  hospitalSpecialtyInput.value = profile.specialty;
  trustScoreInput.value = String(profile.trust_score);
}

async function loadClaimOptions() {
  try {
    const response = await fetch("/claim-options", { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to load claim options");
    }
    const options = await response.json();
    populateClaimOptions(options);
  } catch (_error) {
    setStatus("Unable to load policy/disease options. Refresh the page.", true);
  }
}

async function parseError(response) {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") {
      return body.detail;
    }
    if (typeof body?.detail?.message === "string") {
      const suggestions = body?.detail?.suggested_uids || body?.detail?.suggested_hosp_ids || [];
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return `${body.detail.message} Try: ${suggestions.join(", ")}`;
      }
      return body.detail.message;
    }
    if (Array.isArray(body?.detail) && body.detail.length > 0) {
      return body.detail[0]?.msg || `Request failed with status ${response.status}`;
    }
    return `Request failed with status ${response.status}`;
  } catch (_err) {
    return `Request failed with status ${response.status}`;
  }
}

async function scorePayload(payload, sourceLabel) {
  const response = await fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const prediction = await response.json();
  renderResult(sourceLabel, {
    ...prediction,
    claim_decision: decisionFromRisk(prediction.risk_label),
    extracted_features: payload,
  });
}

uidFetchButton.addEventListener("click", async () => {
  const uid = uidInput.value.trim();
  if (!uid) {
    highlightMissingFields(["uid"]);
    setStatus("Enter UID first.", true);
    return;
  }

  uidFetchButton.disabled = true;
  setStatus("Fetching patient details by UID...");

  try {
    const response = await fetch(`/patient-profile/${encodeURIComponent(uid)}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const profile = await response.json();
    applyPatientProfile(profile);
    setStatus(`Fetched profile for ${profile.name} (${profile.uid}).`);
  } catch (error) {
    resetFetchedProfile();
    setStatus(error.message || "Unable to fetch UID profile.", true);
  } finally {
    uidFetchButton.disabled = false;
  }
});

hospitalFetchButton.addEventListener("click", async () => {
  const hospId = hospIdInput.value.trim();
  if (!hospId) {
    highlightMissingFields(["hosp_id"]);
    setStatus("Enter Hospital ID first.", true);
    return;
  }

  hospitalFetchButton.disabled = true;
  setStatus("Fetching hospital details by Hospital ID...");

  try {
    const response = await fetch(`/hospital-profile/${encodeURIComponent(hospId)}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const profile = await response.json();
    applyHospitalProfile(profile);
    setStatus(
      `Fetched hospital ${profile.hospital_name} (${profile.hosp_id}), specialty: ${profile.specialty}.`
    );
  } catch (error) {
    resetHospitalProfile();
    setStatus(error.message || "Unable to fetch hospital profile.", true);
  } finally {
    hospitalFetchButton.disabled = false;
  }
});

manualForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  manualSubmit.disabled = true;
  setStatus("Scoring claim with medical authorization checks...");

  try {
    clearMissingHighlights();
    if (!currentPatientProfile) {
      throw new Error("Fetch patient by UID before evaluating the claim.");
    }
    if (!currentHospitalProfile) {
      throw new Error("Fetch hospital by ID before evaluating the claim.");
    }
    const payload = getManualPayload();
    await scorePayload(payload, "uid-manual");
    setStatus("Claim scored successfully.");
  } catch (error) {
    setStatus(error.message || "Claim evaluation failed.", true);
  } finally {
    manualSubmit.disabled = false;
  }
});

portfolioForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("portfolio_file");
  if (!fileInput.files || fileInput.files.length === 0) {
    setStatus("Choose a portfolio CSV file first.", true);
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  portfolioSubmit.disabled = true;
  setStatus("Analyzing insurance portfolio dataset and refreshing UID registry...");

  try {
    const response = await fetch("/analyze-portfolio-csv", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const analysis = await response.json();
    renderPortfolioAnalysis(analysis);
    resetFetchedProfile();
    setStatus("Portfolio analysis completed. UID registry refreshed.");
  } catch (error) {
    setStatus(error.message || "Portfolio analysis failed.", true);
  } finally {
    portfolioSubmit.disabled = false;
  }
});

hospitalForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("hospital_file");
  if (!fileInput.files || fileInput.files.length === 0) {
    setStatus("Choose a hospital XLSX file first.", true);
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  hospitalSubmit.disabled = true;
  setStatus("Loading hospital registry from XLSX...");

  try {
    const response = await fetch("/analyze-hospitals-xlsx", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const summary = await response.json();
    resetHospitalProfile();
    setStatus(
      `Hospital registry loaded (${summary.record_count} records). Try IDs: ${summary.sample_hosp_ids.join(", ")}`
    );
  } catch (error) {
    setStatus(error.message || "Hospital registry load failed.", true);
  } finally {
    hospitalSubmit.disabled = false;
  }
});

loadClaimOptions();
