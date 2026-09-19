import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_STYLES = {
  APPLIED: 'status-applied',
  SHORTLISTED: 'status-shortlisted',
  REJECTED: 'status-rejected',
  HIRED: 'status-hired',
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/applications/mine')
      .then((res) => setApplications(res.data))
      .catch(() => setError('Could not load your applications.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>My applications</h1>
        <p className="page-subtitle">Track the status of every role you've applied to.</p>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p><Link to="/jobs">Browse open roles</Link> and apply to get started.</p>
        </div>
      ) : (
        <div className="application-list">
          {applications.map((app) => (
            <div className="application-row" key={app.id}>
              <div>
                <h4>{app.jobTitle}</h4>
                <p className="muted">{app.companyName} · Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
              </div>
              <span className={`status-pill ${STATUS_STYLES[app.status]}`}>{app.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
