import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import { api } from '../api'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kraft_token')
    if (!token) {
      setLoading(false)
      return
    }
    api('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('kraft_token'))
      .finally(() => setLoading(false))
  }, [])

  async function signIn(email, password) {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    localStorage.setItem('kraft_token', data.token)
    setUser(data.user)
  }

  async function signUp(form) {
    await api('/api/auth/signup', { method: 'POST', body: form })
  }

  function signOut() {
    localStorage.removeItem('kraft_token')
    setUser(null)
  }

  return (
        <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updateUser: setUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider