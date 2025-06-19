// src/components/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

function Signup() {
  const [signupData, setSignupData] = useState({ name: '', email: '', phno: '', password: '' });
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupChange = e =>
    setSignupData({ ...signupData, [e.target.name]: e.target.value });

  const handleSignup = async e => {
    e.preventDefault();
    if (otpLoading) return;

    if (!signupData.email.endsWith('@vitapstudent.ac.in')) {
      alert('Only @vitapstudent.ac.in emails can sign up.');
      return navigate('/403')
    }

    setOtpLoading(true);
    try {
      const res = await fetch('/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        navigate('/verify', { state: { email: signupData.email } });
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Sign Up</h2>
        <input type="text" name="name" placeholder="Name" value={signupData.name} onChange={handleSignupChange} required />
        <input type="email" name="email" placeholder="Email" value={signupData.email} onChange={handleSignupChange} required />
        <input type="text" name="phno" placeholder="Phone Number" value={signupData.phno} onChange={handleSignupChange} required />
        <input type="password" name="password" placeholder="Password" value={signupData.password} onChange={handleSignupChange} required />
        <button type="submit" disabled={otpLoading}>{otpLoading ? 'Sending OTP...' : 'Request OTP'}</button>
        <a href="/auth/google" className="google-login-btn">
          <img src="https://i.postimg.cc/3NGKBY4V/google-icon.png" alt="Google" />
          Sign up with Google
        </a>
        <p>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
}

export default Signup;