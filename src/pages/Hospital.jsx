import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import KpiCard from '../components/KpiCard';
import ClaimsTable from '../components/ClaimsTable';

function HospitalDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalClaims: 1284,
    pendingApproval: 42,
    totalSettledAmount: 4200000,
    rejections: 12,
  });
  const [claims, setClaims] = useState([
    { patientName: 'John Doe', policyId: 'POL-98234-AX', amount: 1450, status: 'Settled', date: 'Oct 24, 2023' },
    { patientName: 'Alice Williams', policyId: 'POL-22341-BV', amount: 2890, status: 'Pending', date: 'Oct 23, 2023' },
    { patientName: 'Robert Johnson', policyId: 'POL-77129-MK', amount: 840, status: 'Flagged', date: 'Oct 22, 2023' },
    { patientName: 'Emma Miller', policyId: 'POL-44501-LZ', amount: 5120, status: 'Settled', date: 'Oct 21, 2023' },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'hospital') {
      navigate('/login/hospital');
      return;
    }
  }, [navigate]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 bg-gray-100">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
              <p className="text-gray-600">Manage and track your insurance claims efficiently.</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-blue-700 transition">
              <span className="text-lg font-medium">+ Raise New Claim</span>
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <KpiCard title="Total Claims" value={dashboardStats.totalClaims} percentageChange={12} />
            <KpiCard title="Pending Approval" value={dashboardStats.pendingApproval} percentageChange={5} />
            <KpiCard title="Total Settled Amount" value={`$${(dashboardStats.totalSettledAmount / 1000000).toFixed(1)}M`} percentageChange={-2} />
            <KpiCard title="Rejections" value={dashboardStats.rejections} percentageChange={-8} />
          </div>

          <section className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Claims</h2>
              <button className="text-blue-600 hover:underline">View All</button>
            </div>
            <ClaimsTable claims={claims} />
          </section>
        </main>

        {/* Footer with Contact Support */}
        <footer className="bg-white shadow-md p-6 text-center mt-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-700">HELP CENTER</h3>
            <p className="text-xs text-gray-500 mb-2">Having trouble with a claim?</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
              Contact Support
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HospitalDashboard;
