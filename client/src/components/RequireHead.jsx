import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function RequireHead({ children }) {
  const { user } = useAuth()
  return user.type === 'head' ? children : <Navigate to="/" replace />
}

export default RequireHead