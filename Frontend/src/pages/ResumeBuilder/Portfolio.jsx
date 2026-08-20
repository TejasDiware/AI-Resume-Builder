import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaLinkedin, FaGithub, FaGlobe, FaLink } from 'react-icons/fa'
import { MdSave, MdCheckCircle, MdLanguage } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'

const inputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  padding: '10px 14px',
  fontSize: '0.85rem',
  color: '#374151',
  background: 'transparent',
}

function LinkField({ icon, iconBg, label, placeholder, value, onChange, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: '1.5px solid #d1d5db',
        borderRadius: 10, overflow: 'hidden',
        background: '#fff',
        transition: 'border-color 0.2s',
      }}
        onFocusCapture={e => e.currentTarget.style.borderColor = '#4f46e5'}
        onBlurCapture={e => e.currentTarget.style.borderColor = '#d1d5db'}
      >
        <div style={{
          width: 44, height: 44,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
        {value && (
          <MdCheckCircle size={18} color="#22c55e" style={{ marginRight: 12, flexShrink: 0 }} />
        )}
      </div>
      {hint && <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

export default function Portfolio() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const params     = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const { websites = {}, setWebsites, projects, saveProfileToBackend } = useResume()
  const _portCtx = useResume()

  // Ensure the correct template's data is active when entering this page
  useEffect(() => {
    _portCtx?.switchTemplate?.(Number(templateId))
  }, [templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Guard: only redirect to projects page if user arrived via the resume-builder
  // step flow (i.e. template param is present in the URL). Direct navigation from
  // the sidebar or a bookmark should always land on this page as-is.
  useEffect(() => {
    const isResumeBuilderFlow = params.get('template') !== null

    if (isResumeBuilderFlow) {
      const hasCompletedProject = (projects || []).some(project =>
        !!(project.title || project.name)?.trim() &&
        !!(project.technologies || project.techStack)?.toString().trim() &&
        !!project.role?.trim() &&
        !!project.startDate &&
        !!(project.ongoing || project.endDate) &&
        !!project.description?.trim()
      )

      if (!hasCompletedProject) {
        navigate(`/app/resume-builder/projects?template=${templateId}`, { replace: true })
      }
    }
  }, [projects, navigate, templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState({
    linkedin:  websites.linkedin  || '',
    github:    websites.github    || '',
    portfolio: websites.portfolio || '',
    other:     websites.other     || '',
  })
  const [saved, setSaved] = useState(false)

  // Sync when context updates (e.g. after CV import)
  useEffect(() => {
    setForm({
      linkedin:  websites.linkedin  || '',
      github:    websites.github    || '',
      portfolio: websites.portfolio || '',
      other:     websites.other     || '',
    })
  }, [websites])

  const update = (field, val) => {
    const updated = { ...form, [field]: val }
    setForm(updated)
    setWebsites(updated)   // live update context → preview reflects instantly
  }

  const handleSave = async () => {
    // Save to localStorage context
    setWebsites({ ...form })

    // Backend: linkedin_url, github_url, portfolio_url stored in CandidateProfile
    try {
      await saveProfileToBackend?.({
        linkedin_url:  form.linkedin  || null,
        github_url:    form.github    || null,
        portfolio_url: form.portfolio || null,
      })
    } catch (err) {
      console.error('Backend save failed (websites):', err)
    }

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(`/app/resume-builder/summary?template=${templateId}`)
    }, 800)
  }

  const filledCount = Object.values(form).filter(v => v.trim()).length

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── LEFT: form ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', padding: '24px 20px' }}>
        <ResumeSectionTabs />

        {/* Page heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <MdLanguage size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Websites & Portfolio</h1>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Add your online presence and portfolio links</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 22px' }}>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: '#4f46e5',
              width: `${(filledCount / 4) * 100}%`,
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {filledCount}/4 filled
          </span>
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>

          <LinkField
            icon={<FaLinkedin size={20} color="#fff" />}
            iconBg="#0077b5"
            label="LinkedIn Profile"
            placeholder="https://www.linkedin.com/in/your-profile"
            value={form.linkedin}
            onChange={val => update('linkedin', val)}
            hint="Your professional LinkedIn URL"
          />

          <LinkField
            icon={<FaGithub size={20} color="#fff" />}
            iconBg="#24292e"
            label="GitHub Profile"
            placeholder="https://github.com/your-username"
            value={form.github}
            onChange={val => update('github', val)}
            hint="Link to your GitHub account"
          />

          <LinkField
            icon={<FaGlobe size={18} color="#fff" />}
            iconBg="#4f46e5"
            label="Portfolio Website"
            placeholder="https://yourportfolio.com"
            value={form.portfolio}
            onChange={val => update('portfolio', val)}
            hint="Your personal website or portfolio"
          />

          <LinkField
            icon={<FaLink size={17} color="#fff" />}
            iconBg="#0891b2"
            label="Other Link (Optional)"
            placeholder="https://behance.net/you  or  dribbble.com/you"
            value={form.other}
            onChange={val => update('other', val)}
            hint="Behance, Dribbble, Kaggle, etc."
          />

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 16, borderTop: '1px solid #f3f4f6', gap: 12 }}>
            <button onClick={() => navigate(`/app/resume-builder/projects?template=${templateId}`)}
              style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: '2px solid #4f46e5', background: '#fff', color: '#4f46e5', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              ← Previous
            </button>
            <button onClick={handleSave}
              style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: 'none', background: saved ? '#22c55e' : '#4f46e5', color: '#fff', cursor: 'pointer', transition: 'background 0.3s' }}>
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', marginTop: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', margin: '0 0 10px' }}>💡 Tips</p>
          {[
            'LinkedIn is the most important — always add it.',
            'GitHub showcases your technical work to recruiters.',
            'A portfolio website sets you apart from other candidates.',
            'Paste the full URL including https://',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
              <MdCheckCircle size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.75rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ── RIGHT: live preview ── */}
      <LivePreviewPanel />
    </div>
  )
}
