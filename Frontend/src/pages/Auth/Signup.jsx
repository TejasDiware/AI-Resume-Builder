import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LandingNavbar from '../../components/LandingNavbar'
import { MdEmail, MdLock, MdPerson, MdOutlineDescription, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { authApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

export default function Signup() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,  setLoading]  = useState(false)

  /* ── Client-side validation ── */
  const validate = () => {
    const e = {}
    if (!form.name.trim())                          e.name     = 'Full name is required.'
    if (!form.email.trim())                         e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email    = 'Enter a valid email address.'
    if (!form.password)                             e.password = 'Password is required.'
    else if (form.password.length < 8)              e.password = 'Password must be at least 8 characters.'
    if (!form.confirm)                              e.confirm  = 'Please confirm your password.'
    else if (form.confirm !== form.password)        e.confirm  = 'Passwords do not match.'
    return e
  }

  const handleChange = (field) => (ev) => {
    setForm({ ...form, [field]: ev.target.value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
    if (apiError)      setApiError('')
  }

  /* ── Submit → POST /api/auth/register, then POST /api/auth/login ── */
  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setApiError('')

    try {
      // Step 1: register — returns UserResponse (no token)
      await authApi.signup(form.email, form.password)

      // Step 2: login to obtain access token
      const { data } = await authApi.login(form.email, form.password)
      // Store token first so the /me request is authenticated
      localStorage.setItem('rb_token', data.access_token)
      // TokenResponse has no user — fetch profile via /me
      const { data: userData } = await authApi.me()
      login(data.access_token, userData)
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Signup failed. This email may already be registered.'
      setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  /* ── Password strength ── */
  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6)          s++
    if (/[A-Z]/.test(p))        s++
    if (/[0-9]/.test(p))        s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][strength]

  return (
    <div className="auth-page">
      <LandingNavbar />

      <div className="auth-page__body">
        {/* ── Left panel — form ── */}
        <div className="auth-card auth-card--signup">
          <h2 className="auth-card__title">Create Account</h2>
          <p className="auth-card__sub">Join thousands building standout resumes.</p>

{/* API error banner */}
          {apiError && (
            <div className="auth-api-error">
              <span>⚠ {apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full name */}
            <div className="auth-field">
              <label className="auth-field__label">Full Name</label>
              <div className={`auth-field__wrap ${errors.name ? 'has-error' : ''}`}>
                <MdPerson size={18} className="auth-field__icon" />
                <input
                  type="text"
                  className="auth-field__input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange('name')}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="auth-field__error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-field__label">Email Address</label>
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
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange('password')}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-field__toggle"
                  onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="auth-strength">
                  <div className="auth-strength__bars">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="auth-strength__bar"
                        style={{ background: i <= strength ? strengthColor : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="auth-strength__label" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
              {errors.password && <p className="auth-field__error">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-field__label">Confirm Password</label>
              <div className={`auth-field__wrap ${errors.confirm ? 'has-error' : ''}`}>
                <MdLock size={18} className="auth-field__icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-field__input"
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={handleChange('confirm')}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-field__toggle"
                  onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm">
                  {showConfirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.confirm && <p className="auth-field__error">{errors.confirm}</p>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Login</Link>
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
            <Link to="/login" className="auth-showcase__register-btn">Login Instead</Link>
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
