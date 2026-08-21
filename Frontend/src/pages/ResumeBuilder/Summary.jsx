import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdSave, MdInfoOutline, MdAutoAwesome } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'

const suggestions = [
  'Passionate Full Stack Developer with 2+ years of experience building scalable web applications using React.js, Django, and Python.',
  'Results-driven Data Scientist with expertise in Machine Learning, NLP, and statistical analysis. Strong ability to convert complex data into actionable insights.',
  'Detail-oriented SQL Support Specialist with 3+ years of experience in database management, query optimization, and data modeling.',
  'Creative Power BI Developer skilled in building interactive dashboards, DAX formulas, and delivering business intelligence solutions.',
  'Dedicated AI/ML Engineer experienced in developing and deploying deep learning models using TensorFlow, PyTorch, and LangChain.',
]

const inputStyle = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: '0.85rem',
  color: '#1e293b',
  outline: 'none',
  background: '#fff',
  transition: 'border-color 0.2s',
}

export default function Summary() {
  const navigate = useNavigate()
  const location = useLocation()

  const params = new URLSearchParams(location.search)

  /* ── Resume context ── */
  const context = useResume()

  /* ── Keep selected template ID ──
     URL template ID has priority.
     If URL does not have it, use activeTemplateId from context.
     Finally fall back to template 1.
  */
  const templateId =
    params.get('template') ||
    String(context?.activeTemplateId || 1)

  const {
    summary: contextSummary,
    setSummary: setContextSummary,
    saveProfileToBackend,
  } = context || {}

  const [summary, setSummary] = useState(contextSummary || '')
  const [charCount, setCharCount] = useState(
    (contextSummary || '').length
  )
  const [saved, setSaved] = useState(false)

  const maxChars = 600

  /* ── Ensure selected template remains active ── */
  useEffect(() => {
    context?.switchTemplate?.(Number(templateId))
  }, [templateId, context])

  /* ── Sync summary when context changes ── */
  useEffect(() => {
    if (contextSummary) {
      setSummary(contextSummary)
      setCharCount(contextSummary.length)
    }
  }, [contextSummary])

  const handleChange = (val) => {
    // Keep pasted content usable: truncate overlong text
    // instead of rejecting the entire browser paste operation.
    const nextValue = val.slice(0, maxChars)

    setSummary(nextValue)
    setCharCount(nextValue.length)
  }

  const applySuggestion = (text) => {
    setSummary(text)
    setCharCount(text.length)
  }

  const handleSave = async () => {
    if (!summary.trim()) return

    // Save to localStorage
    setContextSummary?.(summary)

    // Backend: summary is stored in CandidateProfile.summary
    try {
      await saveProfileToBackend?.({ summary: summary.trim() })
    } catch (err) {
      console.error('Backend save failed (summary):', err)
    }

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(`/app/resume-builder/preview?template=${templateId}`)
    }, 800)
  }

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
      }}
    >

      {/* ── LEFT: form ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#f3f4f6',
          padding: '24px 20px',
        }}
      >

        <ResumeSectionTabs />

        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            margin: '0 0 4px',
            color: '#1e293b',
          }}
        >
          Professional Summary
        </h1>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            marginBottom: 24,
          }}
        >
          Write a short summary that highlights your skills and experience.
        </p>

        {/* ── Summary textarea card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            marginBottom: 20,
          }}
        >
          <label
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#374151',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Summary <span style={{ color: '#ef4444' }}>*</span>
          </label>

          <textarea
            value={summary}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="e.g. Passionate developer with 2+ years of experience..."
            rows={6}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: 140,
              lineHeight: 1.7,
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4f46e5'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 6,
            }}
          >
            <p
              style={{
                fontSize: '0.72rem',
                color: '#9ca3af',
                margin: 0,
              }}
            >
              50–600 characters recommended
            </p>

            <p
              style={{
                fontSize: '0.72rem',
                margin: 0,
                fontWeight: 600,
                color: charCount > 550 ? '#ef4444' : '#9ca3af',
              }}
            >
              {charCount}/{maxChars}
            </p>
          </div>
        </div>

        {/* ── Suggested summaries card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <MdAutoAwesome size={18} color="#4f46e5" />

            <p
              style={{
                fontWeight: 700,
                fontSize: '0.92rem',
                color: '#1e293b',
                margin: 0,
              }}
            >
              Suggested Summaries
            </p>
          </div>

          <p
            style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              margin: '0 0 14px',
            }}
          >
            Click any suggestion to use it.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => applySuggestion(s)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${
                    summary === s ? '#4f46e5' : '#e5e7eb'
                  }`,
                  fontSize: '0.78rem',
                  color: '#374151',
                  cursor: 'pointer',
                  lineHeight: 1.6,
                  background:
                    summary === s ? '#eef2ff' : '#fff',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5'
                  e.currentTarget.style.background = '#f5f3ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    summary === s ? '#4f46e5' : '#e5e7eb'

                  e.currentTarget.style.background =
                    summary === s ? '#eef2ff' : '#fff'
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* ── Tips card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '18px 20px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <MdInfoOutline size={18} color="#4f46e5" />

            <p
              style={{
                fontWeight: 700,
                fontSize: '0.88rem',
                color: '#1e293b',
                margin: 0,
              }}
            >
              Tips
            </p>
          </div>

          {[
            'Keep it concise — 2 to 4 sentences is ideal.',
            'Mention your years of experience and key skills.',
            'Tailor it to the job you are applying for.',
            'Avoid using "I" — write in third person or passive voice.',
          ].map((tip, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>

              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#374151',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {tip}
              </p>
            </div>
          ))}
        </div>

        {/* ── Navigation ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 8,
            gap: 12,
          }}
        >
          <button
            onClick={() =>
              navigate(
                `/app/resume-builder/preview?template=${templateId}`
              )
            }
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 999,
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '2px solid #4f46e5',
              background: '#fff',
              color: '#4f46e5',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#eef2ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff'
            }}
          >
            ← Previous
          </button>

          <button
            onClick={handleSave}
            disabled={!summary.trim()}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 999,
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: saved
                ? '#22c55e'
                : summary.trim()
                  ? '#4f46e5'
                  : '#a5b4fc',
              color: '#fff',
              cursor: summary.trim()
                ? 'pointer'
                : 'not-allowed',
              transition: 'background 0.3s',
            }}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── RIGHT: live preview ── */}
      <LivePreviewPanel />
    </div>
  )
}