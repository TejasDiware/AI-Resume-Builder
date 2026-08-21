import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineDescription, MdUpload, MdEdit, MdDownload, MdMoreVert, MdDelete, MdOutlineVisibility } from 'react-icons/md'
import { useResume, ResumeContext } from '../../context/ResumeContext'
import templateMap from '../ResumeBuilder/templates/templateMap'
import { achievementApi, certificationApi, languageApi, pdfApi, profileApi, resumeApi } from '../../utils/api'

// ── Mini resume thumbnail ─────────────────────────────────────────────────────
function ResumeThumbnail({ templateId = 1 }) {
  const colors = {
    1: '#1e3a5f', 2: '#6d28d9', 3: '#ea580c',
    4: '#1e3a5f', 5: '#111827', 6: '#0f766e',
    7: '#111827', 8: '#f9a8d4',
  }
  const sideColor = colors[templateId] || colors[1]
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fff', overflow: 'hidden', borderRadius: 6 }}>
      <div style={{ width: '35%', background: sideColor, padding: '8px 5px' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ccc', margin: '0 auto 6px' }} />
        {[100, 80, 90, 70, 85, 75].map((w, i) => (
          <div key={i} style={{ height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, margin: '4px 0', width: `${w}%` }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: '8px 6px' }}>
        <div style={{ height: 6, background: sideColor, borderRadius: 2, width: '75%', marginBottom: 4 }} />
        <div style={{ height: 3, background: '#a5b4fc', borderRadius: 2, width: '55%', marginBottom: 8 }} />
        {[100, 85, 70, 90, 80, 65, 95, 75, 60].map((w, i) => (
          <div key={i} style={{ height: 2.5, background: '#e5e7eb', borderRadius: 2, margin: '3px 0', width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

function FullTemplateThumbnail({ Component }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(210)

  // Keep the complete A4 page visible, including its resume information.
  useEffect(() => {
    if (!containerRef.current) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const scale = width / 794
  return (
    <div ref={containerRef} style={{ height: Math.round(1123 * scale), minHeight: 290, overflow: 'hidden', position: 'relative', background: '#fff' }}>
      {/* Null context forces templates to render their built-in demo data */}
      <ResumeContext.Provider value={null}>
        <div style={{ width: 794, position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          <Component />
        </div>
      </ResumeContext.Provider>
    </div>
  )
}

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const color = score >= 60 ? '#22c55e' : score >= 30 ? '#f59e0b' : '#e5e7eb'
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Score</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: score > 0 ? color : '#9ca3af' }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 999, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

// ── Resume Card ───────────────────────────────────────────────────────────────
function ResumeCard({ resume, onEdit, onDelete, onView, onServerDownload }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const templateId = resume.template_id ?? resume.templateId ?? 1

  return (
    <div className="bg-white rounded-4 p-3" style={{ border: '1px solid #e5e7eb', position: 'relative', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <div className="d-flex gap-3">
        {/* Thumbnail */}
        <div
          onClick={() => onView(resume)}
          style={{ width: 100, height: 130, flexShrink: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', cursor: 'pointer' }}
        >
          <ResumeThumbnail templateId={templateId} />
        </div>

        {/* Info */}
        <div className="flex-fill" style={{ minWidth: 0 }}>
          <p className="fw-bold mb-2" style={{ fontSize: '1rem', color: '#1e293b' }}>{resume.title}</p>
          <ScoreBar score={resume.score} />

          {/* Action buttons */}
          <div className="d-flex align-items-center gap-2 mt-3" style={{ minHeight: 32 }}>
            {/* Edit */}
            <button
              onClick={() => onEdit(resume)}
              className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
              style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, border: 'none', width: 72, height: 32, padding: 0, lineHeight: 1 }}
            >
              <MdEdit size={14} /> Edit
            </button>

            <button
              onClick={() => onServerDownload(resume)}
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{ background: '#ecfdf5', color: '#047857', borderRadius: 8, border: 'none', width: 32, height: 32 }}
              title="Download PDF"
            >
              <MdDownload size={16} />
            </button>

            {/* More */}
            <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn btn-sm d-flex align-items-center justify-content-center"
                style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 8, border: 'none', width: 32, height: 32 }}
              >
                <MdMoreVert size={16} />
              </button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                  <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 50, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 130, overflow: 'hidden' }}>
                    <button
                      onClick={() => { onView(resume); setMenuOpen(false) }}
                      className="d-flex align-items-center gap-2 w-100"
                      style={{ background: 'none', border: 'none', padding: '9px 14px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}
                    >
                      <MdOutlineVisibility size={15} /> Preview
                    </button>
                    <button
                      onClick={() => { onDelete(resume.id); setMenuOpen(false) }}
                      className="d-flex align-items-center gap-2 w-100"
                      style={{ background: 'none', border: 'none', padding: '9px 14px', fontSize: '0.8rem', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <MdDelete size={15} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Resume() {
  const navigate        = useNavigate()
  const ctx             = useResume()
  const [modal, setModal]         = useState(false)
  const [templateModal, setTemplateModal] = useState(false)
  const [title, setTitle]         = useState('')
  const [pendingTitle, setPendingTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [importing, setImporting] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectingId, setSelectingId] = useState(null)
  const [resumeError, setResumeError] = useState('')
  const [importError, setImportError] = useState('')
  const inputRef            = useRef()

  // Use context savedResumes — shared across pages
  const resumes    = ctx?.savedResumes || []

  const openModal = () => {
    setTitle('')
    setModal(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleCreate = (t) => {
    const resumeTitle = t || title
    if (!resumeTitle.trim()) return
    setModal(false)
    setPendingTitle(resumeTitle.trim())
    setSelectedTemplate(null)
    setTemplateModal(true)
  }

  const handleTemplateSelect = async (templateId = selectedTemplate) => {
    if (!templateId || !pendingTitle) return
    setCreating(true)
    setResumeError('')

    // Clear all previous resume data so the new CV starts completely fresh
    ctx?.clearResumeData?.()
    ctx?.setResumeTitle?.(pendingTitle)
    setTemplateModal(false)

    try {
      const { data } = await resumeApi.create({
        title: pendingTitle,
        template_id: Number(templateId),
        template: 'classic',
      })
      if (!data?.id) throw new Error('The backend did not return a resume ID.')
      await ctx?.loadResume?.(data.id)
      await ctx?.refreshResumes?.()
      navigate(`/app/profile?template=${templateId}`)
    } catch (err) {
      console.error('Resume create failed:', err)
      setResumeError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to create the resume. Please try again.',
      )
    } finally {
      setCreating(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') setModal(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return
    setResumeError('')
    try {
      await ctx?.deleteResume?.(id)
      await ctx?.refreshResumes?.()
    } catch (err) {
      console.error('Resume delete failed:', err)
      setResumeError(
        err.response?.data?.detail ||
        'Unable to delete the resume. Please try again.',
      )
    }
  }

  const openResume = async (resume, destination) => {
    if (!resume?.id || selectingId) return
    setSelectingId(resume.id)
    setResumeError('')
    try {
      const loaded = await ctx?.loadResume?.(resume.id)
      if (!loaded) throw new Error('The resume could not be loaded.')
      navigate(`${destination}?template=${loaded.template_id}`)
    } catch (err) {
      console.error('Resume selection failed:', err)
      setResumeError(
        err.response?.data?.detail ||
        'Unable to load this resume. Please try again.',
      )
    } finally {
      setSelectingId(null)
    }
  }

  const handleView = (resume) => openResume(resume, '/app/resume-builder/preview')
  const handleEdit = (resume) => openResume(resume, '/app/profile')

  const handleServerDownload = async (resume) => {
    try {
      const { data } = await pdfApi.download(resume.id, resume.template || 'classic')
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${resume.title || 'Resume'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Server PDF download failed:', err)
    }
  }

  const handleImportCv = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Reset input so same file can be re-selected
    e.target.value = ''
    setImporting(true)
    setImportError('')
    try {
      const cvTitle = file.name.replace(/\.[^.]+$/, '')
      const { data: created } = await resumeApi.create({
        title: cvTitle,
        template_id: 1,
        template: 'classic',
      })
      const resumeId = created?.id

      if (!resumeId) {
        throw new Error('The resume could not be created.')
      }

      await resumeApi.upload(resumeId, file)
      const canonicalResumeId = await ctx?.finalizeResume?.(resumeId) || resumeId

      const [
        educationResponse,
        experienceResponse,
        skillsResponse,
        projectsResponse,
        certificationsResponse,
        languagesResponse,
        achievementsResponse,
        profileResponse,
      ] = await Promise.all([
        resumeApi.getEducation(canonicalResumeId),
        resumeApi.getExperience(canonicalResumeId),
        resumeApi.getSkills(canonicalResumeId),
        resumeApi.getProjects(canonicalResumeId),
        certificationApi.list(canonicalResumeId),
        languageApi.list(canonicalResumeId),
        achievementApi.list(canonicalResumeId),
        profileApi.get(),
      ])

      const toYear = (value) => value ? String(value).slice(0, 4) : ''

      ctx?.setEducation?.((educationResponse.data || []).map(item => {
        const description = item.description || ''
        const cgpaMatch = description.match(/CGPA:\s*([^|]+)/i)
        const percentMatch = description.match(/Percentage:\s*([^|]+)/i)

        return {
          id: item.id,
          institution: item.institution || '',
          degree: item.degree || '',
          startYear: toYear(item.start_date),
          endYear: toYear(item.end_date),
          cgpa: (cgpaMatch?.[1] || percentMatch?.[1] || '').trim(),
          schoolName: item.institution || '',
          fieldStudy: item.field_of_study || '',
          city: '',
          state: '',
        }
      }))
      ctx?.setExperiences?.((experienceResponse.data || []).map(item => ({
        id: item.id,
        jobTitle: item.job_title || '',
        employer: item.company || '',
        employerOther: '',
        city: item.location || '',
        state: '',
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        currentWork: Boolean(item.is_current),
        description: item.description || '',
      })))
      ctx?.setSkills?.((skillsResponse.data || [])
        .map(item => item.name)
        .filter(Boolean))
      ctx?.setProjects?.((projectsResponse.data || []).map(item => ({
        id: item.id,
        title: item.title || '',
        technologies: item.technologies || '',
        role: item.role || '',
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        ongoing: !item.end_date,
        description: item.description || '',
        projectLink: item.project_url || '',
        highlights: '',
      })))
      ctx?.setCertifications?.((certificationsResponse.data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        issuer: item.issuing_organization || '',
        year: toYear(item.issue_date),
      })))
      ctx?.setLanguages?.((languagesResponse.data || [])
        .map(item => item.name)
        .filter(Boolean))
      ctx?.setAchievements?.((achievementsResponse.data || [])
        .map(item => item.title)
        .filter(Boolean))

      const profile = profileResponse.data
      if (profile) {
        ctx?.setProfileData?.(previous => ({
          ...previous,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          profession: profile.professional_title || '',
          city: profile.location || '',
        }))
        ctx?.setSummary?.(profile.summary || '')
        ctx?.setWebsites?.(previous => ({
          ...previous,
          linkedin: profile.linkedin_url || '',
          github: profile.github_url || '',
          portfolio: profile.portfolio_url || '',
        }))
      }

      ctx?.setResumeTitle?.(cvTitle)
      ctx?.setCurrentResumeId?.(canonicalResumeId)
      await ctx?.loadResume?.(canonicalResumeId)
      ctx?.setProfileSaved?.(true)
      ctx?.setExperienceSaved?.(true)
      ctx?.setEducationSaved?.(true)
      ctx?.setSkillsSaved?.(true)
      ctx?.setProjectsSaved?.(true)
      ctx?.setPortfolioSaved?.(true)

      await ctx?.refreshResumes?.()

      navigate(`/app/profile?template=1&imported=1`)
    } catch (err) {
      console.error('CV import failed:', err)
      setImportError(
        err.response?.data?.detail ||
        err.message ||
        'Could not import this CV. Please try another file.'
      )
    } finally {
      setImporting(false)
    }
  }

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 20px' }}>

      {/* ── Top row: Create + Import ── */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-stretch">

        {/* Create New CV */}
        <div
          className="bg-white rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center p-4"
          style={{ width: 200, minHeight: 140, cursor: 'pointer', border: '2px solid #e5e7eb', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onClick={() => !creating && openModal()}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div className="d-flex align-items-center justify-content-center mb-2"
            style={{ width: 52, height: 52, background: '#eef2ff', borderRadius: 14 }}>
            <MdOutlineDescription size={28} color="#4f46e5" />
          </div>
          <p className="fw-bold mb-0 text-center" style={{ fontSize: '0.88rem', color: '#1e293b' }}>
            {creating ? 'Creating CV…' : 'Create New CV ✏️'}
          </p>
          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>Start Fresh</p>
        </div>

        {/* Import CV */}
        <div
          className="bg-white rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center p-4"
          style={{ width: 200, minHeight: 140, cursor: importing ? 'wait' : 'pointer', border: `2px solid ${importing ? '#4f46e5' : '#e5e7eb'}`, transition: 'border-color 0.2s, box-shadow 0.2s', opacity: importing ? 0.8 : 1 }}
          onClick={() => !importing && document.getElementById('import-cv-input').click()}
          onMouseEnter={e => { if (!importing) { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.12)' }}}
          onMouseLeave={e => { if (!importing) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}}
        >
          <div className="d-flex align-items-center justify-content-center mb-2"
            style={{ width: 52, height: 52, background: '#eef2ff', borderRadius: 14 }}>
            {importing
              ? <div style={{ width: 28, height: 28, border: '3px solid #a5b4fc', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <MdUpload size={28} color="#4f46e5" />
            }
          </div>
          <p className="fw-bold mb-0 text-center" style={{ fontSize: '0.88rem', color: '#1e293b' }}>
            {importing ? 'Parsing CV…' : 'Import CV 📤'}
          </p>
          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>
            {importing ? 'Please wait' : 'Use Current CV'}
          </p>
          <input
            id="import-cv-input"
            type="file"
            accept=".pdf,.docx"
            hidden
            onChange={handleImportCv}
          />
        </div>
      </div>

      {/* Import error banner */}
      {importError && (
        <div className="d-flex align-items-center gap-2 mb-3 px-3 py-2 rounded-3"
          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.82rem' }}>
          ⚠️ {importError}
          <button onClick={() => setImportError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
        </div>
      )}

      {resumeError && (
        <div className="d-flex align-items-center gap-2 mb-3 px-3 py-2 rounded-3"
          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.82rem' }}>
          {resumeError}
          <button onClick={() => setResumeError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── Resume Cards Grid ── */}
      {resumes.length > 0 && (
        <div className="row g-4">
          {resumes.map(resume => (
            <div key={resume.id} className="col-12 col-md-6 col-lg-4">
              <ResumeCard
                resume={resume}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onServerDownload={handleServerDownload}
              />
            </div>
          ))}
        </div>
      )}

      {resumes.length === 0 && (
        <div className="text-center py-5 text-muted">
          <MdOutlineDescription size={48} color="#d1d5db" />
          <p className="mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
            No resumes yet. Click "Create New CV" to get started!
          </p>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <>
          <div onClick={() => setModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)', zIndex: 1001,
            background: '#fff', borderRadius: 20,
            padding: '36px 40px', width: 480, maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          }}>
            <button onClick={() => setModal(false)}
              style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: '1.3rem', color: '#9ca3af', cursor: 'pointer' }}>×</button>
            <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1e293b' }}>Enter Resume Title</h2>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>This name will be used to save your resume.</p>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Manasi Ithape"
              className="form-control mb-4"
              style={{ borderRadius: 12, padding: '12px 16px', fontSize: '0.95rem', border: '1.5px solid #d1d5db' }}
            />
            <div className="d-flex justify-content-center gap-3">
              <button onClick={() => setModal(false)}
                className="btn px-5 py-2 fw-semibold text-white"
                style={{ background: '#ef4444', borderRadius: 999, fontSize: '0.95rem' }}>
                Close
              </button>
              <button
                onClick={() => handleCreate(title)}
                disabled={!title.trim()}
                className="btn px-5 py-2 fw-semibold text-white"
                style={{ background: title.trim() ? '#4f46e5' : '#a5b4fc', borderRadius: 999, fontSize: '0.95rem', cursor: title.trim() ? 'pointer' : 'not-allowed' }}>
                Create
              </button>
            </div>
          </div>
        </>
      )}

      {/* Template picker shown immediately after entering a new CV title */}
      {templateModal && (
        <>
          <div onClick={() => setTemplateModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000 }} />
          <div role="dialog" aria-modal="true" aria-labelledby="template-picker-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1001, background: '#fff', borderRadius: 16, width: 780, maxWidth: '92vw', maxHeight: '88vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.24)' }}>
            <div style={{ padding: '22px 26px 14px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <button onClick={() => setTemplateModal(false)} aria-label="Close template picker" style={{ position: 'absolute', top: 13, right: 18, background: 'none', border: 'none', fontSize: '1.35rem', color: '#9ca3af', cursor: 'pointer' }}>×</button>
              <h2 id="template-picker-title" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Choose a Resume Template</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '6px 0 0' }}>Select a template for “{pendingTitle}”.</p>
            </div>

            <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
              {Object.entries(templateMap).map(([templateIdValue, template]) => {
                const templateId = Number(templateIdValue)
                const active = selectedTemplate === templateId
                return (
                  <div key={templateId} role="button" tabIndex={0} onClick={() => setSelectedTemplate(templateId)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setSelectedTemplate(templateId) }} style={{ padding: 0, overflow: 'hidden', background: '#fff', borderRadius: 10, border: active ? '3px solid #4f46e5' : '1px solid #dbe1ea', boxShadow: active ? '0 0 0 3px #c7d2fe' : '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer', textAlign: 'left' }}>
                    <FullTemplateThumbnail Component={template.Component} />
                    <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: active ? '#4f46e5' : '#1e293b', fontWeight: 700 }}>{template.name}</span>
                      {active && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4f46e5' }}>Selected</span>}
                    </div>
                    <button type="button" onClick={event => { event.stopPropagation(); handleTemplateSelect(templateId) }} style={{ width: 'calc(100% - 20px)', margin: '0 10px 10px', border: 'none', borderRadius: 7, padding: '8px', background: '#16a34a', color: '#fff', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>Select</button>
                  </div>
                )
              })}
            </div>

          </div>
        </>
      )}
    </div>
  )
}
