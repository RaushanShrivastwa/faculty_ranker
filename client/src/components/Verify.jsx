// src/pages/Verify.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as jwtDecode from 'jwt-decode';
import '../styles/Verify.css';  // add whatever styles you like

function Verify() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Verification failed');
        setLoading(false);
        return;
      }

      // 1. Decode the token to extract user details
      let decodedUser = {};
      try {
        const decoded = jwtDecode(data.token);
        decodedUser = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          banned: decoded.banned
        };
      } catch (err) {
        console.error('JWT decoding failed:', err);
        alert('Verification succeeded, but could not process your login.');
        setLoading(false);
        return;
      }

      // 2. Call your context login to persist token + user
      login(data.token, decodedUser);

      // 3. Navigate based on their role
      if (decodedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/Dashboard');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vauth-card">
      <h2>Verify OTP</h2>
      <p>Please enter the OTP sent to <strong>{email}</strong></p>
      <form onSubmit={handleSubmit} className="verify-form">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOTP(e.target.value)}
          required
        />
        <button type="submit" className="btn solid" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
}

export default Verify;
