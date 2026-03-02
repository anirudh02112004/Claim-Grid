import React from 'react';

function KpiCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default KpiCard;