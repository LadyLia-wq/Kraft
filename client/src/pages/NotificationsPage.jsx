import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import { describe } from '../components/NotificationBell'

function timeAgo(value) {
  const secs = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

const changed = () => window.dispatchEvent(new Event('notifications-changed'))

function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await api('/api/notifications')
      setItems(data.notifications)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isUnread = (n) => !n.read

  async function openItem(n) {
    if (isUnread(n)) {
      try {
        await api(`/api/notifications/${n.id}/read`, { method: 'POST' })
        changed()
      } catch {
        /* still navigate */
      }
    }
    const ownerId = n.ownerId
    navigate(
      user.type === 'head'
        ? `/interns/${ownerId}?date=${n.day}`
        : `/?date=${n.day}`
    )
  }

  async function markAll() {
    try {
      await api('/api/notifications/read', { method: 'POST' })
      changed()
      load()
    } catch {
      /* ignore */
    }
  }

  const unreadCount = items.filter(isUnread).length

  return (
    <main className="notif-page">
      <div className="notif-page-head">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button type="button" className="notif-markall" onClick={markAll}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="notif-empty">Loading…</p>
      ) : items.length === 0 ? (
        <div className="notif-empty">
          <Bell size={28} />
          <p>You're all caught up.</p>
        </div>
      ) : (
        <ul className="notif-list">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={isUnread(n) ? 'notif-card unread' : 'notif-card'}
                onClick={() => openItem(n)}
              >
                <span className="notif-text">
                  <strong>{n.actor}</strong> {describe(n)}
                </span>
                <span className="notif-time">
                  {timeAgo(n.createdAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default NotificationsPage