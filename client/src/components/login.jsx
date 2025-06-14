// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as jwtDecode from 'jwt-decode';
import '../styles/Login.css'; // Assuming you have a CSS file for styling

function Login() {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginChange = e =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();

      if (res.ok) {
        let decodedUser = {};
        try {
          const decodedToken = jwtDecode(data.token);
          decodedUser = {
            id: decodedToken.id,
            email: decodedToken.email,
            role: decodedToken.role,
            banned: decodedToken.banned
          };
        } catch (err) {
          console.error('JWT decoding failed:', err);
          alert('Login successful, but user info could not be decoded.');
          return;
        }

        login(data.token, decodedUser);
        navigate(decodedUser.role === 'admin' ? '/admin' : '/Dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} required />
        <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
        <button type="submit">Login</button>
        <a href="/auth/google" className="google-login-btn">
          <img src="https://i.postimg.cc/3NGKBY4V/google-icon.png" alt="Google" />
          Login with Google
        </a>
        <p>Don't have an account? <a href="/signup">Sign up</a></p>
      </form>
    </div>
  );
}

export default Login;
