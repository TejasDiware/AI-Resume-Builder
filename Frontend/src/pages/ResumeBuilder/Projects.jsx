import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MdOutlineFolderSpecial,
  MdSave,
  MdAdd,
  MdDelete,
  MdEdit,
} from 'react-icons/md'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'
import { useResume } from '../../context/ResumeContext'
import { safeNavigate } from '../../utils/safeNavigate'

const emptyProject = {
  id: null,
  title: '',
  technologies: '',
  role: '',
  startDate: '',
  endDate: '',
  ongoing: false,
  description: '',
  projectLink: '',
  highlights: '',
}

const inputStyle = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: '0.85rem',
  color: '#374151',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  minWidth: 0,
  transition: 'border-color 0.2s',
}

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#374151',
  display: 'block',
  marginBottom: 6,
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, ...style }}
      onFocus={e => (e.target.style.borderColor = '#4f46e5')}
      onBlur={e => (e.target.style.borderColor = '#d1d5db')}
    />
  )
}

export default function Projects() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const { projects: ctxProjects, setProjects: setContextProjects, setProjectsSaved,
      ensureResumeExists, saveProjectsToBackend, finalizeResume, resumeTitle } = useResume()

  // Ensure the correct template's data is active when entering this page
  const _projCtx = useResume()
  useEffect(() => {
    _projCtx?.switchTemplate?.(Number(templateId))
  }, [templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const mapP = (p) => ({
    ...emptyProject,
    ...p,
    id:           p.id          ?? null,
    title:        p.name        || p.title || '',
    technologies: Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.technologies || ''),
    role:         p.role        || '',
    description:  p.description || '',
    projectLink:  p.githubUrl   || p.liveUrl || p.projectLink || '',
    startDate:    p.startDate   || '',
    endDate:      p.endDate     || '',
    ongoing:      p.ongoing     || false,
    highlights:   p.highlights  || '',
  })

  const [projects, setProjects] = useState(() =>
    ctxProjects?.length ? ctxProjects.map(mapP) : []
  )

  // Sync when context updates (e.g. after CV import)
  useEffect(() => {
    // Draft data is written only for the live preview; do not let it replace
    // the local form while the user is still typing.
    if (ctxProjects?.some(project => project.id === 'draft-project' || project.isDraft)) return
    setProjects(ctxProjects?.length ? ctxProjects.map(mapP) : [])
    if (!ctxProjects?.length) setForm({ ...emptyProject })
  }, [ctxProjects])
  const [form, setForm] = useState({ ...emptyProject })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(() => !ctxProjects?.length)
  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [backendError, setBackendError] = useState('')

  const update = (field, val) => {
    setForm(prev => {
      const nextForm = { ...prev, [field]: val }
      const previewProjects = editingId !== null
        ? projects.map(project => project.id === editingId ? { ...nextForm, id: editingId, isDraft: true } : project)
        : [...projects, { ...nextForm, isDraft: true }]

      // Keep the live resume preview in sync while the user is typing.
      setContextProjects(previewProjects)
      return nextForm
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Project title is required'
    if (!form.technologies.trim()) e.technologies = 'Technologies are required'
    if (!form.role.trim()) e.role = 'Your role is required'
    if (!form.startDate) e.startDate = 'Start date is required'
    if (!form.ongoing && !form.endDate) e.endDate = 'End date is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSaveProject = () => {
    if (!validate()) return
    let updated
    if (editingId !== null) {
      updated = projects.map(p => (p.id === editingId ? { ...form, id: editingId } : p))
      setEditingId(null)
    } else {
      updated = [...projects, { ...form, id: null }]
    }
    setProjects(updated)
    setContextProjects(updated)   // sync to live preview
    setForm({ ...emptyProject })
    setShowForm(false)
  }

  const handleEdit = project => {
    setForm({ ...project })
    setEditingId(project.id)
    setShowForm(true)
    setErrors({})
  }

  const handleDelete = id => {
    const updated = projects.filter(p => p.id !== id)
    setProjects(updated)
    setContextProjects(updated)
  }

  const handleCancel = () => {
    setForm({ ...emptyProject })
    setEditingId(null)
    setErrors({})
    setShowForm(projects.length > 0 ? false : true)
    setContextProjects(projects)
  }

  const handleFinish = async () => {
    setSaving(true)
    setBackendError('')
    let saveFailed = false

    // Always save to localStorage first (offline-safe)
    setContextProjects(projects)
    setProjectsSaved(true)

    // Persist to backend
    try {
      const rid = await ensureResumeExists(resumeTitle || 'Untitled Resume')
      if (rid) {
        await saveProjectsToBackend(projects, rid)
        await finalizeResume(rid)
      }
    } catch (err) {
      console.error('Backend save failed (projects):', err)
      setBackendError(err.response?.data?.detail || err.message || 'Failed to save projects')
      saveFailed = true
    }

    setSaving(false)
    if (saveFailed) return
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(`/app/resume-builder/certifications?template=${templateId}`)
    }, 800)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── LEFT: scrollable form area ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', padding: '24px 20px' }}>
        <ResumeSectionTabs />

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <MdOutlineFolderSpecial size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Projects</h1>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
              Showcase your best work and technical achievements
            </p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6, marginBottom: 0 }}>* Required fields</p>
          </div>

          {!showForm && (
            <button
              onClick={() => { setForm({ ...emptyProject }); setEditingId(null); setErrors({}); setShowForm(true) }}
              style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#4f46e5', color: '#fff',
                border: 'none', borderRadius: 10,
                padding: '9px 18px', fontSize: '0.84rem',
                fontWeight: 600, cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
              onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
            >
              <MdAdd size={18} /> Add Project
            </button>
          )}
        </div>

        {/* ── Saved Projects List ── */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {projects.map(p => (
              <div key={p.id} style={{
                background: '#fff', borderRadius: 14,
                padding: '14px 18px', marginBottom: 10,
                boxShadow: '0 1px 5px rgba(0,0,0,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.93rem', color: '#1e293b', margin: 0 }}>{p.title}</p>
                    {p.ongoing && (
                      <span style={{
                        fontSize: '0.67rem', fontWeight: 600, color: '#16a34a',
                        background: '#dcfce7', borderRadius: 999, padding: '2px 8px',
                      }}>Ongoing</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.77rem', color: '#4f46e5', margin: '3px 0 3px', fontWeight: 600 }}>{p.role}</p>
                  <p style={{ fontSize: '0.74rem', color: '#6b7280', margin: '0 0 3px' }}>
                    {p.startDate}{p.endDate && !p.ongoing ? ` — ${p.endDate}` : p.ongoing ? ' — Present' : ''}
                  </p>
                  <p style={{ fontSize: '0.77rem', color: '#9ca3af', margin: 0 }}>{p.technologies}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: '#eef2ff', color: '#4f46e5',
                    border: 'none', borderRadius: 8,
                    padding: '6px 11px', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                    <MdEdit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: '#fef2f2', color: '#ef4444',
                    border: 'none', borderRadius: 8,
                    padding: '6px 11px', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                    <MdDelete size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div style={{
            background: '#fff', borderRadius: 16,
            padding: '24px 24px 20px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            marginBottom: 20,
          }}>
            {/* Form header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <MdOutlineFolderSpecial size={21} color="#fff" />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '1rem', margin: 0, color: '#1e293b' }}>
                  {editingId ? 'Edit Project' : 'Add New Project'}
                </p>
                <p style={{ fontSize: '0.76rem', color: '#6b7280', margin: 0 }}>Add details about your project</p>
              </div>
            </div>

            {/* Row 1: Title + Technologies */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginBottom: 16 }}>
              <Field label="Project Title" required>
                <TextInput value={form.title} onChange={v => update('title', v)} placeholder="Enter project title" />
                {errors.title && <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: '4px 0 0' }}>{errors.title}</p>}
              </Field>
              <Field label="Technologies Used" required>
                <TextInput value={form.technologies} onChange={v => update('technologies', v)} placeholder="Example: React, Node.js, MongoDB, etc." />
                {errors.technologies && <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: '4px 0 0' }}>{errors.technologies}</p>}
              </Field>
            </div>

            {/* Row 2: Role + Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Project Role / Your Role" required>
                <TextInput value={form.role} onChange={v => update('role', v)} placeholder="Example: Full Stack Developer" />
                {errors.role && <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: '4px 0 0' }}>{errors.role}</p>}
              </Field>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Project Duration" required>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <input type="date" value={form.startDate}
                    onChange={e => update('startDate', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                  />
                  <span style={{ color: '#9ca3af', flexShrink: 0 }}>—</span>
                  <input type="date" value={form.endDate}
                    onChange={e => update('endDate', e.target.value)}
                    disabled={form.ongoing}
                    style={{ ...inputStyle, flex: 1, opacity: form.ongoing ? 0.5 : 1, cursor: form.ongoing ? 'not-allowed' : 'text' }}
                    onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.77rem', color: '#374151', cursor: 'pointer', flexShrink: 0 }}>
                    <input type="checkbox" checked={form.ongoing} onChange={e => update('ongoing', e.target.checked)}
                      style={{ width: 14, height: 14, accentColor: '#4f46e5' }} />
                    Ongoing
                  </label>
                </div>
                {(errors.startDate || errors.endDate) && (
                  <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: '4px 0 0' }}>
                    {errors.startDate || errors.endDate}
                  </p>
                )}
              </Field>
              </div>
            </div>

            {/* Project Description */}
            <div style={{ marginBottom: 16 }}>
              <Field label="Project Description" required>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Describe your project, what it does, and your key responsibilities..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 96, lineHeight: 1.6 }}
                  onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                />
                {errors.description && <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: '4px 0 0' }}>{errors.description}</p>}
              </Field>
            </div>

            {/* Project Link (full width — Live Demo removed) */}
            {/* Key Highlights */}
            <div style={{ marginBottom: 20 }}>
              <Field label="Key Highlights / Achievements">
                <textarea
                  value={form.highlights}
                  onChange={e => update('highlights', e.target.value)}
                  placeholder="List your key achievements in this project..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 76, lineHeight: 1.6 }}
                  onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                />
              </Field>
            </div>

            {/* Form Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={handleCancel} style={{
                background: '#fff', color: '#374151',
                border: '1.5px solid #d1d5db', borderRadius: 10,
                padding: '8px 20px', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#9ca3af')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#d1d5db')}
              >
                Cancel
              </button>
              <button onClick={handleSaveProject} style={{
                background: '#4f46e5', color: '#fff',
                border: 'none', borderRadius: 10,
                padding: '8px 22px', fontSize: '0.83rem',
                fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
              >
                <MdOutlineFolderSpecial size={16} />
                Save Project
              </button>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!showForm && projects.length === 0 && (
          <div style={{
            background: '#fff', borderRadius: 16,
            padding: '44px 24px', textAlign: 'center',
            boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
            marginBottom: 20,
          }}>
            <MdOutlineFolderSpecial size={46} color="#d1d5db" style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: '0.97rem', color: '#374151', margin: '0 0 6px' }}>No projects yet</p>
            <p style={{ fontSize: '0.81rem', color: '#9ca3af', margin: '0 0 16px' }}>
              Add your projects to stand out from other candidates.
            </p>
            <button onClick={() => setShowForm(true)} style={{
              background: '#4f46e5', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '9px 20px', fontSize: '0.83rem',
              fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <MdAdd size={17} /> Add Your First Project
            </button>
          </div>
        )}

        {/* ── Tips ── */}
        <div style={{
          background: '#fff', borderRadius: 12,
          padding: '14px 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          marginBottom: 20,
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.83rem', color: '#1e293b', margin: '0 0 10px' }}>💡 Tips</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'List your most impactful or recent projects first.',
              'Mention the tech stack — it helps ATS systems match keywords.',
              'Add a GitHub link to let recruiters see your work.',
              'Quantify achievements where possible (e.g., reduced load time by 40%).',
            ].map((tip, i) => (
              <p key={i} style={{ fontSize: '0.74rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                {tip}
              </p>
            ))}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          {backendError && (
            <p style={{ color: '#b91c1c', fontSize: '0.78rem', margin: 0 }}>{backendError}</p>
          )}
          <button type="button" onClick={() => safeNavigate(navigate, `/resume-builder/skills?template=${templateId}`)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.83rem', fontWeight: 600, border: '2px solid #4f46e5', background: '#fff', color: '#4f46e5', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            ← Previous
          </button>
          <button type="button" onClick={handleFinish}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.83rem', fontWeight: 600, border: 'none', background: saved ? '#22c55e' : '#4f46e5', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.3s', opacity: saving ? 0.7 : 1 }}
            disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>

      </div>

      {/* ── RIGHT: Live CV Preview ── */}
      <LivePreviewPanel />

    </div>
  )
}


