import { useState, useEffect, useRef } from 'react'
import DayCard from '../components/DayCard'
import DayView from '../components/DayView'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import {
  getMonday,
  addDays,
  formatWeekRange,
  toKey,
  getTodayIndex,
  startOfToday,
  parseKey,
} from '../utils/dates'

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const saveMessages = {
  saving: 'Saving…',
  saved: 'All changes saved',
  error: 'Could not save',
}

function BoardPage({ intern }) {
  const { user } = useAuth()

  // An inactive intern's board only covers the days from their first entry to their last.
  const limited = intern?.status === 'inactive'
  const range = limited ? intern.entryRange : null
  const noEntries = limited && !range
  const firstMonday = range ? getMonday(parseKey(range.first)) : null
  const lastMonday = range ? getMonday(parseKey(range.last)) : null

  const [weekStart, setWeekStart] = useState(range ? lastMonday : getMonday())
  const [selectedDay, setSelectedDay] = useState(
    range
      ? Math.min(4, Math.max(0, parseKey(range.last).getDay() - 1))
      : getTodayIndex()
  )
  const [board, setBoard] = useState({ key: '', days: null })
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const pending = useRef({})
  const timers = useRef({})

  // Whose board is this? An admin looks at an intern's; an intern at their own.
  const ownerId = intern ? intern.id : user.id
  const weekKey = toKey(weekStart)
  const boardKey = `${ownerId}:${weekKey}`
  const week = board.key === boardKey ? board.days : null

  const viewer = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    type: user.type,
  }

  // Load the week whenever the person or the week changes.
  useEffect(() => {
    if (noEntries) return
    let cancelled = false
    api(`/api/boards/${ownerId}/week/${weekKey}`)
      .then((data) => {
        if (cancelled) return
        setBoard({ key: `${ownerId}:${weekKey}`, days: data.days })
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [ownerId, weekKey, noEntries])

  // Which of the five days are shown this week?
  const visibleIndexes = [0, 1, 2, 3, 4].filter((i) => {
    if (!range) return true
    const key = toKey(addDays(weekStart, i))
    return key >= range.first && key <= range.last
  })
  const activeDay = visibleIndexes.includes(selectedDay)
    ? selectedDay
    : visibleIndexes[0] ?? 0

  const atStart = Boolean(range) && weekStart <= firstMonday
  const atEnd = Boolean(range) && weekStart >= lastMonday

  const selectedDate = addDays(weekStart, activeDay)
  const isPastDay = selectedDate < startOfToday()
  const isHead = user.type === 'head'
  const readOnly = isPastDay || isHead

  async function flushSave(date) {
    const day = pending.current[date]
    if (!day) return
    delete pending.current[date]
    try {
      await api(`/api/boards/${ownerId}/days/${date}`, {
        method: 'PUT',
        body: {
          subject: day.subject,
          tasks: day.tasks,
          challenges: day.challenges,
          solutions: day.solutions,
          nextSteps: day.nextSteps,
        },
      })
      if (Object.keys(pending.current).length === 0) setSaveStatus('saved')
    } catch (err) {
      setSaveStatus('error')
      setError(err.message)
    }
  }

  // Edits show up on screen straight away and are saved shortly after you stop typing.
  function updateDay(index, changes) {
    const updated = { ...week[index], ...changes }
    setBoard({
      key: boardKey,
      days: week.map((d, i) => (i === index ? updated : d)),
    })

    pending.current[updated.date] = updated
    clearTimeout(timers.current[updated.date])
    timers.current[updated.date] = setTimeout(
      () => flushSave(updated.date),
      600
    )
    setSaveStatus('saving')
  }

  // After a comment or reaction, refresh only those parts so unsaved typing isn't overwritten.
  async function refreshDiscussion() {
    const data = await api(`/api/boards/${ownerId}/week/${weekKey}`)
    setBoard((current) =>
      current.key !== boardKey
        ? current
        : {
            key: boardKey,
            days: current.days.map((d, i) => ({
              ...d,
              comments: data.days[i].comments,
              reactions: data.days[i].reactions,
            })),
          }
    )
  }

  async function addComment(index, text, parentId) {
    setError('')
    try {
      await api(`/api/boards/${ownerId}/days/${week[index].date}/comments`, {
        method: 'POST',
        body: { text, parentId },
      })
      await refreshDiscussion()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleReaction(index, type) {
    setError('')
    try {
      await api(
        `/api/boards/${ownerId}/days/${week[index].date}/reactions/${type}`,
        { method: 'POST' }
      )
      await refreshDiscussion()
    } catch (err) {
      setError(err.message)
    }
  }

  const ownerHeading = intern && (
    <h2 className="board-owner">
      {intern.firstName} {intern.lastName}'s board
      {limited && <span className="status-badge inactive">Inactive</span>}
    </h2>
  )

  if (noEntries) {
    return (
      <div>
        {ownerHeading}
        <p className="readonly-note">
          This intern is inactive and has no entries, so there is nothing to
          show.
        </p>
      </div>
    )
  }

  if (!week) {
    return error ? (
      <main className="board">
        <p className="form-error">{error}</p>
      </main>
    ) : (
      <p className="loading">Loading board…</p>
    )
  }

  return (
    <div>
      {ownerHeading}

      {readOnly && (
        <p className="readonly-note">
          {isHead
            ? "You're viewing an intern's board: read-only. You can react and comment."
            : 'Past day: read-only. You can still react, comment and reply.'}
        </p>
      )}

      {limited && (
        <p className="readonly-note">
          This intern is inactive, so only the days from their first entry to
          their last entry are shown.
        </p>
      )}

      {error && <p className="form-error board-error">{error}</p>}

      <div className="week-nav">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          disabled={atStart}
        >
          ←
        </button>
        <h2>{formatWeekRange(weekStart)}</h2>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          disabled={atEnd}
        >
          →
        </button>
        {!range && (
          <button onClick={() => setWeekStart(getMonday())}>This Week</button>
        )}
      </div>

      <p className="save-status">{saveMessages[saveStatus] || '\u00A0'}</p>

      <div className="week-strip">
        {visibleIndexes.map((index) => (
          <DayCard
            key={dayNames[index]}
            name={dayNames[index]}
            date={addDays(weekStart, index)}
            data={week[index]}
            active={index === activeDay}
            onClick={() => setSelectedDay(index)}
          />
        ))}
      </div>

      <main className="board">
        <DayView
          day={dayNames[activeDay]}
          date={selectedDate}
          data={week[activeDay]}
          onChange={(changes) => updateDay(activeDay, changes)}
          onAddComment={(text, parentId) =>
            addComment(activeDay, text, parentId)
          }
          onToggleReaction={(type) => toggleReaction(activeDay, type)}
          readOnly={readOnly}
          user={viewer}
        />
      </main>
    </div>
  )
}

export default BoardPage