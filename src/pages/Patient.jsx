import { Link } from 'react-router-dom';

function Patient() {
  // Mock patient data
  const patientInfo = {
    name: 'Rajesh Kumar',
    insuranceId: 'INS-2024-7891',
    policyNumber: 'POL-987654321',
    provider: 'Star Health Insurance'
  };

  // Mock claim history
  const claimHistory = [
    {
      id: 'CLM-10234',
      date: '2026-02-28',
      hospital: 'Apollo Hospital',
      diagnosis: 'Routine checkup and blood tests',
      amount: 25000,
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CLM-10145',
      date: '2026-02-15',
      hospital: 'Max Healthcare',
      diagnosis: 'Dental care',
      amount: 8500,
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CLM-10089',
      date: '2026-01-20',
      hospital: 'Fortis Hospital',
      diagnosis: 'Eye examination',
      amount: 3200,
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CLM-09956',
      date: '2025-12-10',
      hospital: 'AIIMS Delhi',
      diagnosis: 'Annual health checkup',
      amount: 15000,
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'CLM-09845',
      date: '2025-11-05',
      hospital: 'Medanta Hospital',
      diagnosis: 'X-ray scan',
      amount: 2500,
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-gray-600">Track your claim history and policy information</p>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Patient Name
              </label>
              <p className="text-lg font-medium text-gray-900 mt-1">{patientInfo.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Unified Insurance ID
              </label>
              <p className="text-lg font-medium text-blue-600 mt-1">{patientInfo.insuranceId}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Policy Number
              </label>
              <p className="text-lg font-medium text-gray-900 mt-1">{patientInfo.policyNumber}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Insurance Provider
              </label>
              <p className="text-lg font-medium text-gray-900 mt-1">{patientInfo.provider}</p>
            </div>
          </div>
        </div>

        {/* Claim History */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Claim History</h2>
          
          <div className="space-y-4">
            {claimHistory.map((claim) => (
              <div 
                key={claim.id} 
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{claim.id}</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${claim.statusColor}`}>
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Date:</span> {new Date(claim.date).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Hospital:</span> {claim.hospital}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Diagnosis:</span> {claim.diagnosis}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{claim.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Claim Amount</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-gray-600">Total Claims Filed</p>
                <p className="text-2xl font-bold text-gray-900">{claimHistory.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount Claimed</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{claimHistory.reduce((sum, claim) => sum + claim.amount, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Patient;
