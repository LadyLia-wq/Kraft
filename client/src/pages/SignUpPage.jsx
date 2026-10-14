import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Mail, KeyRound } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import PasswordField from '../components/PasswordField'
import Dropdown from '../components/Dropdown'

function SignUpPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
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
        state: {
          message: 'Account created! Please sign in.',
          email: form.email,
        },
      })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <h2 className="auth-title">Create your account</h2>
          {/* <p className="auth-lead">Choose your role to get started.</p> */}
        </div>

        <div className="field-row">
          <Field
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            required
          />
          <Field
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            required
          />
        </div>

        <Dropdown
          label="Role"
          value={form.accountType}
          onChange={(value) => setForm({ ...form, accountType: value })}
          options={[
            { value: 'intern', label: 'Intern' },
            { value: 'admin', label: 'Admin' },
          ]}
        />

        {form.accountType === 'admin' && (
          <>
            <Field
              label="Your role"
              name="roleTitle"
              value={form.roleTitle}
              onChange={handleChange}
              placeholder="e.g. Head of Engineering"
              required
            />
            <Field
              label="Access code"
              icon={KeyRound}
              type="password"
              name="accessCode"
              value={form.accessCode}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </>
        )}

        <Field
          label="Email"
          icon={Mail}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <PasswordField
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default SignUpPage