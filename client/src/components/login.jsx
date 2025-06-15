// src/pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import '../styles/Login.css'

// simple JWT payload parser—no external lib needed
function parseJWT(token) {
  if (!token) throw new Error('Missing token')
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')

  // Base64URL → Base64
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  // decode, percent‐encode for UTF-8, then parse JSON
  const json = decodeURIComponent(
    atob(b64)
      .split('')
      .map(ch => '%' + ch.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  )

  return JSON.parse(json)
}

export default function Login() {
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = e =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await fetch('/signin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(loginData),
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Login failed')
        return
      }

      let payload
      try {
        payload = parseJWT(data.token)
      } catch (err) {
        console.error('JWT parse error:', err)
        alert('Login succeeded, but token is invalid.')
        return
      }

      const user = {
        id:     payload.id,
        email:  payload.email,
        role:   payload.role,
        banned: payload.banned,
      }

      // persist token + user in context
      login(data.token, user)

      // navigate by role
      navigate(user.role === 'admin' ? '/admin' : '/facultyList')
    } catch (err) {
      console.error('Login error:', err)
      alert('Network error. Please try again.')
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>

        <a href="/auth/google" className="google-login-btn">
          <img
            src="https://i.postimg.cc/3NGKBY4V/google-icon.png"
            alt="Google"
          />
          Login with Google
        </a>

        <p>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  )
}