import { useResume } from '../../../context/ResumeContext'

const TEAL     = '#2d6b7a'
const INIT_CLR = '#9ca3af'
const HEAD_BG  = '#e8ecef'
const HDG      = '#374151'
const BODY     = '#4b5563'
const META     = '#6b7280'
const RULE     = '#d1d5db'
const DARK     = '#1f2937'

/* ── helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) return `${String(m[2]).padStart(2,'0')}/${m[1]}`
  return val
}

function initials(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0,2).join('')
}

/* ── Section heading (bold caps + thin rule) ──────────────────────────────── */
function SectionHead({ title }) {
  return (
    <div style={{ marginBottom: 8, marginTop: 18 }}>
      <p style={{
        margin: '0 0 4px',
        fontSize: '9pt',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: HDG,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        {title}
      </p>
      <div style={{ height: 1, background: RULE }} />
    </div>
  )
}

/* ── Personal info row (label / value) ────────────────────────────────────── */
function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 9 }}>
      <p style={{
        margin: 0, fontSize: '7pt', fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: TEAL, fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        {label}
      </p>
      <p style={{ margin: '1px 0 0', fontSize: '9pt', color: BODY, lineHeight: 1.4 }}>
        {value}
      </p>
    </div>
  )
}

/* ── Sidebar bullet ───────────────────────────────────────────────────────── */
function SideBullet({ text }) {
  if (!text) return null
  return (
    <li style={{ fontSize: '9pt', color: BODY, lineHeight: 1.6, marginBottom: 2 }}>
      {text}
    </li>
  )
}

/* ── Main bullet ──────────────────────────────────────────────────────────── */
function MainBullet({ text }) {
  if (!text) return null
  return (
    <li style={{ fontSize: '9.5pt', color: BODY, lineHeight: 1.6, marginBottom: 3 }}>
      {text}
    </li>
  )
}

/* ── Work history entry ───────────────────────────────────────────────────── */
function WorkEntry({ jobTitle, employer, employerOther, city, state,
                     startDate, endDate, currentWork, description, points }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'Present' : fmtDate(endDate)
  const dateStr  = [start, end].filter(Boolean).join(' - ')

  const bullets = points?.length
    ? points
    : description ? [description] : []

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Company - italic role */}
      <p style={{ margin: 0, fontSize: '10pt', color: DARK, lineHeight: 1.35 }}>
        {company && <strong>{company}</strong>}
        {company && jobTitle && <span style={{ color: META }}> - </span>}
        {jobTitle && <em style={{ fontWeight: 600 }}>{jobTitle}</em>}
      </p>
      {/* location */}
      {location && (
        <p style={{ margin: '1px 0 0', fontSize: '9pt', color: META }}>{location}</p>
      )}
      {/* dates */}
      {dateStr && (
        <p style={{ margin: '0 0 5px', fontSize: '9pt', color: META }}>{dateStr}</p>
      )}
      {/* bullets */}
      {bullets.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {bullets.map((pt, i) => <MainBullet key={i} text={pt} />)}
        </ul>
      )}
    </div>
  )
}

/* ── Project entry ────────────────────────────────────────────────────────── */
function ProjectEntry({ title, dateStr, description, points, link }) {
  const bullets = points?.length
    ? points
    : description ? [description] : []

  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ margin: 0, fontSize: '10pt', color: DARK, lineHeight: 1.35 }}>
        <strong>{title}</strong>
      </p>
      {link && (
        <p style={{ margin: '1px 0 0', fontSize: '8.5pt', color: META }}>{link}</p>
      )}
      {dateStr && (
        <p style={{ margin: '0 0 5px', fontSize: '9pt', color: META }}>{dateStr}</p>
      )}
      {bullets.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {bullets.map((pt, i) => <MainBullet key={i} text={pt} />)}
        </ul>
      )}
    </div>
  )
}

/* ── Language row with teal progress bar ─────────────────────────────────── */
const LEVEL_PCT = {
  'native': 100, 'fluent': 90, 'advanced': 75, 'upper-intermediate': 65,
  'intermediate': 50, 'b2': 65, 'b1': 50, 'a2': 35, 'a1': 20, 'beginner': 20,
}

function LangRow({ language, proficiency }) {
  const label    = typeof language === 'string' ? language : (language?.language || '')
  const level    = typeof language === 'string' ? proficiency : (language?.proficiency || proficiency || '')
  const pct      = LEVEL_PCT[level?.toLowerCase()] || 40
  const dispLevel = level ? `${level.charAt(0).toUpperCase()}${level.slice(1)}` : ''
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ margin: '0 0 2px', fontSize: '9pt', fontWeight: 600, color: HDG }}>
        {label}:
      </p>
      <div style={{ height: 3, background: '#e5e7eb', borderRadius: 2, width: '80%' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: TEAL, borderRadius: 2 }} />
      </div>
      {dispLevel && (
        <p style={{ margin: '2px 0 0', fontSize: '8pt', color: META }}>{dispLevel}</p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Template23AikoYamamoto() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const summary      = ctx.summary        || ''
  const langs        = (p.languages || [])
  const projects     = ctx.projects       || []

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''

  /* personal info */
  const personal = {
    email:    p.email || '',
    phone:    p.phone || '',
    location: [p.city, p.state].filter(Boolean).join(', '),
    dob:      p.dob || p.dateOfBirth || '',
    website:  p.website || '',
    linkedin: p.linkedin || p.linkedIn || '',
  }

  /* skill list */
  const skillRows = [
    skillsDet.programmingLanguages, skillsDet.frameworks, skillsDet.frontend,
    skillsDet.backend, skillsDet.databases, skillsDet.tools, skillsDet.other,
  ].filter(Boolean)
  const skillList = skillRows.length
    ? skillRows.flatMap(r => r.split(/[,;]/)).map(s => s.trim()).filter(Boolean)
    : skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)

  /* project list */
  const projectList = projects.map(pr => ({
    title:       pr.title || pr.name || '',
    dateStr:     [fmtDate(pr.startDate), pr.currentWork ? 'Present' : fmtDate(pr.endDate)].filter(Boolean).join(' - '),
    description: pr.description || '',
    points:      pr.points || [],
    link:        pr.link || pr.url || '',
  })).filter(pr => pr.title)

  /* ── demo data ── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoName       = 'Aiko Yamamoto'
  const demoProfession = 'Full Stack Developer'
  const demoPersonal   = {
    email: 'Aiko.Yamamoto@example.com',
    phone: '(555) 555-5555',
    location: 'Detroit, MI 48202',
    dob: '22 August 1993',
    website: 'www.aikoyamamoto.dev',
    linkedin: 'linkedin.com/in/aikoyamamoto',
  }
  const demoSummary    = 'Accomplished Full Stack Developer Intern with 9 years of experience building, optimizing, and launching dynamic web applications. Skilled in JavaScript, React, and Node.js with a track record of delivering significant performance improvements. Known for driving user growth and enhancing digital presence.'
  const demoSkills     = ['JavaScript','React','Node.js','HTML/CSS','RESTful APIs','SQL','Git','Agile Development']
  const demoEdu = [
    { degree: "Master's", fieldStudy: 'Computer Science', institution: 'Stanford University',
      city: 'Stanford', state: 'California', endYear: '06/2016' },
    { degree: "Bachelor's", fieldStudy: 'Computer Science', institution: 'University of California, Berkeley',
      city: 'Berkeley', state: 'California', endYear: '06/2014' },
  ]
  const demoLangs = [
    { language: 'Spanish',  proficiency: 'Beginner (A1)' },
    { language: 'French',   proficiency: 'Intermediate (B1)' },
    { language: 'German',   proficiency: 'Beginner (A1)' },
  ]
  const demoExp = [
    {
      jobTitle: 'Full Stack Developer Intern', employer: 'Tech Innovate Solutions',
      city: 'Detroit', state: 'MI', startDate: '2025-06', endDate: '2025-12',
      points: [
        'Developed 10+ web applications optimizing user experience by 30%',
        'Implemented RESTful APIs improving data flow by 25%',
        'Collaborated with a team of 5 to reduce bug fixes by 40%',
      ],
    },
    {
      jobTitle: 'Frontend Developer', employer: 'Innovative Web Solutions',
      city: 'Detroit', state: 'MI', startDate: '2017-01', endDate: '2025-05',
      points: [
        'Redesigned website layouts increasing engagement by 20%',
        'Enhanced site speed by 50% through code optimization',
        'Created interactive UI components leading to 15% user growth',
      ],
    },
    {
      jobTitle: 'Web Developer', employer: 'NextGen Technologies',
      city: 'Southgate', state: 'MI', startDate: '2016-01', endDate: '2016-12',
      points: [
        'Developed landing pages boosting conversion rates by 35%',
        'Maintained websites ensuring uptime of 99.9%',
        'Optimized SQL queries improving load times by 45%',
      ],
    },
  ]
  const demoProjects = [
    {
      title: 'Portfolio Analytics Dashboard',
      dateStr: '2024 - Present',
      points: [
        'Built a React/Node.js dashboard visualizing personal project metrics in real time',
        'Integrated third-party APIs to track traffic and engagement across 6 live projects',
      ],
    },
    {
      title: 'Open-Source UI Kit',
      dateStr: '2022 - 2023',
      points: [
        'Published a reusable component library adopted by 300+ GitHub stars',
        'Wrote documentation and examples that reduced integration time for contributors by 40%',
      ],
    },
  ]

  const displayName       = showDemo ? demoName       : (fullName || 'Your Name')
  const displayProfession = showDemo ? demoProfession : profession
  const displayInitials   = showDemo ? 'AY'           : initials(displayName)
  const displayPersonal   = showDemo ? demoPersonal   : personal
  const displaySummary    = showDemo ? demoSummary    : summary
  const displaySkills     = showDemo ? demoSkills     : skillList
  const displayEdu        = showDemo ? demoEdu        : education
  const displayExp        = showDemo ? demoExp        : experiences
  const displayLangs      = showDemo ? demoLangs      : langs
  const displayProjects   = showDemo ? demoProjects   : projectList

  return (
    <div style={{
      width: 794, minHeight: 1123,
      background: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: DARK, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ════ HEADER BAND ════════════════════════════════════════════════ */}
      <div style={{
        background: HEAD_BG,
        padding: '22px 32px 16px',
      }}>
        {/* Initials / Name row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            fontSize: '26pt', fontWeight: 700, color: INIT_CLR,
            letterSpacing: '0.06em', lineHeight: 1,
          }}>
            {displayInitials}
          </span>
          <span style={{ fontSize: '14pt', fontWeight: 400, color: INIT_CLR }}>
            {' /'}
          </span>
          <span style={{
            fontSize: '26pt', fontWeight: 800, color: TEAL,
            letterSpacing: '0.06em', lineHeight: 1, textTransform: 'uppercase',
          }}>
            {displayName.toUpperCase()}
          </span>
        </div>

        {/* Profession */}
        {displayProfession && (
          <p style={{
            margin: '4px 0 0', fontSize: '10pt', fontWeight: 600, color: HDG,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {displayProfession}
          </p>
        )}
      </div>

      {/* thin separator */}
      <div style={{ height: 2, background: RULE }} />

      {/* ════ BODY ═══════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── LEFT MAIN ─────────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          padding: '18px 24px 24px 32px',
          boxSizing: 'border-box',
          borderRight: '1px solid #e5e7eb',
        }}>

          {/* PROFESSIONAL SUMMARY */}
          {displaySummary && (
            <>
              <SectionHead title="Professional Summary" />
              <p style={{ margin: '0 0 4px', fontSize: '9.5pt', color: BODY, lineHeight: 1.65 }}>
                {displaySummary}
              </p>
            </>
          )}

          {/* WORK HISTORY */}
          {displayExp.length > 0 && (
            <>
              <SectionHead title="Work History" />
              {displayExp.map((exp, i) => (
                <WorkEntry key={i} {...exp} />
              ))}
            </>
          )}

          {/* PROJECTS */}
          {displayProjects.length > 0 && (
            <>
              <SectionHead title="Projects" />
              {displayProjects.map((pr, i) => (
                <ProjectEntry key={i} {...pr} />
              ))}
            </>
          )}

          {/* LANGUAGES */}
          {displayLangs.length > 0 && (
            <>
              <SectionHead title="Languages" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                columnGap: 24,
              }}>
                {displayLangs.map((lang, i) => {
                  const label = typeof lang === 'string' ? lang : (lang.language || '')
                  const level = typeof lang === 'string' ? '' : (lang.proficiency || '')
                  return (
                    <LangRow key={i} language={label} proficiency={level} />
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
        <div style={{
          width: 220, minWidth: 220, flexShrink: 0,
          padding: '18px 20px 24px 18px',
          boxSizing: 'border-box',
        }}>

          {/* PERSONAL INFO */}
          <SectionHead title="Personal Info" />
          <InfoRow label="Email"    value={displayPersonal.email} />
          <InfoRow label="Phone"    value={displayPersonal.phone} />
          <InfoRow label="Location" value={displayPersonal.location} />
          <InfoRow label="DOB"      value={displayPersonal.dob} />
          <InfoRow label="Website"  value={displayPersonal.website} />
          <InfoRow label="LinkedIn" value={displayPersonal.linkedin} />

          {/* SKILLS */}
          {displaySkills.length > 0 && (
            <>
              <SectionHead title="Skills" />
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {displaySkills.map((s, i) => <SideBullet key={i} text={s} />)}
              </ul>
            </>
          )}

          {/* EDUCATION */}
          {displayEdu.length > 0 && (
            <>
              <SectionHead title="Education" />
              {displayEdu.map((item, i) => {
                const inst   = item.institution || item.schoolName || ''
                const loc    = [item.city, item.state].filter(Boolean).join(', ')
                const date   = item.endYear || item.endDate || item.startYear || ''
                const degree = item.degree || ''
                const field  = item.fieldStudy || ''
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    {inst && (
                      <p style={{ margin: 0, fontSize: '9.5pt', fontWeight: 700, color: DARK }}>
                        {inst}
                      </p>
                    )}
                    {loc && (
                      <p style={{ margin: '1px 0 0', fontSize: '8.5pt', color: META }}>{loc}</p>
                    )}
                    {date && (
                      <p style={{ margin: '1px 0 2px', fontSize: '8.5pt', color: META }}>{date}</p>
                    )}
                    {degree && (
                      <p style={{ margin: 0, fontSize: '9pt', fontStyle: 'italic', color: BODY }}>
                        <em>{degree}</em>
                      </p>
                    )}
                    {field && (
                      <p style={{ margin: 0, fontSize: '9pt', color: BODY }}>{field}</p>
                    )}
                    {item.cgpa && (
                      <p style={{ margin: 0, fontSize: '8.5pt', color: META }}>CGPA: {item.cgpa}</p>
                    )}
                  </div>
                )
              })}
            </>
          )}

        </div>
      </div>
    </div>
  )
}