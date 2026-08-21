import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BsCalendar3, BsPlusCircle } from 'react-icons/bs'
import { MdSave, MdDeleteOutline } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
  display: 'block',
}

const inputStyle = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: '0.85rem',
  color: '#1e293b',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

function Field({ label, children, required = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444', marginLeft: 6 }}>*</span>}</label>
      {children}
    </div>
  )
}

function DateField({ label, value, onChange, disabled = false, required = false }) {
  return (
    <Field label={label} required={required}>
        <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 10,
          top: '50%', transform: 'translateY(-50%)',
          color: '#9ca3af', pointerEvents: 'none', zIndex: 1,
        }}>
          <BsCalendar3 size={13} />
        </span>
        <input
          type="month"
          value={value ? String(value).slice(0, 7) : ''}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          style={{
            ...inputStyle,
            paddingLeft: 32,
            opacity: disabled ? 0.45 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = '#4f46e5' }}
          onBlur={e => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>
    </Field>
  )
}

const COMPANIES = [
  'Cubeage Technologies Services Pvt. Ltd.',
  'Devcons Software Solutions Pvt. Ltd.',
  'JDIT Software Solutions Pvt. Ltd.',
  'Neweage Cloud Solution Pvt. Ltd.',
  'NIMBJA SECURITY SOLUTIONS Pvt. Ltd.',
  'Penta Software Consultancy Services (I) Pvt Ltd',
  'Quick Management Services',
  'RP Business Solutions LLP',
  'Smart Software Services (I) Pvt. Ltd.',
  'SmartMatrix Digital Services Pvt. Ltd',
]

const emptyEntry = () => ({
  jobTitle:      '',
  employer:      '',
  employerOther: '',
  city:          '',
  state:         '',
  startDate:     '',
  endDate:       '',
  currentWork:   false,
  description:   '',
})

export default function Experience() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const params     = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const ctx = useResume()
  const {
    experiences: ctxExperiences, setExperiences, setExperienceSaved,
    currentResumeId, saveExperiencesToBackend,
  } = ctx

  const [entries, setEntries] = useState(() =>
    ctxExperiences?.length ? ctxExperiences.map(e => ({ ...emptyEntry(), ...e })) : [emptyEntry()]
  )
  const [saved,    setSaved]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  // Sync when context updates (e.g. after CV import)
  useEffect(() => {
    setEntries(
      ctxExperiences?.length
        ? ctxExperiences.map(e => ({ ...emptyEntry(), ...e }))
        : [emptyEntry()],
    )
  }, [ctxExperiences])

  const update = (index, field, val) =>
    setEntries(prev => {
      const next = prev.map((e, entryIndex) => entryIndex === index ? { ...e, [field]: val } : e)
      try { setExperiences([...next]) } catch (err) { /* ignore if context not ready */ }
      return next
    })

  const addEntry  = () => setEntries(prev => {
    const next = [...prev, emptyEntry()]
    try { setExperiences([...next]) } catch (err) {}
    return next
  })
  const removeEntry = index =>
    setEntries(prev => {
      const next = prev.length > 1 ? prev.filter((_, entryIndex) => entryIndex !== index) : prev
      try { setExperiences([...next]) } catch (err) {}
      return next
    })

  const handleSave = async () => {
    const problems = []
    entries.forEach((e, i) => {
      const missing = []
      if (!(e.jobTitle && e.jobTitle.trim())) missing.push('Job Title')
      if (!(e.employer && e.employer.trim())) missing.push('Company')
      if (!(e.startDate && e.startDate.trim())) missing.push('Start Date')
      if (missing.length) problems.push(`Experience #${i + 1}: ${missing.join(', ')}`)
    })

    if (problems.length) {
      setError('Please fill required fields:\n' + problems.join(' ; '))
      return
    }

    setError('')
    setSaving(true)
    try {
      const rid = currentResumeId
      if (!rid) throw new Error('Select or create a resume before saving experience.')
      await saveExperiencesToBackend(entries, rid)
      setExperienceSaved(true)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        navigate(`/app/resume-builder/education?template=${templateId}`)
      }, 800)
    } catch (err) {
      console.error('Backend save failed (experience):', err)
      setError(err.response?.data?.detail || err.message || 'Unable to save experience.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── LEFT: form ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', padding: '24px 20px' }}>

        <ResumeSectionTabs />

        {/* Heading */}
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>
          Work Experience
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 8 }}>
          Add your work experience details below.
        </p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 0, marginBottom: 16 }}>* Required fields</p>

        {entries.map((entry, idx) => (
          <div key={entry.id || `new-${idx}`} style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px 24px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            marginBottom: 20,
          }}>

            {/* Card header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>
                {entries.length > 1 ? `Experience #${idx + 1}` : 'Experience'}
              </p>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(idx)}
                  style={{
                    background: '#fef2f2', border: 'none', cursor: 'pointer',
                    color: '#ef4444', display: 'flex', alignItems: 'center',
                    gap: 4, fontSize: '0.78rem', fontWeight: 600,
                    borderRadius: 8, padding: '5px 10px',
                  }}
                >
                  <MdDeleteOutline size={16} /> Remove
                </button>
              )}
            </div>

            {/* Row 1 — Job Title | Company */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Field label="Job Title" required>
                <input
                  style={inputStyle}
                  type="text"
                  value={entry.jobTitle}
                  placeholder="e.g. Software Engineer"
                  onChange={e => update(idx, 'jobTitle', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                />
              </Field>

              <Field label="Company" required>
                {/* Dropdown — lists the 10 known companies + "Other" */}
                <select
                  style={inputStyle}
                  value={COMPANIES.includes(entry.employer) ? entry.employer : '__other__'}
                  onChange={e => {
                    const val = e.target.value
                    if (val !== '__other__') {
                      // Known company selected — fill employer directly
                      update(idx, 'employer', val)
                    } else {
                      // "Other" selected — blank out so the text input appears empty
                      update(idx, 'employer', '')
                    }
                  }}
                  onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                >
                  <option value="__other__" disabled>— Select company —</option>
                  {COMPANIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__other__">Other (type manually)</option>
                </select>

                {/* Free-text input — shown when the employer is not in the predefined list */}
                {!COMPANIES.includes(entry.employer) && (
                  <input
                    type="text"
                    style={{ ...inputStyle, marginTop: 8 }}
                    value={entry.employer}
                    placeholder="Enter company name"
                    onChange={e => update(idx, 'employer', e.target.value)}
                    onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                  />
                )}
              </Field>
            </div>

            {/* Row 2 — City | State */}
            {/* Row 3 — Start Date | End Date | Ongoing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 6 }}>
              <DateField
                label="Start Date"
                required
                value={entry.startDate}
                onChange={val => update(idx, 'startDate', val)}
              />
              <DateField
                label="End Date"
                value={entry.currentWork ? '' : entry.endDate}
                onChange={val => update(idx, 'endDate', val)}
                disabled={entry.currentWork}
              />
            </div>

            {/* Ongoing checkbox — aligned under End Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div /> {/* empty spacer under Start Date */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', fontSize: '0.78rem',
                color: '#6b7280', fontWeight: 500,
              }}>
                <input
                  type="checkbox"
                  id={`current-${entry.id || idx}`}
                  checked={entry.currentWork}
                  onChange={e => update(idx, 'currentWork', e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#4f46e5', cursor: 'pointer', flexShrink: 0 }}
                />
                I currently work here
              </label>
            </div>

            {/* Description */}
            <Field label="Description (Optional)">
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 90, lineHeight: 1.6 }}
                value={entry.description}
                placeholder="Describe your role and key responsibilities..."
                onChange={e => update(idx, 'description', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')}
              />
            </Field>

          </div>
        ))}

        {error && (
          <div style={{ color: '#dc2626', background: '#fff7f7', padding: 10, borderRadius: 8, border: '1px solid #fecaca', marginBottom: 12, whiteSpace: 'pre-wrap' }}>{error}</div>
        )}

        {/* Add Another Experience */}
        <button
          onClick={addEntry}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%',
            background: '#fff', border: '1.5px dashed #4f46e5',
            borderRadius: 12, padding: '11px 20px',
            color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', marginBottom: 24,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#eef2ff')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
        >
          <BsPlusCircle size={16} />
          Add Another Experience
        </button>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, gap: 12 }}>
          <button onClick={() => navigate(`/app/profile?template=${templateId}`)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: '2px solid #4f46e5', background: '#fff', color: '#4f46e5', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            ← Previous
          </button>
          <button onClick={handleSave}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: 'none', background: saved ? '#22c55e' : '#4f46e5', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.3s', opacity: saving ? 0.7 : 1 }}
            disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>

      </div>

      {/* ── RIGHT: live preview ── */}
      <LivePreviewPanel />
    </div>
  )
}
