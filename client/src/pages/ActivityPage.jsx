import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Loader from '../components/Loader'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ActivityPage() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/interns/activity')
      .then((data) => setInterns(data.interns))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="intern-list-page">
      <h2>Activity</h2>
      <p className="intern-list-sub">
        All interns, active and inactive. Select one to open their board.
      </p>

      {loading && <Loader label="Loading interns…" />}      {error && <p className="form-error">{error}</p>}
      {!loading && !error && interns.length === 0 && (
        <p className="entry-empty">No interns have signed up yet.</p>
      )}

      <div className="activity-list">
        {interns.map((intern) => (
          <Link
            key={intern.id}
            to={`/interns/${intern.id}`}
            className="activity-row"
          >
            <span className="activity-name">
              {intern.firstName} {intern.lastName}
            </span>
            <span className="activity-date">
              Signed up {formatDate(intern.signedUpAt)}
            </span>
            <span className={`status-badge ${intern.status}`}>
              {intern.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default ActivityPage