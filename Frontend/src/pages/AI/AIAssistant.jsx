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

/* Resume selector — upload only (no dropdown) */
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
      const { data: created } = await resumeApi.create({ title, template: 'classic' })
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

function JobDescriptionSelect({ list, value, onChange }) {
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
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [experiences, setExperiences] = useState([])
  const [experienceId, setExperienceId] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [improved, setImproved] = useState('')
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    resumeApi.list().then(({ data }) => setResumes(data || [])).catch(() => setResumes([]))
  }, [])

  useEffect(() => {
    setExperienceId('')
    if (!resumeId) { setExperiences([]); return }
    resumeApi.getExperience(resumeId).then(({ data }) => setExperiences(data || [])).catch(() => setExperiences([]))
  }, [resumeId])

  const run = async () => {
    if (!resumeId || !experienceId) { setError('Please select a resume and an experience entry.'); return }
    setError(''); setApplied(false); setLoading(true)
    try {
      const { data } = await aiApi.improveExperience(resumeId, experienceId, { instruction: instruction || undefined })
      setImproved(data.improved_description)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const applyChange = async () => {
    setApplying(true)
    try {
      await aiApi.applyChange(resumeId, {
        action: 'update',
        section: 'experience',
        target_id: Number(experienceId),
        content: improved,
      })
      setApplied(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not apply the change.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={setResumeId} onUploaded={(r) => setResumes((prev) => [...prev, r])} />

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
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [improved, setImproved] = useState('')
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    resumeApi.list().then(({ data }) => setResumes(data || [])).catch(() => setResumes([]))
  }, [])

  useEffect(() => {
    setProjectId('')
    if (!resumeId) { setProjects([]); return }
    resumeApi.getProjects(resumeId).then(({ data }) => setProjects(data || [])).catch(() => setProjects([]))
  }, [resumeId])

  const run = async () => {
    if (!resumeId || !projectId) { setError('Please select a resume and a project entry.'); return }
    setError(''); setApplied(false); setLoading(true)
    try {
      const { data } = await aiApi.improveProject(resumeId, projectId, { instruction: instruction || undefined })
      setImproved(data.improved_description)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const applyChange = async () => {
    setApplying(true)
    try {
      await aiApi.applyChange(resumeId, {
        action: 'update',
        section: 'project',
        target_id: Number(projectId),
        content: improved,
      })
      setApplied(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not apply the change.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={setResumeId} onUploaded={(r) => setResumes((prev) => [...prev, r])} />

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
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    resumeApi.list().then(({ data }) => setResumes(data || [])).catch(() => setResumes([]))
  }, [])

  const run = async () => {
    if (!resumeId || !prompt.trim()) { setError('Please select a resume and enter a prompt.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await aiApi.generateResumeContent(resumeId, { prompt })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={setResumeId} onUploaded={(r) => setResumes((prev) => [...prev, r])} />

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
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    resumeApi.list().then(({ data }) => setResumes(data || [])).catch(() => setResumes([]))
  }, [])

  const run = async () => {
    if (!resumeId) { setError('Please select a resume.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await aiApi.generateResume(resumeId, { instruction: instruction || undefined })
      setContent(data.content)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={setResumeId} onUploaded={(r) => setResumes((prev) => [...prev, r])} />

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
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    jobDescriptionApi.list().then(({ data }) => setList(data || [])).catch(() => setList([]))
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
      <JobDescriptionSelect list={list} value={jdId} onChange={setJdId} />

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
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [jdList, setJdList] = useState([])
  const [jdId, setJdId] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [tailored, setTailored] = useState(null)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    resumeApi.list().then(({ data }) => setResumes(data || [])).catch(() => setResumes([]))
    jobDescriptionApi.list().then(({ data }) => setJdList(data || [])).catch(() => setJdList([]))
  }, [])

  const run = async () => {
    if (!resumeId || !jdId) { setError('Please select a resume and a job description.'); return }
    setError(''); setApplied(false); setLoading(true)
    try {
      const { data } = await aiApi.generateTailoredResume(resumeId, jdId, { instruction: instruction || undefined })
      setTailored(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const applyTailored = async () => {
    setApplying(true)
    try {
      const structured = tailored?.structured
      await aiApi.applyTailoredResume(resumeId, {
        summary: structured?.summary || undefined,
        skill_ids: [],
      })
      setApplied(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not apply the tailored resume.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <>
      <ResumeSelect resumes={resumes} value={resumeId} onChange={setResumeId} onUploaded={(r) => setResumes((prev) => [...prev, r])} />
      <JobDescriptionSelect list={jdList} value={jdId} onChange={setJdId} />

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

      <ErrorBox error={error} />

      {tailored && (
        <ResultPanel title="AI Tailored Resume Summary">
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {tailored.structured?.summary || tailored.content}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={primaryBtn} onClick={applyTailored} disabled={applying}>
              {applied ? '✓ Applied' : applying ? 'Applying…' : 'Apply Tailored Resume'}
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
      <div>
        <Dashboard />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
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
    <div style={{ ...card, padding: 28, maxWidth: 720 }}>
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
  )
}