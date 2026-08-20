import { useEffect, useState } from 'react'
import { profileApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import { useResume } from '../../context/ResumeContext'

const inputStyle = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: '0.9rem',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function MyProfile() {
  const { user, updateUser } = useAuth()
  const { setProfileData } = useResume()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    professional_title: '',
    location: '',
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Load profile from backend on mount — user object from /me only has id/email/role
  useEffect(() => {
    profileApi.get()
      .then(({ data }) => {
        setForm({
          first_name:         data.first_name         || '',
          last_name:          data.last_name          || '',
          phone:              data.phone              || '',
          professional_title: data.professional_title || '',
          location:           data.location           || '',
        })
      })
      .catch(() => {
        // Profile doesn't exist yet — keep form empty so user can fill and create
      })
      .finally(() => setLoading(false))
  }, [])

  const updateField = (field, value) => {
    setForm(current => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setMessage('')
    setError('')
    setSaving(true)

    try {
      // Only send fields that exist in CandidateProfileUpdate.
      // first_name and last_name are required for create but optional for update.
      const payload = {
        first_name:         form.first_name.trim()         || undefined,
        last_name:          form.last_name.trim()          || undefined,
        phone:              form.phone.trim()              || undefined,
        professional_title: form.professional_title.trim() || undefined,
        location:           form.location.trim()           || undefined,
      }

      let data
      try {
        ;({ data } = await profileApi.update(payload))
      } catch (updateErr) {
        // Profile doesn't exist yet — create it instead.
        if (updateErr.response?.status === 404) {
          ;({ data } = await profileApi.create(payload))
        } else {
          throw updateErr
        }
      }

      updateUser(data)

      // Sync to ResumeContext so Navbar display name updates immediately
      setProfileData(prev => ({
        ...prev,
        firstName:  data.first_name         || prev.firstName  || '',
        lastName:   data.last_name          || prev.lastName   || '',
        phone:      data.phone              || prev.phone      || '',
        profession: data.professional_title || prev.profession || '',
        city:       data.location           || prev.city       || '',
      }))

      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Unable to update your profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#f3f4f6',
        padding: '32px 20px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#1e293b',
            margin: '0 0 6px',
          }}
        >
          My Profile
        </h1>

        <p
          style={{
            color: '#6b7280',
            fontSize: '0.9rem',
            margin: '0 0 20px',
          }}
        >
          Manage your account details.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
          }}
        >
          {loading && (
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Loading profile…
            </p>
          )}

          {/* First Name */}
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: 6,
            }}
          >
            First Name
          </label>
          <input
            style={inputStyle}
            type="text"
            value={form.first_name}
            onChange={event => updateField('first_name', event.target.value)}
            autoComplete="given-name"
            required
          />

          {/* Last Name */}
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#374151',
              margin: '16px 0 6px',
            }}
          >
            Last Name
          </label>
          <input
            style={inputStyle}
            type="text"
            value={form.last_name}
            onChange={event => updateField('last_name', event.target.value)}
            autoComplete="family-name"
            required
          />

          {/* Professional Title */}
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#374151',
              margin: '16px 0 6px',
            }}
          >
            Professional Title
          </label>
          <input
            style={inputStyle}
            type="text"
            value={form.professional_title}
            onChange={event => updateField('professional_title', event.target.value)}
            autoComplete="organization-title"
            placeholder="e.g. Software Engineer"
          />

          {/* Phone */}
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#374151',
              margin: '16px 0 6px',
            }}
          >
            Phone
          </label>
          <input
            style={inputStyle}
            type="tel"
            value={form.phone}
            onChange={event => updateField('phone', event.target.value)}
            autoComplete="tel"
            placeholder="e.g. +91 98765 43210"
          />

          {/* Location */}
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#374151',
              margin: '16px 0 6px',
            }}
          >
            Location
          </label>
          <input
            style={inputStyle}
            type="text"
            value={form.location}
            onChange={event => updateField('location', event.target.value)}
            autoComplete="address-level2"
            placeholder="e.g. Pune, Maharashtra"
          />

          {error && (
            <div
              role="alert"
              style={{
                color: '#b91c1c',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: 10,
                borderRadius: 8,
                marginTop: 16,
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              style={{
                color: '#166534',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: 10,
                borderRadius: 8,
                marginTop: 16,
                fontSize: '0.85rem',
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '11px 16px',
              border: 'none',
              borderRadius: 8,
              background: saving ? '#a5b4fc' : '#4f46e5',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

        </form>
      </div>
    </div>
  )
}