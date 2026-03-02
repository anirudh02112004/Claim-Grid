import { Link } from 'react-router-dom';
import { useState } from 'react';

function Provider() {
  // Mock claim data with risk scores
  const [claims, setClaims] = useState([
    {
      id: 'CLM-10234',
      insuranceId: 'INS-2024-7891',
      hospital: 'Apollo Hospital',
      amount: 25000,
      diagnosis: 'Routine checkup and blood tests',
      riskScore: 0.15,
      status: 'pending'
    },
    {
      id: 'CLM-10235',
      insuranceId: 'INS-2024-4562',
      hospital: 'Max Healthcare',
      amount: 180000,
      diagnosis: 'Cardiac surgery',
      riskScore: 0.55,
      status: 'pending'
    },
    {
      id: 'CLM-10236',
      insuranceId: 'INS-2024-9123',
      hospital: 'Fortis Hospital',
      amount: 350000,
      diagnosis: 'Orthopedic surgery with complications',
      riskScore: 0.82,
      status: 'pending'
    },
    {
      id: 'CLM-10237',
      insuranceId: 'INS-2024-3344',
      hospital: 'AIIMS Delhi',
      amount: 15000,
      diagnosis: 'Dental care',
      riskScore: 0.08,
      status: 'pending'
    },
    {
      id: 'CLM-10238',
      insuranceId: 'INS-2024-5678',
      hospital: 'Medanta Hospital',
      amount: 95000,
      diagnosis: 'Gastric endoscopy procedure',
      riskScore: 0.42,
      status: 'pending'
    }
  ]);

  const getRiskBadge = (riskScore) => {
    if (riskScore < 0.3) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Low Risk',
        message: 'Auto-Approved'
      };
    } else if (riskScore < 0.7) {
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Medium Risk',
        message: 'Review Required'
      };
    } else {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'High Risk',
        message: 'Manual Review'
      };
    }
  };

  const handleAction = (claimId, action) => {
    setClaims(claims.map(claim => 
      claim.id === claimId 
        ? { ...claim, status: action }
        : claim
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Dashboard Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Dashboard</h1>
          <p className="text-gray-600">Review and process insurance claims with AI-powered risk assessment</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-medium">
                AI Auto-Approval Engine Active
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Claims with risk score below 0.3 are automatically approved. Flagged cases require human review.
              </p>
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Insurance ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {claims.map((claim) => {
                  const badge = getRiskBadge(claim.riskScore);
                  const isAutoApproved = claim.riskScore < 0.3;
                  
                  return (
                    <tr key={claim.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{claim.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {claim.insuranceId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {claim.hospital}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">₹{claim.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {(claim.riskScore * 100).toFixed(0)}%
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {claim.status === 'pending' ? (
                          <div className="flex flex-col gap-2">
                            {isAutoApproved ? (
                              <button
                                disabled
                                className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg cursor-not-allowed"
                              >
                                ✓ Auto-Approved
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleAction(claim.id, 'approved')}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAction(claim.id, 'rejected')}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleAction(claim.id, 'clarification')}
                                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition"
                                >
                                  Ask for Clarification
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-600 capitalize">
                            {claim.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Provider;
