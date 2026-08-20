import { useResume } from '../../../context/ResumeContext'

const NAVY   = '#1a2e4a'
const BLUE   = '#1a6bb3'
const WHITE  = '#ffffff'
const DARK   = '#111827'
const MID    = '#374151'
const META   = '#6b7280'
const RULE   = '#d1d5db'

/* ── helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) return `${String(m[2]).padStart(2,'0')}/${m[1]}`
  return val
}

/* ── Sidebar section heading ──────────────────────────────────────────────── */
function SideHead({ title }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 18 }}>
      <p style={{
        margin: '0 0 5px', fontSize: '10pt', fontWeight: 700,
        letterSpacing: '0.08em', color: WHITE, textTransform: 'uppercase',
      }}>{title}</p>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.25)' }} />
    </div>
  )
}

/* ── Right section heading ────────────────────────────────────────────────── */
function RightHead({ title }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 20 }}>
      <p style={{
        margin: '0 0 5px', fontSize: '11pt', fontWeight: 800,
        color: DARK, letterSpacing: '0.02em',
      }}>{title}</p>
      <div style={{ height: 1.5, background: RULE }} />
    </div>
  )
}

/* ── Sidebar personal-info row ────────────────────────────────────────────── */
function SideInfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 9 }}>
      <p style={{
        margin: 0, fontSize: '7pt', fontWeight: 700,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.55)',
      }}>
        {label}
      </p>
      <p style={{ margin: '1px 0 0', fontSize: '9pt', color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, wordBreak: 'break-word' }}>
        {value}
      </p>
    </div>
  )
}

/* ── Language row ─────────────────────────────────────────────────────────── */
function LangRow({ name, level }) {
  if (!name) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.9)' }}>{name}</span>
      {level && <span style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.6)' }}>{level}</span>}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{ margin: 0, fontSize: '11pt', fontWeight: 700, color: DARK }}>{jobTitle || 'Job Title'}</p>
        {dateStr && <p style={{ margin: 0, fontSize: '8.5pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>{dateStr}</p>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        {company && <p style={{ margin: '1px 0 0', fontSize: '9.5pt', fontWeight: 700, color: BLUE }}>{company}</p>}
        {location && <p style={{ margin: '1px 0 0', fontSize: '8.5pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>{location}</p>}
      </div>
      {bullets.map((pt, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: '8pt', color: META, marginTop: 3, flexShrink: 0 }}>•</span>
          <p style={{ margin: 0, fontSize: '9pt', color: MID, lineHeight: 1.55 }}>{pt}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Education entry ──────────────────────────────────────────────────────── */
function EduEntry({ degree, fieldStudy, institution, startYear, endYear, cgpa, score, city, state }) {
  const degreeStr = degree || fieldStudy || 'Degree'
  const school    = institution || ''
  const location  = [city, state].filter(Boolean).join(', ')
  const dateStr   = [startYear, endYear].filter(Boolean).join(' - ')
  const grade     = cgpa || score

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{ margin: 0, fontSize: '11pt', fontWeight: 700, color: DARK }}>{degreeStr}</p>
        {dateStr && <p style={{ margin: 0, fontSize: '8.5pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>{dateStr}</p>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        {school && <p style={{ margin: '1px 0 0', fontSize: '9.5pt', fontWeight: 700, color: BLUE }}>{school}</p>}
        {location && <p style={{ margin: '1px 0 0', fontSize: '8.5pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>{location}</p>}
      </div>
      {grade && <p style={{ margin: '2px 0 0', fontSize: '8.5pt', color: META }}>CGPA: {grade}</p>}
    </div>
  )
}

/* ── Project entry (sidebar) ──────────────────────────────────────────────── */
function ProjectEntry({ name, description, link }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ margin: '0 0 3px', fontSize: '9.5pt', fontWeight: 700, color: WHITE, lineHeight: 1.4 }}>
        {name}
      </p>
      {description && (
        <p style={{ margin: '0 0 2px', fontSize: '8.5pt', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {link && (
        <p style={{ margin: 0, fontSize: '8pt', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all' }}>
          {link.replace(/^https?:\/\//, '')}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Template22EnhancvDarkSidebar() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const websites     = ctx.websites       || {}
  const summary      = ctx.summary        || ''
  const projects     = ctx.projects       || []
  const languages    = p.languages || ctx.languages || []

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''
  const location   = [p.city, p.state].filter(Boolean).join(', ')

  /* personal info (structured) */
  const personal = {
    email:    p.email || '',
    phone:    p.phone || '',
    location: location,
    dob:      p.dob || p.dateOfBirth || '',
    website:  p.website || websites.portfolio || '',
    linkedin: websites.linkedin || p.linkedin || '',
  }

  const skillRows = [
    skillsDet.programmingLanguages, skillsDet.frameworks, skillsDet.frontend,
    skillsDet.backend, skillsDet.databases, skillsDet.tools, skillsDet.other,
  ].filter(Boolean)
  const skillStr = skillRows.length
    ? skillRows.join(', ')
    : skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean).join(', ')

  const languageList = languages.map(l =>
    typeof l === 'string' ? { name: l, level: '' } : { name: l.name || l.language || '', level: l.level || l.proficiency || '' }
  ).filter(l => l.name)

  /* ── demo data ── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoFirstName = 'SOPHIE'
  const demoLastName  = 'MARTIN'
  const demoProfession = 'Python Full Stack Developer | Web Applications | Backend Solutions'
  const demoPersonal = {
    email: 'help@enhancv.com',
    phone: '+1-(234)-555-1234',
    location: 'Dallas, Texas',
    dob: '9 May 1991',
    website: 'www.sophiemartin.dev',
    linkedin: 'linkedin.com/in/sophiemartin',
  }
  const demoProjects = [
    { name: 'Open Source Progressive Web App',
      description: 'Contributed to an open-source PWA to enhance offline functionality, available at',
      link: 'github.com/SophieMartin/PWA_Project' },
    { name: 'Custom Django REST Framework',
      description: 'Developed an extension for Django REST framework to simplify API development, view at',
      link: 'github.com/SophieMartin/Custom_Django_REST' },
  ]
  const demoLanguages = [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Fluent' },
    { name: 'German', level: 'Conversational' },
  ]
  const demoSkills = 'Python, Django, React, JSX, JavaScript, PostgreSQL'
  const demoSummary = 'Ambitious and technically adept Python Full Stack Developer with over 7 years of industry experience, specializing in React and Django development. My career is marked by a track record of building robust systems that enhance user interface and experience, achieving a 99.9% uptime for business-critical applications, and notably improving system efficiencies. Eager to develop SIGMA\'s next-generation assessment platform.'
  const demoExp = [
    { jobTitle: 'Senior Python Developer', employer: 'TechGlobe Solutions',
      city: 'Dallas', state: 'Texas', startDate: '2020-06', endDate: '', currentWork: true,
      points: [
        'Led the development of a scalable web application, increasing user capacity by 40% and significantly enhancing the customer experience.',
        'Collaborated with a cross-functional team to integrate machine learning algorithms, resulting in a 25% improvement in data processing efficiency.',
        'Pioneered the implementation of a new RESTful API, which streamlined data retrieval processes and bolstered overall system performance.',
        'Executed end-to-end software development lifecycle with precision, delivering stable releases and achieving a 99.9% uptime for critical applications.',
        'Wrote custom Python scripts for data manipulation that saved the company approximately 15 hours of manual work per week.',
        'Automated the testing process which improved the code coverage by 30%, enhancing the robustness of the application.',
      ] },
    { jobTitle: 'Full Stack Developer', employer: 'Innovative Web Solutions',
      city: 'Austin', state: 'Texas', startDate: '2018-03', endDate: '2020-05',
      points: [
        'Created over 50 JSX components that were reusable and contributed to a 20% increase in development speed for future projects.',
        'Designed and implemented a database system in PostgreSQL that optimized storage and retrieval operations by 35%.',
        'Developed progressive web apps with React, enhancing mobile user engagement by more than 50%.',
        'Optimized existing backend code, leading to a reduction in server response time by an average of 150ms.',
        'Integrated third-party services using RESTful APIs, which expanded the platform\'s capabilities and enriched the user experience.',
      ] },
    { jobTitle: 'Python Developer', employer: 'Global DevNet',
      city: 'Fort Worth', state: 'Texas', startDate: '2015-10', endDate: '2018-02',
      points: [
        'Developed a robust content management system using Django, which successfully managed the workflow for a team of 20+ content creators.',
        'Implemented a new scoring algorithm for educational assessments that increased the accuracy of results by 15%.',
        'Performed extensive code reviews to enforce coding standards and improve application\'s security and scalability.',
        'Assisted in transitioning the development environment to Azure resulting in a more consistent deployment process.',
      ] },
  ]
  const demoEdu = [
    { degree: "Master's Degree in Computer Science",  institution: 'University of Texas at Austin',
      startYear: '01/2013', endYear: '01/2015', city: 'Austin', state: 'Texas' },
    { degree: "Bachelor's Degree in Computer Science", institution: 'Southern Methodist University',
      startYear: '01/2009', endYear: '01/2013', city: 'Dallas', state: 'Texas' },
  ]

  /* display values */
  const [dFirst, dLast]    = showDemo
    ? [demoFirstName, demoLastName]
    : [p.firstName || '', [p.middleName, p.lastName].filter(Boolean).join(' ')]
  const displayPersonal    = showDemo ? demoPersonal    : personal
  const displayProfession  = showDemo ? demoProfession  : profession
  const displayProjects    = showDemo ? demoProjects    : projects
  const displaySkills      = showDemo ? demoSkills      : skillStr
  const displayLanguages   = showDemo ? demoLanguages   : languageList
  const displaySummary     = showDemo ? demoSummary     : summary
  const displayExp         = showDemo ? demoExp         : experiences
  const displayEdu         = showDemo ? demoEdu         : education

  return (
    <div style={{
      width: 794, minHeight: 1123,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: DARK, boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ display: 'flex', flex: 1 }}>

        {/* ════ LEFT SIDEBAR ══════════════════════════════════════════════ */}
        <div style={{
          width: 230, minWidth: 230, flexShrink: 0,
          background: NAVY,
          padding: '28px 16px 28px 20px',
          boxSizing: 'border-box',
        }}>
          {/* Name — stacked large */}
          <p style={{ margin: '0 0 2px', fontSize: '22pt', fontWeight: 900,
            color: WHITE, lineHeight: 1.05, letterSpacing: '0.02em' }}>
            {dFirst || 'FIRST'}
          </p>
          <p style={{ margin: '0 0 18px', fontSize: '22pt', fontWeight: 900,
            color: WHITE, lineHeight: 1.05, letterSpacing: '0.02em' }}>
            {dLast || 'LAST'}
          </p>

          {/* PERSONAL INFO */}
          <SideHead title="Personal Info" />
          <SideInfoRow label="Email"    value={displayPersonal.email} />
          <SideInfoRow label="Phone"    value={displayPersonal.phone} />
          <SideInfoRow label="Location" value={displayPersonal.location} />
          <SideInfoRow label="DOB"      value={displayPersonal.dob} />
          <SideInfoRow label="Website"  value={displayPersonal.website} />
          <SideInfoRow label="LinkedIn" value={displayPersonal.linkedin} />

          {/* SKILLS */}
          {displaySkills && (
            <>
              <SideHead title="Skills" />
              <p style={{ margin: 0, fontSize: '9pt',
                color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                {displaySkills}
              </p>
            </>
          )}

          {/* LANGUAGES */}
          {displayLanguages.length > 0 && (
            <>
              <SideHead title="Languages" />
              {displayLanguages.map((l, i) => (
                <LangRow key={i} name={l.name} level={l.level} />
              ))}
            </>
          )}

          {/* PROJECTS */}
          {displayProjects.length > 0 && (
            <>
              <SideHead title="Projects" />
              {displayProjects.map((proj, i) => (
                <ProjectEntry key={i}
                  name={proj.name || proj.title || 'Project'}
                  description={proj.description}
                  link={proj.link || proj.url || ''}
                />
              ))}
            </>
          )}
        </div>

        {/* ════ RIGHT MAIN ════════════════════════════════════════════════ */}
        <div style={{
          flex: 1, padding: '28px 24px 28px 20px',
          boxSizing: 'border-box',
        }}>

          {/* Profession — blue bold */}
          {displayProfession && (
            <p style={{
              margin: '0 0 6px', fontSize: '10.5pt', fontWeight: 700,
              color: BLUE, lineHeight: 1.35,
            }}>
              {displayProfession}
            </p>
          )}

          <div style={{ height: 1, background: RULE, marginBottom: 4 }} />

          {/* SUMMARY */}
          {displaySummary && (
            <>
              <RightHead title="Professional Summary" />
              <p style={{ margin: '0 0 4px', fontSize: '9.5pt', color: MID, lineHeight: 1.65 }}>
                {displaySummary}
              </p>
            </>
          )}

          {/* EXPERIENCE */}
          {displayExp.length > 0 && (
            <>
              <RightHead title="Work Experience" />
              {displayExp.map((exp, i) => <ExpEntry key={i} {...exp} />)}
            </>
          )}

          {/* EDUCATION */}
          {displayEdu.length > 0 && (
            <>
              <RightHead title="Education" />
              {displayEdu.map((edu, i) => <EduEntry key={i} {...edu} />)}
            </>
          )}
        </div>
      </div>

      {/* ════ FOOTER ════════════════════════════════════════════════════════ */}
      <div style={{
        borderTop: '1px solid #e5e7eb', padding: '7px 22px',
        display: 'flex', justifyContent: 'space-between',
        fontSize: '7.5pt', color: '#aaa',
      }}>
        <span>Powered by Enhancv</span>
        <span>www.enhancv.com</span>
      </div>
    </div>
  )
}