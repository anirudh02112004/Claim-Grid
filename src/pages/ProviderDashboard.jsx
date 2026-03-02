import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8000";

// Sidebar Component
function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login/provider');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ClaimGrid</h1>
            <p className="text-xs text-gray-500">Enterprise Insurance</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Overview
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Claim Queue
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Policy Management
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Risk Analytics
        </button>
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// Header Component
function DashboardHeader() {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.isGuest ? 'Guest' : user.email || user.name || 'Robert Sterling';
  const displayRole = user.isGuest ? 'Guest User' : 'Senior Claims Adjudicator';

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Executive</h2>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search claims, policies, or providers..."
              className="w-72 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Notification Icon */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          {/* Message Icon */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>

          {/* Profile Section */}
          <div className="flex items-center gap-3 ml-2">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{displayRole}</p>
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            </div>
            <img 
              src="https://i.pravatar.cc/150?img=12" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// Stats Card Component
function StatsCard({ title, value, trend, icon, iconBg }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {trend && (
        <p className={`text-sm flex items-center gap-1 ${
          trend.startsWith('+') ? 'text-green-600' : 
          trend.startsWith('-') && trend.includes('improvement') ? 'text-green-600' : 
          'text-red-600'
        }`}>
          {trend.startsWith('+') || trend.includes('improvement') ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {trend}
        </p>
      )}
    </div>
  );
}

// Risk Score Card Component
function RiskScoreCard({ riskScore }) {
  const getHealthyStatus = () => {
    if (riskScore === "LOW") return "HEALTHY";
    if (riskScore === "MEDIUM") return "MODERATE";
    if (riskScore === "HIGH") return "CRITICAL";
    return "UNKNOWN";
  };

  const getStatusColor = () => {
    if (riskScore === "LOW") return "bg-green-100 text-green-700";
    if (riskScore === "MEDIUM") return "bg-yellow-100 text-yellow-700";
    if (riskScore === "HIGH") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">Portfolio Risk Score</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {getHealthyStatus()}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-3">{riskScore}</p>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full flex">
          <div className={`h-full ${riskScore === "LOW" || riskScore === "MEDIUM" || riskScore === "HIGH" ? 'bg-green-500' : ''}`} style={{ width: '33%' }}></div>
          <div className={`h-full ${riskScore === "MEDIUM" || riskScore === "HIGH" ? 'bg-yellow-500' : ''}`} style={{ width: '33%' }}></div>
          <div className={`h-full ${riskScore === "HIGH" ? 'bg-red-500' : ''}`} style={{ width: '34%' }}></div>
        </div>
      </div>
    </div>
  );
}

// Get Risk Badge Color
function getRiskColor(level) {
  if (level === "LOW") return "bg-green-100 text-green-700";
  if (level === "MEDIUM") return "bg-yellow-100 text-yellow-700";
  if (level === "HIGH") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

// Main Provider Dashboard Component
function ProviderDashboard() {
  const [summary, setSummary] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard summary
        const summaryResponse = await fetch(`${API_BASE}/api/provider/dashboard`);
        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);

        // Fetch claims
        const claimsResponse = await fetch(`${API_BASE}/api/provider/claims`);
        if (!claimsResponse.ok) {
          throw new Error('Failed to fetch claims data');
        }
        const claimsData = await claimsResponse.json();
        setClaims(claimsData);

        setLoading(false);
      } catch (err) {
        // Use dummy data when API is not available
        console.log('API not available, using dummy data');
        setSummary({
          claimsUnderReview: 1284,
          pendingDecisions: 85,
          avgApprovalDays: 4.2,
          portfolioRiskScore: "LOW"
        });
        
        setClaims([
          {
            claimId: "CLM-9021",
            hospital: "St. Mary's Medical",
            policyType: "Life Insurance",
            amount: 12500,
            riskLevel: "HIGH"
          },
          {
            claimId: "CLM-8842",
            hospital: "City General",
            policyType: "Health Plus",
            amount: 4200,
            riskLevel: "LOW"
          },
          {
            claimId: "CLM-8765",
            hospital: "Unity Hospital",
            policyType: "Family Cover",
            amount: 8900,
            riskLevel: "MEDIUM"
          },
          {
            claimId: "CLM-8541",
            hospital: "Grace Clinic",
            policyType: "Corporate",
            amount: 15000,
            riskLevel: "HIGH"
          },
          {
            claimId: "CLM-8320",
            hospital: "Valley Health",
            policyType: "Basic Life",
            amount: 2100,
            riskLevel: "LOW"
          }
        ]);
        
        setLoading(false);
        setError(null);
      }
    };

    fetchData();
  }, []);

  // Helper function to add hospital subtitle
  const getHospitalSubtitle = (hospital) => {
    const subtitles = {
      "St. Mary's Medical": "London Regional",
      "City General": "Main Campus",
      "Unity Hospital": "Community Center",
      "Grace Clinic": "Private Sector",
      "Valley Health": "County Center"
    };
    return subtitles[hospital] || "Medical Center";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <DashboardHeader />

        {/* Content Area */}
        <div className="p-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && summary && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Claims Under Review"
                  value={summary.claimsUnderReview.toLocaleString()}
                  trend="+12% from last month"
                  icon={
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                  iconBg="bg-blue-100"
                />
                <StatsCard
                  title="Pending Decisions"
                  value={summary.pendingDecisions.toLocaleString()}
                  trend="-5% from last week"
                  icon={
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  iconBg="bg-orange-100"
                />
                <StatsCard
                  title="Avg. Approval Time"
                  value={`${summary.avgApprovalDays} Days`}
                  trend="-1.5% improvement"
                  icon={
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  iconBg="bg-purple-100"
                />
                <RiskScoreCard riskScore={summary.portfolioRiskScore} />
              </div>

              {/* Claims Adjudication Queue Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                {/* Section Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Claims Adjudication Queue
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage and process high-priority insurance claims
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Claims Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Claim ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Hospital Provider
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Policy Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {claims.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No claims found
                          </td>
                        </tr>
                      ) : (
                        claims.map((claim) => (
                          <tr
                            key={claim.claimId}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-semibold text-blue-600">
                                #{claim.claimId}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="font-medium text-gray-900">{claim.hospital}</div>
                                <div className="text-sm text-gray-500">{getHospitalSubtitle(claim.hospital)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {claim.policyType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                              {claim.amount.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                                  claim.riskLevel
                                )}`}
                              >
                                ● {claim.riskLevel}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Review Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing 1-{Math.min(5, claims.length)} of {summary.claimsUnderReview.toLocaleString()} results
                  </div>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition">
                      2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition">
                      3
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Processing Banner */}
                <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-2">Priority Processing Active</h3>
                      <p className="text-blue-100 text-sm">High-value claims are being processed with expedited review</p>
                    </div>
                    <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Claims Engine</span>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Gateway</span>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProviderDashboard;
