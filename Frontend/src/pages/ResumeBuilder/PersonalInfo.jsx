import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MdPerson, MdEmail, MdPhone, MdCake, MdPublic,
  MdHome, MdLocationCity, MdMap, MdLink, MdEdit,
  MdCameraAlt, MdCheckCircle,
} from 'react-icons/md'
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa'
import { BsGlobe } from 'react-icons/bs'
import { useResume } from '../../context/ResumeContext'

const nationalities = ['Indian', 'American', 'British', 'Australian', 'Canadian', 'Other']
const countries     = ['India', 'USA', 'UK', 'Australia', 'Canada', 'Other']
const indianStates  = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Kerala',
]

export default function PersonalInfo() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const params     = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const {
    profileData, setProfileData,
    websites, setWebsites,
    setProfileSaved,
    resumeTitle,
    saveProfileToBackend,
    ensureResumeExists,
  } = useResume()

  // Ensure the correct template's data is active when entering this page
  const _piCtx = useResume()
  useEffect(() => {
    _piCtx?.switchTemplate?.(Number(templateId))
  }, [templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const [photo,   setPhoto]   = useState(profileData?.photo || null)
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const fileRef               = useRef()

  const [form, setForm] = useState({
    fullName:    profileData?.firstName
                   ? `${profileData.firstName} ${profileData.lastName}`.trim()
                   : 'Manasi Ithape',
    jobTitle:    profileData?.profession   || 'Frontend Developer',
    email:       profileData?.email        || 'manasiithape@gmail.com',
    phone:       profileData?.phone        || '+91 98765 43210',
    dob:         profileData?.dob          || '21/07/2003',
    nationality: profileData?.nationality  || 'Indian',
    address1:    profileData?.street       || '123, Pune - Mumbai Road',
    address2:    '',
    city:        profileData?.city         || 'Pune',
    state:       profileData?.state        || 'Maharashtra',
    pin:         '',
    country:     'India',
    linkedin:    websites?.linkedin        || 'https://www.linkedin.com/in/manasi-ithape',
    github:      websites?.github          || 'https://github.com/manasiithape',
    portfolio:   websites?.portfolio       || 'https://manasiithape.vercel.app',
    twitter:     '',
  })

  const update = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    // Keep context in sync as user types
    const nameParts = field === 'fullName' ? val.split(/\s+/) : null
    setProfileData(prev => ({
      ...prev,
      ...(field === 'fullName'   ? { firstName: nameParts?.[0] || '', lastName: nameParts?.slice(1).join(' ') || '' } : {}),
      ...(field === 'jobTitle'   ? { profession: val } : {}),
      ...(field === 'email'      ? { email: val } : {}),
      ...(field === 'phone'      ? { phone: val } : {}),
      ...(field === 'dob'        ? { dob: val } : {}),
      ...(field === 'nationality'? { nationality: val } : {}),
      ...(field === 'address1'   ? { street: val } : {}),
      ...(field === 'city'       ? { city: val } : {}),
      ...(field === 'state'      ? { state: val } : {}),
    }))
    if (['linkedin', 'github', 'portfolio'].includes(field)) {
      setWebsites(prev => ({ ...prev, [field]: val }))
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhoto(ev.target.result)
      setProfileData(prev => ({ ...prev, photo: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)

    // Sync context (already kept live via update(), but make sure)
    const currentProfile = {
      ...profileData,
      linkedin:  form.linkedin,
      github:    form.github,
      portfolio: form.portfolio,
    }
    setWebsites({ linkedin: form.linkedin, github: form.github, portfolio: form.portfolio, other: form.twitter })
    setProfileSaved(true)

    // Persist profile to backend
    try {
      await saveProfileToBackend(currentProfile)
    } catch (err) {
      console.error('Backend save failed (profile):', err)
    }

    // Also ensure a resume row exists in the DB so later sections can attach to it
    try {
      await ensureResumeExists(resumeTitle || 'Untitled Resume')
    } catch (err) {
      console.error('ensureResumeExists failed:', err)
    }

    setSaving(false)
    setSaved(true)
    const cameFromDashboard = location.state?.from === 'dashboard'
    setTimeout(() => {
      setSaved(false)
      navigate(
        cameFromDashboard
          ? '/app/dashboard'
          : `/app/resume-builder/experience?template=${templateId}`
      )
    }, 800)
  }

  return (
    <div className="p-4" style={{ background: '#f3f4f6', minHeight: '100vh' }}>

      {/* Page heading */}
      <h1 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Personal Information</h1>
      <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
        Add your personal details to create a professional identity.
      </p>

      <div className="row g-4">

        {/* ── LEFT — Form ── */}
        <div className="col-lg-8">

          {/* Basic Information */}
          <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <MdPerson size={20} color="#4f46e5" />
              <p className="fw-bold mb-0">Basic Information</p>
            </div>

            <div className="row g-3">
              {/* Photo Upload */}
              <div className="col-12 d-flex flex-column align-items-center mb-2">
                {/* hidden file input */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />

                {/* circular photo / placeholder */}
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    width: 96, height: 96, borderRadius: '50%',
                    border: '2.5px dashed #4f46e5',
                    background: photo ? 'transparent' : '#eef2ff',
                    cursor: 'pointer', overflow: 'hidden',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'box-shadow 0.2s',
                    boxShadow: '0 2px 10px rgba(79,70,229,0.12)',
                  }}
                  title="Click to upload photo"
                >
                  {photo
                    ? <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <MdPerson size={42} color="#a5b4fc" />
                  }

                  {/* camera overlay on hover */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(79,70,229,0.55)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                    color: '#fff',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <MdCameraAlt size={22} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, marginTop: 2 }}>Upload</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6, marginBottom: 0 }}>
                  {photo ? 'Click to change photo' : 'Click to upload photo'}
                </p>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: '0.7rem', color: '#ef4444',
                      cursor: 'pointer', padding: '2px 0', marginTop: 2,
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Full Name */}
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdPerson size={16} color="#9ca3af" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    value={form.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }}
                  />
                </div>
              </div>

              {/* Job Title */}
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Job Title / Profession</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdEdit size={16} color="#9ca3af" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    value={form.jobTitle}
                    onChange={e => update('jobTitle', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdEmail size={16} color="#9ca3af" />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdPhone size={16} color="#9ca3af" />
                  </span>
                  <input
                    type="tel"
                    className="form-control border-start-0"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }}
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Date of Birth</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdCake size={16} color="#9ca3af" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    value={form.dob}
                    onChange={e => update('dob', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    style={{ borderRadius: '0 8px 8px 0' }}
                  />
                </div>
              </div>

              {/* Nationality */}
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Nationality</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdPublic size={16} color="#9ca3af" />
                  </span>
                  <select
                    className="form-select border-start-0"
                    value={form.nationality}
                    onChange={e => update('nationality', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }}
                  >
                    {nationalities.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <MdLocationCity size={20} color="#4f46e5" />
              <p className="fw-bold mb-0">Address</p>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Address Line 1</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdHome size={16} color="#9ca3af" />
                  </span>
                  <input type="text" className="form-control border-start-0"
                    value={form.address1} onChange={e => update('address1', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Address Line 2 (Optional)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdHome size={16} color="#9ca3af" />
                  </span>
                  <input type="text" className="form-control border-start-0"
                    value={form.address2} onChange={e => update('address2', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>City</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdLocationCity size={16} color="#9ca3af" />
                  </span>
                  <input type="text" className="form-control border-start-0"
                    value={form.city} onChange={e => update('city', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>State</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdMap size={16} color="#9ca3af" />
                  </span>
                  <select className="form-select border-start-0"
                    value={form.state} onChange={e => update('state', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }}>
                    {indianStates.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>PIN Code</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>#</span>
                  </span>
                  <input type="text" className="form-control border-start-0"
                    value={form.pin} onChange={e => update('pin', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Country</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <MdPublic size={16} color="#9ca3af" />
                  </span>
                  <select className="form-select border-start-0"
                    value={form.country} onChange={e => update('country', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }}>
                    {countries.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <MdLink size={20} color="#4f46e5" />
              <p className="fw-bold mb-0">Additional Links</p>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>LinkedIn</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaLinkedin size={15} color="#0077b5" />
                  </span>
                  <input type="url" className="form-control border-start-0"
                    value={form.linkedin} onChange={e => update('linkedin', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>GitHub</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaGithub size={15} color="#333" />
                  </span>
                  <input type="url" className="form-control border-start-0"
                    value={form.github} onChange={e => update('github', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Portfolio Website</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <BsGlobe size={15} color="#4f46e5" />
                  </span>
                  <input type="url" className="form-control border-start-0"
                    value={form.portfolio} onChange={e => update('portfolio', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Twitter (Optional)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaTwitter size={15} color="#1da1f2" />
                  </span>
                  <input type="url" className="form-control border-start-0"
                    value={form.twitter} onChange={e => update('twitter', e.target.value)}
                    style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="d-flex justify-content-between gap-3">
            <button
              className="btn btn-outline-primary px-4 d-flex align-items-center gap-2"
              style={{ borderRadius: 12 }}
              onClick={() => navigate(-1)}
            >
              ← Previous
            </button>
            <button
              className="btn text-white px-4 d-flex align-items-center gap-2"
              style={{ background: saved ? '#22c55e' : '#4f46e5', borderRadius: 12, opacity: saving ? 0.7 : 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save & Next →'}
            </button>
          </div>
        </div>

        {/* ── RIGHT — Preview + Tips ── */}
        <div className="col-lg-4">

          {/* Profile Preview Card */}
          <div className="bg-white rounded-4 shadow-sm p-4 mb-4" style={{ background: 'linear-gradient(135deg,#eef2ff 0%,#fff 100%)' }}>
            {/* Avatar + name */}
            <div className="d-flex align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
              {photo
                ? <img src={photo} alt="Profile" className="rounded-circle"
                    style={{ width: 64, height: 64, objectFit: 'cover', border: '3px solid #4f46e5', flexShrink: 0 }} />
                : <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#eef2ff', border: '3px solid #4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <MdPerson size={32} color="#a5b4fc" />
                  </div>
              }
              <div>
                <p className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#1e293b' }}>{form.fullName || '—'}</p>
                <p className="mb-0" style={{ fontSize: '0.78rem', color: '#4f46e5' }}>{form.jobTitle || '—'}</p>
              </div>
            </div>

            {/* Preview details */}
            <div className="d-flex flex-column gap-2">
              {[
                { icon: <MdEmail size={14} color="#4f46e5" />, val: form.email },
                { icon: <MdPhone size={14} color="#4f46e5" />, val: form.phone },
                { icon: <MdCake size={14} color="#4f46e5" />, val: form.dob },
                { icon: <MdPublic size={14} color="#4f46e5" />, val: form.nationality },
              ].map(({ icon, val }, i) => (
                <div key={i} className="d-flex align-items-center gap-2">
                  {icon}
                  <span style={{ fontSize: '0.75rem', color: '#374151' }}>{val || '—'}</span>
                </div>
              ))}

              {/* Address */}
              <div className="d-flex align-items-start gap-2 mt-1">
                <MdHome size={14} color="#4f46e5" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.5 }}>
                  <div>{form.address1}</div>
                  {form.address2 && <div>{form.address2}</div>}
                  <div>{form.city}, {form.state} - {form.pin}</div>
                  <div>{form.country}</div>
                </div>
              </div>

              {/* Links */}
              <div className="d-flex flex-column gap-1 mt-1">
                {form.linkedin && (
                  <div className="d-flex align-items-center gap-2">
                    <FaLinkedin size={13} color="#0077b5" />
                    <span style={{ fontSize: '0.72rem', color: '#4f46e5' }}>
                      {form.linkedin.replace('https://', '')}
                    </span>
                  </div>
                )}
                {form.github && (
                  <div className="d-flex align-items-center gap-2">
                    <FaGithub size={13} color="#333" />
                    <span style={{ fontSize: '0.72rem', color: '#4f46e5' }}>
                      {form.github.replace('https://', '')}
                    </span>
                  </div>
                )}
                {form.portfolio && (
                  <div className="d-flex align-items-center gap-2">
                    <BsGlobe size={13} color="#4f46e5" />
                    <span style={{ fontSize: '0.72rem', color: '#4f46e5' }}>
                      {form.portfolio.replace('https://', '')}
                    </span>
                  </div>
                )}
                {form.twitter && (
                  <div className="d-flex align-items-center gap-2">
                    <FaTwitter size={13} color="#1da1f2" />
                    <span style={{ fontSize: '0.72rem', color: '#4f46e5' }}>
                      {form.twitter.replace('https://', '')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-4 shadow-sm p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: '1.1rem' }}>💡</span>
              <p className="fw-bold mb-0">Tips</p>
            </div>
            <div className="d-flex flex-column gap-2">
              {[
                'Use your real name as it appears on professional documents.',
                'Add a professional email address.',
                'Double-check your phone number and links.',
                'Keep your information up to date.',
              ].map((tip, i) => (
                <div key={i} className="d-flex align-items-start gap-2">
                  <MdCheckCircle size={16} color="#16a34a" className="flex-shrink-0 mt-1" />
                  <p className="mb-0" style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}