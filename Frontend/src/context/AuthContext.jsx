import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(null)
  const [token,           setToken]           = useState(localStorage.getItem('rb_token') || null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading,       setIsLoading]       = useState(true)   // true while verifying stored token

  /* ── Persist helpers ── */
  const persist = (accessToken, userData) => {
    localStorage.setItem('rb_token', accessToken)
    localStorage.setItem('rb_user',  JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const clear = () => {
    localStorage.removeItem('rb_token')
    localStorage.removeItem('rb_user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  /* ── On mount: verify stored token with /api/auth/me ── */
  useEffect(() => {
    const storedToken = localStorage.getItem('rb_token')
    if (!storedToken) { setIsLoading(false); return }

    authApi.me()
      .then(({ data }) => {
        setToken(storedToken)
        setUser(data)
        setIsAuthenticated(true)
      })
      .catch(() => clear())         // token expired or invalid — wipe it
      .finally(() => setIsLoading(false))
  }, [])

  /* ── login: called after a successful /api/auth/login or /signup response ── */
  const login = useCallback((accessToken, userData) => {
    persist(accessToken, userData)
  }, [])

  /* ── logout: clear state + storage ── */
  const logout = useCallback(() => {
    clear()
  }, [])

  const updateUser = useCallback((userData) => {
    localStorage.setItem('rb_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
