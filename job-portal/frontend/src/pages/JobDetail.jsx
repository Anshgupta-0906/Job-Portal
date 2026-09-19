import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data)).catch(() => setError('This job could not be found.'))
  }, [id])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (!resumeFile) {
      setError('Please attach your resume (PDF, DOC, or DOCX).')
      return
    }
    setApplying(true)
    setError('')
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('jobId', id)
      formData.append('coverLetter', coverLetter)
      formData.append('resume', resumeFile)

      await api.post('/applications', formData)
      setMessage('Application submitted! You can track its status from My Applications.')
      setCoverLetter('')
      setResumeFile(null)
      e.target.reset()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your application.')
    } finally {
      setApplying(false)
    }
  }

  if (error && !job) return <div className="page"><div className="alert">{error}</div></div>
  if (!job) return <div className="page"><p className="muted">Loading…</p></div>

  return (
    <div className="page page-narrow">
      <div className="job-detail-header">
        <span className="job-type-pill">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
        <h1>{job.title}</h1>
        <p className="job-company">{job.companyName} · {job.location}</p>
        <p className="job-experience">
          {job.minExperienceYears === 0 && !job.maxExperienceYears
            ? 'Fresher friendly'
            : job.maxExperienceYears
              ? `${job.minExperienceYears}–${job.maxExperienceYears} yrs experience required`
              : `${job.minExperienceYears}+ yrs experience required`}
        </p>
        {(job.minSalary || job.maxSalary) && (
          <p className="job-salary">
            {job.minSalary && job.maxSalary
              ? `₹${job.minSalary.toLocaleString('en-IN')} – ₹${job.maxSalary.toLocaleString('en-IN')}`
              : `₹${(job.minSalary || job.maxSalary).toLocaleString('en-IN')}`}
          </p>
        )}
      </div>

      <section className="job-section">
        <h3>About this role</h3>
        <p className="job-description-full">{job.description}</p>
      </section>

      {job.skillsRequired && (
        <section className="job-section">
          <h3>Skills</h3>
          <div className="skill-pills">
            {job.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
              <span className="skill-pill" key={skill}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {(!user || user.role === 'CANDIDATE') && (
        <section className="job-section apply-section">
          <h3>Apply for this role</h3>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert">{error}</div>}
          <form onSubmit={handleApply}>
            <label>
              Resume (PDF, DOC, or DOCX — max 5MB)
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
            </label>
            <label>
              Cover letter (optional)
              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the hiring team why you're a great fit…"
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={applying}>
              {applying ? 'Submitting…' : user ? 'Submit application' : 'Log in to apply'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
