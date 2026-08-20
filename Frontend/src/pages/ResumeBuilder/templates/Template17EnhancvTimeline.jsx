/**
 * Template 17 — Enhancv Timeline
 *
 * Exact match to the "Sophie Martin" Enhancv style from the image:
 *
 *  SOPHIE MARTIN                          ← very large bold dark name
 *  Python Full Stack Developer | …        ← bold gold subtitle
 *  📞 phone  ✉ email  🔗 linkedin         ← inline contact row
 *  📍 Dallas, Texas                        ← location
 *
 *  SUMMARY ─────────────────────────────────────────────────────────
 *  paragraph
 *
 *  SKILLS ──────────────────────────────────────────────────────────
 *  comma-separated list
 *
 *  EXPERIENCE ──────────────────────────────────────────────────────
 *  [left col: date range    │ vertical line + dot]  [right col: role]
 *  [         city, state   ]                        [gold company]
 *                                                   · bullet
 *                                                   · bullet
 *
 *  EDUCATION ────────────────────────────────────────────────────────
 *  same left-date / right-content layout
 *
 * Colors:
 *   Name:    #1a1a2e  (very dark navy)
 *   Gold:    #e8a020  (orange-gold — company names, subtitle)
 *   Text:    #333
 *   Line:    #1a1a2e  (dark vertical timeline line)
 *   Dot:     #1a1a2e  filled circle
 */

import { useResume } from '../../../context/ResumeContext'

const DARK   = '#1a1a2e'
const GOLD   = '#e8a020'
const TEXT   = '#333'
const LIGHT  = '#555'

/* ── helpers ──────────────────────────────────────────────────────────────── */
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) return `${String(m[2]).padStart(2,'0')}/${m[1]}`
  return val
}

/* ── Section heading — large bold, no rule ────────────────────────────────── */
function SectionHead({ title }) {
  return (
    <h2 style={{
      margin: '0 0 14px',
      fontSize: '15pt',
      fontWeight: 800,
      letterSpacing: '0.02em',
      color: DARK,
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      {title.toUpperCase()}
    </h2>
  )
}

/* ── Timeline entry — date left, dot+line, content right ─────────────────── */
function TimelineEntry({ dateTop, dateBottom, locationStr, children }) {
  return (
    <div style={{ display: 'flex', marginBottom: 20 }}>

      {/* ── LEFT: date + location ── */}
      <div style={{
        width: 120,
        minWidth: 120,
        flexShrink: 0,
        paddingRight: 10,
        boxSizing: 'border-box',
      }}>
        <p style={{ margin: 0, fontSize: '9pt', color: TEXT, lineHeight: 1.5, fontWeight: 500 }}>
          {dateTop}
        </p>
        {locationStr && (
          <p style={{ margin: '2px 0 0', fontSize: '8.5pt', color: LIGHT, lineHeight: 1.4 }}>
            {locationStr}
          </p>
        )}
      </div>

      {/* ── CENTRE: vertical line + filled dot ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 20,
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* dot */}
        <div style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: DARK,
          flexShrink: 0,
          marginTop: 3,
          zIndex: 1,
        }} />
        {/* line extending downward */}
        <div style={{
          flex: 1,
          width: 1.5,
          background: DARK,
          marginTop: 3,
        }} />
      </div>

      {/* ── RIGHT: content ── */}
      <div style={{ flex: 1, paddingLeft: 14 }}>
        {children}
      </div>
    </div>
  )
}

/* ── Experience entry ─────────────────────────────────────────────────────── */
function ExpEntry({ jobTitle, employer, employerOther, city, state,
                    startDate, endDate, currentWork, description, points }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'Present' : fmtDate(endDate)
  const dateRange = [start, end].filter(Boolean).join(' - ')

  const bullets = points?.length
    ? points
    : description ? [description] : []

  return (
    <TimelineEntry dateTop={dateRange} locationStr={location}>
      {/* Job title */}
      <p style={{ margin: 0, fontSize: '12pt', fontWeight: 700, color: DARK, lineHeight: 1.3 }}>
        {jobTitle || 'Job Title'}
      </p>
      {/* Company — gold */}
      {company && (
        <p style={{ margin: '2px 0 6px', fontSize: '10.5pt', fontWeight: 700, color: GOLD }}>
          {company}
        </p>
      )}
      {/* Bullets */}
      {bullets.map((pt, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: '8pt', color: TEXT, marginTop: 3, flexShrink: 0 }}>·</span>
          <p style={{ margin: 0, fontSize: '9.5pt', color: TEXT, lineHeight: 1.55 }}>{pt}</p>
        </div>
      ))}
    </TimelineEntry>
  )
}

/* ── Education entry ──────────────────────────────────────────────────────── */
function EduEntry({ degree, fieldStudy, institution, startYear, endYear,
                    cgpa, score, city, state }) {
  const degreeStr = [degree, fieldStudy].filter(Boolean).join(' in ') || 'Degree'
  const location  = [city, state].filter(Boolean).join(', ')
  const dateRange = [startYear, endYear].filter(Boolean).join(' - ')
  const grade     = cgpa || score

  return (
    <TimelineEntry dateTop={dateRange} locationStr={location}>
      <p style={{ margin: 0, fontSize: '12pt', fontWeight: 700, color: DARK, lineHeight: 1.3 }}>
        {degreeStr}
      </p>
      {institution && (
        <p style={{ margin: '2px 0 0', fontSize: '10.5pt', fontWeight: 700, color: GOLD }}>
          {institution}
        </p>
      )}
      {grade && (
        <p style={{ margin: '3px 0 0', fontSize: '9pt', color: LIGHT }}>CGPA: {grade}</p>
      )}
    </TimelineEntry>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════════════════ */
export default function Template17EnhancvTimeline() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const websites     = ctx.websites       || {}
  const summary      = ctx.summary        || ''
  const certs        = ctx.certifications || []
  const achievements = ctx.achievements   || []
  const langs        = (p.languages || [])
    .map(l => typeof l === 'string' ? l : l.language).filter(Boolean)

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''
  const location   = [p.city, p.state].filter(Boolean).join(', ')

  /* contact items */
  const contactItems = [
    p.phone              && { icon: '📞', text: p.phone },
    p.email              && { icon: '✉',  text: p.email },
    p.dob                && { icon: '🎂', text: `DOB: ${p.dob}` },
    websites.linkedin    && { icon: '🔗', text: websites.linkedin.replace(/https?:\/\/(www\.)?/,'') },
    websites.github      && { icon: '🐙', text: websites.github.replace(/https?:\/\/(www\.)?github\.com\//,'github.com/') },
    websites.portfolio   && { icon: '🌐', text: websites.portfolio.replace(/https?:\/\/(www\.)?/,'') },
  ].filter(Boolean)

  /* skill list */
  const skillRows = [
    skillsDet.programmingLanguages,
    skillsDet.frameworks,
    skillsDet.frontend,
    skillsDet.backend,
    skillsDet.databases,
    skillsDet.tools,
    skillsDet.other,
  ].filter(Boolean)

  const skillTagStr = skillRows.length
    ? skillRows.join(', ')
    : skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean).join(', ')

  /* ── demo data ─────────────────────────────────────────────────────────── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoName      = 'SOPHIE MARTIN'
  const demoProfession = 'Python Full Stack Developer | Web Applications | Backend Solutions'
  const demoContact   = [
    { icon: '📞', text: '+1-(234)-555-1234' },
    { icon: '✉',  text: 'help@enhancv.com'  },
    { icon: '🔗', text: 'linkedin.com'       },
  ]
  const demoLocation  = 'Dallas, Texas'
  const demoSummary   = 'Ambitious and technically adept Python Full Stack Developer with over 7 years of industry experience, specializing in React and Django development. My career is marked by a track record of building robust systems that enhance user interface and experience, achieving a 99.9% uptime for business-critical applications, and notably improving system efficiencies. Eager to develop SIGMA\'s next-generation assessment platform.'
  const demoSkills    = 'Python, Django, React, JSX, JavaScript, PostgreSQL'
  const demoExp = [
    {
      jobTitle: 'Senior Python Developer',
      employer: 'TechGlobe Solutions',
      city: 'Dallas', state: 'Texas',
      startDate: '2020-06', endDate: '', currentWork: true,
      points: [
        'Led the development of a scalable web application, increasing user capacity by 40% and significantly enhancing the customer experience.',
        'Collaborated with a cross-functional team to integrate machine learning algorithms, resulting in a 25% improvement in data processing efficiency.',
        'Pioneered the implementation of a new RESTful API, which streamlined data retrieval processes and bolstered overall system performance.',
        'Executed end-to-end software development lifecycle with precision, delivering stable releases and achieving a 99.9% uptime for critical applications.',
        'Wrote custom Python scripts for data manipulation that saved the company approximately 15 hours of manual work per week.',
        'Automated the testing process which improved the code coverage by 30%, enhancing the robustness of the application.',
      ],
    },
    {
      jobTitle: 'Full Stack Developer',
      employer: 'Innovative Web Solutions',
      city: 'Austin', state: 'Texas',
      startDate: '2018-03', endDate: '2020-05', currentWork: false,
      points: [
        'Created over 50 JSX components that were reusable and contributed to a 20% increase in development speed for future projects.',
        'Designed and implemented a database system in PostgreSQL that optimized storage and retrieval operations by 35%.',
        'Developed progressive web apps with React, enhancing mobile user engagement by more than 50%.',
        'Optimized existing backend code, leading to a reduction in server response time by an average of 150ms.',
        'Integrated third-party services using RESTful APIs, which expanded the platform\'s capabilities and enriched the user experience.',
      ],
    },
    {
      jobTitle: 'Python Developer',
      employer: 'Global DevNet',
      city: 'Fort Worth', state: 'Texas',
      startDate: '2015-10', endDate: '2018-02', currentWork: false,
      points: [
        'Developed a robust content management system using Django, which successfully managed the workflow for a team of 20+ content creators.',
        'Implemented a new scoring algorithm for educational assessments that increased the accuracy of results by 15%.',
        'Performed extensive code reviews to enforce coding standards and improve application\'s security and scalability.',
        'Assisted in transitioning the development environment to Azure resulting in a more consistent deployment process.',
      ],
    },
  ]
  const demoEdu = [
    {
      degree: "Master's Degree in Computer Science",
      institution: 'University of Texas at Austin',
      startYear: '01/2013', endYear: '01/2015',
      city: 'Austin', state: 'Texas',
    },
    {
      degree: "Bachelor's Degree in Computer Science",
      institution: 'Southern Methodist University',
      startYear: '01/2009', endYear: '01/2013',
      city: 'Dallas', state: 'Texas',
    },
  ]

  const displayName       = showDemo ? demoName       : (fullName.toUpperCase() || 'YOUR NAME')
  const displayProfession = showDemo ? demoProfession : profession
  const displayContact    = showDemo ? demoContact    : contactItems
  const displayLocation   = showDemo ? demoLocation   : location
  const displaySummary    = showDemo ? demoSummary    : summary
  const displaySkills     = showDemo ? demoSkills     : skillTagStr
  const displayExp        = showDemo ? demoExp        : experiences
  const displayEdu        = showDemo ? demoEdu        : education
  const displayCerts      = showDemo ? []             : certs
  const displayAchievements = showDemo ? []           : achievements
  const displayLangs      = showDemo ? []             : langs

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: '#fff',
      padding: '44px 50px 44px 44px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: TEXT,
    }}>

      {/* ════ HEADER ════════════════════════════════════════════════════════ */}

      {/* Name */}
      <h1 style={{
        margin: 0,
        fontSize: '26pt',
        fontWeight: 900,
        color: DARK,
        letterSpacing: '0.01em',
        lineHeight: 1.05,
      }}>
        {displayName}
      </h1>

      {/* Profession — gold bold */}
      {displayProfession && (
        <p style={{
          margin: '5px 0 8px',
          fontSize: '11pt',
          fontWeight: 700,
          color: GOLD,
          letterSpacing: '0.01em',
        }}>
          {displayProfession}
        </p>
      )}

      {/* Contact row */}
      {displayContact.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 18px', marginBottom: 4, fontSize: '9.5pt', color: TEXT }}>
          {displayContact.map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {displayLocation && (
        <p style={{ margin: '0 0 18px', fontSize: '9.5pt', color: TEXT }}>
          📍 {displayLocation}
        </p>
      )}

      {/* ════ SUMMARY ═══════════════════════════════════════════════════════ */}
      {displaySummary && (
        <section style={{ marginBottom: 22 }}>
          <SectionHead title="Summary" />
          <p style={{ margin: 0, fontSize: '9.5pt', color: TEXT, lineHeight: 1.65 }}>
            {displaySummary}
          </p>
        </section>
      )}

      {/* ════ SKILLS ════════════════════════════════════════════════════════ */}
      {displaySkills && (
        <section style={{ marginBottom: 22 }}>
          <SectionHead title="Skills" />
          <p style={{ margin: 0, fontSize: '9.5pt', color: TEXT, lineHeight: 1.6 }}>
            {displaySkills}
          </p>
        </section>
      )}

      {/* ════ EXPERIENCE ════════════════════════════════════════════════════ */}
      {displayExp.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <SectionHead title="Experience" />
          {displayExp.map((exp, i) => (
            <ExpEntry key={i} {...exp} />
          ))}
        </section>
      )}

      {/* ════ EDUCATION ═════════════════════════════════════════════════════ */}
      {displayEdu.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <SectionHead title="Education" />
          {displayEdu.map((edu, i) => (
            <EduEntry key={i} {...edu} />
          ))}
        </section>
      )}

      {/* ════ CERTIFICATIONS ════════════════════════════════════════════════ */}
      {displayCerts.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <SectionHead title="Certifications" />
          {displayCerts.map((c, i) => {
            const text = typeof c === 'string'
              ? c
              : `${c.name || ''}${c.issuer ? ' – ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`
            return (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <span style={{ color: TEXT, flexShrink: 0 }}>·</span>
                <p style={{ margin: 0, fontSize: '9.5pt', color: TEXT, lineHeight: 1.55 }}>{text}</p>
              </div>
            )
          })}
        </section>
      )}

      {/* ════ ACHIEVEMENTS ══════════════════════════════════════════════════ */}
      {displayAchievements.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <SectionHead title="Achievements" />
          {displayAchievements.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <span style={{ color: TEXT, flexShrink: 0 }}>·</span>
              <p style={{ margin: 0, fontSize: '9.5pt', color: TEXT, lineHeight: 1.55 }}>
                {typeof a === 'string' ? a : a.text}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* ════ LANGUAGES ═════════════════════════════════════════════════════ */}
      {displayLangs.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <SectionHead title="Languages" />
          <p style={{ margin: 0, fontSize: '9.5pt', color: TEXT, lineHeight: 1.6 }}>
            {displayLangs.join(' · ')}
          </p>
        </section>
      )}

      {/* ════ FOOTER ════════════════════════════════════════════════════════ */}
      <div style={{
        marginTop: 28,
        borderTop: '1px solid #e5e7eb',
        paddingTop: 8,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '7.5pt',
        color: '#aaa',
      }}>
        <span>www.enhancv.com</span>
        <span>Powered by Enhancv</span>
      </div>

    </div>
  )
}
