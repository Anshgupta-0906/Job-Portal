import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/jobs" className="brand">Anchorpoint</Link>

        <nav className="nav-links">
          <Link to="/jobs">Browse jobs</Link>

          {user?.role === 'EMPLOYER' && (
            <>
              <Link to="/post-job">Post a job</Link>
              <Link to="/employer/dashboard">My postings</Link>
            </>
          )}

          {user?.role === 'CANDIDATE' && (
            <Link to="/my-applications">My applications</Link>
          )}

          {user ? (
            <div className="nav-user">
              <span className="nav-user-name">{user.fullName}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <div className="nav-user">
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
