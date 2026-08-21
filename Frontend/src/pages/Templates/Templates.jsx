import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import templateMap from '../ResumeBuilder/templates/templateMap'
import { useResume, ResumeContext } from '../../context/ResumeContext'
import { resumeApi } from '../../utils/api'

const A4_W = 794
const A4_H = 1123

const categories = [
  'All Templates',
  'Professional',
  'Creative',
  'Minimal',
  'Modern',
]

function TemplatePreview({ Component }) {
  const previewRef = useRef(null)
  const [width, setWidth] = useState(180)

  useEffect(() => {
    if (!previewRef.current) return undefined

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })

    observer.observe(previewRef.current)

    return () => observer.disconnect()
  }, [])

  const scale = width / A4_W

  return (
    <div
      ref={previewRef}
      style={{
        height: Math.max(185, Math.round(A4_H * scale)),
        overflow: 'hidden',
        position: 'relative',
        background: '#f8fafc',
      }}
    >
      {/* Template cards use their own demo data. */}
      <ResumeContext.Provider value={null}>
        <div
          style={{
            width: A4_W,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <Component />
        </div>
      </ResumeContext.Provider>
    </div>
  )
}

export default function Templates() {
  const navigate = useNavigate()
  const location = useLocation()
  const context = useResume()

  const params = new URLSearchParams(location.search)
  const titleFromUrl = params.get('title')
  const urlTemplateId = Number(params.get('template'))

  const [selected, setSelected] = useState(() => {
    return (
      urlTemplateId ||
      Number(context?.activeTemplateId) ||
      1
    )
  })

  const [activeCategory, setActiveCategory] = useState('All Templates')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (urlTemplateId) {
      setSelected(urlTemplateId)
    }
  }, [urlTemplateId])

  const templates = Object.entries(templateMap).map(
    ([id, template]) => ({
      id: Number(id),
      ...template,
    }),
  )

  const visibleTemplates = templates.filter((template) => {
    const categoryMatches =
      activeCategory === 'All Templates' ||
      template.category === activeCategory

    const searchMatches = template.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())

    return categoryMatches && searchMatches
  })

  /*
   * Select template.
   *
   * This intentionally talks to the backend directly instead of relying
   * only on ResumeContext. This guarantees that the selected template is
   * persisted against a real PostgreSQL resume before moving to Profile.
   */
  const handleSelect = async () => {
    if (saving) return

    const templateId = Number(selected)

    if (!Number.isInteger(templateId) || templateId <= 0) {
      setError('Please select a valid template.')
      return
    }

    setSaving(true)
    setError('')

    try {
      let resumeId = context?.currentResumeId || null

      /*
       * If a resume title was supplied, use that exact backend resume.
       */
      if (titleFromUrl && Array.isArray(context?.savedResumes)) {
        const matchingResume = [...context.savedResumes]
          .reverse()
          .find(
            (resume) =>
              String(resume?.title || '').trim() ===
              String(titleFromUrl).trim(),
          )

        if (matchingResume?.id) {
          resumeId = matchingResume.id
        }
      }

      /*
       * If there is no backend resume yet, create one.
       */
      if (!resumeId) {
        const { data } = await resumeApi.create({
          title:
            titleFromUrl ||
            context?.resumeTitle ||
            'Untitled Resume',
          template_id: templateId,
          template: 'classic',
        })

        resumeId = data?.id

        if (!resumeId) {
          throw new Error(
            'Backend created the resume but did not return a resume ID.',
          )
        }

        context?.setCurrentResumeId?.(resumeId)
      }

      /*
       * Persist the actual frontend template ID.
       *
       * IMPORTANT:
       * template_id is the database template identifier added to resumes.
       */
      await resumeApi.update(resumeId, {
        template_id: templateId,
      })

      /*
       * Synchronize frontend state.
       */
      context?.setCurrentResumeId?.(resumeId)
      context?.switchTemplate?.(templateId)
      await context?.loadResume?.(resumeId)
      await context?.refreshResumes?.()

      /*
       * Profile is intentionally outside ProfileGuard, so the user can
       * continue filling the resume even when it is still empty.
       */
      navigate(`/app/profile?template=${templateId}`, {
        replace: true,
      })
    } catch (err) {
      console.error('Template selection failed:', err)

      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Unable to save the selected template.'

      setError(
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        background: '#f3f4f6',
        padding: '26px 18px',
      }}
    >
      <section
        style={{
          maxWidth: '100%',
          margin: '0 auto',
          background: '#fff',
          borderRadius: 16,
          boxShadow:
            '0 12px 36px rgba(15,23,42,0.14)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            padding: '28px 32px 18px',
            borderBottom: '1px solid #e5e7eb',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              margin: 0,
              color: '#172033',
            }}
          >
            Choose a Resume Template
          </h1>

          <p
            style={{
              fontSize: '0.85rem',
              color: '#64748b',
              margin: '8px 0 16px',
            }}
          >
            Select a template and customize it to match
            your style
          </p>

          {error && (
            <div
              role="alert"
              style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: '10px 14px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.82rem',
                textAlign: 'left',
              }}
            >
              {error}
            </div>
          )}
        </header>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            padding: '16px 32px 12px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                border:
                  activeCategory === category
                    ? 'none'
                    : '1px solid #d1d5db',
                borderRadius: 999,
                padding: '7px 16px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background:
                  activeCategory === category
                    ? '#4f46e5'
                    : '#fff',
                color:
                  activeCategory === category
                    ? '#fff'
                    : '#4b5563',
                cursor: 'pointer',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div
          style={{
            padding: '16px 32px',
          }}
        >
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search templates..."
            aria-label="Search templates"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: '1px solid #c7d2fe',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
        </div>

        <div
          style={{
            padding: '0 32px 32px',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24,
          }}
        >
          {visibleTemplates.map((template) => {
            const isSelected =
              selected === template.id

            return (
              <article
                key={template.id}
                onClick={() =>
                  !saving &&
                  setSelected(template.id)
                }
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: saving
                    ? 'default'
                    : 'pointer',
                  border: isSelected
                    ? '2.5px solid #4f46e5'
                    : '1px solid #dbe1ea',
                  boxShadow: isSelected
                    ? '0 0 0 3px #c7d2fe'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  background: '#fff',
                  transition: 'all 0.2s',
                }}
              >
                <TemplatePreview
                  Component={template.Component}
                />

                <div
                  style={{
                    padding: '14px 14px 10px',
                    borderTop:
                      '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isSelected
                        ? '#4f46e5'
                        : '#1e293b',
                    }}
                  >
                    {template.name}
                  </span>

                  {isSelected && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#4f46e5',
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>

                {isSelected && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      void handleSelect()
                    }}
                    style={{
                      width:
                        'calc(100% - 28px)',
                      margin: '0 14px 14px',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px',
                      background: saving
                        ? '#818cf8'
                        : '#4f46e5',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: saving
                        ? 'not-allowed'
                        : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {saving
                      ? 'Saving...'
                      : 'Select Template'}
                  </button>
                )}
              </article>
            )
          })}

          {visibleTemplates.length === 0 && (
            <p
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: '#94a3b8',
                margin: '40px 0',
                fontSize: '0.95rem',
              }}
            >
              No templates found.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}