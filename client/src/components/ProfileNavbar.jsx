// src/components/ProfileNavbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileNavbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white flex items-center justify-between px-6 h-14 z-50 shadow-lg">
      <button
        onClick={() => navigate(-1)}
        className="text-lg font-semibold hover:text-gray-300"
      >
        ← Back
      </button>
      <div className="space-x-4">
        <button
          onClick={() => navigate('/about')}
          className="hover:text-gray-300"
        >
          About Us
        </button>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
