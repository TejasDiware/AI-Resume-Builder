import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import LandingNavbar from '../../components/LandingNavbar'
import { MdEmail, MdLock, MdOutlineDescription, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { authApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()
  const { login }       = useAuth()

  const [form,     setForm]     = useState({ email: '', password: '' })
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  /* ── Redirect target after login ── */
  const from = searchParams.get('from') || '/app/dashboard'

  /* ── Client-side validation ── */
  const validate = () => { 
    const e = {}
    if (!form.email.trim())                       e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))    e.email    = 'Enter a valid email address.'
    if (!form.password)                            e.password = 'Password is required.'
    return e
  }

  const handleChange = (field) => (ev) => {
    setForm({ ...form, [field]: ev.target.value })
    if (errors[field])  setErrors({ ...errors, [field]: '' })
    if (apiError)       setApiError('')
  }

  /* ── Submit → POST /api/auth/login ── */
  const handleSubmit = async (ev) => {
    ev.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setApiError('')

    try {
      /* ========================================================
        Step 1: Login and receive JWT
      ======================================================== */

      const { data } = await authApi.login(
        form.email.trim(),
        form.password
      )

      const accessToken = data.access_token

      if (!accessToken) {
        throw new Error('Login response did not contain an access token.')
      }

      /*
      * Temporarily store the token so that authApi.me()
      * can send Authorization: Bearer <token>.
      *
      * AuthContext.login() will persist the final session.
      */
      localStorage.setItem('rb_token', accessToken)

      /* ========================================================
        Step 2: Fetch authenticated user
      ======================================================== */

      const { data: userData } = await authApi.me()

      /* ========================================================
        Step 3: Store complete authenticated session
      ======================================================== */

      login(accessToken, userData)

      /* ========================================================
        Step 4: Redirect
      ======================================================== */

      navigate(from, { replace: true })

    } catch (err) {
      /* Never leave a broken token behind */
      localStorage.removeItem('rb_token')
      localStorage.removeItem('rb_user')

      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials and try again.'

      setApiError(
        typeof msg === 'string'
          ? msg
          : JSON.stringify(msg)
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <LandingNavbar />

      <div className="auth-page__body">
        {/* ── Left panel — form ── */}
        <div className="auth-card">
          <h2 className="auth-card__title">Login</h2>

{/* API error banner */}
          {apiError && (
            <div className="auth-api-error">
              <span>⚠ {apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-field__label">Email</label>
              <div className={`auth-field__wrap ${errors.email ? 'has-error' : ''}`}>
                <MdEmail size={18} className="auth-field__icon" />
                <input
                  type="email"
                  className="auth-field__input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="auth-field__error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <div className={`auth-field__wrap ${errors.password ? 'has-error' : ''}`}>
                <MdLock size={18} className="auth-field__icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-field__input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-field__toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.password && <p className="auth-field__error">{errors.password}</p>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Login'}
            </button>
          </form>

          <Link to="/forgot-password" className="auth-link auth-link--center">Forgot Password</Link>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
        </div>

        {/* ── Right panel — showcase ── */}
        <div className="auth-showcase">
          <div className="auth-showcase__overlay" />
          <div className="auth-showcase__content">
            <div className="auth-showcase__brand">
              <div className="auth-showcase__brand-icon">
                <MdOutlineDescription size={24} color="#fff" />
              </div>
              <span className="auth-showcase__brand-name">Resume Builder</span>
            </div>
            <p className="auth-showcase__tagline">
              Make a CV to define yourself the right away. Meet thousands of job
              announcements and employers by the help of your profile with a private
              extension, which you can share at all social media environments.
            </p>
            <Link to="/signup" className="auth-showcase__register-btn">Register</Link>
          </div>
          <div className="auth-showcase__card auth-showcase__card--1">
            <div className="auth-showcase__card-avatar" style={{ background: '#4f46e5' }}>JB</div>
            <div>
              <div style={{ height: 7, width: 80, background: '#e5e7eb', borderRadius: 3, marginBottom: 4 }} />
              <div style={{ height: 5, width: 55, background: '#f1f5f9', borderRadius: 3 }} />
            </div>
          </div>
          <div className="auth-showcase__card auth-showcase__card--2">
            <div className="auth-showcase__card-avatar" style={{ background: '#10b981' }}>MK</div>
            <div>
              <div style={{ height: 7, width: 70, background: '#e5e7eb', borderRadius: 3, marginBottom: 4 }} />
              <div style={{ height: 5, width: 50, background: '#f1f5f9', borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
