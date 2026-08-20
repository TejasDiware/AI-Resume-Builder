import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdAdd, MdDelete, MdSave, MdCheckCircle, MdEmojiEvents, MdVerified, MdLanguage, MdSportsEsports, MdPerson, MdInterests } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import { certificationApi, languageApi, achievementApi } from '../../utils/api'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'

const inputStyle = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: '0.85rem',
  color: '#1e293b',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: '24px',
  boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  marginBottom: 20,
}

function SectionTitle({ icon, title, color = '#4f46e5' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{title}</h2>
    </div>
  )
}

function TagInput({ items, setItems, placeholder }) {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim()
    if (val && !items.includes(val)) setItems(prev => [...prev, val])
    setInput('')
  }

  const remove = (i) => setItems(prev => prev.filter((_, idx) => idx !== i))

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          style={{ ...inputStyle, flex: 1 }}
          onFocus={e => (e.target.style.borderColor = '#4f46e5')}
          onBlur={e => (e.target.style.borderColor = '#d1d5db')}
        />
        <button
          onClick={add}
          style={{
            padding: '9px 16px', background: '#4f46e5', color: '#fff',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: 600, flexShrink: 0,
          }}
        >
          + Add
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#eef2ff', borderRadius: 8,
            padding: '5px 10px', fontSize: '0.82rem', color: '#4f46e5',
          }}>
            <span>{item}</span>
            <button
              onClick={() => remove(i)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#4f46e5', padding: 0, fontSize: '1rem', lineHeight: 1,
                display: 'flex', alignItems: 'center',
              }}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CertCard({ cert, index, onChange, onRemove }) {
  return (
    <div style={{
      border: '1.5px solid #e5e7eb', borderRadius: 12,
      padding: '16px', marginBottom: 12, background: '#fafafa',
      position: 'relative',
    }}>
      <button
        onClick={() => onRemove(index)}
        style={{
          position: 'absolute', top: 10, right: 10,
          background: '#fef2f2', border: 'none', borderRadius: 8,
          cursor: 'pointer', padding: '4px 8px',
          display: 'flex', alignItems: 'center',
        }}
      >
        <MdDelete size={16} color="#ef4444" />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            Certificate Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={cert.name}
            onChange={e => onChange(index, 'name', e.target.value)}
            placeholder="e.g. AWS Certified Developer"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#4f46e5')}
            onBlur={e => (e.target.style.borderColor = '#d1d5db')}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            Issuing Organization
          </label>
          <input
            type="text"
            value={cert.issuer}
            onChange={e => onChange(index, 'issuer', e.target.value)}
            placeholder="e.g. Amazon Web Services"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#4f46e5')}
            onBlur={e => (e.target.style.borderColor = '#d1d5db')}
          />
        </div>
      </div>
      <div style={{ maxWidth: 200 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
          Year
        </label>
        <input
          type="text"
          value={cert.year}
          onChange={e => onChange(index, 'year', e.target.value)}
          placeholder="e.g. 2024"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = '#4f46e5')}
          onBlur={e => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>
    </div>
  )
}

const emptyRef = () => ({ name: '', title: '', company: '', phone: '', email: '' })

const emptyCert = () => ({ name: '', issuer: '', year: '' })

export default function Certifications() {
  const navigate = useNavigate()
  const location = useLocation()
  const params   = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const {
    certifications: ctxCerts,       setCertifications,
    achievements: ctxAchievements,  setAchievements,
    languages: ctxLanguages,        setLanguages,
    interests: ctxInterests,        setInterests,
    hobbies: ctxHobbies,            setHobbies,
    references: ctxReferences,      setReferences,
    skillsDetailed: ctxSkillsDet,   setSkillsDetailed,
    ensureResumeExists,
    currentResumeId,
    resumeTitle,
  } = useResume()
  const _certCtx = useResume()

  // Ensure the correct template's data is active when entering this page
  useEffect(() => {
    _certCtx?.switchTemplate?.(Number(templateId))
  }, [templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const [certs, setCerts] = useState(() =>
    ctxCerts?.length ? ctxCerts.map(c =>
      typeof c === 'string' ? { name: c, issuer: '', year: '' } : { ...emptyCert(), ...c }
    ) : [emptyCert()]
  )
  const [achievements, setLocalAchievements] = useState(() =>
    ctxAchievements?.length ? [...ctxAchievements] : []
  )
  const [languages, setLocalLanguages] = useState(() =>
    ctxLanguages?.length ? [...ctxLanguages] : []
  )
  const [interests, setLocalInterests] = useState(() =>
    ctxInterests?.length ? [...ctxInterests] : []
  )
  const [hobbies, setLocalHobbies] = useState(() =>
    ctxHobbies?.length ? [...ctxHobbies] : []
  )
  const [refs, setRefs] = useState(() =>
    ctxReferences?.length ? ctxReferences.map(r => ({ ...emptyRef(), ...r })) : [emptyRef()]
  )
  const [skillsDet, setSkillsDet] = useState(() => ({
    programmingLanguages: ctxSkillsDet?.programmingLanguages || '',
    frameworks:           ctxSkillsDet?.frameworks           || '',
    frontend:             ctxSkillsDet?.frontend             || '',
    backend:              ctxSkillsDet?.backend              || '',
    databases:            ctxSkillsDet?.databases            || '',
    tools:                ctxSkillsDet?.tools                || '',
    versionControl:       ctxSkillsDet?.versionControl       || '',
    other:                ctxSkillsDet?.other                || '',
  }))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync if context updates (e.g. CV import)
  useEffect(() => {
    if (ctxCerts?.length)
      setCerts(ctxCerts.map(c => typeof c === 'string' ? { name: c, issuer: '', year: '' } : { ...emptyCert(), ...c }))
  }, [ctxCerts])

  useEffect(() => {
    if (ctxAchievements?.length) setLocalAchievements([...ctxAchievements])
  }, [ctxAchievements])

  useEffect(() => {
    if (ctxLanguages?.length) setLocalLanguages([...ctxLanguages])
  }, [ctxLanguages])

  useEffect(() => {
    if (ctxInterests?.length) setLocalInterests([...ctxInterests])
  }, [ctxInterests])

  useEffect(() => {
    if (ctxHobbies?.length) setLocalHobbies([...ctxHobbies])
  }, [ctxHobbies])

  const updateRef    = (i, field, val) =>
    setRefs(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  const addRef       = () => setRefs(prev => [...prev, emptyRef()])
  const removeRef    = (i) => setRefs(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev)

  const updateCert   = (i, field, val) =>
    setCerts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  const addCert      = () => setCerts(prev => [...prev, emptyCert()])
  const removeCert   = (i) => setCerts(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev)

  const updateSkill = (field, val) =>
    setSkillsDet(prev => ({ ...prev, [field]: val }))

  const handleSave = async () => {
    const validCerts = certs.filter(c => c.name.trim())
    const validRefs  = refs.filter(r => r.name.trim())

    // Save to localStorage first (offline-safe)
    setCertifications(validCerts)
    setAchievements(achievements)
    setLanguages(languages)
    setInterests(interests)
    setHobbies(hobbies)
    setReferences(validRefs)
    setSkillsDetailed(skillsDet)

    setSaving(true)

    // Persist certifications to backend
    // CertificationCreate: name, issuing_organization (required), issue_date, expiration_date, credential_id, credential_url
    try {
      const rid = await ensureResumeExists(resumeTitle || 'Untitled Resume')
      if (rid && validCerts.length > 0) {
        // First fetch existing certifications to delete them (replace pattern)
        const { data: existing } = await certificationApi.list(rid).catch(() => ({ data: [] }))
        await Promise.all(
          (existing || []).map(c => certificationApi.delete(rid, c.id).catch(() => {}))
        )
        // Re-create each certification
        for (const cert of validCerts) {
          // Convert year string to YYYY-MM-DD or null
          const toDate = (val) => {
            if (!val) return null
            const year = val.toString().match(/\d{4}/)?.[0]
            return year ? `${year}-01-01` : null
          }
          await certificationApi.create(rid, {
            name:                 cert.name.trim(),
            issuing_organization: cert.issuer?.trim() || 'Unknown',
            issue_date:           toDate(cert.year),
            expiration_date:      null,
            credential_id:        null,
            credential_url:       null,
          })
        }
      }
    } catch (err) {
      console.error('Backend save failed (certifications):', err)
    }

    // Languages and achievements are tag strings in this form. The string is
    // the language name or achievement title; optional API fields are null.
    try {
      const rid = await ensureResumeExists(resumeTitle || 'Untitled Resume')
      if (rid) {
        const validLanguages = languages
          .filter(language => typeof language === 'string' && language.trim())
        const { data: existing } = await languageApi.list(rid).catch(() => ({ data: [] }))
        await Promise.all(
          (existing || []).map(language => languageApi.delete(rid, language.id).catch(() => {}))
        )
        for (const language of validLanguages) {
          await languageApi.create(rid, {
            name: language.trim(),
            proficiency: null,
          })
        }
      }
    } catch (err) {
      console.error('Backend save failed (languages):', err)
    }

    try {
      const rid = await ensureResumeExists(resumeTitle || 'Untitled Resume')
      if (rid) {
        const validAchievements = achievements
          .filter(achievement => typeof achievement === 'string' && achievement.trim())
        const { data: existing } = await achievementApi.list(rid).catch(() => ({ data: [] }))
        await Promise.all(
          (existing || []).map(achievement => achievementApi.delete(rid, achievement.id).catch(() => {}))
        )
        for (const achievement of validAchievements) {
          await achievementApi.create(rid, {
            title: achievement.trim(),
            description: null,
            organization: null,
            year: null,
          })
        }
      }
    } catch (err) {
      console.error('Backend save failed (achievements):', err)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(`/app/resume-builder/summary?template=${templateId}`)
    }, 800)
  }

  const skillFields = [
    { key: 'programmingLanguages', label: 'Programming Languages' },
    { key: 'frameworks',           label: 'Frameworks' },
    { key: 'frontend',             label: 'Frontend' },
    { key: 'backend',              label: 'Backend' },
    { key: 'databases',            label: 'Databases' },
    { key: 'tools',                label: 'Tools' },
    { key: 'versionControl',       label: 'Version Control' },
    { key: 'other',                label: 'Other' },
  ]

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── LEFT: form ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', padding: '24px 20px' }}>
        <ResumeSectionTabs />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>
          Certifications, Skills & More
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 24 }}>
          Add certifications, achievements, languages and detailed skills.
        </p>

        {/* ── Technical Skills (Detailed) ── */}
        <div style={cardStyle}>
          <SectionTitle icon={<span style={{ fontSize: 18 }}>⚙️</span>} title="Technical Skills (Detailed)" color="#7c3aed" />
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 14, marginTop: -8 }}>
            These appear in the ATS Single Column template as labelled skill rows.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {skillFields.map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {label}
                </label>
                <input
                  type="text"
                  value={skillsDet[key]}
                  onChange={e => updateSkill(key, e.target.value)}
                  placeholder={`e.g. ${key === 'programmingLanguages' ? 'JavaScript, Python' : key === 'frameworks' ? 'React, Express' : key === 'databases' ? 'MongoDB, MySQL' : key === 'versionControl' ? 'Git, GitHub' : ''}`}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Certifications ── */}
        <div style={cardStyle}>
          <SectionTitle icon={<MdVerified size={20} color="#fff" />} title="Certifications" color="#0891b2" />
          {certs.map((cert, i) => (
            <CertCard key={i} cert={cert} index={i} onChange={updateCert} onRemove={removeCert} />
          ))}
          <button
            onClick={addCert}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f0f9ff', border: '1.5px dashed #0891b2',
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
              color: '#0891b2', fontSize: '0.82rem', fontWeight: 600,
            }}
          >
            <MdAdd size={18} /> Add Another Certificate
          </button>
        </div>

        {/* ── Achievements ── */}
        <div style={cardStyle}>
          <SectionTitle icon={<MdEmojiEvents size={20} color="#fff" />} title="Achievements" color="#d97706" />
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 12, marginTop: -8 }}>
            Type and press Enter or click "+ Add" to add each achievement.
          </p>
          <TagInput
            items={achievements}
            setItems={setLocalAchievements}
            placeholder="e.g. Won 1st place in National Hackathon 2023"
          />
        </div>

        {/* ── Languages ── */}
        <div style={cardStyle}>
          <SectionTitle icon={<MdLanguage size={20} color="#fff" />} title="Languages" color="#059669" />
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 12, marginTop: -8 }}>
            Type and press Enter or click "+ Add" to add each language.
          </p>
          <TagInput
            items={languages}
            setItems={setLocalLanguages}
            placeholder="e.g. English (Fluent)"
          />
        </div>

        {/* ── Interests ── */}
        <div style={cardStyle}>
          <SectionTitle icon={<MdInterests size={20} color="#fff" />} title="Interests" color="#7c3aed" />
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 12, marginTop: -8 }}>
            e.g. Reading, Travelling, Photography — press Enter or click "+ Add"
          </p>
          <TagInput
            items={interests}
            setItems={setLocalInterests}
            placeholder="e.g. Photography"
          />
        </div>

        {/* ── Hobbies ── */}
        <div style={cardStyle}>
          <SectionTitle icon={<MdSportsEsports size={20} color="#fff" />} title="Hobbies" color="#be185d" />
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 12, marginTop: -8 }}>
            e.g. Cricket, Music, Gaming — press Enter or click "+ Add"
          </p>
          <TagInput
            items={hobbies}
            setItems={setLocalHobbies}
            placeholder="e.g. Cricket"
          />
        </div>

        {/* ── References ── */}
        <div style={cardStyle}>
          <SectionTitle icon={<MdPerson size={20} color="#fff" />} title="References" color="#374151" />
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 14, marginTop: -8 }}>
            Optional — add people who can vouch for your work.
          </p>
          {refs.map((ref, i) => (
            <div key={i} style={{
              border: '1.5px solid #e5e7eb', borderRadius: 12,
              padding: '16px', marginBottom: 12, background: '#fafafa',
              position: 'relative',
            }}>
              {refs.length > 1 && (
                <button onClick={() => removeRef(i)} style={{
                  position: 'absolute', top: 10, right: 10,
                  background: '#fef2f2', border: 'none', borderRadius: 8,
                  cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center',
                }}>
                  <MdDelete size={16} color="#ef4444" />
                </button>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {[
                  { field: 'name',    label: 'Full Name *',        placeholder: 'e.g. Mr. John Smith' },
                  { field: 'title',   label: 'Job Title',          placeholder: 'e.g. Senior Manager' },
                  { field: 'company', label: 'Company',            placeholder: 'e.g. Infosys' },
                  { field: 'phone',   label: 'Phone',              placeholder: 'e.g. +91 98765 43210' },
                  { field: 'email',   label: 'Email',              placeholder: 'e.g. john@email.com' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      value={ref[field]}
                      onChange={e => updateRef(i, field, e.target.value)}
                      placeholder={placeholder}
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                      onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={addRef} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f9fafb', border: '1.5px dashed #374151',
            borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
            color: '#374151', fontSize: '0.82rem', fontWeight: 600,
          }}>
            <MdAdd size={18} /> Add Another Reference
          </button>
        </div>

        {/* ── Buttons row ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button onClick={() => navigate(`/app/resume-builder/portfolio?template=${templateId}`)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, border: '2px solid #4f46e5', background: '#fff', color: '#4f46e5', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            ← Previous
          </button>
          <button onClick={handleSave}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, border: 'none', background: saved ? '#22c55e' : '#4f46e5', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.3s', opacity: saving ? 0.7 : 1 }}
            disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── RIGHT: live preview ── */}
      <LivePreviewPanel templateId={templateId} />
    </div>
  )
}
