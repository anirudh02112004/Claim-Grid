import { useState } from "react";

const ML_API_URL = "http://localhost:8001/"; 
// Use your Live Share forwarded port

function RiskAnalytics() {
  const [formData, setFormData] = useState({
    uid: "",
    claim_amount: "",
    policy_tenure_months: "",
    previous_claims_count: "",
    hospital_trust_score: "",
    days_since_policy_start: "",
    patient_age: "",
    policy_type: "Individual",
    disease_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        uid: formData.uid,
        claim_amount: Number(formData.claim_amount),
        policy_tenure_months: Number(formData.policy_tenure_months),
        previous_claims_count: Number(formData.previous_claims_count),
        hospital_trust_score: Number(formData.hospital_trust_score),
        days_since_policy_start: Number(formData.days_since_policy_start),
        patient_age: Number(formData.patient_age),
        policy_type: formData.policy_type,
        disease_name: formData.disease_name,
      };

      const response = await fetch(ML_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (level) => {
    if (level === "LOW") return "bg-green-100 text-green-700";
    if (level === "MEDIUM") return "bg-yellow-100 text-yellow-700";
    if (level === "HIGH") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">AI Risk Analytics</h2>
      <iframe
        src="http://localhost:8001/"
        title="Risk Analytics Backend"
        className="w-full h-screen border-0"
      ></iframe>
    </div>
  );
}

export default RiskAnalytics;