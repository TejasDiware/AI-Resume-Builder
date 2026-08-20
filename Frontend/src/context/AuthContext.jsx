import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import { authApi } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('rb_user')

    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser)
    } catch {
      localStorage.removeItem('rb_user')
      return null
    }
  })

  const [token, setToken] = useState(
    () => localStorage.getItem('rb_token') || null
  )

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('rb_token'))
  )

  const [isLoading, setIsLoading] = useState(true)

  /* ==========================================================
     Clear authentication state
  ========================================================== */

  const clear = useCallback(() => {
    localStorage.removeItem('rb_token')
    localStorage.removeItem('rb_user')

    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  /* ==========================================================
     Persist authentication state
  ========================================================== */

  const persist = useCallback((accessToken, userData) => {
    localStorage.setItem('rb_token', accessToken)
    localStorage.setItem('rb_user', JSON.stringify(userData))

    setToken(accessToken)
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  /* ==========================================================
     Verify stored token when application starts
  ========================================================== */

  useEffect(() => {
    const storedToken = localStorage.getItem('rb_token')

    if (!storedToken) {
      setIsLoading(false)
      return
    }

    authApi
      .me()
      .then(({ data }) => {
        persist(storedToken, data)
      })
      .catch(() => {
        clear()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [clear, persist])

  /* ==========================================================
     Listen for global 401 / unauthorized events
  ========================================================== */

  useEffect(() => {
    const handleUnauthorized = () => {
      clear()
    }

    window.addEventListener(
      'rb:unauthorized',
      handleUnauthorized
    )

    return () => {
      window.removeEventListener(
        'rb:unauthorized',
        handleUnauthorized
      )
    }
  }, [clear])

  /* ==========================================================
     Login
  ========================================================== */

  const login = useCallback(
    (accessToken, userData) => {
      persist(accessToken, userData)
    },
    [persist]
  )

  /* ==========================================================
     Logout
  ========================================================== */

  const logout = useCallback(() => {
    clear()
  }, [clear])

  /* ==========================================================
     Update user
  ========================================================== */

  const updateUser = useCallback((userData) => {
    localStorage.setItem(
      'rb_user',
      JSON.stringify(userData)
    )

    setUser(userData)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside <AuthProvider>'
    )
  }

  return context
}