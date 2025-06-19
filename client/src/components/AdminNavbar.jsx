// src/components/AdminNavbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-gray-200 p-4 flex items-center justify-between shadow-lg">
      <div className="flex space-x-4">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `px-3 py-1 rounded ${isActive ? 'bg-purple-700 text-white' : 'hover:bg-gray-700'}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/faculty-management"
          className={({ isActive }) =>
            `px-3 py-1 rounded ${isActive ? 'bg-purple-700 text-white' : 'hover:bg-gray-700'}`
          }
        >
          Faculty Approval
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `px-3 py-1 rounded ${isActive ? 'bg-purple-700 text-white' : 'hover:bg-gray-700'}`
          }
        >
          User Management
        </NavLink>
      </div>
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
      >
        Logout
      </button>
    </nav>
  );
}
