import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import RequireAuth from './components/RequireAuth'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import BoardPage from './pages/BoardPage'
import HeadHomePage from './pages/HeadHomePage'
import { useAuth } from './auth/AuthContext'
import './App.css'
import RequireHead from './components/RequireHead'
import InternBoardPage from './pages/InternBoardPage'
import ActivityPage from './pages/ActivityPage'

function Home() {
  const { user } = useAuth()
  return user.type === 'head' ? <HeadHomePage /> : <BoardPage />
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/interns/:id"
          element={
            <RequireAuth>
              <RequireHead>
                <InternBoardPage />
              </RequireHead>
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/activity"
          element={
            <RequireAuth>
              <RequireHead>
                <ActivityPage />
              </RequireHead>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App