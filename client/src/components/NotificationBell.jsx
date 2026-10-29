import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'

const reactionVerbs = {
  like: 'liked',
  love: 'loved',
  fire: 'reacted with fire to',
}

function formatDay(day) {
  return new Date(`${day}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function describe(n) {
  const day = formatDay(n.day)
  if (n.type === 'reply') return `replied to your comment on ${day}`
  if (n.type === 'reaction') {
    return `${reactionVerbs[n.reaction] ?? 'reacted to'} your report for ${day}`
  }
  return `commented on your report for ${day}`
}

function NotificationBell({ tab = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const wrapRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await api('/api/notifications')
      setItems(data.notifications)
      setUnread(data.unread)
    } catch {
      // stay quiet: the bell just keeps its last known state
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 60000)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    if (!open) return

    function onPointerDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle() {
    if (!open) load()
    setOpen(!open)
  }

  function openItem(n) {
    if (!n.read) {
      setItems((list) =>
        list.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      )
      setUnread((count) => Math.max(0, count - 1))
      api(`/api/notifications/${n.id}/read`, { method: 'POST' }).catch(() => {})
    }
    setOpen(false)
    
    const base = user.type === 'head' ? `/interns/${n.ownerId}` : '/'
    navigate(`${base}?date=${n.day}`)
  }

  function markAll() {
    setItems((list) => list.map((item) => ({ ...item, read: true })))
    setUnread(0)
    api('/api/notifications/read', { method: 'POST' }).catch(() => {})
  }

  return (
    <div className={tab ? 'bell-wrap tab-wrap' : 'bell-wrap'} ref={wrapRef}>
      <button
        type="button"
        className={tab ? 'tab-item' : 'bell-btn'}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
        }
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggle}
      >
        <Bell size={tab ? 22 : 20} />
        {tab && <span>Alerts</span>}
        {unread > 0 && (
          <span className="bell-badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>


      {open && (
        <div
          className="bell-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <div className="bell-panel">
          <div className="bell-head">
            <h2>Notifications</h2>
            {unread > 0 && (
              <button type="button" className="bell-markall" onClick={markAll}>
                Mark all as read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="bell-empty">
              Nothing yet. Comments and reactions will show up here.
            </p>
          ) : (
            <ul className="bell-list">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={n.read ? 'bell-item' : 'bell-item unread'}
                    onClick={() => openItem(n)}
                  >
                    <span>
                      <strong>{n.actor}</strong> {describe(n)}
                    </span>
                    <small>{timeAgo(n.createdAt)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell