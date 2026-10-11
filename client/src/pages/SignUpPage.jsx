import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function SignUpPage() {
  const { user, signUp } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    accountType: 'intern',
    roleTitle: '',
    accessCode: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  if (user) return <Navigate to="/" replace />

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await signUp(form)
        navigate('/signin', {
        state: { message: 'Account created! Please sign in.', email: form.email },
      })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create your account</h2>

        <label>
          First name
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Last name
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Role
          <select
            name="accountType"
            value={form.accountType}
            onChange={handleChange}
          >
            <option value="intern">Intern</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {form.accountType === 'admin' && (
          <>
            <label>
              Your role (e.g. Head of Engineering)
              <input
                name="roleTitle"
                value={form.roleTitle}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Access code
              <input
                type="password"
                name="accessCode"
                value={form.accessCode}
                onChange={handleChange}
                required
              />
            </label>
          </>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </form>
    </main>
  )
}

export default SignUpPage