// src/components/AddFacultyNavbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddFacultyNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-800 text-white p-4 flex items-center shadow-md">
      <button
        onClick={() => navigate('/facultyList')}
        className="mr-4 px-2 py-1 rounded hover:bg-gray-700 transition"
      >
        ← Back
      </button>
      <h1 className="text-xl font-semibold">Add New Faculty</h1>
    </nav>
  );
}
