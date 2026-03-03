import React from 'react';

function ClaimsTable({ claims }) {
  console.log('🎯 ClaimsTable received claims:', claims?.length || 0, 'claims');
  console.log('📋 Claims data:', claims);

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Settled': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
      'Flagged': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Claims</h2>
      {claims.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No claims available.</p>
          <p className="text-sm text-gray-400 mt-1">Submit your first claim to see it here</p>
        </div>
      ) : (
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Policy ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim, index) => (
              <tr key={claim.id || index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm">{claim.patientName}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{claim.policyId}</td>
                <td className="px-4 py-3 text-sm font-semibold">₹{claim.amount?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={claim.displayStatus || claim.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{claim.date}</td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      onClick={() => {
                        const optionsMenu = document.getElementById(`options-${index}`);
                        optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
                      }}
                    >
                      View
                    </button>
                    <div 
                      id={`options-${index}`} 
                      className="absolute bg-white border rounded shadow-md mt-2 hidden"
                      style={{ zIndex: 10 }}
                    >
                      <button 
                        className="block px-4 py-2 text-left w-full hover:bg-gray-100"
                        onClick={() => {
                          alert(`Claim on hold for policy ID: ${claim.policyId}`);
                          const optionsMenu = document.getElementById(`options-${index}`);
                          optionsMenu.style.display = 'none';
                        }}
                      >
                        Hold Claim
                      </button>
                      <button 
                        className="block px-4 py-2 text-left w-full hover:bg-gray-100"
                        onClick={() => {
                          alert(`Claim canceled for policy ID: ${claim.policyId}`);
                          const optionsMenu = document.getElementById(`options-${index}`);
                          optionsMenu.style.display = 'none';
                        }}
                      >
                        Cancel Claim
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClaimsTable;