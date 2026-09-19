import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import JobList from './pages/JobList.jsx'
import JobDetail from './pages/JobDetail.jsx'
import PostJob from './pages/PostJob.jsx'
import EmployerDashboard from './pages/EmployerDashboard.jsx'
import MyApplications from './pages/MyApplications.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          <Route path="/post-job" element={
            <ProtectedRoute role="EMPLOYER"><PostJob /></ProtectedRoute>
          } />
          <Route path="/employer/dashboard" element={
            <ProtectedRoute role="EMPLOYER"><EmployerDashboard /></ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute role="CANDIDATE"><MyApplications /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>
    </>
  )
}
