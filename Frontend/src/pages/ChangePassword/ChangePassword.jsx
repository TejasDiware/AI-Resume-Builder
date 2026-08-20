import { useState } from 'react'

const inputStyle = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8,
  padding: '10px 12px', fontSize: '0.9rem', color: '#1e293b', outline: 'none',
  boxSizing: 'border-box',
}

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    setSaving(true)
    try {
      // Backend does not currently expose a change-password endpoint.
      // Show a friendly message instead of crashing.
      await Promise.reject({ response: { data: { detail: 'Change password is not available yet. Please contact support.' } } })
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to change password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f6', padding: '32px 20px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>Change Password</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px' }}>Use a new password with at least 6 characters.</p>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Current Password</label>
          <input style={inputStyle} type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} autoComplete="current-password" required />

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', margin: '16px 0 6px' }}>New Password</label>
          <input style={inputStyle} type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} autoComplete="new-password" minLength="6" required />

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', margin: '16px 0 6px' }}>Confirm New Password</label>
          <input style={inputStyle} type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength="6" required />

          {error && <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: 10, borderRadius: 8, marginTop: 16, fontSize: '0.85rem' }}>{error}</div>}
          {success && <div role="status" style={{ color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 10, borderRadius: 8, marginTop: 16, fontSize: '0.85rem' }}>{success}</div>}

          <button type="submit" disabled={saving} style={{ width: '100%', marginTop: 20, padding: '11px 16px', border: 'none', borderRadius: 8, background: saving ? '#a5b4fc' : '#4f46e5', color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
