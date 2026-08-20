/**
 * Template 6 — ATS Single Column
 * Format:
 *   FULL NAME
 *   City, State | Phone | Email | GitHub | LinkedIn
 *   ─────────────────────────────────────────────────
 *   PROFESSIONAL SUMMARY
 *   EDUCATION
 *   EXPERIENCE
 *   PROJECTS
 *   TECHNICAL SKILLS
 *   CERTIFICATIONS
 *   ACHIEVEMENTS
 *   LANGUAGES
 */

import { useResume } from '../../../context/ResumeContext'

const ACCENT = '#1a1a1a'
const HR_COLOR = '#555'

function formatMonthYear(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  return match ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[2]) - 1]} ${match[1]}` : value
}

// ── Section heading with full-width rule ─────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <div style={{ marginBottom: 6, marginTop: 14 }}>
      <p style={{
        fontSize: '13pt',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: ACCENT,
        margin: '0 0 3px',
        fontFamily: 'Georgia, serif',
      }}>
        {title}
      </p>
      <div style={{ height: 1.5, background: HR_COLOR, width: '100%' }} />
    </div>
  )
}

// ── Bullet item ───────────────────────────────────────────────────────────────
function Bullet({ text }) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 2.5 }}>
      <span style={{ fontSize: 10, marginTop: 1.5, flexShrink: 0, color: '#333' }}>•</span>
      <span style={{ fontSize: '11pt', color: '#222', lineHeight: 1.45 }}>{text}</span>
    </div>
  )
}

// ── Education entry ───────────────────────────────────────────────────────────
function EduEntry({ institution, degree, fieldStudy, startYear, endYear, cgpa, city }) {
  const period = [startYear, endYear || 'Present'].filter(Boolean).join(' - ')
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{ fontWeight: 700, fontSize: 10.5, margin: 0, color: '#111' }}>{institution}</p>
        <p style={{ fontSize: 10, color: '#444', margin: 0, whiteSpace: 'nowrap', marginLeft: 8 }}>{period}</p>
      </div>
      <p style={{ fontSize: 10, color: '#333', margin: '1px 0 0', fontStyle: 'italic' }}>
        {degree}
        {cgpa ? ` | CGPA: ${cgpa}` : ''}
      </p>
    </div>
  )
}

// ── Experience entry ──────────────────────────────────────────────────────────
function ExpEntry({ jobTitle, employer, city, state, startDate, endDate, currentWork, description, points }) {
  const period = currentWork ? `${formatMonthYear(startDate)} – Present` : [formatMonthYear(startDate), formatMonthYear(endDate)].filter(Boolean).join(' – ')
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{ fontWeight: 700, fontSize: 10.5, margin: 0, color: '#111' }}>
          {jobTitle}{employer ? ` – ${employer}` : ''}{(city || state) ? ` | ${[city, state].filter(Boolean).join(', ')}` : ''}
        </p>
        <p style={{ fontSize: 10, color: '#444', margin: 0, whiteSpace: 'nowrap', marginLeft: 8 }}>{period}</p>
      </div>
      {/* description string from form */}
      {description && !(points?.length) && <Bullet text={description} />}
      {(points || []).map((pt, i) => <Bullet key={i} text={pt} />)}
    </div>
  )
}

// ── Project entry ─────────────────────────────────────────────────────────────
function ProjectEntry({ name, technologies, description, highlights, points }) {
  const techStr = Array.isArray(technologies) ? technologies.join(', ') : technologies
  const bullets = points?.length
    ? points
    : description
      ? [description, ...(highlights ? [highlights] : [])]
      : (highlights ? [highlights] : [])

  return (
    <div style={{ marginBottom: 9 }}>
      <p style={{ fontWeight: 700, fontSize: 10.5, margin: '0 0 1px', color: '#111' }}>
        {name}
      </p>
      {techStr && (
        <p style={{ fontSize: 10, color: '#444', margin: '0 0 3px', fontStyle: 'italic' }}>
          ({techStr})
        </p>
      )}
      {bullets.map((b, i) => <Bullet key={i} text={b} />)}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Template6ATS() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const projects     = ctx.projects       || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const websites     = ctx.websites       || {}
  const summary      = ctx.summary        || ''
  const certs        = ctx.certifications || []
  const achievements = ctx.achievements   || []
  const langs        = (p.languages || []).map(language => typeof language === 'string' ? language : language.language).filter(Boolean)
  const interests    = ctx.interests      || []
  const hobbies      = ctx.hobbies        || []
  const references   = ctx.references     || []

  // ── Contact line ─────────────────────────────────────────────────────────
  const fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'FULL NAME'
  const contactParts = [
    p.city && p.state ? `${p.city}, ${p.state}` : (p.city || p.state || ''),
    p.phone  || '',
    p.email  || '',
    p.dob    ? `DOB: ${p.dob}` : '',
    websites.github    ? (websites.github.replace(/https?:\/\/(www\.)?github\.com\//, 'github.com/')) : '',
    websites.linkedin  ? (websites.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin.com/in/')) : '',
  ].filter(Boolean)

  // ── Skill rows (if skillsDetailed filled use that, else fall back to skills[]) ──
  const skillRows = [
    { label: 'Programming Languages', value: skillsDet.programmingLanguages },
    { label: 'Frameworks',            value: skillsDet.frameworks },
    { label: 'Frontend',              value: skillsDet.frontend },
    { label: 'Backend',               value: skillsDet.backend },
    { label: 'Databases',             value: skillsDet.databases },
    { label: 'Tools',                 value: skillsDet.tools },
    { label: 'Version Control',       value: skillsDet.versionControl },
    { label: 'Other',                 value: skillsDet.other },
  ].filter(r => r.value?.trim())

  const hasSkillRows = skillRows.length > 0
  const hasSkillTags = skills.length > 0

  // ── Demo fallback data (shown when context is empty) ──────────────────────
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoEdu = [
    { institution: 'ABC University', degree: 'B.Tech', fieldStudy: 'Computer Science', startYear: '2020', endYear: '2024', cgpa: '8.5' },
    { institution: 'XYZ College', degree: 'Higher Secondary (12th)', fieldStudy: 'Science', startYear: '2018', endYear: '2020', cgpa: '92%' },
  ]
  const demoExp = [
    { jobTitle: 'Software Developer', employer: 'Tech Corp', startDate: 'Jan 2024', endDate: '', currentWork: true, description: 'Developed and maintained full-stack web applications using React and Node.js.' },
  ]
  const demoProjects = [
    { name: 'E-Commerce Platform', technologies: 'React, Node.js, MongoDB', description: 'Built a full-featured e-commerce platform with cart, checkout, and admin panel.', highlights: 'Reduced load time by 40% using lazy loading and code splitting.' },
    { name: 'Resume Builder App', technologies: 'React, Vite, PDF.js', description: 'Created an AI-powered resume builder with live preview and PDF export.' },
  ]
  const demoSkillRows = [
    { label: 'Programming Languages', value: 'JavaScript, Python, Java, C++' },
    { label: 'Frameworks',            value: 'React, Node.js, Express, Django' },
    { label: 'Databases',             value: 'MongoDB, MySQL, PostgreSQL' },
    { label: 'Tools',                 value: 'VS Code, Postman, Figma, Docker' },
    { label: 'Version Control',       value: 'Git, GitHub' },
  ]
  const demoCerts = [
    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: '2024' },
    { name: 'React Developer Certificate', issuer: 'Meta', year: '2023' },
  ]
  const demoAchievements = [
    'Won 1st place in National Hackathon 2023 among 500+ teams.',
    'Achieved 99th percentile in JEE Mains 2020.',
  ]
  const demoLanguages = ['English (Fluent)', 'Hindi (Native)', 'Marathi (Native)']

  const displayEdu        = showDemo ? demoEdu        : education
  const displayExp        = showDemo ? demoExp        : experiences
  const displayProjects   = showDemo ? demoProjects   : projects
  const displaySkillRows  = showDemo ? demoSkillRows  : (hasSkillRows ? skillRows : [])
  const displaySkillTags  = showDemo ? []             : (hasSkillRows ? [] : skills)
  const displayCerts      = showDemo ? demoCerts      : certs
  const displayAchievements = showDemo ? demoAchievements : achievements
  const displayLanguages  = showDemo ? demoLanguages  : langs
  const displaySummary    = showDemo
    ? 'Motivated and detail-oriented Computer Science graduate with hands-on experience in full-stack web development. Passionate about building scalable applications and solving complex problems.'
    : summary
  const displayName       = showDemo ? 'Manasi Ithape' : fullName
  const displayContact    = showDemo
    ? ['Pune, Maharashtra', '+91 98765 43210', 'manasi@email.com', 'github.com/manasi', 'linkedin.com/in/manasi']
    : contactParts

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: '#fff',
      padding: '44px 52px 44px 52px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      boxSizing: 'border-box',
      color: '#1a1a1a',
    }}>

      {/* ── NAME ── */}
      <p style={{
        fontSize: '18pt',
        fontWeight: 700,
        textAlign: 'center',
        margin: '0 0 4px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontFamily: 'Georgia, serif',
        color: '#000',
      }}>
        {displayName}
      </p>

      {/* ── CONTACT LINE ── */}
      <p style={{
        fontSize: '9.5pt',
        textAlign: 'center',
        margin: '0 0 10px',
        color: '#333',
        lineHeight: 1.6,
      }}>
        {displayContact.join(' | ')}
      </p>

      {/* ── TOP DIVIDER ── */}
      <div style={{ height: 2, background: '#1a1a1a', marginBottom: 2 }} />
      <div style={{ height: 0.5, background: '#555', marginBottom: 10 }} />

      {/* ── PROFESSIONAL SUMMARY ── */}
      {displaySummary && (
        <>
          <SectionHeader title="Professional Summary" />
          <p style={{ fontSize: 10.5, color: '#222', lineHeight: 1.65, margin: '4px 0 0' }}>
            {displaySummary}
          </p>
        </>
      )}

      {/* ── EDUCATION ── */}
      {displayEdu.length > 0 && (
        <>
          <SectionHeader title="Education" />
          {displayEdu.map((e, i) => (
            <EduEntry key={i} {...e} />
          ))}
        </>
      )}

      {/* ── EXPERIENCE ── */}
      {displayExp.length > 0 && (
        <>
          <SectionHeader title="Experience" />
          {displayExp.map((e, i) => (
            <ExpEntry key={i} {...e} />
          ))}
        </>
      )}

      {/* ── PROJECTS ── */}
      {displayProjects.length > 0 && (
        <>
          <SectionHeader title="Projects" />
          {displayProjects.map((proj, i) => (
            <ProjectEntry
              key={i}
              name={proj.name || proj.title}
              technologies={proj.techStack || proj.technologies}
              description={proj.description}
              highlights={proj.highlights}
              points={proj.points}
            />
          ))}
        </>
      )}

      {/* ── TECHNICAL SKILLS ── */}
      {(displaySkillRows.length > 0 || displaySkillTags.length > 0) && (
        <>
          <SectionHeader title="Technical Skills" />
          {displaySkillRows.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#111', minWidth: 150, flexShrink: 0 }}>
                {row.label} :
              </span>
              <span style={{ fontSize: 10.5, color: '#333', lineHeight: 1.5 }}>{row.value}</span>
            </div>
          ))}
          {displaySkillTags.length > 0 && (
            <p style={{ fontSize: 10.5, color: '#333', margin: '3px 0 0', lineHeight: 1.6 }}>
              {displaySkillTags.join(' • ')}
            </p>
          )}
        </>
      )}

      {/* ── ACHIEVEMENTS ── */}
      {displayLanguages.length > 0 && (
        <>
          <SectionHeader title="Languages" />
          {displayLanguages.map((language, index) => (
            <Bullet key={`language-${index}`} text={typeof language === 'string' ? language : language.name} />
          ))}
        </>
      )}

      {displayAchievements.length > 0 && (
        <>
          <SectionHeader title="Achievements" />
          {displayAchievements.map((a, i) => (
            <Bullet key={i} text={typeof a === 'string' ? a : a.text} />
          ))}
        </>
      )}

      {/* ── LANGUAGES ── */}
      {false && displayLanguages.length > 0 && (
        <>
          <SectionHeader title="Languages" />
          {displayLanguages.map((l, i) => (
            <Bullet key={i} text={typeof l === 'string' ? l : l.name} />
          ))}
        </>
      )}

      {/* ── INTERESTS ── */}
      {(interests.length > 0 || hobbies.length > 0) && (
        <>
          <SectionHeader title="Interests & Hobbies" />
          {[...interests, ...hobbies].map((item, i) => (
            <Bullet key={i} text={item} />
          ))}
        </>
      )}

      {/* ── REFERENCES ── */}
      {references.length > 0 && (
        <>
          <SectionHeader title="References" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {references.map((ref, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <p style={{ fontWeight: 700, fontSize: 10.5, margin: '0 0 1px', color: '#111' }}>{ref.name}</p>
                {ref.title   && <p style={{ fontSize: 10, color: '#333', margin: 0 }}>{ref.title}{ref.company ? ` – ${ref.company}` : ''}</p>}
                {ref.phone   && <p style={{ fontSize: 10, color: '#555', margin: 0 }}>📞 {ref.phone}</p>}
                {ref.email   && <p style={{ fontSize: 10, color: '#555', margin: 0 }}>✉ {ref.email}</p>}
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}
