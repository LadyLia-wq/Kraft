import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import PasswordField from '../components/PasswordField'

function SignInPage() {
  const { user, signIn } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const successMessage = location.state?.message

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-lead">Sign in here</p>
        </div>

        <div className="auth-fields">
        {successMessage && <p className="form-success">{successMessage}</p>}

        <Field
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="form-error">{error}</p>}
        </div>
        
        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default SignInPage