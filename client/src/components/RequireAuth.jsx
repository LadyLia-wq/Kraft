import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="loading">Loading…</p>
  if (!user) return <Navigate to="/signin" replace />

  return children
}

export default RequireAuth