import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getToken, removeToken } from '../utils/auth';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);

  // On mount, check for token in query or localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromQuery = params.get('token');
    const storedToken = getToken();
    const token = tokenFromQuery || storedToken;
    if (tokenFromQuery) {
      // Save token from Google OAuth
      localStorage.setItem('token', tokenFromQuery);
    }
    if (!token) {
      // No token, redirect to login
      navigate('/');
      return;
    }
    // Fetch user info
    fetch('/api/dashboard', {
      headers: { 'Authorization': token }
    }).then(res => {
      if (res.status === 401) {
        removeToken();
        navigate('/');
        return null;
      }
      return res.json();
    }).then(data => {
      if (data && data.user) {
        setUser(data.user);
        setLogs(data.logs || []);
      }
    });
  }, [navigate, location]);

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  if (!user) return null;
  return (
    <div className="auth-card">
      <h1>Welcome back, <span className="dashboard-username">{user.username}</span></h1>
      <p>Your role: {user.role}</p>
      <button onClick={handleLogout} className="btn solid">Logout</button>

      <h2>Activity Log</h2>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx}>{new Date(log.timestamp).toLocaleString()}: {log.action}</li>
        ))}
      </ul>
    </div>
  );
}
export default Dashboard;
