import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Hospital Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">
          {user?.name} {user?.isGuest && <span className="text-sm text-gray-500">(Guest Mode)</span>}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;