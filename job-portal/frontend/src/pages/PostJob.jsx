import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'

export default function PostJob() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    companyName: user?.companyName || '',
    location: '',
    jobType: 'FULL_TIME',
    minSalary: '',
    maxSalary: '',
    minExperienceYears: '0',
    maxExperienceYears: '',
    skillsRequired: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        minSalary: form.minSalary ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
        minExperienceYears: form.minExperienceYears ? Number(form.minExperienceYears) : 0,
        maxExperienceYears: form.maxExperienceYears ? Number(form.maxExperienceYears) : null,
      }
      const res = await api.post('/jobs', payload)
      navigate(`/jobs/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post this job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>Post a job</h1>
        <p className="page-subtitle">Fill in the details below to reach candidates on Anchorpoint.</p>
      </div>

      {error && <div className="alert">{error}</div>}

      <form className="stacked-form" onSubmit={handleSubmit}>
        <label>
          Job title
          <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="Backend Engineer" />
        </label>

        <label>
          Company name
          <input type="text" name="companyName" required value={form.companyName} onChange={handleChange} placeholder="Acme Inc." />
        </label>

        <div className="form-row">
          <label>
            Location
            <input type="text" name="location" required value={form.location} onChange={handleChange} placeholder="Remote / Bengaluru" />
          </label>

          <label>
            Job type
            <select name="jobType" value={form.jobType} onChange={handleChange}>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Minimum salary in ₹ (optional)
            <input type="number" name="minSalary" value={form.minSalary} onChange={handleChange} placeholder="600000" />
          </label>
          <label>
            Maximum salary in ₹ (optional)
            <input type="number" name="maxSalary" value={form.maxSalary} onChange={handleChange} placeholder="900000" />
          </label>
        </div>

        <div className="form-row">
          <label>
            Minimum experience (years)
            <input type="number" min="0" name="minExperienceYears" required value={form.minExperienceYears} onChange={handleChange} placeholder="0" />
          </label>
          <label>
            Maximum experience in years (optional)
            <input type="number" min="0" name="maxExperienceYears" value={form.maxExperienceYears} onChange={handleChange} placeholder="e.g. 3" />
          </label>
        </div>

        <label>
          Skills required (comma separated)
          <input type="text" name="skillsRequired" value={form.skillsRequired} onChange={handleChange} placeholder="Java, Spring Boot, MySQL" />
        </label>

        <label>
          Description
          <textarea rows={8} name="description" required value={form.description} onChange={handleChange} placeholder="Responsibilities, requirements, and what makes this role great…" />
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Posting…' : 'Post job'}
        </button>
      </form>
    </div>
  )
}
