import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdCameraAlt, MdPerson } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'

const labelStyle = {
  fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block',
}

const inputStyle = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8,
  padding: '9px 12px', fontSize: '0.85rem', color: '#1e293b', outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.2s',
}

const normalizeLanguages = (languages = []) => languages
  .filter(Boolean)
  .map(language => typeof language === 'string'
    ? { language, proficiency: '' }
    : { language: language.language || '', proficiency: language.proficiency || '' })
  .filter(item => item.language)

function Field({ label, children, required = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444', marginLeft: 6 }}>*</span>}</label>
      {children}
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const rawTemplate = params.get('template')
  const templateId = rawTemplate || '1'

  const ctx = useResume()
  const { profileData, setProfileData, setProfileSaved,
          saveProfileToBackend, ensureResumeExists, resumeTitle, websites } = ctx

  // Guard: only redirect if coming from resume-builder flow (template param present)
  // AND somehow the template value is empty. Direct navigation (/app/profile) is
  // always allowed — rawTemplate will be null in that case so we skip the guard.
  useEffect(() => {
    if (rawTemplate !== null && !rawTemplate) {
      // template param exists but is empty string — send back to template picker
      navigate('/app/templates')
    }
  }, [rawTemplate, navigate])

  // Show banner when redirected here because profile was incomplete
  const wasBlocked = params.get('incomplete') === '1'

  const [form, setForm] = useState({
    firstName: profileData?.firstName || '',
    middleName: profileData?.middleName || '',
    lastName: profileData?.lastName || '',
    dob: profileData?.dob || '',
    profession: profileData?.profession || '',
    languages: normalizeLanguages(profileData?.languages?.length ? profileData.languages : [profileData?.language]),
    street: profileData?.street || '',
    city: profileData?.city || '',
    state: profileData?.state || '',
    phone: profileData?.phone || '',
    email: profileData?.email || '',
    photo: profileData?.photo || '',
  })

  useEffect(() => {
    if (!profileData) return
    setForm({
      firstName: profileData.firstName || '',
      middleName: profileData.middleName || '',
      lastName: profileData.lastName || '',
      dob: profileData.dob || '',
      profession: profileData.profession || '',
      languages: normalizeLanguages(profileData.languages?.length ? profileData.languages : [profileData.language]),
      street: profileData.street || '',
      city: profileData.city || '',
      state: profileData.state || '',
      phone: profileData.phone || '',
      email: profileData.email || '',
      photo: profileData.photo || '',
    })
  }, [profileData])

  const today = new Date().toISOString().split('T')[0]

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [languageName, setLanguageName] = useState('')
  const [proficiency, setProficiency] = useState('')
  const [editingLanguage, setEditingLanguage] = useState(null)
  const fileRef = useRef()

  const update = (field, val) => {
    const next = { ...form, [field]: val }
    setForm(next)
    setProfileData(next)
  }

  const saveLanguage = () => {
    if (!languageName) return
    const nextLanguage = { language: languageName, proficiency }
    const languages = editingLanguage === null
      ? [...form.languages, nextLanguage]
      : form.languages.map((item, index) => index === editingLanguage ? nextLanguage : item)
    update('languages', languages)
    setLanguageName('')
    setProficiency('')
    setEditingLanguage(null)
  }

  const editLanguage = (item, index) => {
    setLanguageName(item.language)
    setProficiency(item.proficiency)
    setEditingLanguage(index)
  }

  const deleteLanguage = (index) => update('languages', form.languages.filter((_, itemIndex) => itemIndex !== index))

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => update('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    const missing = []
    if (!(form.firstName && form.firstName.trim())) missing.push('First Name')
    if (!(form.lastName && form.lastName.trim())) missing.push('Last Name')
    if (!(form.profession && form.profession.trim())) missing.push('Profession')
    if (!(form.dob && form.dob.trim())) missing.push('Date of Birth')
    if (!(form.city && form.city.trim())) missing.push('City')
    if (!(form.state && form.state.trim())) missing.push('State')
    const hasContact = (form.email && form.email.trim()) || (form.phone && form.phone.trim())
    if (!hasContact) missing.push('Email or Phone')

    if (missing.length) {
      setError('Please fill required fields: ' + missing.join(', '))
      return
    }

    setError('')
    setProfileData({ ...form })
    setProfileSaved(true)

    // Persist to backend — merge current websites context so linkedin/github/portfolio are included
    try {
      await saveProfileToBackend({
        ...form,
        linkedin:  websites?.linkedin  || '',
        github:    websites?.github    || '',
        portfolio: websites?.portfolio || '',
      })
    } catch (err) {
      console.error('Backend save failed (profile):', err)
    }

    // Ensure a resume row exists so later sections can attach data to it
    try {
      await ensureResumeExists(resumeTitle || `${form.firstName} ${form.lastName}`.trim() || 'Untitled Resume')
    } catch (err) {
      console.error('ensureResumeExists failed:', err)
    }

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(`/app/resume-builder/experience?template=${templateId}`)
    }, 700)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', padding: '24px 20px' }}>
        <ResumeSectionTabs />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>Profile</h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 8 }}>Fill in your personal information below.</p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 0, marginBottom: 16 }}>* Required fields</p>

        {/* Banner shown when user tried to skip profile */}
        {wasBlocked && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: '#fff7ed', border: '1.5px solid #fb923c',
            borderRadius: 10, padding: '12px 16px', marginBottom: 18,
            maxWidth: 820, width: '100%', margin: '0 auto 18px',
          }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#9a3412' }}>
                Complete your Profile first
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#c2410c' }}>
                Please fill in all required fields below and click <strong>Save</strong> before moving to the next section.
              </p>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', maxWidth: 820, width: '100%', margin: '0 auto' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <div onClick={() => fileRef.current.click()} style={{ width: 96, height: 96, borderRadius: '50%', border: form.photo ? 'none' : '2.5px solid rgba(79,70,229,0.15)', background: form.photo ? 'transparent' : '#eef2ff', cursor: 'pointer', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: form.photo ? '0 2px 12px rgba(0,0,0,0.12)' : 'none' }} title="Click to upload photo">
              {form.photo ? <img src={form.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <MdPerson size={44} color="#a5b4fc" />}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(79,70,229,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', color: '#fff' }} onMouseEnter={e => (e.currentTarget.style.opacity = 1)} onMouseLeave={e => (e.currentTarget.style.opacity = 0)}>
                <MdCameraAlt size={22} />
                <span style={{ fontSize: '0.58rem', fontWeight: 700, marginTop: 3, letterSpacing: 0.5 }}>UPLOAD</span>
              </div>
              {form.photo && (
                <button type="button" onClick={e => { e.stopPropagation(); update('photo', '') }} aria-label="Remove photo" style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444', border: 'none', color: '#fff', borderRadius: 999, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700 }}>×</button>
              )}
            </div>
            {form.photo && <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8, marginBottom: 0 }}>Click to change photo</p>}
            {form.photo && (
              <button type="button" onClick={() => update('photo', '')} style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#ef4444', cursor: 'pointer', padding: '2px 0', marginTop: 2 }}>Remove photo</button>
            )}
          </div>

          <Field label="First Name" required>
            <input style={inputStyle} type="text" value={form.firstName} placeholder="e.g. Manasi" onChange={e => update('firstName', e.target.value)} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
          </Field>

          <Field label="Last Name" required>
            <input style={inputStyle} type="text" value={form.lastName} placeholder="e.g. Ithape" onChange={e => update('lastName', e.target.value)} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
            <Field label="Middle Name (Optional)">
              <input style={inputStyle} type="text" value={form.middleName} onChange={e => update('middleName', e.target.value)} />
            </Field>
            <Field label="Date of Birth" required>
              <input style={inputStyle} type="date" value={form.dob} max={today} onChange={e => update('dob', e.target.value)} />
            </Field>
          </div>

          <div style={{ marginTop: 12 }}>
            <Field label="Profession" required><input style={inputStyle} type="text" value={form.profession} onChange={e => update('profession', e.target.value)} /></Field>
          </div>

          <div style={{ marginTop: 18, borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#1e293b' }}>Languages</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <Field label="Language">
                <select style={inputStyle} value={languageName} onChange={e => setLanguageName(e.target.value)}>
                  <option value="">Select language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Proficiency">
                <select style={inputStyle} value={proficiency} onChange={e => setProficiency(e.target.value)}>
                  <option value="">Select proficiency</option>
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Professional">Professional</option>
                  <option value="Basic">Basic</option>
                </select>
              </Field>
              <button type="button" onClick={saveLanguage} disabled={!languageName || !proficiency} style={{ padding: '10px 14px', border: 'none', borderRadius: 8, background: languageName && proficiency ? '#4f46e5' : '#a5b4fc', color: '#fff', fontWeight: 700, cursor: languageName && proficiency ? 'pointer' : 'not-allowed', marginBottom: 1 }}>{editingLanguage === null ? '+ Add Language' : 'Save'}</button>
            </div>
            {form.languages.length > 0 && <div style={{ marginTop: 14, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {form.languages.map((item, index) => <div key={`${item.language}-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'center', padding: '10px 12px', borderBottom: index === form.languages.length - 1 ? 'none' : '1px solid #e5e7eb', fontSize: '0.82rem', color: '#374151' }}><span>{item.language}</span><span>{item.proficiency}</span><span style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => editLanguage(item, index)} style={{ border: 'none', background: 'transparent', color: '#4f46e5', cursor: 'pointer', fontWeight: 700 }}>Edit</button><button type="button" onClick={() => deleteLanguage(index)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>Delete</button></span></div>)}
            </div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
            <Field label="Phone" required><input style={inputStyle} type="tel" value={form.phone} placeholder="e.g. +91 98765 43210" onChange={e => update('phone', e.target.value)} /></Field>
            <Field label="Email" required><input style={inputStyle} type="email" value={form.email} placeholder="e.g. you@email.com" onChange={e => update('email', e.target.value)} /></Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
            <Field label="City" required><input style={inputStyle} type="text" value={form.city} onChange={e => update('city', e.target.value)} /></Field>
            <Field label="State / Province" required><input style={inputStyle} type="text" value={form.state} onChange={e => update('state', e.target.value)} /></Field>
          </div>

          {/* Address removed per request */}

          {error && <div style={{ color: '#dc2626', background: '#fff7f7', padding: 10, borderRadius: 8, border: '1px solid #fecaca', marginTop: 12 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f3f4f6', gap: 12, marginTop: 12 }}>
            <button disabled style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: '2px solid #e5e7eb', background: '#f9fafb', color: '#d1d5db', cursor: 'not-allowed' }}>← Previous</button>
            <button onClick={handleSave} style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: 'none', background: saved ? '#22c55e' : '#4f46e5', color: '#fff', cursor: 'pointer' }}>{saved ? '✓ Saved' : 'Save'}</button>
          </div>
        </div>
      </div>

      {/* Right preview */}
      <LivePreviewPanel />
    </div>
  )
}
  
