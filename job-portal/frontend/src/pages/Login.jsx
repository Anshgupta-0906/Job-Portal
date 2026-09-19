import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      navigate(data.role === 'EMPLOYER' ? '/employer/dashboard' : '/jobs')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to keep track of your jobs and applications.</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Email
          <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth-footer">
          New to Anchorpoint? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  )
}
