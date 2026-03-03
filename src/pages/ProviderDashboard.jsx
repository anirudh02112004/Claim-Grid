import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RiskAnalytics from "./RiskAnalytics";
import KpiCard from "../components/KpiCard";
import {
  subscribeToRealTimeClaims,
  approveClaim,
  rejectClaim,
  markClaimUnderReview,
} from "../services/claimService";

// ================= SIDEBAR =================
function Sidebar({ activeSection, setActiveSection }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login/provider");
  };

  const menuItem = (id, label) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
        activeSection === id
          ? "bg-blue-50 text-blue-600"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-lg font-bold">ClaimGrid</h1>
        <p className="text-xs text-gray-500">Enterprise Insurance</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItem("overview", "Overview")}
        {menuItem("claim-queue", "Claim Queue")}
        {menuItem("policy-management", "Policy Management")}
        {menuItem("risk-analytics", "Risk Analytics")}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ================= HEADER =================
function DashboardHeader() {
  return (
    <header className="bg-white border-b px-8 py-4">
      <h2 className="text-xl font-bold">Executive Dashboard</h2>
    </header>
  );
}

// ================= MAIN DASHBOARD =================
function ProviderDashboard() {
  const [firebaseClaims, setFirebaseClaims] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [processingClaim, setProcessingClaim] = useState(null);
  
  // Policy Management - UID Search States
  const [searchUID, setSearchUID] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // 🔥 REAL-TIME FIREBASE SUBSCRIPTION
  useEffect(() => {
    const unsubscribe = subscribeToRealTimeClaims((updatedClaims) => {
      setFirebaseClaims(updatedClaims);

      const pendingCount = updatedClaims.filter(
        (c) => c.status === "Pending"
      ).length;

      const underReviewCount = updatedClaims.filter(
        (c) => c.status === "Under Review"
      ).length;

      const portfolioRiskScore =
        updatedClaims.some((c) => c.riskLevel === "HIGH_RISK")
          ? "HIGH"
          : "LOW";

      // Calculate average approval days from approved claims
      const approvedClaims = updatedClaims.filter(
        (c) => c.status === "Approved" && c.createdAt && c.updatedAt
      );
      
      let avgApprovalDays = 0;
      if (approvedClaims.length > 0) {
        const totalDays = approvedClaims.reduce((sum, claim) => {
          const createdDate = new Date(claim.createdAt);
          const updatedDate = new Date(claim.updatedAt);
          const diffTime = Math.abs(updatedDate - createdDate);
          const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convert milliseconds to days
          return sum + diffDays;
        }, 0);
        avgApprovalDays = (totalDays / approvedClaims.length).toFixed(1);
      }

      setSummary({
        claimsUnderReview: underReviewCount,
        pendingDecisions: pendingCount,
        avgApprovalDays: avgApprovalDays,
        portfolioRiskScore,
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ================= CLAIM ACTIONS =================
  const handleApproveClaim = async (claimId) => {
    setProcessingClaim(claimId);
    await approveClaim(claimId);
    setProcessingClaim(null);
  };

  const handleRejectClaim = async (claimId) => {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return;

    setProcessingClaim(claimId);
    await rejectClaim(claimId, reason);
    setProcessingClaim(null);
  };

  const handleMarkUnderReview = async (claimId) => {
    setProcessingClaim(claimId);
    await markClaimUnderReview(claimId);
    setProcessingClaim(null);
  };

  // ================= UID SEARCH HANDLER =================
  const handleUIDSearch = async (e) => {
    e.preventDefault();
    
    if (!searchUID.trim()) {
      alert('Please enter a Patient UID');
      return;
    }

    setSearchLoading(true);
    setNotFound(false);
    setPatientData(null);

    try {
      const response = await fetch('/insurance_dataset_uid_based_dates.csv');
      const csvText = await response.text();
      
      // Parse CSV
      const lines = csvText.split('\n');
      
      // Find patient with matching UID
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Handle quoted fields properly
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim());
        
        if (values && values[0] === searchUID.trim()) {
          // Found matching patient
          const patient = {
            uid: values[0],
            name: values[1],
            age: values[2],
            gender: values[3],
            phone: values[4],
            email: values[5],
            address: values[6],
            policyType: values[7],
            coverage: values[8],
            premium: values[9],
            authorizedDiseases: values[10],
            dateOfInsuranceIssued: values[11]
          };
          
          setPatientData(patient);
          setSearchLoading(false);
          return;
        }
      }
      
      // UID not found
      setNotFound(true);
      setSearchLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Error loading patient records. Please try again.');
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchUID('');
    setPatientData(null);
    setNotFound(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="ml-64 flex-1">
        <DashboardHeader />

        <div className="p-8">

          {/* ================= OVERVIEW ================= */}
          {!loading && activeSection === "overview" && summary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <KpiCard
                  title="Claims Under Review"
                  value={summary.claimsUnderReview}
                  color="text-blue-600"
                />
                <KpiCard
                  title="Pending Decisions"
                  value={summary.pendingDecisions}
                  color="text-orange-600"
                />
                <KpiCard
                  title="Avg Approval Days"
                  value={summary.avgApprovalDays}
                  color="text-green-600"
                />
                <KpiCard
                  title="Portfolio Risk"
                  value={summary.portfolioRiskScore}
                  color={
                    summary.portfolioRiskScore === "LOW"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                />
              </div>

              {/* Recent Claims */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold mb-4">
                  Recent Claims
                </h3>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Policy ID</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hospital</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Risk</th>
                    </tr>
                  </thead>

                  <tbody>
                    {firebaseClaims.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">
                          <p className="text-lg">No claims available</p>
                          <p className="text-sm text-gray-400 mt-1">Claims will appear here when hospitals submit them</p>
                        </td>
                      </tr>
                    ) : (
                      firebaseClaims.slice(0, 5).map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{claim.policyId}</td>
                          <td className="px-4 py-3 text-sm">{claim.hospitalName}</td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            ₹{claim.amount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={claim.status} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {claim.riskLevel || <span className="text-gray-400">Not analyzed</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= CLAIM QUEUE ================= */}
          {activeSection === "claim-queue" && (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Real-Time Claim Queue</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>

              {firebaseClaims.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No claims in the queue</p>
                  <p className="text-gray-400 text-sm">Claims will appear here in real-time when hospitals submit them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {firebaseClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-gray-900">{claim.patientName}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {claim.policyId} | {claim.hospitalName}
                          </p>
                          {claim.diagnosis && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Diagnosis:</span> {claim.diagnosis}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Claim Amount</p>
                            <p className="text-xl font-bold text-gray-900">
                              ₹{claim.amount?.toLocaleString()}
                            </p>
                          </div>

                          <StatusBadge status={claim.status} />
                        </div>
                      </div>

                      {claim.status === "Pending" && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleMarkUnderReview(claim.id)}
                            disabled={processingClaim === claim.id}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Mark Under Review
                          </button>

                          <button
                            onClick={() => handleApproveClaim(claim.id)}
                            disabled={processingClaim === claim.id}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleRejectClaim(claim.id)}
                            disabled={processingClaim === claim.id}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {claim.status === "Under Review" && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleApproveClaim(claim.id)}
                            disabled={processingClaim === claim.id}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleRejectClaim(claim.id)}
                            disabled={processingClaim === claim.id}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= POLICY MANAGEMENT ================= */}
          {activeSection === "policy-management" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h1 className="text-3xl font-bold text-white">Policy Management</h1>
                </div>
                <p className="text-blue-100">Search and manage patient insurance policies by Patient UID</p>
              </div>

              {/* Search Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Search Patient Policy</h2>
                
                <form onSubmit={handleUIDSearch} className="space-y-4">
                  <div>
                    <label htmlFor="search-uid" className="block text-sm font-semibold text-gray-700 mb-2">
                      Patient UID
                    </label>
                    <div className="flex gap-4">
                      <input
                        id="search-uid"
                        type="text"
                        value={searchUID}
                        onChange={(e) => setSearchUID(e.target.value)}
                        placeholder="Enter Patient UID (e.g., ACK210001)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        disabled={searchLoading}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {searchLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                          </>
                        )}
                      </button>
                      {(patientData || notFound) && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    💡 Try sample UIDs: ACK210001, DIG220001, HDF230001, PMJ260001, ECH260001
                  </p>
                </form>
              </div>

              {/* Not Found Message */}
              {notFound && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Patient Not Found</h3>
                  <p className="text-red-600">No patient record found with UID: <span className="font-mono font-semibold">{searchUID}</span></p>
                  <p className="text-sm text-red-500 mt-2">Please check the UID and try again</p>
                </div>
              )}

              {/* Patient Data Display */}
              {patientData && (
                <div className="space-y-6">
                  {/* Patient Information Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                      <h2 className="text-2xl font-bold text-white mb-2">{patientData.name}</h2>
                      <p className="text-blue-100">Patient ID: <span className="font-mono font-semibold">{patientData.uid}</span></p>
                    </div>
                    
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-blue-600">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                              <p className="text-gray-900 text-lg font-medium mt-1">{patientData.name}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Age</label>
                              <p className="text-gray-900 text-lg font-medium mt-1">{patientData.age} years</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
                              <p className="text-gray-900 text-lg font-medium mt-1">{patientData.gender}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                              <p className="text-gray-900 text-lg font-mono mt-1">{patientData.phone}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                              <p className="text-gray-900 break-all mt-1">{patientData.email}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Address</label>
                              <p className="text-gray-900 mt-1">{patientData.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Insurance Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-green-600">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Insurance Information
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Policy Type</label>
                              <p className="text-gray-900 text-lg font-bold mt-1">{patientData.policyType}</p>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Coverage Amount</label>
                              <p className="text-green-600 text-2xl font-bold mt-1">₹{parseInt(patientData.coverage).toLocaleString()}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Annual Premium</label>
                              <p className="text-gray-900 text-lg font-medium mt-1">₹{parseInt(patientData.premium).toLocaleString()}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Insurance Issued Date</label>
                              <p className="text-gray-900 font-medium mt-1">{new Date(patientData.dateOfInsuranceIssued).toLocaleDateString('en-IN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <label className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Policy Status</label>
                              </div>
                              <p className="text-blue-900 font-bold text-lg">Active & Valid</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authorized Diseases Card */}
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-purple-600">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Authorized Diseases & Treatments
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">The following medical conditions and treatments are covered under this policy:</p>
                    
                    <div className="flex flex-wrap gap-3">
                      {patientData.authorizedDiseases.split(';').map((disease, index) => (
                        <span 
                          key={index}
                          className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {disease.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= RISK ANALYTICS ================= */}
          {activeSection === "risk-analytics" && (
            <RiskAnalytics />
          )}
        </div>
      </main>
    </div>
  );
}

export default ProviderDashboard;