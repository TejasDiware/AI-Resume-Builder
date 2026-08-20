/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * - While the token is being verified with /api/auth/me on mount,
 *   shows a full-screen spinner so there's no flash-redirect.
 * - If not authenticated, redirects to /login?from=<current path>
 *   so the user lands back here after logging in.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  /* Still verifying the stored token — don't redirect yet */
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#f3f4f6',
      }}>
        <div style={{
          width: 44, height: 44,
          border: '4px solid #e0e7ff',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from=${returnTo}`} replace />
  }

  return <Outlet />
}
