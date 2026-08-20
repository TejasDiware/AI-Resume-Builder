import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import { createWorker } from 'tesseract.js'

import {
  FaRobot,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
  FaPaperclip,
  FaPaperPlane,
} from 'react-icons/fa'
import {
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdOutlineAnalytics,
  MdOutlineTipsAndUpdates,
  MdRefresh,
  MdClose,
} from 'react-icons/md'

import {
  achievementApi,
  atsApi,
  certificationApi,
  jobDescriptionApi,
  aiApi,
  languageApi,
  profileApi,
  resumeApi,
} from '../../utils/api'
import { useResume } from '../../context/ResumeContext'

/* ============================================================
   PDF WORKER
============================================================ */
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/* ============================================================
   CONSTANTS
============================================================ */
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp']
let ocrWorkerPromise = null

/* ============================================================
   STEP MACHINE
   idle → resume → jd → analyzing → result
============================================================ */
const STEP = {
  IDLE:      'idle',
  RESUME:    'resume',
  JD:        'jd',
  ANALYZING: 'analyzing',
  RESULT:    'result',
}

/* ============================================================
   OCR
============================================================ */
function getOcrWorker(onProgress) {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = createWorker('eng', 1, {
      logger: (m) => {
        if (onProgress && m.status === 'recognizing text')
          onProgress(Math.round((m.progress || 0) * 100))
      },
    })
  }
  return ocrWorkerPromise
}

async function ocrCanvas(canvas, onProgress) {
  const worker = await getOcrWorker(onProgress)
  const { data: { text } } = await worker.recognize(canvas)
  return (text || '').trim()
}

/* ============================================================
   PDF
============================================================ */
async function renderPdfPageToCanvas(page, scale = 2) {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  return canvas
}

async function extractTextFromPDF(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    fullText += content.items.map((i) => i.str).join(' ') + '\n'
  }
  fullText = fullText.trim()
  if (fullText.length < 20) {
    if (onProgress) onProgress({ mode: 'ocr', page: 0, totalPages: pdf.numPages, percent: 0 })
    let ocrText = ''
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p)
      const canvas = await renderPdfPageToCanvas(page)
      const t = await ocrCanvas(canvas, (pct) => {
        if (onProgress) onProgress({ mode: 'ocr', page: p, totalPages: pdf.numPages, percent: pct })
      })
      ocrText += t + '\n'
    }
    fullText = ocrText.trim()
  }
  return fullText
}

/* ============================================================
   DOCX
============================================================ */
async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

/* ============================================================
   IMAGE OCR
============================================================ */
async function extractTextFromImage(file, onProgress) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  canvas.getContext('2d').drawImage(image, 0, 0)
  if (onProgress) onProgress({ mode: 'ocr', page: 1, totalPages: 1, percent: 0 })
  return ocrCanvas(canvas, (pct) => {
    if (onProgress) onProgress({ mode: 'ocr', page: 1, totalPages: 1, percent: pct })
  })
}

/* ============================================================
   FILE PARSER
============================================================ */
async function parseFile(file, onProgress) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return extractTextFromPDF(file, onProgress)
  if (ext === 'docx') return extractTextFromDOCX(file)
  if (ext === 'doc') throw new Error('.doc is not supported. Convert to .docx or .pdf.')
  if (ext === 'txt')
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  if (IMAGE_EXTS.includes(ext)) return extractTextFromImage(file, onProgress)
  throw new Error(`Unsupported file type: .${ext}`)
}

/* ============================================================
   FILE ICON
============================================================ */
function FileIcon({ name, size = 16 }) {
  const ext = name?.split('.').pop().toLowerCase()
  if (ext === 'pdf')  return <FaFilePdf size={size} color="#ef4444" />
  if (ext === 'docx') return <FaFileWord size={size} color="#2563eb" />
  if (IMAGE_EXTS.includes(ext)) return <FaFileImage size={size} color="#16a34a" />
  return <FaFileAlt size={size} color="#6b7280" />
}

/* ============================================================
   SCORE RING
============================================================ */
function ScoreRing({ score, size = 110, stroke = 11 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        style={{ fill: color, fontSize: size * 0.2, fontWeight: 800,
                 transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {score}%
      </text>
    </svg>
  )
}

/* ============================================================
   SCORE BAR
============================================================ */
function ScoreBar({ label, score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ height: 7, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 999, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

/* ============================================================
   NORMALIZE BACKEND RESULT
============================================================ */
function normalizeBackendResult(data) {
  if (!data) return null
  const overall     = Number(data.overall_score ?? data.overall ?? 0)
  const keywordScore     = Number(data.keywords_score ?? data.keyword_score ?? data.keywordScore ?? 0)
  const experienceScore  = Number(data.experience_score ?? 0)
  const educationScore   = Number(data.education_score ?? 0)
  const completenessScore = Number(data.completeness_score ?? data.sectionScore ?? 0)
  const matched       = Array.isArray(data.matched_keywords) ? data.matched_keywords : Array.isArray(data.matched) ? data.matched : []
  const missing       = Array.isArray(data.missing_keywords) ? data.missing_keywords : Array.isArray(data.missing) ? data.missing : []
  const matchedSkills = Array.isArray(data.matched_skills) ? data.matched_skills : []
  const missingSkills = Array.isArray(data.missing_skills) ? data.missing_skills : []
  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : []
  const tips = recommendations.length > 0
    ? recommendations.map((text) => ({ type: 'warn', text }))
    : [{ type: 'pass', text: 'Your resume has strong baseline alignment with this job description.' }]
  return {
    overall, keywordScore, completenessScore, experienceScore, educationScore,
    matched, missing, matchedSkills, missingSkills, tips,
    jobWords: [...new Set([...matched, ...missing])],
  }
}

/* ============================================================
   RESULT BUBBLE — full ATS result rendered inside a chat bubble
============================================================ */
function ResultBubble({ result }) {
  const scoreColor = result.overall >= 75 ? '#10b981' : result.overall >= 50 ? '#f59e0b' : '#ef4444'
  const badgeBg    = result.overall >= 75 ? '#dcfce7' : result.overall >= 50 ? '#fef9c3' : '#fee2e2'
  const badgeLabel = result.overall >= 75 ? 'ATS Friendly' : result.overall >= 50 ? 'Needs Work' : 'High Risk'

  return (
    <div className="chat-result">

      {/* ── Overall score ── */}
      <div className="chat-result__score-row">
        <ScoreRing score={result.overall} />
        <div className="chat-result__score-meta">
          <div className="chat-result__score-title">Overall ATS Score</div>
          <p className="chat-result__score-desc">
            {result.overall >= 75
              ? 'Great! Your resume is well-optimized for ATS systems.'
              : result.overall >= 50
              ? 'Your resume needs some improvements to pass ATS filters.'
              : 'Your resume may be filtered out by ATS. Follow the tips below.'}
          </p>
          <span className="chat-result__badge" style={{ background: badgeBg, color: scoreColor }}>
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* ── Breakdown ── */}
      <div className="chat-result__section">
        <div className="chat-result__section-head">
          <MdOutlineAnalytics size={15} color="#4f46e5" />
          <span>Score Breakdown</span>
        </div>
        <ScoreBar label="Keyword Match"  score={result.keywordScore} />
        <ScoreBar label="Completeness"   score={result.completenessScore} />
        <ScoreBar label="Experience"     score={result.experienceScore} />
        <ScoreBar label="Education"      score={result.educationScore} />
      </div>

      {/* ── Matched Skills ── */}
      {result.matchedSkills.length > 0 && (
        <div className="chat-result__section">
          <div className="chat-result__section-head">
            <MdCheckCircle size={15} color="#10b981" />
            <span>Matched Skills</span>
          </div>
          <div className="chat-result__tags">
            {result.matchedSkills.map((s) => (
              <span key={s} className="ats-kw-tag ats-kw-tag--match">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Missing Skills ── */}
      {result.missingSkills.length > 0 && (
        <div className="chat-result__section">
          <div className="chat-result__section-head">
            <MdCancel size={15} color="#ef4444" />
            <span>Missing Skills</span>
          </div>
          <div className="chat-result__tags">
            {result.missingSkills.map((s) => (
              <span key={s} className="ats-kw-tag ats-kw-tag--miss">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Keyword Analysis ── */}
      {result.jobWords.length > 0 && (
        <div className="chat-result__section">
          <div className="chat-result__section-head">
            <MdOutlineTipsAndUpdates size={15} color="#4f46e5" />
            <span>Keyword Analysis</span>
          </div>
          {result.matched.length > 0 && (
            <div style={{ marginBottom: '0.6rem' }}>
              <p className="ats-kw-label ats-kw-label--match" style={{ marginBottom: 6 }}>
                <MdCheckCircle size={13} /> Matched ({result.matched.length})
              </p>
              <div className="chat-result__tags">
                {result.matched.map((w) => (
                  <span key={w} className="ats-kw-tag ats-kw-tag--match">{w}</span>
                ))}
              </div>
            </div>
          )}
          {result.missing.length > 0 && (
            <div>
              <p className="ats-kw-label ats-kw-label--miss" style={{ marginBottom: 6 }}>
                <MdCancel size={13} /> Missing ({result.missing.length})
              </p>
              <div className="chat-result__tags">
                {result.missing.map((w) => (
                  <span key={w} className="ats-kw-tag ats-kw-tag--miss">{w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tips ── */}
      <div className="chat-result__section" style={{ marginBottom: 0 }}>
        <div className="chat-result__section-head">
          <MdOutlineTipsAndUpdates size={15} color="#4f46e5" />
          <span>Improvement Tips</span>
        </div>
        <ul className="ats-tips">
          {result.tips.map((tip, i) => (
            <li key={i} className={`ats-tip ats-tip--${tip.type}`}>
              {tip.type === 'pass' ? <MdCheckCircle size={16} color="#10b981" />
               : tip.type === 'error' ? <MdCancel size={16} color="#ef4444" />
               : <MdWarning size={16} color="#f59e0b" />}
              <span>{tip.text}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function ATSCheckerChat() {
  const {
    addResume,
    refreshResumes,
    selectResume,
    setAchievements,
    setCertifications,
    setEducation,
    setEducationSaved,
    setExperienceSaved,
    setExperiences,
    setLanguages,
    setPortfolioSaved,
    setProfileData,
    setProfileSaved,
    setProjects,
    setProjectsSaved,
    setResumeTitle,
    setSkills,
    setSkillsSaved,
    setSummary,
    setWebsites,
  } = useResume()
  const navigate = useNavigate()

  /* ── conversation messages ── */
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      type: 'text',
      text: "Hi! I'm your ATS checker. Upload your resume (PDF, DOCX, TXT, or image) and I'll analyse how well it matches a job description.",
    },
    {
      id: 2,
      from: 'bot',
      type: 'upload-prompt',
      text: 'Start by uploading your resume below.',
    },
  ])

  /* ── step state ── */
  const [step, setStep] = useState(STEP.RESUME)

  /* ── resume file state ── */
  const [resumeText, setResumeText]   = useState('')
  const [fileName, setFileName]       = useState('')
  const [checkResumeId, setCheckResumeId] = useState(null)
  const [parsing, setParsing]         = useState(false)
  const [ocrStatus, setOcrStatus]     = useState(null)
  const [fileError, setFileError]     = useState('')
  const [dragOver, setDragOver]       = useState(false)

  /* ── job description ── */
  const [jobDesc, setJobDesc]         = useState('')
  const [jdRows, setJdRows]           = useState(4)
  const [jdId, setJdId]               = useState(null)

  /* ── analyzing ── */
  const [analyzing, setAnalyzing]     = useState(false)
  const [improving, setImproving]     = useState(false)

  /* ── refs ── */
  const fileRef     = useRef()
  const bottomRef   = useRef()
  const textareaRef = useRef()

  /* ── auto-scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, analyzing])

  /* ── helpers ── */
  function addMessage(msg) {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }])
  }

  /* ============================================================
     FILE HANDLING
  ============================================================ */
  const handleFileLoad = async (file) => {
    if (!file) return
    setFileError('')
    setResumeText('')
    setOcrStatus(null)
    setFileName(file.name)
    setParsing(true)

    try {
      const text = await parseFile(file, (progress) => {
        if (progress?.mode === 'ocr') setOcrStatus(progress)
      })

      if (!text || text.length < 20) {
        setFileError('Could not extract text from this file.')
        setFileName('')
        return
      }

      const title = file.name.replace(/\.[^.]+$/, '') || 'ATS Resume'
      const { data: created } = await resumeApi.create({
        title,
        template: 'classic',
      })
      const resumeId = created?.id

      if (!resumeId) {
        throw new Error('The resume could not be created.')
      }

      await resumeApi.upload(resumeId, file)

      setResumeText(text)
      setCheckResumeId(resumeId)
      addResume?.({
        id: resumeId,
        title,
        templateId: 1,
        score: 0,
        createdAt: new Date().toLocaleDateString(),
      })
      await refreshResumes?.()

      /* Add user bubble showing the uploaded file */
      addMessage({
        from: 'user',
        type: 'file',
        fileName: file.name,
        charCount: text.length,
      })

      /* Bot response */
      setTimeout(() => {
        addMessage({
          from: 'bot',
          type: 'text',
          text: `Got it! I've read and saved your resume (${text.length.toLocaleString()} characters). Now paste the job description you want to match against.`,
        })
        setStep(STEP.JD)
      }, 400)

    } catch (err) {
      setFileError(err.message || 'Failed to read file.')
      setFileName('')
    } finally {
      setParsing(false)
      setOcrStatus(null)
    }
  }

  const handleInputChange  = (e) => handleFileLoad(e.target.files?.[0])
  const handleDrop         = (e) => { e.preventDefault(); setDragOver(false); handleFileLoad(e.dataTransfer.files?.[0]) }

  const clearFile = () => {
    setFileName(''); setResumeText(''); setCheckResumeId(null); setFileError(''); setOcrStatus(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  /* ============================================================
     SEND JOB DESCRIPTION
  ============================================================ */
  const handleSendJD = async () => {
    const jd = jobDesc.trim()
    if (!jd || step !== STEP.JD) return

    /* User bubble */
    addMessage({ from: 'user', type: 'jd', text: jd })
    setJobDesc('')
    setStep(STEP.ANALYZING)
    setAnalyzing(true)

    /* Typing indicator */
    addMessage({ from: 'bot', type: 'typing', id: 'typing' })

    try {
      /* ── 1. Resolve resume ID ── */
      if (!checkResumeId) {
        throw new Error('Please upload your resume again before analyzing it.')
      }

      /* ── 2. Create Job Description ── */
      const { data: jobDescription } = await jobDescriptionApi.create({
        title: 'ATS Check', company: '', description: jd,
      })
      if (!jobDescription?.id) throw new Error('Job description ID was not returned by the server.')
      setJdId(jobDescription.id)

      /* ── 3. Analyze JD with AI ── */
      await aiApi.analyzeJobDescription(jobDescription.id)

      /* ── 4. ATS Score ── */
      const { data: scoreData } = await atsApi.score(checkResumeId, jobDescription.id)
      const normalized = normalizeBackendResult(scoreData)
      if (!normalized) throw new Error('No ATS score was returned by the server.')

      /* Remove typing indicator, add result */
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'))
      addMessage({ from: 'bot', type: 'result', result: normalized })
      setStep(STEP.RESULT)

    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to analyze resume.'

      setMessages((prev) => prev.filter((m) => m.id !== 'typing'))
      addMessage({ from: 'bot', type: 'error', text: msg })
      setStep(STEP.JD)   // allow retry
    } finally {
      setAnalyzing(false)
    }
  }

  /* ============================================================
     RESET
  ============================================================ */
  const handleReset = () => {
    clearFile()
    setJobDesc('')
    setStep(STEP.RESUME)
    setAnalyzing(false)
    setImproving(false)
    setJdId(null)
    setMessages([
      { id: 1, from: 'bot', type: 'text', text: "Hi! I'm your ATS checker. Upload your resume (PDF, DOCX, TXT, or image) and I'll analyse how well it matches a job description." },
      { id: 2, from: 'bot', type: 'upload-prompt', text: 'Start by uploading your resume below.' },
    ])
  }

  /* ============================================================
     KEYBOARD — send on Enter (Shift+Enter = newline)
  ============================================================ */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendJD()
    }
  }

  const handleImproveResume = async () => {
    if (!checkResumeId || !jdId || improving) return

    setImproving(true)
    addMessage({ from: 'bot', type: 'typing', id: 'typing' })

    try {
      const { data: optimization } = await atsApi.optimize(checkResumeId, jdId)
      const changes = Array.isArray(optimization?.changes) ? optimization.changes : []

      if (!changes.length) {
        throw new Error('No resume changes were returned for this job description.')
      }

      const appliedReasons = []
      for (const change of changes) {
        const request = {
          action: change.action,
          section: change.section,
          target_id: change.target_id ?? null,
        }

        if (change.action === 'create') {
          request.data = change.data
        } else {
          request.content = change.new_content
        }

        await aiApi.applyChange(checkResumeId, request)
        if (change.reason) appliedReasons.push(change.reason)
      }

      setMessages((prev) => prev.filter((m) => m.id !== 'typing'))
      addMessage({
        from: 'bot',
        type: 'improve-result',
        reasons: appliedReasons,
      })
      await refreshResumes?.()
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to improve your resume.'

      setMessages((prev) => prev.filter((m) => m.id !== 'typing'))
      addMessage({ from: 'bot', type: 'error', text: msg })
    } finally {
      setImproving(false)
    }
  }

  const handleOpenInBuilder = async () => {
    if (!checkResumeId) return
    await selectResume?.(checkResumeId)
    navigate('/app/profile?template=1')
  }

  /* ============================================================
     RENDER MESSAGES
  ============================================================ */
  function renderMessage(msg) {
    const isBot = msg.from === 'bot'

    if (msg.type === 'typing') {
      return (
        <div key={msg.id} className="chat-row chat-row--bot">
          <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>
          <div className="chat-bubble chat-bubble--bot chat-bubble--typing">
            <span className="chat-dot" />
            <span className="chat-dot" />
            <span className="chat-dot" />
          </div>
        </div>
      )
    }

    if (msg.type === 'upload-prompt') {
      return (
        <div key={msg.id} className="chat-row chat-row--bot">
          <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>
          <div className="chat-bubble chat-bubble--bot">
            <p className="chat-bubble__text">{msg.text}</p>
          </div>
        </div>
      )
    }

    if (msg.type === 'file') {
      return (
        <div key={msg.id} className="chat-row chat-row--user">
          <div className="chat-bubble chat-bubble--user">
            <div className="chat-file-pill">
              <FileIcon name={msg.fileName} size={18} />
              <div className="chat-file-pill__info">
                <span className="chat-file-pill__name">{msg.fileName}</span>
                <span className="chat-file-pill__chars">{msg.charCount?.toLocaleString()} characters extracted</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (msg.type === 'jd') {
      const preview = msg.text.length > 180 ? msg.text.slice(0, 180) + '…' : msg.text
      return (
        <div key={msg.id} className="chat-row chat-row--user">
          <div className="chat-bubble chat-bubble--user">
            <p className="chat-bubble__text" style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem' }}>{preview}</p>
            <span className="chat-bubble__sub">{msg.text.length.toLocaleString()} characters</span>
          </div>
        </div>
      )
    }

    if (msg.type === 'result') {
      return (
        <div key={msg.id} className="chat-row chat-row--bot chat-row--wide">
          <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>
          <div className="chat-bubble chat-bubble--bot chat-bubble--result">
            <ResultBubble result={msg.result} />
          </div>
        </div>
      )
    }

    if (msg.type === 'improve-result') {
      return (
        <div key={msg.id} className="chat-row chat-row--bot">
          <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>
          <div className="chat-bubble chat-bubble--bot">
            <p className="chat-bubble__text">Your resume has been improved for this job description.</p>
            {msg.reasons?.length > 0 && (
              <ul className="ats-tips" style={{ marginTop: '0.6rem' }}>
                {msg.reasons.map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}
              </ul>
            )}
            <button type="button" className="chat-new-check-btn" onClick={handleOpenInBuilder} style={{ marginTop: '0.75rem' }}>
              Open in Resume Builder
            </button>
          </div>
        </div>
      )
    }

    if (msg.type === 'error') {
      return (
        <div key={msg.id} className="chat-row chat-row--bot">
          <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>
          <div className="chat-bubble chat-bubble--bot chat-bubble--error">
            <MdCancel size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <p className="chat-bubble__text">{msg.text}</p>
          </div>
        </div>
      )
    }

    /* default: text */
    return (
      <div key={msg.id} className={`chat-row chat-row--${isBot ? 'bot' : 'user'}`}>
        {isBot && <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>}
        <div className={`chat-bubble chat-bubble--${isBot ? 'bot' : 'user'}`}>
          <p className="chat-bubble__text">{msg.text}</p>
        </div>
      </div>
    )
  }

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="chat-page">

      {/* ── Header ── */}
      <div className="chat-header">
        <div className="chat-header__icon">
          <FaRobot size={20} color="#fff" />
        </div>
        <div className="chat-header__info">
          <h1 className="chat-header__title">ATS Resume Checker</h1>
          <p className="chat-header__sub">Chat with your resume analyser</p>
        </div>
        {step !== STEP.RESUME && (
          <button type="button" className="chat-reset-btn" onClick={handleReset} title="Start over">
            <MdRefresh size={18} />
            <span>New Check</span>
          </button>
        )}
      </div>

      {/* ── Message thread ── */}
      <div className="chat-thread">

        {messages.map((msg) => renderMessage(msg))}

        {/* Parsing status inline */}
        {parsing && (
          <div className="chat-row chat-row--bot">
            <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>
            <div className="chat-bubble chat-bubble--bot">
              <span className="chat-spinner-sm" />
              <span className="chat-bubble__text">
                {ocrStatus
                  ? `Running OCR page ${ocrStatus.page}/${ocrStatus.totalPages} — ${ocrStatus.percent}%`
                  : 'Reading your resume…'}
              </span>
            </div>
          </div>
        )}

        {/* File error */}
        {fileError && (
          <div className="chat-row chat-row--bot">
            <div className="chat-avatar chat-avatar--bot"><FaRobot size={14} /></div>
            <div className="chat-bubble chat-bubble--bot chat-bubble--error">
              <MdCancel size={16} color="#ef4444" />
              <p className="chat-bubble__text">{fileError} Try a different file.</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="chat-input-bar">

        {/* ── RESUME STEP: drag-drop zone or file loaded pill ── */}
        {step === STEP.RESUME && (
          <div className="chat-input-bar__resume">
            {!fileName ? (
              <div
                className={`chat-dropzone${dragOver ? ' drag-over' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="chat-dropzone__icons">
                  <FaFilePdf size={22} color="#ef4444" />
                  <FaFileWord size={22} color="#2563eb" />
                  <FaFileImage size={22} color="#16a34a" />
                  <FaFileAlt size={22} color="#94a3b8" />
                </div>
                <span className="chat-dropzone__label">
                  {parsing ? 'Reading file…' : 'Click or drag & drop your resume (PDF · DOCX · TXT · Image)'}
                </span>
                {parsing && <span className="chat-spinner-sm" style={{ borderTopColor: '#4f46e5', borderColor: '#e0e7ff' }} />}
                <input
                  ref={fileRef} type="file"
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.bmp"
                  style={{ display: 'none' }}
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <div className="chat-file-loaded">
                <FileIcon name={fileName} size={18} />
                <span className="chat-file-loaded__name">{fileName}</span>
                <span className="chat-file-loaded__chars">{resumeText.length.toLocaleString()} chars</span>
                <button type="button" className="chat-file-loaded__remove" onClick={clearFile} aria-label="Remove">
                  <MdClose size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── JD STEP: textarea + send button ── */}
        {step === STEP.JD && (
          <div className="chat-input-bar__jd">
            <div className="chat-input-bar__attach" title="Attach a file instead" onClick={() => fileRef.current?.click()}>
              <FaPaperclip size={16} />
              <input
                ref={fileRef} type="file"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.bmp"
                style={{ display: 'none' }}
                onChange={handleInputChange}
              />
            </div>
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              rows={jdRows}
              placeholder="Paste the job description here… (Enter to send, Shift+Enter for new line)"
              value={jobDesc}
              onChange={(e) => {
                setJobDesc(e.target.value)
                /* auto-grow rows */
                const lines = e.target.value.split('\n').length
                setJdRows(Math.min(Math.max(lines, 3), 8))
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className={`chat-send-btn${!jobDesc.trim() ? ' chat-send-btn--disabled' : ''}`}
              onClick={handleSendJD}
              disabled={!jobDesc.trim()}
              aria-label="Send"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        )}

        {/* ── ANALYZING STEP ── */}
        {step === STEP.ANALYZING && (
          <div className="chat-input-bar__status">
            <span className="chat-spinner-sm" style={{ borderTopColor: '#4f46e5', borderColor: '#e0e7ff' }} />
            <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600 }}>
              Analyzing your resume against the job description…
            </span>
          </div>
        )}

        {/* ── RESULT STEP ── */}
        {step === STEP.RESULT && (
          <div className="chat-input-bar__status">
            {improving ? <span className="chat-spinner-sm" style={{ borderTopColor: '#4f46e5', borderColor: '#e0e7ff' }} /> : <MdCheckCircle size={18} color="#10b981" />}
            <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>
              {improving ? 'Improving your resume for this roleâ€¦' : 'Analysis complete.'}
            </span>
            <button type="button" className="chat-new-check-btn" onClick={handleImproveResume} disabled={improving}>
              <MdOutlineTipsAndUpdates size={15} /> Improve My Resume
            </button>
            <button type="button" className="chat-new-check-btn" onClick={handleReset}>
              <MdRefresh size={15} /> Run another check
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
