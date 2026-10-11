import { useAuth } from '../auth/AuthContext'
import logo from '../assets/DevArpsLogo.png'
import { NavLink } from 'react-router-dom'

function Header () {

    const { user, signOut } = useAuth()
    return (
        <header className="app-header">
            <img src={logo} alt="DevArps logo" height="30" />
            <h1>Kraft</h1>
            {user?.type === 'head' && (
                <nav className="header-nav">
                    <NavLink to="/" end>Interns</NavLink>
                    <NavLink to="/activity">Activity</NavLink>
                </nav>
            )}
            {user && (
                <div className="header-user">
                    <span>
                    {user.firstName} {user.lastName} · {user.role}
                    </span>
                    <button onClick={signOut}>Sign out</button>
                </div>
            )}
        </header>
    )
}

export default Header
