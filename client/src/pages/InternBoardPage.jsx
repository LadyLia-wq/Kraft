import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import BoardPage from './BoardPage'
import { ChevronLeft } from 'lucide-react'

function InternBoardPage() {
  const { id } = useParams()
  const [intern, setIntern] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setIntern(null)
    setError('')
    api(`/api/interns/${id}`)
      .then((data) => setIntern(data.intern))
      .catch((err) => setError(err.message))
  }, [id])

  return (
    <>
      <div className="back-bar">
        <Link to="/" className="back-pill">
          <ChevronLeft size={16} aria-hidden="true" />
          All interns
        </Link>
      </div>

      {error && (
        <main className="board">
          <p className="form-error">{error}</p>
        </main>
      )}
      {!intern && !error && <p className="loading">Loading…</p>}
      {intern && <BoardPage key={intern.id} intern={intern} />}
    </>
  )
}

export default InternBoardPage