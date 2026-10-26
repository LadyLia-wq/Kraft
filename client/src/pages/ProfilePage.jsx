import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Link } from 'react-router-dom'
import { api } from '../api'

function PasswordInput({ id, label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="field-toggle"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

function ProfilePage() {
  const { user, updateUser } = useAuth()

  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [email, setEmail] = useState(user.email)
  const [detailsError, setDetailsError] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  function showToast(message) {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
  const roleLabel = user.type === 'head' ? user.role : 'Intern'

  const detailsChanged =
    firstName.trim() !== user.firstName ||
    lastName.trim() !== user.lastName ||
    email.trim().toLowerCase() !== user.email

  async function saveDetails(e) {
    e.preventDefault()
    setDetailsError('')
    setSavingDetails(true)
    try {
      const data = await api('/api/auth/profile', {
        method: 'PUT',
        body: { firstName, lastName, email },
      })
      updateUser(data.user)
      setFirstName(data.user.firstName)
      setLastName(data.user.lastName)
      setEmail(data.user.email)
      showToast('Changes saved')
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setSavingDetails(false)
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setSavingPassword(true)
    try {
      await api('/api/auth/password', {
        method: 'PUT',
        body: { currentPassword, newPassword, confirmPassword },
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
    <div className="back-bar">
      <Link to="/" className="back-pill">
        <ChevronLeft size={18} />
        Back
      </Link>
    </div>

    <main className="board profile-page">
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="profile-who">
          <h2>
            {user.firstName} {user.lastName}
          </h2>
          <span className="profile-role">{roleLabel}</span>
        </div>
      </section>

      <section className="profile-card">
        <h3>Personal details</h3>
        <form className="profile-form" onSubmit={saveDetails}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="first-name">First name</label>
              <input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="field">
              <label htmlFor="last-name">Last name</label>
              <input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {detailsError && (
            <p className="form-error" role="alert">
              {detailsError}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit profile-save"
            disabled={!detailsChanged || savingDetails}
          >
            {savingDetails ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      <section className="profile-card">
        <h3>Change password</h3>
        <form className="profile-form" onSubmit={savePassword}>
          <PasswordInput
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <PasswordInput
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />

          {passwordError && (
            <p className="form-error" role="alert">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit profile-save"
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              savingPassword
            }
          >
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
    </>
  )
}

export default ProfilePage