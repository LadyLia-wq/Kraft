import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'

function HeadHomePage() {
  const { user } = useAuth()
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/interns')
      .then((data) => setInterns(data.interns))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="intern-list-page">
      <h2>Welcome, {user.firstName}</h2>
      <p className="intern-list-sub">Select an intern to view their board.</p>

      {loading && <p className="loading">Loading interns…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && interns.length === 0 && (
        <p className="entry-empty">No active interns right now.</p>
      )}

      <div className="intern-grid">
        {interns.map((intern) => (
          <Link
            key={intern.id}
            to={`/interns/${intern.id}`}
            className="intern-card"
          >
            <span className="intern-avatar">
              {(intern.firstName[0] + intern.lastName[0]).toUpperCase()}
            </span>
            <span className="intern-name">
              {intern.firstName} {intern.lastName}
            </span>
            <span className="intern-email">{intern.email}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default HeadHomePage