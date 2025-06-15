import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-container">
      <h1>Admin Profile</h1>
      <div className="admin-details">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.banned ? 'Banned' : 'Active'}</p>
      </div>
      <button className="btn logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
