import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Loader from './Loader'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <Loader full />
  if (!user) return <Navigate to="/signin" replace />

  return children
}

export default RequireAuth