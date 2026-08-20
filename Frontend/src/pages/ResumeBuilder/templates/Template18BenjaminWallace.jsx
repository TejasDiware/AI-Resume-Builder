/**
 * Template 18 — Benjamin Wallace
 *
 * Matches the image exactly:
 *
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │  dark slate header: BENJAMIN WALLACE / FULL-STACK JAVA DEVELOPER │
 *  ├──────────────────────┬──────────────────────────────────────────┤
 *  │  CONTACT  (right-    │  WORK EXPERIENCE                         │
 *  │  aligned, centered)  │    Job Title (large)                     │
 *  │  EDUCATION           │    Company                               │
 *  │  SKILLS              │    Date / Location  (gray)               │
 *  │  CERTIFICATIONS      │    • bullet  • bullet …                  │
 *  └──────────────────────┴──────────────────────────────────────────┘
 *
 * Colors:
 *   Header bg : #556070   (dark slate blue-gray)
 *   Link blue : #4472c4
 *   Section h  : #1a1a1a  bold, no rules
 *   Meta text  : #666
 */

import { useResume } from '../../../context/ResumeContext'

const HEADER_BG = '#556070'
const LINK_BLUE = '#4472c4'
const DARK      = '#111'
const MID       = '#444'
const META      = '#666'

/* ── helpers ──────────────────────────────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`
  return val
}

/* ── Section heading (bold caps, no rule) ─────────────────────────────────── */
function SectionHead({ title }) {
  return (
    <h2 style={{
      margin: '0 0 8px',
      fontSize: '11pt',
      fontWeight: 800,
      letterSpacing: '0.04em',
      color: DARK,
      textAlign: 'center',
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      {title.toUpperCase()}
    </h2>
  )
}

/* ── Work Experience section heading (left-aligned) ──────────────────────── */
function MainSectionHead({ title }) {
  return (
    <h2 style={{
      margin: '0 0 14px',
      fontSize: '12pt',
      fontWeight: 800,
      letterSpacing: '0.03em',
      color: DARK,
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      {title.toUpperCase()}
    </h2>
  )
}

/* ── Bullet point ─────────────────────────────────────────────────────────── */
function Bullet({ text }) {
  if (!text) return null
  // Support **bold** markdown-style inline bold
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <li style={{ fontSize: '9.5pt', color: MID, lineHeight: 1.55, marginBottom: 4 }}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </li>
  )
}

/* ── Experience entry ─────────────────────────────────────────────────────── */
function ExpEntry({ jobTitle, employer, employerOther, city, state,
                    startDate, endDate, currentWork, description, points }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'current' : fmtDate(endDate)
  const dateMeta = [start && end ? `${start} - ${end}` : (start || end), location]
    .filter(Boolean).join('  /  ')

  const bullets = points?.length
    ? points
    : description ? [description] : []

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Job title */}
      <p style={{ margin: 0, fontSize: '13pt', fontWeight: 600, color: DARK, lineHeight: 1.25, fontFamily: 'Georgia, serif' }}>
        {jobTitle || 'Job Title'}
      </p>
      {/* Company */}
      {company && (
        <p style={{ margin: '2px 0 1px', fontSize: '10pt', color: MID }}>
          {company}
        </p>
      )}
      {/* Date / Location */}
      {dateMeta && (
        <p style={{ margin: '0 0 7px', fontSize: '9.5pt', color: META }}>
          {dateMeta}
        </p>
      )}
      {/* Bullets */}
      {bullets.length > 0 && (
        <ul style={{ margin: '0', paddingLeft: 18 }}>
          {bullets.map((pt, i) => <Bullet key={i} text={pt} />)}
        </ul>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════════════════ */
export default function Template18BenjaminWallace() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const websites     = ctx.websites       || {}
  const certs        = ctx.certifications || []
  const achievements = ctx.achievements   || []
  const projects     = ctx.projects       || []

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''
  const location   = [p.city, p.state].filter(Boolean).join(', ')

  /* skill string */
  const skillRows = [
    skillsDet.programmingLanguages,
    skillsDet.frameworks,
    skillsDet.frontend,
    skillsDet.backend,
    skillsDet.databases,
    skillsDet.tools,
    skillsDet.other,
  ].filter(Boolean)

  const skillStr = skillRows.length
    ? skillRows.join('; ')
    : skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean).join('; ')

  /* cert names */
  const certNames = certs.map(c =>
    typeof c === 'string' ? c : (c.name || '')
  ).filter(Boolean)

  /* links */
  const linkedIn = websites.linkedin
  const github   = websites.github

  /* ── demo data ─────────────────────────────────────────────────────────── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoName      = 'Benjamin Wallace'
  const demoProfession = 'Full-Stack Java Developer'
  const demoEmail     = 'benwallace@email.com'
  const demoPhone     = '(123) 456-7890'
  const demoCity      = 'Brooklyn, NY'
  const demoLinkedIn  = 'https://linkedin.com/in/benwallace'
  const demoGithub    = 'https://github.com/benwallace'
  const demoEdu = [
    {
      degree: 'B.S.',
      fieldStudy: 'Computer Science',
      institution: 'University of Pittsburgh',
      startYear: 'September 2013',
      endYear: 'June 2017',
      city: 'Pittsburgh', state: 'PA',
    },
  ]
  const demoSkills = 'Java; SQL; Spring; Hibernate; AWS; C++; Python; Kafka; Enzyme; JavaScript; React.js; Node.js; TypeScript'
  const demoCerts  = ['IWA', 'ETA', 'IEEE']
  const demoExp = [
    {
      jobTitle: 'Full-Stack Java Developer',
      employer: 'Logicplanet IT Services',
      city: 'New York', state: 'NY',
      startDate: '2019-02', endDate: '', currentWork: true,
      points: [
        '**Designed and developed 20+** front-end and back-end applications utilizing React.j, Node.js, and TypeScript',
        'Developed 10+ new application features and distributed services that support high-scale applications',
        'Helped evolve front-end and back-end stack',
        'Worked with Agile team across 4+ application domains',
        'Participated in 100+ weekly code reviews to ensure code quality and system efficiency',
      ],
    },
    {
      jobTitle: 'Junior Full-Stack Developer',
      employer: 'Punch',
      city: 'Pittsburgh', state: 'PA',
      startDate: '2017-06', endDate: '2019-02', currentWork: false,
      points: [
        'Designed and built 3 mobile applications using React Native',
        'Ensured the performance, quality, and responsiveness of 6+ applications',
        'Defined, designed, and shipped 7 new features',
        'Identified and corrected 10+ bottlenecks and 100+ bug fixes',
        '**Participated in 100+** weekly code reviews to ensure code quality and receive mentoring from senior developers',
      ],
    },
    {
      jobTitle: 'Full-Stack Developer Intern',
      employer: 'Boeing',
      city: 'Philadelphia', state: 'PA',
      startDate: '2017-01', endDate: '2017-05', currentWork: false,
      points: [
        'Remained up-to-date with industry-standard technologies and **mentored a team of 11** junior developers',
        'Wrote structured, tested, readable, and maintainable code',
        'Helped maintain code quality, organization, and automatization for 6+ applications',
        'Assisted in developing and implementing systems architecture designs, patterns, and approaches',
      ],
    },
  ]

  const displayName       = showDemo ? demoName       : (fullName || 'Your Name')
  const displayProfession = showDemo ? demoProfession : profession
  const displayEmail      = showDemo ? demoEmail      : (p.email || '')
  const displayPhone      = showDemo ? demoPhone      : (p.phone || '')
  const displayDob        = p.dob || ''
  const displayCity       = showDemo ? demoCity       : location
  const displayLinkedIn   = showDemo ? demoLinkedIn   : linkedIn
  const displayGithub     = showDemo ? demoGithub     : github
  const displayEdu        = showDemo ? demoEdu        : education
  const displaySkills     = showDemo ? demoSkills     : skillStr
  const displayCerts      = showDemo ? demoCerts      : certNames
  const displayExp        = showDemo ? demoExp        : experiences

  /* education formatting helper */
  const fmtEdu = (item) => {
    const deg    = [item.degree, item.fieldStudy].filter(Boolean).join('\n') || 'Degree'
    const school = item.institution || item.schoolName || ''
    const dates  = [item.startYear || item.startDate, item.endYear || item.endDate].filter(Boolean).join(' - ')
    const loc    = [item.city, item.state].filter(Boolean).join(', ')
    return { deg, school, dates, loc }
  }

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: DARK,
      boxSizing: 'border-box',
      border: '6px solid #fff',
      boxShadow: 'inset 0 0 0 1px #e0e0e0',
    }}>

      {/* ════ HEADER BAND ════════════════════════════════════════════════════ */}
      <div style={{
        background: HEADER_BG,
        padding: '28px 40px 22px',
        textAlign: 'center',
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '24pt',
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#fff',
          textTransform: 'uppercase',
          fontFamily: 'Georgia, serif',
          lineHeight: 1.15,
        }}>
          {displayName.toUpperCase()}
        </h1>
        {displayProfession && (
          <p style={{
            margin: '7px 0 0',
            fontSize: '10pt',
            fontWeight: 400,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.85)',
            fontStyle: 'italic',
            textTransform: 'uppercase',
          }}>
            {displayProfession}
          </p>
        )}
      </div>

      {/* thin divider */}
      <div style={{ height: 3, background: HEADER_BG }} />

      {/* ════ BODY (two columns) ════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <div style={{
          width: 195,
          minWidth: 195,
          flexShrink: 0,
          padding: '24px 14px 30px 16px',
          boxSizing: 'border-box',
          borderRight: '1px solid #ddd',
          textAlign: 'center',
        }}>

          {/* CONTACT */}
          <SectionHead title="Contact" />
          <div style={{ marginBottom: 20, fontSize: '9pt', color: MID, lineHeight: 1.8 }}>
            {displayEmail && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span>{displayEmail}</span>
                <span style={{ fontSize: '9pt' }}>✉</span>
              </div>
            )}
            {displayPhone && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span>{displayPhone}</span>
                <span style={{ fontSize: '9pt' }}>📞</span>
              </div>
            )}
            {displayDob && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span>DOB: {displayDob}</span>
              </div>
            )}
            {displayCity && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span>{displayCity}</span>
                <span style={{ fontSize: '9pt' }}>📍</span>
              </div>
            )}
            {displayLinkedIn && (
              <div style={{ marginBottom: 2, textAlign: 'right' }}>
                <span style={{ color: LINK_BLUE, fontWeight: 500 }}>
                  LinkedIn
                </span>
                <span style={{ marginLeft: 4, fontSize: '9pt' }}>🔗</span>
              </div>
            )}
            {displayGithub && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: LINK_BLUE, fontWeight: 500 }}>
                  Github
                </span>
                <span style={{ marginLeft: 4, fontSize: '9pt' }}>🐙</span>
              </div>
            )}
          </div>

          {/* EDUCATION */}
          <SectionHead title="Education" />
          <div style={{ marginBottom: 20 }}>
            {displayEdu.map((item, i) => {
              const { deg, school, dates, loc } = fmtEdu(item)
              return (
                <div key={i} style={{ marginBottom: 12, fontSize: '9pt', color: MID, lineHeight: 1.6, textAlign: 'center' }}>
                  {deg.split('\n').map((line, j) => (
                    <p key={j} style={{ margin: 0, fontWeight: j === 0 ? 600 : 400 }}>{line}</p>
                  ))}
                  {school && <p style={{ margin: 0 }}>{school}</p>}
                  {dates  && <p style={{ margin: 0 }}>{dates}</p>}
                  {loc    && <p style={{ margin: 0 }}>{loc}</p>}
                </div>
              )
            })}
          </div>

          {/* SKILLS */}
          <SectionHead title="Skills" />
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: '9pt', color: MID, lineHeight: 1.7, textAlign: 'center' }}>
              {displaySkills}
            </p>
          </div>

          {/* CERTIFICATIONS */}
          {displayCerts.length > 0 && (
            <>
              <SectionHead title="Certifications" />
              <div style={{ marginBottom: 20 }}>
                {displayCerts.map((cert, i) => (
                  <p key={i} style={{ margin: '0 0 3px', fontSize: '9pt', color: MID, textAlign: 'right', paddingRight: 4 }}>
                    {cert}
                  </p>
                ))}
              </div>
            </>
          )}

          {/* ACHIEVEMENTS (if any) */}
          {achievements.length > 0 && (
            <>
              <SectionHead title="Achievements" />
              <div style={{ marginBottom: 20 }}>
                {achievements.map((a, i) => (
                  <p key={i} style={{ margin: '0 0 4px', fontSize: '9pt', color: MID, textAlign: 'center' }}>
                    {typeof a === 'string' ? a : a.text}
                  </p>
                ))}
              </div>
            </>
          )}

        </div>

        {/* ── RIGHT MAIN ───────────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          padding: '24px 28px 30px 24px',
          boxSizing: 'border-box',
        }}>

          {/* WORK EXPERIENCE */}
          {displayExp.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <MainSectionHead title="Work Experience" />
              {displayExp.map((exp, i) => (
                <ExpEntry key={i} {...exp} />
              ))}
            </div>
          )}

          {/* PROJECTS (if present) */}
          {projects.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <MainSectionHead title="Projects" />
              {projects.map((proj, i) => {
                const tech = Array.isArray(proj.techStack)
                  ? proj.techStack.join(', ')
                  : (proj.technologies || proj.techStack || '')
                const bullets = proj.points?.length
                  ? proj.points
                  : [proj.description, proj.highlights].filter(Boolean)
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <p style={{ margin: 0, fontSize: '13pt', fontWeight: 600, color: DARK, fontFamily: 'Georgia, serif' }}>
                      {proj.name || proj.title || 'Project'}
                    </p>
                    {tech && <p style={{ margin: '1px 0 6px', fontSize: '9.5pt', color: META }}>{tech}</p>}
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {bullets.map((b, j) => <Bullet key={j} text={b} />)}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
