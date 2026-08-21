import { useEffect, useRef, useState } from 'react'
import {
  FaMagic,
  FaFileSignature,
  FaBriefcase,
  FaRocket,
  FaFileMedical,
  FaRobot,
  FaSearch,
  FaBullseye,
  FaArrowLeft,
  FaRegCopy,
  FaCheck,
  FaUpload,
} from 'react-icons/fa'

import {
  aiApi,
  resumeApi,
  jobDescriptionApi,
} from '../../utils/api'
import { useResume } from '../../context/ResumeContext'

/* ============================================================
   TOOL CONFIG — matches the AI Resume Assistant dashboard grid
============================================================ */
const TOOLS = [
  {
    id: 'improve-text',
    title: 'Improve Text',
    desc: 'Improve any text from your resume using AI.',
    icon: <FaMagic size={20} />,
    bg: '#ede9fe',
    fg: '#7c3aed',
  },
  {
    id: 'improve-summary',
    title: 'Improve Summary',
    desc: 'Make your professional summary strong and ATS friendly.',
    icon: <FaFileSignature size={20} />,
    bg: '#dbeafe',
    fg: '#2563eb',
  },
  {
    id: 'improve-experience',
    title: 'Improve Experience',
    desc: 'Enhance your work experience with better achievements.',
    icon: <FaBriefcase size={20} />,
    bg: '#dcfce7',
    fg: '#16a34a',
  },
  {
    id: 'improve-project',
    title: 'Improve Project',
    desc: 'Improve your project descriptions and impact.',
    icon: <FaRocket size={20} />,
    bg: '#ffedd5',
    fg: '#ea580c',
  },
  {
    id: 'generate-resume-content',
    title: 'Generate Content',
    desc: 'Generate content for any section of your resume.',
    icon: <FaFileMedical size={20} />,
    bg: '#fce7f3',
    fg: '#db2777',
  },
  {
    id: 'generate-resume',
    title: 'Generate Resume',
    desc: 'Generate a complete resume from your information.',
    icon: <FaRobot size={20} />,
    bg: '#cffafe',
    fg: '#0891b2',
  },
  {
    id: 'analyze-job-description',
    title: 'Analyze Job Description',
    desc: 'Analyze job description and extract key information.',
    icon: <FaSearch size={20} />,
    bg: '#e0e7ff',
    fg: '#4f46e5',
  },
  {
    id: 'generate-tailored-resume',
    title: 'Tailored Resume',
    desc: 'Generate a resume tailored for a specific job description.',
    icon: <FaBullseye size={20} />,
    bg: '#fef9c3',
    fg: '#ca8a04',
  },
]

/* ============================================================
   SHARED STYLE TOKENS
============================================================ */
const card = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
}

const label = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
  display: 'block',
}

const inputStyle = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: '0.875rem',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#fff',
}

const primaryBtn = {
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 18px',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
}

const ghostBtn = {
  background: '#fff',
  color: '#4f46e5',
  border: '1.5px solid #c7d2fe',
  borderRadius: 8,
  padding: '9px 16px',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
}

const pageShell = {
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  padding: '24px 24px 32px',
  boxSizing: 'border-box',
}

function Field({ children }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>
}

function Badge({ children }) {
  return (
    <span style={{
      background: '#ede9fe', color: '#6d28d9', fontSize: '0.65rem',
      fontWeight: 800, padding: '3px 8px', borderRadius: 999,
      letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  )
}

/* Copy-to-clipboard button used across result panels */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      style={{ ...ghostBtn, display: 'flex', alignItems: 'center', gap: 6 }}
      onClick={() => {
        navigator.clipboard?.writeText(text || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ErrorBox({ error }) {
  if (!error) return null
  return (
    <div style={{
      marginTop: 16, padding: '12px 14px', borderRadius: 10,
      background: '#fef2f2', border: '1px solid #fecaca',
      color: '#b91c1c', fontSize: '0.82rem',
    }}>
      {error}
    </div>
  )
}

function ResultPanel({ title, children }) {
  return (
    <div style={{
      marginTop: 20, padding: 16, borderRadius: 12,
      background: '#f0fdf4', border: '1px solid #bbf7d0',
    }}>
      {title && (
        <p style={{
          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.04em', color: '#15803d', margin: '0 0 10px',
        }}>
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

/* Resume selector for existing records, with optional upload. */
function ResumeSelect({ resumes, value, onChange, onUploaded }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const selected = resumes.find((r) => String(r.id) === String(value))

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadError('')
    setUploading(true)
    try {
      const title = file.name.replace(/\.[^.]+$/, '') || 'Uploaded Resume'
      const { data: created } = await resumeApi.create({ title, template_id: 1, template: 'classic' })
      await resumeApi.upload(created.id, file)
      onUploaded?.(created)
      onChange(String(created.id))
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Could not upload this resume.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Field>
      <label style={label}>Resume</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <select style={{ ...inputStyle, flex: 1 }} value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select a resume</option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.title} (#{resume.id})
            </option>
          ))}
        </select>
        <label
          style={{
            ...ghostBtn, display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap', cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <FaUpload size={12} />
          {uploading ? 'Uploading…' : selected ? 'Replace Resume' : 'Upload Resume'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={handleFile}
            disabled={uploading}
          />
        </label>

        {selected && (
          <span style={{ fontSize: '0.8rem', color: '#334155' }}>
            {selected.title} <span style={{ color: '#94a3b8' }}>(#{selected.id})</span>
          </span>
        )}
      </div>
      {uploadError && (
        <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#b91c1c' }}>{uploadError}</p>
      )}
    </Field>
  )
}

function JobDescriptionSelect({ list, value, onChange, error }) {
  return (
    <Field>
      <label style={label}>Job Description</label>
      <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a job description</option>
        {list.map((jd) => (
          <option key={jd.id} value={jd.id}>
            {jd.title}{jd.company ? ` — ${jd.company}` : ''}
          </option>
        ))}
      </select>
      {error && <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#b91c1c' }}>{error}</p>}
      {!error && list.length === 0 && <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#64748b' }}>No job descriptions found.</p>}
    </Field>
  )
}

/* ============================================================
   DASHBOARD VIEW
============================================================ */
function ToolCard({ tool, onOpen }) {
  return (
    <div style={{
      ...card, padding: 24, display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', gap: 4,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', background: tool.bg,
        color: tool.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        {tool.icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
        {tool.title}
      </h3>
      <p style={{ margin: '4px 0 16px', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, minHeight: 34 }}>
        {tool.desc}
      </p>
      <button
        onClick={() => onOpen(tool.id)}
        style={{ ...ghostBtn, marginTop: 'auto' }}
      >
        Open Tool →
      </button>
    </div>
  )
}

function Dashboard() {
  return (
    <div style={{
      ...card, padding: '28px 32px', position: 'relative', overflow: 'hidden',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
          AI Resume Assistant
        </h1>
        <Badge>AI</Badge>
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
        Use AI to improve, generate and optimize your resume with smart tools.
      </p>
    </div>
  )
}

/* ============================================================
   TOOL: Improve Text
============================================================ */
function ImproveTextTool() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [improved, setImproved] = useState('')

  const run = async () => {
    if (!text.trim()) { setError('Please enter some text first.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await aiApi.improveText({ text })
      setImproved(data.improved_text)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Field>
        <label style={label}>Enter Text</label>
        <textarea
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Developed a web application using React."
        />
      </Field>

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Improving…' : 'Improve with AI'}
      </button>

      <ErrorBox error={error} />

      {improved && (
        <ResultPanel title="AI Improved Text">
          <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>
            {improved}
          </p>
          <CopyButton text={improved} />
        </ResultPanel>
      )}
    </>
  )
}

/* ============================================================
   TOOL: Improve Summary
============================================================ */
function ImproveSummaryTool() {
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [improved, setImproved] = useState('')

  const run = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await aiApi.improveSummary({ instruction: instruction || undefined })
      setImproved(data.improved_summary)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Field>
        <label style={label}>Additional Instructions (Optional)</label>
        <input
          style={inputStyle}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Make it more concise and ATS friendly"
        />
      </Field>

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Improving…' : 'Improve Summary'}
      </button>

      <ErrorBox error={error} />

      {improved && (
        <ResultPanel title="AI Improved Summary">
          <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>
            {improved}
          </p>
          <CopyButton text={improved} />
        </ResultPanel>
      )}
    </>
  )
}

/* ============================================================
   TOOL: Improve Experience
============================================================ */
function ImproveExperienceTool() {
  const { currentResumeId, savedResumes, selectResume, loadResume } = useResume()
  const resumeId = currentResumeId ? String(currentResumeId) : ''
  const resumes = savedResumes || []
  const [experiences, setExperiences] = useState([])
  const [experienceId, setExperienceId] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [improved, setImproved] = useState('')
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    setExperienceId('')
    if (!resumeId) { setExperiences([]); return }
    let cancelled = false
    resumeApi.getExperience(resumeId).then(({ data }) => {
      if (!cancelled && String(currentResumeId) === String(resumeId)) setExperiences(data || [])
    }).catch(() => { if (!cancelled) setExperiences([]) })
    return () => { cancelled = true }
  }, [resumeId, currentResumeId])

  const run = async () => {
    if (!resumeId || !experienceId) { setError('Please select a resume and an experience entry.'); return }
    setError(''); setApplied(false); setLoading(true)
    try {
      const { data } = await aiApi.improveExperience(resumeId, experienceId, { instruction: instruction || undefined })
      if (String(currentResumeId) !== String(resumeId)) throw new Error('The active resume changed. Please run the request again.')
      setImproved(data.improved_description)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const applyChange = async () => {
    const operationResumeId = resumeId
    setApplying(true)
    try {
      await aiApi.applyChange(operationResumeId, {
        action: 'update',
        section: 'experience',
        target_id: Number(experienceId),
        content: improved,
      })
      if (String(currentResumeId) !== operationResumeId) throw new Error('The active resume changed before the AI change was applied.')
      await loadResume(operationResumeId)
      setApplied(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not apply the change.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={selectResume} />

      <Field>
        <label style={label}>Experience</label>
        <select style={inputStyle} value={experienceId} onChange={(e) => setExperienceId(e.target.value)} disabled={!resumeId}>
          <option value="">Select an experience</option>
          {experiences.map((exp) => (
            <option key={exp.id} value={exp.id}>{exp.job_title} — {exp.company}</option>
          ))}
        </select>
      </Field>

      <Field>
        <label style={label}>Additional Instructions (Optional)</label>
        <input
          style={inputStyle}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Add more impact and metrics"
        />
      </Field>

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Improving…' : 'Improve Experience'}
      </button>

      <ErrorBox error={error} />

      {improved && (
        <ResultPanel title="AI Improved Experience">
          <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {improved}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={primaryBtn} onClick={applyChange} disabled={applying}>
              {applied ? '✓ Applied' : applying ? 'Applying…' : 'Apply Change'}
            </button>
            <CopyButton text={improved} />
          </div>
        </ResultPanel>
      )}
    </>
  )
}

/* ============================================================
   TOOL: Improve Project
============================================================ */
function ImproveProjectTool() {
  const { currentResumeId, savedResumes, selectResume, loadResume } = useResume()
  const resumeId = currentResumeId ? String(currentResumeId) : ''
  const resumes = savedResumes || []
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [improved, setImproved] = useState('')
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    setProjectId('')
    if (!resumeId) { setProjects([]); return }
    let cancelled = false
    resumeApi.getProjects(resumeId).then(({ data }) => {
      if (!cancelled && String(currentResumeId) === String(resumeId)) setProjects(data || [])
    }).catch(() => { if (!cancelled) setProjects([]) })
    return () => { cancelled = true }
  }, [resumeId, currentResumeId])

  const run = async () => {
    if (!resumeId || !projectId) { setError('Please select a resume and a project entry.'); return }
    setError(''); setApplied(false); setLoading(true)
    try {
      const { data } = await aiApi.improveProject(resumeId, projectId, { instruction: instruction || undefined })
      if (String(currentResumeId) !== String(resumeId)) throw new Error('The active resume changed. Please run the request again.')
      setImproved(data.improved_description)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const applyChange = async () => {
    const operationResumeId = resumeId
    setApplying(true)
    try {
      await aiApi.applyChange(operationResumeId, {
        action: 'update',
        section: 'project',
        target_id: Number(projectId),
        content: improved,
      })
      if (String(currentResumeId) !== operationResumeId) throw new Error('The active resume changed before the AI change was applied.')
      await loadResume(operationResumeId)
      setApplied(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not apply the change.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={selectResume} />

      <Field>
        <label style={label}>Project</label>
        <select style={inputStyle} value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={!resumeId}>
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </Field>

      <Field>
        <label style={label}>Additional Instructions (Optional)</label>
        <input
          style={inputStyle}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Highlight measurable impact"
        />
      </Field>

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Improving…' : 'Improve Project'}
      </button>

      <ErrorBox error={error} />

      {improved && (
        <ResultPanel title="AI Improved Project">
          <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {improved}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={primaryBtn} onClick={applyChange} disabled={applying}>
              {applied ? '✓ Applied' : applying ? 'Applying…' : 'Apply Change'}
            </button>
            <CopyButton text={improved} />
          </div>
        </ResultPanel>
      )}
    </>
  )
}

/* ============================================================
   TOOL: Generate Content (any section, from a prompt)
============================================================ */
function GenerateContentTool() {
  const { currentResumeId, savedResumes, selectResume } = useResume()
  const resumeId = currentResumeId ? String(currentResumeId) : ''
  const resumes = savedResumes || []
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const run = async () => {
    if (!resumeId || !prompt.trim()) { setError('Please select a resume and enter a prompt.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await aiApi.generateResumeContent(resumeId, { prompt })
      if (String(currentResumeId) !== String(resumeId)) throw new Error('The active resume changed. Please run the request again.')
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={selectResume} />

      <Field>
        <label style={label}>Prompt</label>
        <textarea
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the role or project you want content generated for…"
        />
      </Field>

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Content'}
      </button>

      <ErrorBox error={error} />

      {result && (
        <ResultPanel title="Generated Content">
          {result.summary && (
            <>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Summary</p>
              <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>{result.summary}</p>
            </>
          )}
          {result.service_history?.length > 0 && (
            <>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Service History</p>
              <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: '0.85rem', color: '#1e293b' }}>
                {result.service_history.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </>
          )}
          {result.project?.title && (
            <>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Project — {result.project.title}</p>
              {result.project.technologies?.length > 0 && (
                <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#64748b' }}>
                  Technologies: {result.project.technologies.join(', ')}
                </p>
              )}
              <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: '0.85rem', color: '#1e293b' }}>
                {(result.project.description || []).map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </>
          )}
          <CopyButton text={JSON.stringify(result, null, 2)} />
        </ResultPanel>
      )}
    </>
  )
}

/* ============================================================
   TOOL: Generate Resume
============================================================ */
function GenerateResumeTool() {
  const { currentResumeId, savedResumes, selectResume } = useResume()
  const resumeId = currentResumeId ? String(currentResumeId) : ''
  const resumes = savedResumes || []
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')

  const run = async () => {
    if (!resumeId) { setError('Please select a resume.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await aiApi.generateResume(resumeId, { instruction: instruction || undefined })
      if (String(currentResumeId) !== String(resumeId)) throw new Error('The active resume changed. Please run the request again.')
      setContent(data.content)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={selectResume} />

      <Field>
        <label style={label}>Additional Instructions (Optional)</label>
        <input
          style={inputStyle}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Focus on leadership and cross-functional work"
        />
      </Field>

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Resume'}
      </button>

      <ErrorBox error={error} />

      {content && (
        <ResultPanel title="Generated Resume">
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {content}
          </p>
          <CopyButton text={content} />
        </ResultPanel>
      )}
    </>
  )
}

/* ============================================================
   TOOL: Analyze Job Description
============================================================ */
function AnalyzeJobDescriptionTool() {
  const [list, setList] = useState([])
  const [jdId, setJdId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    jobDescriptionApi.list().then(({ data }) => setList(data || [])).catch((err) => {
      setList([])
      setListError(err.response?.data?.detail || 'Could not load job descriptions.')
    })
  }, [])

  const run = async () => {
    if (!jdId) { setError('Please select a job description.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await aiApi.analyzeJobDescription(jdId)
      setAnalysis(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const row = (k, v) => (
    <tr key={k}>
      <td style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', width: 160, verticalAlign: 'top', borderBottom: '1px solid #e2e8f0' }}>{k}</td>
      <td style={{ padding: '8px 12px', fontSize: '0.82rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>{v || '—'}</td>
    </tr>
  )

  return (
    <>
      <JobDescriptionSelect list={list} value={jdId} onChange={setJdId} error={listError} />

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Analyzing…' : 'Analyze with AI'}
      </button>

      <ErrorBox error={error} />

      {analysis && (
        <ResultPanel title="Job Analysis Result">
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <tbody>
              {row('Job Title', analysis.job_title)}
              {row('Required Skills', (analysis.required_skills || []).join(', '))}
              {row('Preferred Skills', (analysis.preferred_skills || []).join(', '))}
              {row('Experience', (analysis.experience_requirements || []).join(', '))}
              {row('Education', (analysis.education_requirements || []).join(', '))}
              {row('Keywords', (analysis.keywords || []).join(', '))}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <CopyButton text={JSON.stringify(analysis, null, 2)} />
          </div>
        </ResultPanel>
      )}
    </>
  )
}

/* ============================================================
   TOOL: Tailored Resume
============================================================ */
function TailoredResumeTool() {
  const { currentResumeId, savedResumes, selectResume, loadResume } = useResume()
  const resumeId = currentResumeId ? String(currentResumeId) : ''
  const resumes = savedResumes || []
  const [jdList, setJdList] = useState([])
  const [jdId, setJdId] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [jdError, setJdError] = useState('')
  const [tailored, setTailored] = useState(null)
  const [approvedChangeIds, setApprovedChangeIds] = useState(new Set())
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    jobDescriptionApi.list().then(({ data }) => setJdList(data || [])).catch((err) => {
      setJdList([])
      setJdError(err.response?.data?.detail || 'Could not load job descriptions.')
    })
  }, [])

  const run = async () => {
    if (!resumeId || !jdId) { setError('Please select a resume and a job description.'); return }
    setError(''); setApplied(false); setLoading(true)
    try {
      const { data } = await aiApi.generateTailoredResume(resumeId, jdId, { instruction: instruction || undefined })
      if (String(currentResumeId) !== String(resumeId)) throw new Error('The active resume changed. Please run the request again.')
      setTailored(data)
      setApprovedChangeIds(new Set((data.changes || []).map((change, index) => changeKey(change, index))))
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const applyTailored = async () => {
    const operationResumeId = resumeId
    const approvedChanges = (Array.isArray(tailored?.changes) ? tailored.changes : []).filter((change, index) =>
      approvedChangeIds.has(changeKey(change, index))
    )
    const approvedSummary = approvedChanges.find((change) => change.section === 'summary')
    const experienceUpdates = {}
    const projectUpdates = {}

    approvedChanges.forEach((change) => {
      const tailoredContent = changeContent(change, 'tailored', 'new_content')
      if (change.section === 'experience' && change.target_id != null) {
        experienceUpdates[change.target_id] = tailoredContent
      }
      if (change.section === 'project' && change.target_id != null) {
        projectUpdates[change.target_id] = tailoredContent
      }
    })

    setApplying(true)
    try {
      await aiApi.applyTailoredResume(operationResumeId, {
        summary: approvedSummary
          ? changeContent(approvedSummary, 'tailored', 'new_content')
          : undefined,
        skill_ids: [],
        experience_updates: experienceUpdates,
        project_updates: projectUpdates,
      })
      if (String(currentResumeId) !== operationResumeId) throw new Error('The active resume changed before the AI change was applied.')
      await loadResume(operationResumeId)
      setApplied(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not apply the tailored resume.')
    } finally {
      setApplying(false)
    }
  }

  const selectedJobDescription = jdList.find((item) => String(item.id) === String(jdId))
  const structured = tailored?.structured || {}
  const changes = Array.isArray(tailored?.changes) ? tailored.changes : []
  const changeKey = (change, index) => `${change.id || change.section || 'change'}:${change.target_id ?? 'summary'}:${index}`
  const changeContent = (change, primary, fallback = '') => change[primary] ?? change[fallback] ?? ''
  const changeTargetLabel = (change) => {
    if (change.section === 'experience') {
      const item = (structured.experience || []).find(
        (entry) => String(entry.experience_id ?? entry.id) === String(change.target_id),
      )
      return item?.company || `#${change.target_id}`
    }
    if (change.section === 'project') {
      const item = (structured.projects || []).find(
        (entry) => String(entry.project_id ?? entry.id) === String(change.target_id),
      )
      return item?.title || item?.project_title || `#${change.target_id}`
    }
    return 'Resume summary'
  }
  const toggleChange = (changeKeyValue) => {
    setApprovedChangeIds((current) => {
      const next = new Set(current)
      if (next.has(changeKeyValue)) next.delete(changeKeyValue)
      else next.add(changeKeyValue)
      return next
    })
  }

  const approvedCount = approvedChangeIds.size

  const renderChanges = () => {
    if (changes.length === 0) return null
    return (
      <div style={{ marginTop: 20 }}>
        <p style={{ ...label, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Proposed Changes</p>
        {changes.map((change, index) => {
          const key = changeKey(change, index)
          const originalContent = changeContent(change, 'original', 'old_content')
          const tailoredContent = changeContent(change, 'tailored', 'new_content')

          return (
            <label
              key={key}
              style={{
                display: 'block',
                padding: 16,
                marginBottom: 12,
                background: '#fff',
                border: '1px solid #dbeafe',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={approvedChangeIds.has(key)}
                  onChange={() => toggleChange(key)}
                  style={{ marginTop: 4 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {change.section} · {changeTargetLabel(change)}
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                        Original
                      </span>
                      <div style={{ whiteSpace: 'pre-wrap', color: '#475569', fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {originalContent || '(empty)'}
                      </div>
                    </div>

                    <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12 }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                        Tailored
                      </span>
                      <div style={{ whiteSpace: 'pre-wrap', color: '#14532d', fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {tailoredContent || '(empty)'}
                      </div>
                    </div>
                  </div>

                  {change.reason && (
                    <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '0.74rem', lineHeight: 1.5 }}>
                      {change.reason}
                    </p>
                  )}
                </div>
              </div>
            </label>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={selectResume} />
      <JobDescriptionSelect list={jdList} value={jdId} onChange={setJdId} error={jdError} />

      <Field>
        <label style={label}>Additional Instructions (Optional)</label>
        <input
          style={inputStyle}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Focus more on backend skills"
        />
      </Field>

      <button style={primaryBtn} onClick={run} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Tailored Resume'}
      </button>

      {loading && (
        <div style={{ marginTop: 12, color: '#64748b', fontSize: '0.82rem' }}>
          Analyzing the job description and comparing it with the selected resume…
        </div>
      )}

      <ErrorBox error={error} />

      {tailored && (
        <ResultPanel title="Tailored Resume Review">
          <div style={{ marginBottom: 14, color: '#475569', fontSize: '0.82rem', lineHeight: 1.6 }}>
            <strong>Resume:</strong> {resumes.find((item) => String(item.id) === resumeId)?.title || resumeId}
            <br />
            <strong>Job Description:</strong> {selectedJobDescription?.title || jdId}
          </div>

          <p style={{ ...label, marginBottom: 6 }}>Tailored Summary</p>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {structured.summary || tailored.content}
          </p>

          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <p style={{ ...label, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>JD Match Overview</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, background: '#ecfdf5', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                <p style={{ ...label, color: '#047857', marginBottom: 6 }}>Matched Skills</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#065f46' }}>
                  {(structured.matched_skills || []).length || 0}
                </p>
              </div>
              <div style={{ padding: 12, background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
                <p style={{ ...label, color: '#c2410c', marginBottom: 6 }}>Missing Skills</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#9a3412' }}>
                  {(structured.missing_skills || []).length || 0}
                </p>
              </div>
              <div style={{ padding: 12, background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                <p style={{ ...label, color: '#1d4ed8', marginBottom: 6 }}>Matched Keywords</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e3a8a' }}>
                  {(structured.matched_keywords || []).length || 0}
                </p>
              </div>
              <div style={{ padding: 12, background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                <p style={{ ...label, color: '#b91c1c', marginBottom: 6 }}>Missing Keywords</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#991b1b' }}>
                  {(structured.missing_keywords || []).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 12, background: '#ecfdf5', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <p style={{ ...label, color: '#047857' }}>Matched Skills</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#065f46', whiteSpace: 'pre-wrap' }}>
                {(structured.matched_skills || []).join(', ') || 'None identified'}
              </p>
            </div>
            <div style={{ padding: 12, background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
              <p style={{ ...label, color: '#c2410c' }}>Missing Skills</p>
              <p style={{ margin: '0 0 6px', fontSize: '0.76rem', color: '#9a3412', fontWeight: 600 }}>
                Missing skills — not currently present in your resume
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#9a3412', whiteSpace: 'pre-wrap' }}>
                {(structured.missing_skills || []).join(', ') || 'None identified'}
              </p>
            </div>
          </div>

          {renderChanges()}

          {(structured.matched_keywords || []).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={label}>Matched Keywords</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                {structured.matched_keywords.join(', ')}
              </p>
            </div>
          )}
          {(structured.missing_keywords || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={label}>Missing Keywords</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#9a3412' }}>
                {structured.missing_keywords.join(', ')}
              </p>
            </div>
          )}
          {(structured.recommendations || []).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={label}>Recommendations</p>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: '0.82rem' }}>
                {structured.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
            <button style={{ ...primaryBtn }} onClick={applyTailored} disabled={applying || approvedCount === 0}>
              {applied ? '✓ Applied' : applying ? 'Applying…' : `Apply Selected Changes${approvedCount > 0 ? ` (${approvedCount})` : ''}`}
            </button>
          </div>
        </ResultPanel>
      )}
    </>
  )
}

const TOOL_COMPONENTS = {
  'improve-text': ImproveTextTool,
  'improve-summary': ImproveSummaryTool,
  'improve-experience': ImproveExperienceTool,
  'improve-project': ImproveProjectTool,
  'generate-resume-content': GenerateContentTool,
  'generate-resume': GenerateResumeTool,
  'analyze-job-description': AnalyzeJobDescriptionTool,
  'generate-tailored-resume': TailoredResumeTool,
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function AIAssistant() {
  const [activeId, setActiveId] = useState(null)
  const activeTool = TOOLS.find((t) => t.id === activeId)
  const ActiveComponent = activeId ? TOOL_COMPONENTS[activeId] : null

  if (!activeId) {
    return (
      <div style={pageShell}>
        <Dashboard />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}>
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onOpen={setActiveId} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={pageShell}>
      <div style={{ ...card, padding: 28, width: '100%', boxSizing: 'border-box' }}>
        <button
          onClick={() => setActiveId(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none',
            border: 'none', color: '#64748b', fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', padding: 0, marginBottom: 18,
          }}
        >
          <FaArrowLeft size={12} /> Back to AI Tools
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: activeTool.bg,
            color: activeTool.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {activeTool.icon}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
            {activeTool.title}
          </h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 22px' }}>
          {activeTool.desc}
        </p>

        <ActiveComponent />
      </div>
    </div>
  )
}