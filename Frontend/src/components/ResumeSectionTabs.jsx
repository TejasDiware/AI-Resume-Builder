import { useLocation, useNavigate } from 'react-router-dom'

const sections = [
  { label: 'Profile',              path: '/app/profile' },
  { label: 'Work Experience',      path: '/app/resume-builder/experience' },
  { label: 'Education',            path: '/app/resume-builder/education' },
  { label: 'Skills',               path: '/app/resume-builder/skills' },
  { label: 'Projects',             path: '/app/resume-builder/projects' },
  { label: 'Websites & Portfolio', path: '/app/resume-builder/portfolio' },
  { label: 'Certifications',       path: '/app/resume-builder/certifications' },
  { label: 'Summary',              path: '/app/resume-builder/summary' },
]

export default function ResumeSectionTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const template = new URLSearchParams(location.search).get('template') || '1'

  return (
    <nav
      aria-label="Resume sections"
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '2px 0 16px',
        marginBottom: 20,
        borderBottom: '1px solid #e0e7ff',
      }}
    >
      {sections.map((section) => {
        const active = location.pathname === section.path

        return (
          <button
            key={section.path}
            type="button"
            onClick={() => navigate(`${section.path}?template=${template}`)}
            style={{
              flexShrink: 0,
              border: 'none',
              borderRadius: 999,
              padding: '9px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: active ? '#4f46e5' : 'transparent',
              color: active ? '#fff' : '#4f46e5',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = '#eef2ff'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}
