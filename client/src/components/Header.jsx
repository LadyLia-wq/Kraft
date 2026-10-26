import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
// import logo from '../assets/DevArpsLogo.png'
// import kraftLogo from '../assets/kraft-logo.svg'
import { NavLink, Link } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'

function Header () {

    const [confirmOpen, setConfirmOpen] = useState(false)
    const { user, signOut } = useAuth()

    return (
        <header className="app-header">
            {/* <img src={logo} alt="DevArps logo" height="32" /> */}
            {/* <span className="header-divider" aria-hidden="true" /> */}
            <img src="/kraft-logo.svg" alt="" height="32" />
            <h1>Kraft</h1>

            {user?.type === 'head' && (
                <nav className="header-nav">
                    <NavLink to="/" end>Interns</NavLink>
                    <NavLink to="/activity">Activity</NavLink>
                </nav>
            )}
            {user && (
                <div className="header-user">
                <Link to="/profile" className="header-avatar" aria-label="Your profile">
                    {(user.firstName[0] + user.lastName[0]).toUpperCase()}
                </Link>
                <span className="header-who">
                    {user.firstName} {user.lastName}
                    <small>{user.role}</small>
                </span>
                <button onClick={() => setConfirmOpen(true)}>Sign out</button>
                </div>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Sign out?"
                message="Are you sure you want to go ahead and sign out?"
                confirmLabel="Sign out"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={() => {
                    setConfirmOpen(false)
                    signOut()
                }}
                />
        </header>
    )
}

export default Header
