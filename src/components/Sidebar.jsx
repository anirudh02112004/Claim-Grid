import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { name: 'Overview', path: '/hospital' },
    { name: 'New Claim', path: '/hospital/new-claim' },
    { name: 'Patient Records', path: '/hospital/patient-records' },
    { name: 'Reports', path: '/hospital/reports' },
    { name: 'Settings', path: '/hospital/settings' },
  ];

  return (
    <aside className="bg-white shadow-lg w-64 h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600">ClaimGrid Hospital Portal</h2>
      </div>
      <nav className="space-y-4">
        {navItems.map((item, index) => (
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
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;