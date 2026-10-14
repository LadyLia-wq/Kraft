import { NavLink } from 'react-router-dom'
import kraftLogo from '../assets/kraft-logo.svg'

function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-topbar">
        <img src={kraftLogo} alt="" width="34" height="34" />
        <span className="auth-brand">Kraft</span>
      </div>

      <div className="auth-grid">
        <div className="auth-left">
          <nav className="auth-toggle" aria-label="Sign in or sign up">
            <NavLink to="/signin">Sign in</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </nav>
          {children}
        </div>

        <div className="auth-right">
          <div className="auth-arch">
            <img src={kraftLogo} alt="" width="84" height="84" />
            <p className="auth-tagline">Your week, in one place</p>
            <p className="auth-sub">Internship Report Portal</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout