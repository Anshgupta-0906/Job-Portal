import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', role: 'CANDIDATE', companyName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(form)
      navigate(data.role === 'EMPLOYER' ? '/employer/dashboard' : '/jobs')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Whether you're hiring or job hunting, start here.</p>

        {error && <div className="alert">{error}</div>}

        <div className="role-toggle">
          <button
            type="button"
            className={`role-option ${form.role === 'CANDIDATE' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'CANDIDATE' })}
          >
            I'm looking for a job
          </button>
          <button
            type="button"
            className={`role-option ${form.role === 'EMPLOYER' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'EMPLOYER' })}
          >
            I'm hiring
          </button>
        </div>

        <label>
          Full name
          <input type="text" name="fullName" required value={form.fullName} onChange={handleChange} placeholder="Jordan Lee" />
        </label>

        {form.role === 'EMPLOYER' && (
          <label>
            Company name
            <input type="text" name="companyName" required value={form.companyName} onChange={handleChange} placeholder="Acme Inc." />
          </label>
        )}

        <label>
          Email
          <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
