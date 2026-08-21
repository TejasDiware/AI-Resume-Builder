import { useCallback, useEffect, useState } from 'react'
import {
  MdAutoAwesome,
  MdCheckCircle,
  MdErrorOutline,
  MdRefresh,
  MdTrendingUp,
} from 'react-icons/md'
import { qualityApi, resumeApi } from '../../utils/api'
import { useResume } from '../../context/ResumeContext'

const sectionLabels = [
  ['summary', 'Summary'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['education', 'Education'],
]

function scoreColor(score) {
  if (score >= 75) return '#16a34a'
  if (score >= 50) return '#d97706'
  return '#dc2626'
}

function ScoreCard({ label, score, large = false }) {
  const value = Number(score)
  const safeScore = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0

  const color = scoreColor(safeScore)

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: large ? 22 : 18,
        minWidth: large ? 220 : 150,
        flex: large ? '1 1 220px' : '1 1 150px',
      }}
    >
      <div
        style={{
          color: '#64748b',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 4,
        }}
      >
        <strong
          style={{
            color,
            fontSize: large ? '2.35rem' : '1.65rem',
            lineHeight: 1,
          }}
        >
          {Math.round(safeScore)}
        </strong>

        <span
          style={{
            color: '#94a3b8',
            fontSize: '0.85rem',
          }}
        >
          / 100
        </span>
      </div>

      <div
        style={{
          height: 7,
          background: '#e5e7eb',
          borderRadius: 99,
          marginTop: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${safeScore}%`,
            height: '100%',
            background: color,
            borderRadius: 99,
          }}
        />
      </div>
    </div>
  )
}

function MessageList({ title, items, icon, tone }) {
  if (!items?.length) return null

  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: 20,
        flex: '1 1 320px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
        }}
      >
        {icon}

        <h2
          style={{
            color: '#1e293b',
            fontSize: '1rem',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>

      <ul
        style={{
          color: tone,
          margin: 0,
          paddingLeft: 20,
          display: 'grid',
          gap: 10,
          fontSize: '0.88rem',
          lineHeight: 1.45,
        }}
      >
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default function ResumeQuality() {
  const { currentResumeId, currentResume } = useResume()

  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState(
    currentResumeId || '',
  )

  const [quality, setQuality] = useState(null)
  const [recommendations, setRecommendations] = useState(null)

  const [loadingResumes, setLoadingResumes] = useState(true)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [recommendationError, setRecommendationError] = useState('')

  // ==========================================================
  // LOAD ALL RESUMES
  // ==========================================================

  useEffect(() => {
    let cancelled = false

    async function loadResumes() {
      setLoadingResumes(true)

      try {
        const response = await resumeApi.list()

        if (cancelled) return

        const data = response.data || []

        setResumes(data)

        // Prefer the globally selected resume if it exists.
        if (
          currentResumeId &&
          data.some(
            (resume) => String(resume.id) === String(currentResumeId),
          )
        ) {
          setSelectedResumeId(currentResumeId)
        } else if (data.length > 0) {
          // Otherwise select the first available resume.
          setSelectedResumeId(data[0].id)
        } else {
          setSelectedResumeId('')
        }
      } catch (err) {
        if (cancelled) return

        setResumes([])
        setSelectedResumeId('')
        setError(
          err?.response?.data?.detail ||
            'Unable to load your resumes.',
        )
      } finally {
        if (!cancelled) {
          setLoadingResumes(false)
        }
      }
    }

    loadResumes()

    return () => {
      cancelled = true
    }
  }, [currentResumeId])

  // ==========================================================
  // LOAD QUALITY FOR SELECTED RESUME
  // ==========================================================

  const loadQuality = useCallback(async () => {
    if (!selectedResumeId) {
      setQuality(null)
      setRecommendations(null)
      setError('')
      setRecommendationError('')
      return
    }

    setLoading(true)
    setError('')
    setRecommendationError('')

    const [qualityResult, recommendationResult] =
      await Promise.allSettled([
        qualityApi.get(selectedResumeId),
        qualityApi.recommendations(selectedResumeId),
      ])

    if (qualityResult.status === 'fulfilled') {
      setQuality(qualityResult.value.data)
    } else {
      setQuality(null)

      setError(
        qualityResult.reason?.response?.data?.detail ||
          'Unable to calculate resume quality right now.',
      )
    }

    if (recommendationResult.status === 'fulfilled') {
      setRecommendations(recommendationResult.value.data)
    } else {
      setRecommendations(null)

      setRecommendationError(
        recommendationResult.reason?.response?.data?.detail ||
          'AI recommendations are temporarily unavailable.',
      )
    }

    setLoading(false)
  }, [selectedResumeId])

  useEffect(() => {
    loadQuality()
  }, [loadQuality])

  // ==========================================================
  // SELECTED RESUME
  // ==========================================================

  const selectedResume =
    resumes.find(
      (resume) =>
        String(resume.id) === String(selectedResumeId),
    ) || currentResume

  const title =
    selectedResume?.title || 'Selected resume'

  // ==========================================================
  // RESUME SELECTOR
  // ==========================================================

  function handleResumeChange(event) {
    const value = event.target.value

    setSelectedResumeId(value)
    setQuality(null)
    setRecommendations(null)
    setError('')
    setRecommendationError('')
  }

  return (
    <div
      style={{
        background: '#f3f4f6',
        minHeight: '100vh',
        padding: '28px 22px',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                color: '#4f46e5',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: '0 0 6px',
              }}
            >
              Resume review
            </p>

            <h1
              style={{
                color: '#1e293b',
                fontSize: '1.65rem',
                fontWeight: 800,
                margin: 0,
              }}
            >
              Resume Quality
            </h1>

            <p
              style={{
                color: '#64748b',
                fontSize: '0.88rem',
                margin: '6px 0 0',
              }}
            >
              {title}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Resume Selector */}

            <select
              value={selectedResumeId}
              onChange={handleResumeChange}
              disabled={loadingResumes || resumes.length === 0}
              style={{
                minWidth: 260,
                border: '1px solid #c7d2fe',
                borderRadius: 9,
                background: '#fff',
                color: '#1e293b',
                padding: '10px 12px',
                fontWeight: 600,
                outline: 'none',
                cursor:
                  loadingResumes || resumes.length === 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {loadingResumes ? (
                <option value="">Loading resumes...</option>
              ) : resumes.length === 0 ? (
                <option value="">No resumes available</option>
              ) : (
                resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))
              )}
            </select>

            {/* Refresh */}

            <button
              type="button"
              onClick={loadQuality}
              disabled={loading || !selectedResumeId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid #c7d2fe',
                borderRadius: 9,
                background: '#fff',
                color: '#4338ca',
                padding: '10px 14px',
                fontWeight: 700,
                cursor:
                  loading || !selectedResumeId
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  loading || !selectedResumeId ? 0.6 : 1,
              }}
            >
              <MdRefresh size={18} />

              {loading
                ? 'Refreshing...'
                : 'Refresh analysis'}
            </button>
          </div>
        </div>

        {/* ======================================================
            NO RESUME
        ====================================================== */}

        {!loadingResumes && !selectedResumeId && (
          <div
            style={{
              background: '#fff',
              border: '1px dashed #cbd5e1',
              borderRadius: 14,
              padding: 34,
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Select or create a resume to view its quality
            analysis.
          </div>
        )}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {selectedResumeId && loading && !quality && (
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 34,
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Calculating resume quality...
          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              color: '#b91c1c',
              padding: 14,
              marginBottom: 18,
            }}
          >
            <MdErrorOutline size={20} />

            {error}
          </div>
        )}

        {/* ======================================================
            QUALITY RESULTS
        ====================================================== */}

        {quality && (
          <>
            {/* Overall scores */}

            <div
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                marginBottom: 18,
              }}
            >
              <ScoreCard
                label="Overall quality"
                score={quality.overall_score}
                large
              />

              <ScoreCard
                label="Completeness"
                score={quality.completeness_score}
              />

              <ScoreCard
                label="Content quality"
                score={quality.content_quality_score}
              />

              <ScoreCard
                label="ATS readiness"
                score={quality.ats_readiness_score}
              />
            </div>

            {/* Section scores */}

            <section
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                padding: 20,
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  color: '#1e293b',
                  fontSize: '1rem',
                  margin: '0 0 16px',
                }}
              >
                Section scores
              </h2>

              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                {sectionLabels.map(([key, label]) => (
                  <ScoreCard
                    key={key}
                    label={label}
                    score={quality.sections?.[key]}
                  />
                ))}
              </div>
            </section>

            {/* Issues and built-in recommendations */}

            <div
              style={{
                display: 'flex',
                gap: 18,
                flexWrap: 'wrap',
                marginBottom: 18,
              }}
            >
              <MessageList
                title="Issues to address"
                items={quality.issues}
                icon={
                  <MdErrorOutline
                    size={20}
                    color="#dc2626"
                  />
                }
                tone="#991b1b"
              />

              <MessageList
                title="Built-in recommendations"
                items={quality.recommendations}
                icon={
                  <MdTrendingUp
                    size={20}
                    color="#d97706"
                  />
                }
                tone="#92400e"
              />
            </div>

            {/* AI recommendation error */}

            {recommendationError && (
              <div
                style={{
                  color: '#92400e',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 10,
                  padding: 13,
                  marginBottom: 18,
                }}
              >
                {recommendationError}
              </div>
            )}

            {/* AI recommendations */}

            {recommendations && (
              <MessageList
                title="AI recommendations"
                items={[
                  ...(recommendations.priority || []),
                  ...(recommendations.recommendations || []),
                ]}
                icon={
                  <MdAutoAwesome
                    size={20}
                    color="#4f46e5"
                  />
                }
                tone="#3730a3"
              />
            )}

            {/* No issues */}

            {!quality.issues?.length &&
              !quality.recommendations?.length &&
              !recommendations?.recommendations?.length && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 10,
                    color: '#166534',
                    padding: 14,
                  }}
                >
                  <MdCheckCircle size={20} />

                  No issues or recommendations were
                  returned for this resume.
                </div>
              )}
          </>
        )}
      </div>
    </div>
  )
}