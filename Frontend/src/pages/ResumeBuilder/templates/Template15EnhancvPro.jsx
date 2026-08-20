/**
 * Template 15 — Enhancv Professional (Single Column)
 *
 * Layout (matches the Sophie Martin / Enhancv style):
 *   FULL NAME                          ← large bold black
 *   Blue subtitle (profession)         ← bold blue
 *   📞 phone  ✉ email  🔗 linkedin     ← icon-style contact row
 *   📍 city, state
 *   ──────────────────────────────────
 *   SUMMARY
 *   SKILLS
 *   EXPERIENCE
 *   EDUCATION
 *   PROJECTS
 *   CERTIFICATIONS / ACHIEVEMENTS
 */

import { useResume } from '../../../context/ResumeContext'

const BLUE   = '#1565c0'   // accent – name subtitle, company names, school names
const BLACK  = '#111111'
const RULE   = '#c8c8c8'

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (!m) return val
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m[2])-1]} ${m[1]}`
}

/* ── Section heading: BOLD CAPS + full-width rule ────────────────────────── */
function SectionHead({ title }) {
  return (
    <div style={{ marginTop: 18, marginBottom: 8 }}>
      <p style={{
        margin: 0,
        fontSize: '12.5pt',
        fontWeight: 800,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: BLACK,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        {title}
      </p>
      <div style={{ height: 2, background: BLACK, marginTop: 3 }} />
    </div>
  )
}

/* ── Bullet point ────────────────────────────────────────────────────────── */
function Bullet({ text }) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', gap: 7, marginBottom: 3 }}>
      <span style={{ fontSize: '10.5pt', marginTop: 1, color: '#444', flexShrink: 0 }}>•</span>
      <span style={{ fontSize: '10.5pt', color: '#333', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

/* ── Experience entry ────────────────────────────────────────────────────── */
function ExpEntry({ jobTitle, employer, employerOther, city, state, startDate, endDate, currentWork, description, points }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'Present' : fmtDate(endDate)
  const dates    = [start, end].filter(Boolean).join(' – ')

  const bullets = points?.length
    ? points
    : description
      ? [description]
      : []

  return (
    <div style={{ marginBottom: 16 }}>
      {/* company name  |  location */}
      <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, color: BLUE }}>
        {company || 'Company Name'}
        {location && <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>| {location}</span>}
      </p>
      {/* job title  |  dates */}
      <p style={{ margin: '2px 0 4px', fontSize: '13pt', fontWeight: 600, color: BLACK }}>
        {jobTitle || 'Job Title'}
        {dates && <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>| {dates}</span>}
      </p>
      {bullets.slice(0, 3).map((pt, i) => <Bullet key={i} text={pt} />)}
    </div>
  )
}

/* ── Education entry ─────────────────────────────────────────────────────── */
function EduEntry({ degree, fieldStudy, institution, startYear, endYear, cgpa, score, city }) {
  const dates = [startYear, endYear].filter(Boolean).join(' – ')
  const cgpaVal = cgpa || score
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, color: BLUE }}>
          {institution || 'College / University'}{city ? ` – ${city}` : ''}
        </p>
        <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, color: BLACK, whiteSpace: 'nowrap' }}>
          {dates || 'Passing Year'}
        </p>
      </div>
      <p style={{ margin: '2px 0 0', fontSize: '11pt', fontWeight: 400, fontStyle: 'italic', color: '#525a62' }}>
        {degree || fieldStudy || 'Degree'}
        {cgpaVal ? ` | CGPA: ${cgpaVal}` : ''}
      </p>
    </div>
  )
}

/* ── Project entry ───────────────────────────────────────────────────────── */
function ProjectEntry({ name, title, techStack, technologies, description, highlights, points, startDate, endDate, ongoing }) {
  const projectName = name || title || 'Project'
  const tech = Array.isArray(techStack) ? techStack.join(', ') : (techStack || technologies || '')
  const bullets = points?.length
    ? points
    : [description, highlights].filter(Boolean)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <p style={{ margin: 0, fontSize: '13pt', fontWeight: 600, color: BLACK }}>{projectName}</p>
        <p style={{ margin: 0, fontSize: '9.75pt', color: '#6b7280', whiteSpace: 'nowrap' }}>
          {startDate && `${fmtDate(startDate)} – ${ongoing ? 'Present' : fmtDate(endDate)}`}
        </p>
      </div>
      {tech && (
        <p style={{ margin: '2px 0 4px', fontSize: '10pt', fontWeight: 500, color: '#525a62' }}>
          Technologies: {tech}
        </p>
      )}
      {bullets.map((b, i) => <Bullet key={i} text={b} />)}
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function Template15EnhancvPro() {
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
  const langs        = (p.languages || []).map(l => typeof l === 'string' ? l : l.language).filter(Boolean)

  const fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''

  /* contact icons */
  const contactItems = [
    p.phone    && { icon: '📞', text: p.phone },
    p.email    && { icon: '✉',  text: p.email },
    p.dob      && { icon: '🎂', text: `DOB: ${p.dob}` },
    websites.linkedin && { icon: '🔗', text: websites.linkedin.replace(/https?:\/\/(www\.)?/, '') },
    websites.github   && { icon: '🐙', text: websites.github.replace(/https?:\/\/(www\.)?github\.com\//, 'github.com/') },
  ].filter(Boolean)

  const locationStr = [p.city, p.state].filter(Boolean).join(', ')

  /* skill rows */
  const skillRows = [
    { label: 'Languages',   value: skillsDet.programmingLanguages },
    { label: 'Frameworks',  value: skillsDet.frameworks },
    { label: 'Frontend',    value: skillsDet.frontend },
    { label: 'Backend',     value: skillsDet.backend },
    { label: 'Databases',   value: skillsDet.databases },
    { label: 'Tools',       value: skillsDet.tools },
    { label: 'Other',       value: skillsDet.other },
  ].filter(r => r.value?.trim())

  /* ── demo data (shown when context is empty) ──────────────────────────── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoName      = 'Sophie Martin'
  const demoProfession = 'Python Full Stack Developer | Web Applications | Backend Solutions'
  const demoContact   = [
    { icon: '📞', text: '+1-(234)-555-1234' },
    { icon: '✉',  text: 'help@enhancv.com' },
    { icon: '🔗', text: 'linkedin.com' },
  ]
  const demoLocation  = 'Dallas, Texas'
  const demoSummary   = 'Ambitious and technically adept Python Full Stack Developer with over 7 years of industry experience, specializing in React and Django development. My career is marked by a track record of building robust systems that enhance user interface and experience, achieving a 99.9% uptime for business-critical applications, and notably improving system efficiencies.'
  const demoSkills    = ['Python', 'Django', 'React', 'JSX', 'JavaScript', 'PostgreSQL']
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
      ],
    },
  ]
  const demoEdu = [
    { degree: "Master's Degree in Computer Science",   institution: 'University of Texas at Austin',  startYear: '01/2013', endYear: '01/2015' },
    { degree: "Bachelor's Degree in Computer Science", institution: 'Southern Methodist University',  startYear: '01/2009', endYear: '01/2013' },
  ]

  const displayName       = showDemo ? demoName       : (fullName || 'Your Name')
  const displayProfession = showDemo ? demoProfession : profession
  const displayContact    = showDemo ? demoContact    : contactItems
  const displayLocation   = showDemo ? demoLocation   : locationStr
  const displaySummary    = showDemo ? demoSummary    : summary
  const displaySkillTags  = showDemo ? demoSkills     : (skillRows.length ? [] : skills.map(s => s.name || s))
  const displaySkillRows  = showDemo ? []             : skillRows
  const displayExp        = showDemo ? demoExp        : experiences
  const displayEdu        = showDemo ? demoEdu        : education
  const displayProjects   = showDemo ? []             : projects
  const displayCerts      = showDemo ? []             : certs
  const displayAchievements = showDemo ? []           : achievements
  const displayLangs      = showDemo ? []             : langs

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: '#fff',
      padding: '44px 54px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: BLACK,
    }}>

      {/* ── NAME ──────────────────────────────────────────────────────────── */}
      <p style={{
        margin: 0,
        fontSize: '24pt',
        fontWeight: 900,
        letterSpacing: '0.02em',
        color: BLACK,
        lineHeight: 1.1,
      }}>
        {displayName.toUpperCase()}
      </p>

      {/* ── PROFESSION / SUBTITLE ─────────────────────────────────────────── */}
      {displayProfession && (
        <p style={{
          margin: '4px 0 10px',
          fontSize: '11.5pt',
          fontWeight: 700,
          color: BLUE,
          letterSpacing: '0.01em',
        }}>
          {displayProfession}
        </p>
      )}

      {/* ── CONTACT ROW ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', marginBottom: 4, fontSize: '9.5pt', color: '#333' }}>
        {displayContact.map((item, i) => (
          <span key={i}>{item.icon} {item.text}</span>
        ))}
      </div>

      {/* ── LOCATION ──────────────────────────────────────────────────────── */}
      {displayLocation && (
        <p style={{ margin: '0 0 10px', fontSize: '9.5pt', color: '#333' }}>
          📍 {displayLocation}
        </p>
      )}

      {/* ── TOP DIVIDER ───────────────────────────────────────────────────── */}
      <div style={{ height: 2, background: BLACK, marginBottom: 2 }} />
      <div style={{ height: 0.75, background: RULE, marginBottom: 4 }} />

      {/* ── SUMMARY ───────────────────────────────────────────────────────── */}
      {displaySummary && (
        <>
          <SectionHead title="Summary" />
          <p style={{ margin: '0 0 4px', fontSize: '10.5pt', color: '#333', lineHeight: 1.6 }}>
            {displaySummary}
          </p>
        </>
      )}

      {/* ── SKILLS ────────────────────────────────────────────────────────── */}
      {(displaySkillRows.length > 0 || displaySkillTags.length > 0) && (
        <>
          <SectionHead title="Skills" />
          {displaySkillRows.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: '10.5pt', fontWeight: 700, color: BLACK, minWidth: 130, flexShrink: 0 }}>
                {row.label}:
              </span>
              <span style={{ fontSize: '10.5pt', color: '#333' }}>{row.value}</span>
            </div>
          ))}
          {displaySkillTags.length > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: '10.5pt', color: '#333', lineHeight: 1.7 }}>
              {displaySkillTags.join(', ')}
            </p>
          )}
        </>
      )}

      {/* ── EXPERIENCE ────────────────────────────────────────────────────── */}
      {displayExp.length > 0 && (
        <>
          <SectionHead title="Experience" />
          {displayExp.map((exp, i) => <ExpEntry key={i} {...exp} />)}
        </>
      )}

      {/* ── EDUCATION ─────────────────────────────────────────────────────── */}
      {displayEdu.length > 0 && (
        <>
          <SectionHead title="Education" />
          {displayEdu.map((edu, i) => <EduEntry key={i} {...edu} />)}
        </>
      )}

      {/* ── PROJECTS ──────────────────────────────────────────────────────── */}
      {displayProjects.length > 0 && (
        <>
          <SectionHead title="Projects" />
          {displayProjects.map((proj, i) => (
            <ProjectEntry
              key={i}
              name={proj.name || proj.title}
              techStack={proj.techStack}
              technologies={proj.technologies}
              description={proj.description}
              highlights={proj.highlights}
              points={proj.points}
              startDate={proj.startDate}
              endDate={proj.endDate}
              ongoing={proj.ongoing}
            />
          ))}
        </>
      )}

      {/* ── CERTIFICATIONS ────────────────────────────────────────────────── */}
      {displayCerts.length > 0 && (
        <>
          <SectionHead title="Certifications" />
          {displayCerts.map((c, i) => (
            <Bullet key={i} text={typeof c === 'string' ? c : `${c.name}${c.issuer ? ` – ${c.issuer}` : ''}${c.year ? ` (${c.year})` : ''}`} />
          ))}
        </>
      )}

      {/* ── ACHIEVEMENTS ──────────────────────────────────────────────────── */}
      {displayAchievements.length > 0 && (
        <>
          <SectionHead title="Achievements" />
          {displayAchievements.map((a, i) => (
            <Bullet key={i} text={typeof a === 'string' ? a : a.text} />
          ))}
        </>
      )}

      {/* ── LANGUAGES ─────────────────────────────────────────────────────── */}
      {displayLangs.length > 0 && (
        <>
          <SectionHead title="Languages" />
          <p style={{ margin: '2px 0 0', fontSize: '10.5pt', color: '#333', lineHeight: 1.7 }}>
            {displayLangs.join(' • ')}
          </p>
        </>
      )}

    </div>
  )
}
