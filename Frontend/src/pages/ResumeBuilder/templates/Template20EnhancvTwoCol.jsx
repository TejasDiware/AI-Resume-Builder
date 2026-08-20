/**
 * Template 20 — Enhancv Two-Column (Sophie Martin style)
 *
 * Layout (matches second image exactly):
 *
 *   Left column (~240px):
 *     SOPHIE MARTIN   ← large dark bold
 *     Python Full Stack… ← blue subtitle
 *     📞 phone  ✉ email  🔗 linkedin  📍 city
 *     ─────────────────────────────────
 *     SUMMARY
 *       paragraph
 *     PROJECTS
 *       Blue title
 *       description + link
 *     KEY ACHIEVEMENTS
 *       [icon] Blue title
 *       description
 *
 *   Right column (~490px):
 *     EXPERIENCE  ← blue spaced heading + rule
 *       Job Title  ← dark bold large
 *       Company    ← blue bold
 *       📅 date  📍 location  (on same line, gray)
 *       · bullet
 *     SKILLS
 *       comma-separated
 *     EDUCATION
 *       Degree dark bold
 *       Institution blue
 *       📅 date  📍 location
 *
 *   Footer: www.enhancv.com  Powered by Enhancv
 *
 * Accent: #2563eb (blue)
 */

import { useResume } from '../../../context/ResumeContext'

const BLUE   = '#1a6bb3'
const DARK   = '#111827'
const MID    = '#374151'
const META   = '#6b7280'
const RULE   = '#d1d9e6'

/* ── helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) return `${String(m[2]).padStart(2,'0')}/${m[1]}`
  return val
}

/* ── Right column section heading (blue + rule) ───────────────────────────── */
function RightHead({ title }) {
  return (
    <div style={{ marginBottom: 12, marginTop: 18 }}>
      <p style={{
        margin: '0 0 4px',
        fontSize: '9.5pt',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: BLUE,
      }}>
        {title}
      </p>
      <div style={{ height: 1, background: RULE }} />
    </div>
  )
}

/* ── Left column section heading (gray spaced caps + rule) ───────────────── */
function LeftHead({ title }) {
  return (
    <div style={{ marginBottom: 8, marginTop: 16 }}>
      <p style={{
        margin: '0 0 4px',
        fontSize: '8.5pt',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: META,
      }}>
        {title}
      </p>
      <div style={{ height: 1, background: RULE }} />
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
  const dateStr  = [start, end].filter(Boolean).join(' - ')

  const bullets = points?.length
    ? points
    : description ? [description] : []

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Job title */}
      <p style={{ margin: 0, fontSize: '12pt', fontWeight: 700, color: DARK, lineHeight: 1.25 }}>
        {jobTitle || 'Job Title'}
      </p>
      {/* Company — blue */}
      {company && (
        <p style={{ margin: '1px 0 2px', fontSize: '10pt', fontWeight: 700, color: BLUE }}>
          {company}
        </p>
      )}
      {/* Date + location meta row */}
      {(dateStr || location) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 5, fontSize: '8.5pt', color: META }}>
          {dateStr  && <span>📅 {dateStr}</span>}
          {location && <span>📍 {location}</span>}
        </div>
      )}
      {/* Bullets */}
      {bullets.map((pt, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: '8pt', color: META, marginTop: 3, flexShrink: 0 }}>·</span>
          <p style={{ margin: 0, fontSize: '9pt', color: MID, lineHeight: 1.55 }}>{pt}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Education entry ──────────────────────────────────────────────────────── */
function EduEntry({ degree, fieldStudy, institution, startYear, endYear,
                    cgpa, score, city, state }) {
  const degreeStr = degree || fieldStudy || 'Degree'
  const school    = institution || ''
  const location  = [city, state].filter(Boolean).join(', ')
  const dateStr   = [startYear, endYear].filter(Boolean).join(' - ')
  const grade     = cgpa || score

  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ margin: 0, fontSize: '12pt', fontWeight: 700, color: DARK, lineHeight: 1.25 }}>
        {degreeStr}
      </p>
      {school && (
        <p style={{ margin: '1px 0 2px', fontSize: '10pt', fontWeight: 700, color: BLUE }}>
          {school}
        </p>
      )}
      {(dateStr || location) && (
        <div style={{ display: 'flex', gap: 12, fontSize: '8.5pt', color: META }}>
          {dateStr  && <span>📅 {dateStr}</span>}
          {location && <span>📍 {location}</span>}
        </div>
      )}
      {grade && (
        <p style={{ margin: '2px 0 0', fontSize: '8.5pt', color: META }}>CGPA: {grade}</p>
      )}
    </div>
  )
}

/* ── Project entry ────────────────────────────────────────────────────────── */
function ProjectEntry({ name, title, description, link, techStack, technologies }) {
  const pName = name || title || 'Project'
  const tech  = Array.isArray(techStack)
    ? techStack.join(', ')
    : (techStack || technologies || '')
  const url   = link || ''

  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: '0 0 3px', fontSize: '10pt', fontWeight: 700, color: BLUE }}>
        {pName}
      </p>
      {tech && (
        <p style={{ margin: '0 0 2px', fontSize: '8.5pt', color: META, fontStyle: 'italic' }}>
          {tech}
        </p>
      )}
      {description && (
        <p style={{ margin: '0 0 2px', fontSize: '8.5pt', color: MID, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {url && (
        <p style={{ margin: 0, fontSize: '8pt', color: BLUE, wordBreak: 'break-all' }}>
          {url.replace(/^https?:\/\//, '')}
        </p>
      )}
    </div>
  )
}

/* ── Achievement entry ────────────────────────────────────────────────────── */
const ICONS = ['💙', '✅', '⭐', '✔️', '🔹']
function AchievementEntry({ text, index }) {
  const parts = typeof text === 'string'
    ? { title: text, desc: '' }
    : { title: text.title || text.text || '', desc: text.description || text.desc || '' }

  // Split "Title\nDescription" pattern if single string contains newline
  const lines   = parts.title.split('\n')
  const mainTitle = lines[0]
  const subDesc   = lines.slice(1).join(' ') || parts.desc

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: '14pt', flexShrink: 0, marginTop: 1 }}>{ICONS[index % ICONS.length]}</span>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '9.5pt', fontWeight: 700, color: BLUE }}>
          {mainTitle}
        </p>
        {subDesc && (
          <p style={{ margin: 0, fontSize: '8.5pt', color: MID, lineHeight: 1.5 }}>
            {subDesc}
          </p>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════════════════ */
export default function Template20EnhancvTwoCol() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const websites     = ctx.websites       || {}
  const summary      = ctx.summary        || ''
  const projects     = ctx.projects       || []
  const achievements = ctx.achievements   || []

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''
  const location   = [p.city, p.state].filter(Boolean).join(', ')

  const contactItems = [
    p.phone           && { icon: '📞', text: p.phone },
    p.email           && { icon: '✉',  text: p.email },
    p.dob             && { icon: '🎂', text: `DOB: ${p.dob}` },
    websites.linkedin && { icon: '🔗', text: websites.linkedin.replace(/https?:\/\/(www\.)?/,'') },
    websites.github   && { icon: '🐙', text: websites.github.replace(/https?:\/\/(www\.)?github\.com\//,'github.com/') },
    location          && { icon: '📍', text: location },
  ].filter(Boolean)

  const skillRows = [
    skillsDet.programmingLanguages,
    skillsDet.frameworks, skillsDet.frontend, skillsDet.backend,
    skillsDet.databases, skillsDet.tools, skillsDet.other,
  ].filter(Boolean)
  const skillStr = skillRows.length
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
    { icon: '📍', text: 'Dallas, Texas'      },
  ]
  const demoSummary = 'Ambitious and technically adept Python Full Stack Developer with over 7 years of industry experience, specializing in React and Django development. My career is marked by a track record of building robust systems that enhance user interface and experience, achieving a 99.9% uptime for business-critical applications, and notably improving system efficiencies. Eager to develop SIGMA\'s next-generation assessment platform.'
  const demoProjects = [
    {
      name: 'Open Source Progressive Web App',
      description: 'Contributed to an open-source PWA to enhance offline functionality, available at',
      link: 'github.com/SophieMartin/PWA_Project',
    },
    {
      name: 'Custom Django REST Framework',
      description: 'Developed an extension for Django REST framework to simplify API development, view at',
      link: 'github.com/SophieMartin/Custom_Django_REST',
    },
  ]
  const demoAchievements = [
    { title: 'Developed an Educational Scoring Algorithm',    description: 'Successfully created and implemented a complex scoring algorithm that improved the educational platform\'s accuracy by 15%.' },
    { title: 'Optimized Database System',                     description: 'Led the database optimization project with PostgreSQL, resulting in a 35% performance boost.' },
    { title: 'Enhanced Progressive Web App User Engagement',  description: 'My contributions to a progressive web app project led to a 50% increase in mobile user engagement.' },
    { title: 'Data Manipulation Script Creation',             description: 'Crafted a Python script for data manipulation saving the company 15 hours of manual work weekly.' },
  ]
  const demoExp = [
    {
      jobTitle: 'Senior Python Developer', employer: 'TechGlobe Solutions',
      city: 'Dallas', state: 'Texas', startDate: '2020-06', endDate: '', currentWork: true,
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
      jobTitle: 'Full Stack Developer', employer: 'Innovative Web Solutions',
      city: 'Austin', state: 'Texas', startDate: '2018-03', endDate: '2020-05',
      points: [
        'Created over 50 JSX components that were reusable and contributed to a 20% increase in development speed for future projects.',
        'Designed and implemented a database system in PostgreSQL that optimized storage and retrieval operations by 35%.',
        'Developed progressive web apps with React, enhancing mobile user engagement by more than 50%.',
        'Optimized existing backend code, leading to a reduction in server response time by an average of 150ms.',
        'Integrated third-party services using RESTful APIs, which expanded the platform\'s capabilities and enriched the user experience.',
      ],
    },
    {
      jobTitle: 'Python Developer', employer: 'Global DevNet',
      city: 'Fort Worth', state: 'Texas', startDate: '2015-10', endDate: '2018-02',
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
  const demoSkills = 'Python, Django, React, JSX, JavaScript, PostgreSQL'

  const displayName        = showDemo ? demoName        : (fullName || 'Your Name')
  const displayProfession  = showDemo ? demoProfession  : profession
  const displayContact     = showDemo ? demoContact     : contactItems
  const displaySummary     = showDemo ? demoSummary     : summary
  const displayProjects    = showDemo ? demoProjects    : projects
  const displayAchievements = showDemo ? demoAchievements : achievements
  const displayExp         = showDemo ? demoExp         : experiences
  const displayEdu         = showDemo ? demoEdu         : education
  const displaySkills      = showDemo ? demoSkills      : skillStr

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: DARK,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', flex: 1 }}>

        {/* ════ LEFT COLUMN ════════════════════════════════════════════════ */}
        <div style={{
          width: 242,
          minWidth: 242,
          flexShrink: 0,
          padding: '28px 14px 28px 22px',
          borderRight: '1px solid #e5e7eb',
          boxSizing: 'border-box',
        }}>
          {/* Name */}
          <h1 style={{
            margin: '0 0 3px',
            fontSize: '17pt',
            fontWeight: 900,
            color: DARK,
            lineHeight: 1.1,
            letterSpacing: '0.01em',
          }}>
            {displayName}
          </h1>

          {/* Profession — blue */}
          {displayProfession && (
            <p style={{
              margin: '0 0 8px',
              fontSize: '9pt',
              fontWeight: 600,
              color: BLUE,
              lineHeight: 1.4,
            }}>
              {displayProfession}
            </p>
          )}

          {/* Contact row */}
          {displayContact.length > 0 && (
            <div style={{ marginBottom: 10, fontSize: '8.5pt', color: MID }}>
              {displayContact.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 2, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ lineHeight: 1.4, wordBreak: 'break-all' }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* SUMMARY */}
          {displaySummary && (
            <>
              <LeftHead title="Summary" />
              <p style={{ margin: '0 0 4px', fontSize: '8.5pt', color: MID, lineHeight: 1.6 }}>
                {displaySummary}
              </p>
            </>
          )}

          {/* PROJECTS */}
          {displayProjects.length > 0 && (
            <>
              <LeftHead title="Projects" />
              {displayProjects.map((proj, i) => (
                <ProjectEntry key={i} {...proj} />
              ))}
            </>
          )}

          {/* KEY ACHIEVEMENTS */}
          {displayAchievements.length > 0 && (
            <>
              <LeftHead title="Key Achievements" />
              {displayAchievements.map((a, i) => (
                <AchievementEntry key={i} text={a} index={i} />
              ))}
            </>
          )}
        </div>

        {/* ════ RIGHT COLUMN ═══════════════════════════════════════════════ */}
        <div style={{
          flex: 1,
          padding: '28px 24px 28px 20px',
          boxSizing: 'border-box',
        }}>

          {/* EXPERIENCE */}
          {displayExp.length > 0 && (
            <section style={{ marginBottom: 8 }}>
              <RightHead title="Experience" />
              {displayExp.map((exp, i) => (
                <ExpEntry key={i} {...exp} />
              ))}
            </section>
          )}

          {/* SKILLS */}
          {displaySkills && (
            <section style={{ marginBottom: 8 }}>
              <RightHead title="Skills" />
              <p style={{ margin: '0 0 4px', fontSize: '9.5pt', color: MID, lineHeight: 1.6 }}>
                {displaySkills}
              </p>
            </section>
          )}

          {/* EDUCATION */}
          {displayEdu.length > 0 && (
            <section style={{ marginBottom: 8 }}>
              <RightHead title="Education" />
              {displayEdu.map((edu, i) => (
                <EduEntry key={i} {...edu} />
              ))}
            </section>
          )}
        </div>
      </div>

      {/* ════ FOOTER ═════════════════════════════════════════════════════════ */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        padding: '7px 22px',
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
