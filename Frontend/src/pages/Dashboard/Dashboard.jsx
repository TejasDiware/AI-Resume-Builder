import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdOutlineDescription,
  MdOutlineWork,
  MdOutlineSchool,
  MdOutlineAccountCircle,
  MdOutlineArticle,
  MdCheckCircleOutline,
  MdArrowForward,
  MdOutlineEdit,
} from 'react-icons/md'
import { GiBrain } from 'react-icons/gi'
import { useResume } from '../../context/ResumeContext'
import { dashboardApi } from '../../utils/api'

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, bg, iconColor }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 160,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      <div>
        <p style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          margin: 0,
          color: '#1e293b',
          lineHeight: 1
        }}>
          {value}
        </p>

        <p style={{
          fontSize: '0.78rem',
          color: '#6b7280',
          margin: '4px 0 0',
          fontWeight: 500
        }}>
          {label}
        </p>
      </div>
    </div>
  )
}

// ── Quick Action Card ─────────────────────────────────────────────────────────
function ActionCard({ icon, title, desc, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px',
        border: `2px solid #e5e7eb`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        flex: 1,
        minWidth: 140,
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent
        e.currentTarget.style.boxShadow = `0 4px 20px ${accent}22`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: `${accent}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}>
        {icon}
      </div>

      <p style={{
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#1e293b',
        margin: '0 0 4px'
      }}>
        {title}
      </p>

      <p style={{
        fontSize: '0.75rem',
        color: '#9ca3af',
        margin: 0
      }}>
        {desc}
      </p>
    </div>
  )
}

// ── Progress Step ─────────────────────────────────────────────────────────────
function ProgressStep({ label, done, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        cursor: 'pointer',
        background: done ? '#f0fdf4' : '#fafafa',
        border: `1px solid ${done ? '#bbf7d0' : '#e5e7eb'}`,
        transition: 'all 0.2s',
      }}
    >
      <MdCheckCircleOutline
        size={20}
        color={done ? '#22c55e' : '#d1d5db'}
      />

      <span style={{
        fontSize: '0.82rem',
        fontWeight: 600,
        color: done ? '#16a34a' : '#6b7280',
        flex: 1
      }}>
        {label}
      </span>

      {!done && <MdArrowForward size={16} color='#9ca3af' />}
    </div>
  )
}

// ── Mini Resume Thumbnail ─────────────────────────────────────────────────────
function MiniResume({ templateId = 1 }) {
  const colors = {
    1: '#1e3a5f',
    2: '#6d28d9',
    3: '#ea580c',
    4: '#1e3a5f',
    5: '#111827',
    6: '#0f766e',
    7: '#111827',
    8: '#f472b6',
    9: '#b07a6a',
    10: '#2b4ead',
  }

  const c = colors[templateId] || colors[1]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      background: '#fff',
      overflow: 'hidden',
      borderRadius: 6
    }}>
      <div style={{
        width: '35%',
        background: c,
        padding: '6px 4px'
      }}>
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          margin: '0 auto 5px'
        }} />

        {[100, 80, 90, 70, 85].map((w, i) => (
          <div
            key={i}
            style={{
              height: 2.5,
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 2,
              margin: '3px 0',
              width: `${w}%`
            }}
          />
        ))}
      </div>

      <div style={{
        flex: 1,
        padding: '6px 5px'
      }}>
        <div style={{
          height: 5,
          background: c,
          borderRadius: 2,
          width: '70%',
          marginBottom: 3
        }} />

        <div style={{
          height: 2.5,
          background: '#a5b4fc',
          borderRadius: 2,
          width: '50%',
          marginBottom: 6
        }} />

        {[100, 85, 70, 90, 80, 65, 95].map((w, i) => (
          <div
            key={i}
            style={{
              height: 2,
              background: '#e5e7eb',
              borderRadius: 2,
              margin: '2.5px 0',
              width: `${w}%`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const ctx = useResume()

  // Dashboard API state
  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  const p = ctx?.profileData

  const resumes = ctx?.savedResumes || []

  const firstName = p?.firstName || 'User'

  const resumeId = (() => {
    // Only pass a real backend ID (positive integer < 2^31) to the API.
    // Date.now() IDs are 13-digit timestamps used for locally-created resumes
    // that have not yet been persisted — sending them causes 500 errors.
    const MAX_BACKEND_ID = 2_147_483_647 // PostgreSQL int max
    const candidate = ctx?.currentResumeId || resumes[0]?.id
    if (!candidate) return null
    const n = Number(candidate)
    return Number.isInteger(n) && n > 0 && n <= MAX_BACKEND_ID ? n : null
  })()

  // ── Dashboard API Integration ──
  useEffect(() => {
    const loadDashboard = async () => {
      // Skip API call entirely if there's no valid backend resume ID.
      // Fake local IDs (Date.now() timestamps) are > PostgreSQL int max.
      if (!resumeId) {
        setDashboardLoading(false)
        return
      }

      try {
        setDashboardLoading(true)
        setDashboardError('')

        const { data } = await dashboardApi.get(resumeId)

        setDashboardData(data)
      } catch (requestError) {
        console.error('Dashboard API Error:', requestError)

        setDashboardError(
          requestError.response?.data?.detail ||
          `Dashboard API failed (${requestError.response?.status || 'Network Error'})`
        )
      } finally {
        setDashboardLoading(false)
      }
    }

    loadDashboard()
  }, [resumeId])

  const expCount = ctx?.experiences?.length || 0
  const skillCount = ctx?.skills?.length || 0
  const eduCount = ctx?.education?.length || 0

  const hasProfile = !!(p?.firstName || p?.email)
  const hasExp = expCount > 0
  const hasEdu = eduCount > 0
  const hasSkills = skillCount > 0
  const hasSummary = !!ctx?.summary

  const stepsTotal = 5

  const stepsDone = [
    hasProfile,
    hasExp,
    hasEdu,
    hasSkills,
    hasSummary
  ].filter(Boolean).length

  const progressPct = Math.round(
    (stepsDone / stepsTotal) * 100
  )

  const now = new Date()
  const hour = now.getHours()

  const greet =
    hour < 12
      ? 'Good Morning'
      : hour < 17
        ? 'Good Afternoon'
        : 'Good Evening'

  // ── Loading ──
  if (dashboardLoading) {
    return (
      <div style={{
        background: '#f3f4f6',
        minHeight: '100vh',
        padding: '40px 20px'
      }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={{
      background: '#f3f4f6',
      minHeight: '100vh',
      padding: '24px 20px'
    }}>

      {/* ── Dashboard API Error ── */}
      {dashboardError && (
        <div style={{
          background: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          padding: 12,
          borderRadius: 8,
          marginBottom: 20
        }}>
          {dashboardError}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: '1.55rem',
          fontWeight: 800,
          color: '#1e293b',
          margin: 0
        }}>
          {greet}, {firstName}
        </h1>

        <p style={{
          fontSize: '0.85rem',
          color: '#6b7280',
          marginTop: 4
        }}>
          Here's an overview of your resume building progress.
        </p>
      </div>

      {/* ── Middle Row ── */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 28
      }}>

        {/* Profile Completion */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          flex: '1 1 300px',
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <p style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#1e293b',
              margin: 0
            }}>
              Resume Completion
            </p>

            <span style={{
              background: progressPct === 100
                ? '#dcfce7'
                : '#eef2ff',

              color: progressPct === 100
                ? '#16a34a'
                : '#4f46e5',

              fontWeight: 700,
              fontSize: '0.8rem',
              padding: '3px 10px',
              borderRadius: 999,
            }}>
              {progressPct}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            height: 10,
            background: '#e5e7eb',
            borderRadius: 999,
            marginBottom: 20
          }}>
            <div style={{
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
              width: `${progressPct}%`,
              transition: 'width 0.5s',
            }} />
          </div>

          {/* Steps */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <ProgressStep
              label="Personal Info"
              done={hasProfile}
              onClick={() => navigate('/app/profile')}
            />

            <ProgressStep
              label="Work Experience"
              done={hasExp}
              onClick={() => navigate('/app/resume-builder/experience')}
            />

            <ProgressStep
              label="Education"
              done={hasEdu}
              onClick={() => navigate('/app/resume-builder/education')}
            />

            <ProgressStep
              label="Skills"
              done={hasSkills}
              onClick={() => navigate('/app/resume-builder/skills')}
            />

            <ProgressStep
              label="Professional Summary"
              done={hasSummary}
              onClick={() => navigate('/app/resume-builder/summary')}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          flex: '1 1 300px',
        }}>

          <p style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1e293b',
            margin: '0 0 16px'
          }}>
            Quick Actions
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12
          }}>

            <ActionCard
              icon={<MdOutlineAccountCircle size={22} color="#4f46e5" />}
              title="Edit Profile"
              desc="Update personal info"
              accent="#4f46e5"
              onClick={() => navigate('/app/profile')}
            />

            <ActionCard
              icon={<MdOutlineWork size={22} color="#f59e0b" />}
              title="Add Experience"
              desc="Work history"
              accent="#f59e0b"
              onClick={() => navigate('/app/resume-builder/experience')}
            />

            <ActionCard
              icon={<MdOutlineSchool size={22} color="#06b6d4" />}
              title="Add Education"
              desc="Degree & courses"
              accent="#06b6d4"
              onClick={() => navigate('/app/resume-builder/education')}
            />

            <ActionCard
              icon={<GiBrain size={22} color="#8b5cf6" />}
              title="Add Skills"
              desc="Tech & soft skills"
              accent="#8b5cf6"
              onClick={() => navigate('/app/resume-builder/skills')}
            />

            <ActionCard
              icon={<MdOutlineArticle size={22} color="#10b981" />}
              title="Browse Templates"
              desc="Pick a design"
              accent="#10b981"
              onClick={() => navigate('/app/templates')}
            />

            <ActionCard
              icon={<MdOutlineDescription size={22} color="#ef4444" />}
              title="My Resumes"
              desc="View & download"
              accent="#ef4444"
              onClick={() => navigate('/app/resume')}
            />

          </div>
        </div>
      </div>

      {/* ── Recent Resumes ── */}
      {resumes.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <p style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#1e293b',
              margin: 0
            }}>
              Recent Resumes
            </p>

            <button
              onClick={() => navigate('/app/resume')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View All <MdArrowForward size={14} />
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16
          }}>
            {resumes.slice(0, 4).map(r => (
              <div
                key={r.id}
                style={{
                  background: '#f9fafb',
                  borderRadius: 14,
                  border: '1px solid #e5e7eb',
                  padding: 14,
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  flex: '1 1 220px',
                  maxWidth: 280,
                }}
              >

                {/* Thumbnail */}
                <div style={{
                  width: 56,
                  height: 72,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  flexShrink: 0
                }}>
                  <MiniResume templateId={r.templateId} />
                </div>

                {/* Info */}
                <div style={{
                  flex: 1,
                  minWidth: 0
                }}>
                  <p style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#1e293b',
                    margin: '0 0 4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {r.title}
                  </p>

                  <p style={{
                    fontSize: '0.72rem',
                    color: '#9ca3af',
                    margin: '0 0 8px'
                  }}>
                    {r.createdAt || 'Recently created'}
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        `/app/resume-builder/preview?template=${r.templateId}`
                      )
                    }
                    style={{
                      background: '#eef2ff',
                      color: '#4f46e5',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <MdOutlineEdit size={12} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {resumes.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '40px 24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <MdOutlineDescription size={52} color="#d1d5db" />

          <p style={{
            fontWeight: 700,
            color: '#374151',
            fontSize: '1rem',
            marginTop: 12,
            marginBottom: 4
          }}>
            No resumes yet
          </p>

          <p style={{
            color: '#9ca3af',
            fontSize: '0.83rem',
            marginBottom: 20
          }}>
            Create your first resume and land your dream job!
          </p>

          <button
            onClick={() => navigate('/app/resume')}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '10px 28px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Create Resume
          </button>
        </div>
      )}

    </div>
  )
}