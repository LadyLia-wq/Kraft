import { useState, useEffect, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { House, Users, Activity, User, Bell } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api'

function BottomNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [unread, setUnread] = useState(0)

  const loadUnread = useCallback(async () => {
    try {
      const data = await api('/api/notifications')
      setUnread(data.unread ?? 0)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!user) return
    loadUnread()
    const timer = setInterval(loadUnread, 60000)
    window.addEventListener('notifications-changed', loadUnread)
    return () => {
      clearInterval(timer)
      window.removeEventListener('notifications-changed', loadUnread)
    }
  }, [user, loadUnread])

  useEffect(() => {
    if (user) loadUnread()
  }, [pathname, user, loadUnread])

  if (!user) return null

  const isHead = user.type === 'head'
  const onInterns = pathname === '/' || pathname.startsWith('/interns')

  return (
    <>
      <div className="bottom-nav-spacer" aria-hidden="true" />
      <nav className="bottom-nav" aria-label="Main">
        {isHead ? (
          <>
            <NavLink
              to="/"
              end
              className={onInterns ? 'tab-item active' : 'tab-item'}
            >
              <Users size={22} />
              <span>Interns</span>
            </NavLink>
            <NavLink to="/activity" className="tab-item">
              <Activity size={22} />
              <span>Activity</span>
            </NavLink>
          </>
        ) : (
          <NavLink to="/" end className="tab-item">
            <House size={22} />
            <span>Board</span>
          </NavLink>
        )}

        <NavLink
          to="/notifications"
          className="tab-item"
          aria-label={
            unread > 0 ? `Alerts, ${unread} unread` : 'Alerts'
          }
        >
          <Bell size={22} />
          <span>Alerts</span>
          {unread > 0 && (
            <span className="bell-badge" aria-hidden="true">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </NavLink>

        <NavLink to="/profile" className="tab-item">
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  )
}

export default BottomNav