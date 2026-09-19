import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_OPTIONS = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED']

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/jobs/mine')
      setJobs(res.data)
    } catch (err) {
      setError('Could not load your job postings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const viewApplicants = async (job) => {
    setSelectedJob(job)
    setError('')
    try {
      const res = await api.get(`/applications/job/${job.id}`)
      setApplicants(res.data)
    } catch (err) {
      setError('Could not load applicants for this job.')
    }
  }

  const updateStatus = async (applicationId, status) => {
    try {
      const res = await api.put(`/applications/${applicationId}/status`, { status })
      setApplicants((prev) => prev.map((a) => (a.id === applicationId ? res.data : a)))
    } catch (err) {
      setError('Could not update this application.')
    }
  }

  const closeJob = async (jobId) => {
    if (!window.confirm('Close this job posting? Candidates will no longer be able to apply.')) return
    try {
      await api.delete(`/jobs/${jobId}`)
      loadJobs()
      if (selectedJob?.id === jobId) setSelectedJob(null)
    } catch (err) {
      setError('Could not close this job posting.')
    }
  }

  const downloadResume = async (application) => {
    try {
      const res = await api.get(`/applications/${application.id}/resume`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', application.resumeFileName || 'resume')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Could not download this resume.')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My postings</h1>
        <p className="page-subtitle">Track applicants and manage the roles you've posted.</p>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="dashboard-layout">
        <div className="dashboard-jobs">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs posted yet</h3>
              <p>Ready to hire? <Link to="/post-job">Post your first job</Link>.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                className={`dashboard-job-row ${selectedJob?.id === job.id ? 'active' : ''}`}
                onClick={() => viewApplicants(job)}
              >
                <div>
                  <h4>{job.title}</h4>
                  <p className="muted">{job.location}{!job.active && ' · Closed'}</p>
                </div>
                {job.active && (
                  <span
                    className="text-link"
                    onClick={(e) => { e.stopPropagation(); closeJob(job.id) }}
                  >
                    Close
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="dashboard-applicants">
          {!selectedJob ? (
            <div className="empty-state">
              <h3>Select a job</h3>
              <p>Pick a posting on the left to see who has applied.</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="empty-state">
              <h3>No applicants yet</h3>
              <p>Check back soon — new applications will show up here.</p>
            </div>
          ) : (
            <>
              <h3>Applicants for {selectedJob.title}</h3>
              <div className="applicant-list">
                {applicants.map((a) => (
                  <div className="applicant-card" key={a.id}>
                    <div className="applicant-top">
                      <div>
                        <h4>{a.candidateName}</h4>
                        <p className="muted">{a.candidateEmail}</p>
                      </div>
                      <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {a.coverLetter && <p className="cover-letter">{a.coverLetter}</p>}
                    {a.resumeFileName && (
                      <button type="button" className="text-link resume-link" onClick={() => downloadResume(a)}>
                        Download resume ({a.resumeFileName})
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
