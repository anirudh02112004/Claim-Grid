import React from 'react';

function ClaimsTable({ claims }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Claims</h2>
      {claims.length === 0 ? (
        <p className="text-gray-500">No claims available.</p>
      ) : (
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Patient Name</th>
              <th className="px-4 py-2 text-left text-gray-600">Policy ID</th>
              <th className="px-4 py-2 text-left text-gray-600">Amount</th>
              <th className="px-4 py-2 text-left text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-gray-600">Date</th>
              <th className="px-4 py-2 text-left text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{claim.patientName}</td>
                <td className="px-4 py-2">{claim.policyId}</td>
                <td className="px-4 py-2">${claim.amount}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-white ${
                      claim.status === 'Settled' ? 'bg-green-500' :
                      claim.status === 'Pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  >
                    {claim.status}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(claim.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <button className="text-blue-600 hover:underline">View</button>
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