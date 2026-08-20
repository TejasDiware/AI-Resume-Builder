import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BsPlusCircle } from 'react-icons/bs'
import { MdSave, MdDeleteOutline, MdCheckCircle } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'

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

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
  display: 'block',
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 14 }}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const emptyEntry = () => ({
  id:          Date.now() + Math.random(),
  institution: '',
  degree:      '',
  startYear:   '',
  endYear:     '',
  cgpa:        '',
})

export default function Education() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const params     = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const { education: ctxEducation, setEducation, setEducationSaved,
          ensureResumeExists, saveEducationToBackend, resumeTitle } = useResume()

  const mapCtx = (e) => ({
    id:          Date.now() + Math.random(),
    institution: e.institution || e.schoolName || '',
    degree:      [e.degree, e.fieldStudy].filter(Boolean).join(' – ') || '',
    startYear:   e.startYear  || e.startDate  || '',
    endYear:     e.endYear    || e.endDate    || '',
    cgpa:        e.cgpa       || e.score      || '',
  })

  const [entries, setEntries] = useState(() =>
    ctxEducation?.length ? ctxEducation.map(mapCtx) : [emptyEntry()]
  )
  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // Sync on CV import
  useEffect(() => {
    if (!ctxEducation?.length) return

    // Do not replace locally edited entries when this page writes the same
    // values back to context. Replacing them recreates each input and steals
    // its focus after every keystroke.
    setEntries(currentEntries => {
      const incomingEntries = ctxEducation.map(mapCtx)
      const unchanged = currentEntries.length === incomingEntries.length && currentEntries.every((entry, index) => {
        const incoming = incomingEntries[index]
        return entry.institution === incoming.institution &&
          entry.degree === incoming.degree &&
          entry.startYear === incoming.startYear &&
          entry.endYear === incoming.endYear &&
          entry.cgpa === incoming.cgpa
      })

      return unchanged ? currentEntries : incomingEntries
    })
  }, [ctxEducation])

  const update = (id, field, val) =>
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, [field]: val } : e)
      try {
        const mapped = next.map(e => ({
          institution: e.institution,
          degree:      e.degree,
          startYear:   e.startYear,
          endYear:     e.endYear,
          cgpa:        e.cgpa,
          schoolName:  e.institution,
          fieldStudy:  '',
          city:        '',
          state:       '',
        }))
        setEducation(mapped)
      } catch (err) {}
      return next
    })

  const addEntry    = () => setEntries(prev => [...prev, emptyEntry()])
  const removeEntry = (id) =>
    setEntries(prev => {
      const next = prev.length > 1 ? prev.filter(e => e.id !== id) : prev
      try {
        const mapped = next.map(e => ({
          institution: e.institution,
          degree:      e.degree,
          startYear:   e.startYear,
          endYear:     e.endYear,
          cgpa:        e.cgpa,
          schoolName:  e.institution,
          fieldStudy:  '',
          city:        '',
          state:       '',
        }))
        setEducation(mapped)
      } catch (err) {}
      return next
    })

  const handleSave = async () => {
    const problems = []
    entries.forEach((e, i) => {
      const missing = []
      if (!(e.institution && e.institution.trim())) missing.push('Institution')
      if (!(e.degree && e.degree.trim())) missing.push('Degree')
      if (!(e.startYear && e.startYear.trim())) missing.push('Start Year')
      if (!(e.endYear && e.endYear.trim())) missing.push('End Year')
      // cgpa is UI-only, not required by backend
      if (missing.length) problems.push(`Education #${i + 1}: ${missing.join(', ')}`)
    })

    if (problems.length) {
      setError('Please fill required fields:\n' + problems.join(' ; '))
      return
    }

    setError('')
    setSaving(true)

    const mapped = entries.map(e => ({
      institution: e.institution,
      degree:      e.degree,
      startYear:   e.startYear,
      endYear:     e.endYear,
      cgpa:        e.cgpa,
      schoolName:  e.institution,
      fieldStudy:  '',
      city:        '',
      state:       '',
    }))

    // Always save to localStorage first (offline-safe)
    setEducation(mapped)

    // Persist to backend
    // EducationCreate: institution, degree, field_of_study, start_date, end_date, description
    // cgpa and year strings must be converted to date strings (YYYY-MM-DD) or null
    try {
      const rid = await ensureResumeExists(resumeTitle || 'Untitled Resume')
      if (rid) {
        // Build backend-compatible payload for each entry
        const backendEntries = entries.map(e => {
          // Convert "2020", "2020-2024", "Present" etc. to YYYY-MM-DD or null
          const toDate = (val) => {
            if (!val || val.toString().toLowerCase() === 'present') return null
            const year = val.toString().match(/\d{4}/)?.[0]
            return year ? `${year}-01-01` : null
          }

          // degree field holds "B.Tech in Computer Science" — put whole string as degree
          // field_of_study: extract after "in " if present, else null
          const degreeStr = e.degree || ''
          const inIdx = degreeStr.toLowerCase().indexOf(' in ')
          const degree      = inIdx > -1 ? degreeStr.slice(0, inIdx).trim() : degreeStr
          const fieldOfStudy = inIdx > -1 ? degreeStr.slice(inIdx + 4).trim() : null

          return {
            institution:    e.institution,
            degree:         degree || degreeStr,
            field_of_study: fieldOfStudy || null,
            start_date:     toDate(e.startYear),
            end_date:       toDate(e.endYear),
            description:    e.cgpa ? `CGPA/Score: ${e.cgpa}` : null,
          }
        })
        await saveEducationToBackend(backendEntries, rid)
      }
    } catch (err) {
      console.error('Backend save failed (education):', err)
    }

    setSaving(false)
    setEducationSaved(true)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(`/app/resume-builder/skills?template=${templateId}`)
    }, 800)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── LEFT: form ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', padding: '24px 20px' }}>
        <ResumeSectionTabs />

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>
          Education Details
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 8 }}>
          Add your educational qualifications below.
        </p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 0, marginBottom: 16 }}>* Required fields</p>

        {entries.map((entry, idx) => (
          <div key={entry.id} style={{
            background: '#fff', borderRadius: 16,
            padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            marginBottom: 20,
          }}>

            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>
                Education {idx + 1}
              </p>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(entry.id)}
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

            {/* Institution */}
            <Field label="Institution / College Name" required>
              <input
                style={inputStyle}
                type="text"
                value={entry.institution}
                placeholder="e.g. XYZ University"
                onChange={e => update(entry.id, 'institution', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')}
              />
            </Field>

            {/* Degree */}
            <Field label="Degree" required>
              <input
                style={inputStyle}
                type="text"
                value={entry.degree}
                placeholder="e.g. B.Tech in Computer Science"
                onChange={e => update(entry.id, 'degree', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')}
              />
            </Field>

            {/* Start Year | End Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>
                  Start Year <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  value={entry.startYear}
                  placeholder="e.g. 2020"
                  onChange={e => update(entry.id, 'startYear', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  End Year <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  value={entry.endYear}
                  placeholder="e.g. 2024 or Present"
                  onChange={e => update(entry.id, 'endYear', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
            </div>

            {/* CGPA / Percentage */}
            <Field label="CGPA / Percentage" required>
              <input
                style={inputStyle}
                type="text"
                value={entry.cgpa}
                placeholder="e.g. 8.5 / 10 or 85%"
                onChange={e => update(entry.id, 'cgpa', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')}
              />
            </Field>

          </div>
        ))}

        {error && (
          <div style={{ color: '#dc2626', background: '#fff7f7', padding: 10, borderRadius: 8, border: '1px solid #fecaca', marginBottom: 12, whiteSpace: 'pre-wrap' }}>{error}</div>
        )}

        {/* Add Education button */}
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
          + Add Education
        </button>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 32, gap: 12 }}>
          <button onClick={() => navigate(`/app/resume-builder/experience?template=${templateId}`)}
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
