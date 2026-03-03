import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ onNewClaimClick, onContactUsClick, onPatientRecordsClick }) {
  const navItems = [
    { name: 'Overview', path: '/hospital' },
    { name: 'New Claim', path: '/hospital', action: 'newClaim' },
    { name: 'Patient Records', path: '/hospital', action: 'patientRecords' },
    { name: 'Contact Us', path: '/hospital', action: 'contactUs' },
  ];

  return (
    <aside className="bg-white shadow-lg w-64 h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600">ClaimGrid Hospital Portal</h2>
      </div>
      <nav className="space-y-4">
        {navItems.map((item, index) => (
          item.action === 'newClaim' ? (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                if (onNewClaimClick) onNewClaimClick();
              }}
              className="w-full text-left block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              {item.name}
            </button>
          ) : item.action === 'patientRecords' ? (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                if (onPatientRecordsClick) onPatientRecordsClick();
              }}
              className="w-full text-left block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              {item.name}
            </button>
          ) : item.action === 'contactUs' ? (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                if (onContactUsClick) onContactUsClick();
              }}
              className="w-full text-left block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              {item.name}
            </button>
          ) : (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition ${
                  isActive ? 'bg-gray-100 font-semibold' : ''
                }`
              }
            >
              {item.name}
            </NavLink>
          )
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;