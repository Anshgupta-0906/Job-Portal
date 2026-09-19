import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

export default function JobList() {
  const [jobs, setJobs] = useState([])
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobs = async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/jobs', { params })
      setJobs(res.data)
    } catch (err) {
      setError('Could not load jobs right now. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchJobs({ keyword, location, experience: experience === '' ? undefined : experience })
  }

  const formatSalary = (job) => {
    if (!job.minSalary && !job.maxSalary) return null
    if (job.minSalary && job.maxSalary) return `₹${job.minSalary.toLocaleString('en-IN')} – ₹${job.maxSalary.toLocaleString('en-IN')}`
    return `₹${(job.minSalary || job.maxSalary).toLocaleString('en-IN')}`
  }

  const formatExperience = (job) => {
    if (job.minExperienceYears === 0 && !job.maxExperienceYears) return 'Fresher friendly'
    if (job.maxExperienceYears) return `${job.minExperienceYears}–${job.maxExperienceYears} yrs experience`
    return `${job.minExperienceYears}+ yrs experience`
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Find your next role</h1>
        <p className="page-subtitle">Search open positions posted by hiring teams on Anchorpoint.</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Job title or skill (e.g. React, Java)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          min="0"
          className="experience-input"
          placeholder="Your experience (yrs)"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <h3>No jobs match your search</h3>
          <p>Try a broader keyword, or clear the location filter.</p>
        </div>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => (
            <Link to={`/jobs/${job.id}`} className="job-card" key={job.id}>
              <div className="job-card-top">
                <h3>{job.title}</h3>
                <span className="job-type-pill">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
              </div>
              <p className="job-company">{job.companyName} · {job.location}</p>
              <p className="job-experience">{formatExperience(job)}</p>
              {formatSalary(job) && <p className="job-salary">{formatSalary(job)}</p>}
              <p className="job-desc">{job.description.slice(0, 140)}{job.description.length > 140 ? '…' : ''}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
