// src/pages/Verify.jsx
import React, { useState }        from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth }                 from '../context/AuthContext'
import '../styles/Verify.css'

// minimal JWT parser—decodes the payload (the “middle” segment)
function parseJWT(token) {
  if (!token) throw new Error('Missing token')
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')

  // Base64URL → Base64
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  // decode & percent‐encode for UTF-8 safety
  const json = decodeURIComponent(
    atob(b64)
      .split('')
      .map(ch => '%' + ch.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  )

  return JSON.parse(json)
}

export default function Verify() {
  const { login }      = useAuth()
  const { state }      = useLocation()
  const navigate       = useNavigate()
  const email          = state?.email || ''
  const [otp, setOTP]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (loading) return setLoading(true)

    try {
      const res  = await fetch('/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp })
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Verification failed')
        return setLoading(false)
      }

      let payload
      try {
        payload = parseJWT(data.token)
      } catch (err) {
        console.error('JWT parse error:', err)
        alert('Verified, but token is invalid.')
        return setLoading(false)
      }

      const user = {
        id:     payload.id,
        email:  payload.email,
        role:   payload.role,
        banned: payload.banned
      }

      // persist and route
      login(data.token, user)
      navigate(user.role === 'admin' ? '/admin' : '/facultyList')
    }
    catch (err) {
      console.error('Network / verify-otp error:', err)
      alert('Network error. Please try again.')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="vauth-card">
      <h2>Verify OTP</h2>
      <p>
        Please enter the OTP sent to <strong>{email}</strong>
      </p>
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
  )
}