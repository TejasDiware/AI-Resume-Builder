

import { useResume } from '../../../context/ResumeContext'

const NAVY   = '#1a2e4a'
const WHITE  = '#ffffff'
const DARK   = '#111827'
const MID    = '#374151'
const META   = '#6b7280'
const RULE_S = 'rgba(255,255,255,0.25)'   // sidebar rule
const RULE_M = '#d1d5db'                   // main rule

/* ── helpers ──────────────────────────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec']
function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) return `${MONTHS[Number(m[2])-1]} ${m[1]}`
  return val
}

/* ── Sidebar section heading ──────────────────────────────────────────────── */
function SideHead({ title }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 18 }}>
      <p style={{
        margin: '0 0 5px',
        fontSize: '10pt',
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: WHITE,
        textTransform: 'uppercase',
      }}>
        {title}
      </p>
      <div style={{ height: 1, background: RULE_S }} />
    </div>
  )
}

/* ── Main section heading ─────────────────────────────────────────────────── */
function MainHead({ title }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 20 }}>
      <p style={{
        margin: '0 0 5px',
        fontSize: '11.5pt',
        fontWeight: 800,
        color: NAVY,
        letterSpacing: '0.03em',
      }}>
        {title}
      </p>
      <div style={{ height: 1.5, background: RULE_M }} />
    </div>
  )
}

/* ── Sidebar bullet ───────────────────────────────────────────────────────── */
function SideBullet({ text }) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', gap: 7, marginBottom: 4 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: WHITE,
        flexShrink: 0, marginTop: 5 }} />
      <span style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
        {text}
      </span>
    </div>
  )
}

/* ── Main bullet ──────────────────────────────────────────────────────────── */
function MainBullet({ text }) {
  if (!text) return null
  return (
    <li style={{ fontSize: '9.5pt', color: MID, lineHeight: 1.6, marginBottom: 3 }}>
      {text}
    </li>
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
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{ margin: 0, fontSize: '11pt', fontWeight: 700, color: DARK }}>{jobTitle || 'Job Title'}</p>
        {dateStr && <p style={{ margin: 0, fontSize: '9pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>{dateStr}</p>}
      </div>
      {company && (
        <p style={{ margin: '1px 0 5px', fontSize: '9.5pt', color: MID }}>
          {company}{location ? `, ${location}` : ''}
        </p>
      )}
      {bullets.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {bullets.map((pt, i) => <MainBullet key={i} text={pt} />)}
        </ul>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Template21StevenBrandon() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const websites     = ctx.websites       || {}
  const summary      = ctx.summary        || ''
  const projects     = ctx.projects       || []

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''
  const location   = [p.city, p.state].filter(Boolean).join(', ')

  const skillList = (() => {
    const rows = [
      skillsDet.programmingLanguages, skillsDet.frameworks,
      skillsDet.frontend, skillsDet.backend, skillsDet.databases,
      skillsDet.tools, skillsDet.other,
    ].filter(Boolean)
    if (rows.length) return rows.flatMap(r => r.split(/[,;]/)).map(s => s.trim()).filter(Boolean)
    return skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
  })()

  /* ── demo data ── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoName      = 'Steven Brandon'
  const demoProfession = 'Salesforce Developer'
  const demoPhoto     = ''
  const demoEmail     = 'info@resumekraft.com'
  const demoPhone     = '202-555-0120'
  const demoCity      = 'Chicago, Illinois, US'
  const demoLinkedIn  = 'linkedin.com/resumekraft'
  const demoSkills    = [
    'Administrator','Lightning Web Components','Flows, Process Builder & Workflows',
    'Apex Programming','SOQL','Custom Integration (REST API)','JavaScript',
    'HTML, MD','Bootstrap','CSS','JSON','Packaging','Lightning Web Runtime',
    'CI/CD','Deployments','Management tools',
  ]
  const demoEdu = [
    { degree: 'Bachelor of Technology', startYear: 'Jul 2017', endYear: 'May 2020', institution: 'San Jose State University' },
    { degree: 'Diploma in Mechanical Engineering', startYear: 'Aug 2014', endYear: 'Apr 2017', institution: 'Northeastern University' },
    { degree: 'Secondary School Certificate', startYear: '', endYear: '', institution: '' },
  ]
  const demoSummary = 'Experienced Salesforce developer with over 2.9 years of experience in the IT industry. Complex problem-solver with an analytical and driven mindset. Dedicated to achieving demanding development objectives according to tight schedules while producing impeccable code.'
  const demoExp = [
    {
      jobTitle: 'Salesforce Developer', employer: 'Meirtec',
      city: '', state: '', startDate: '2021-01', endDate: '', currentWork: true,
      points: [
        'Participate on project teams to design, configure, develop, test and release applications/components pursuant to business, and service requirements. Design, configuration, development, test and release activity to be in alignment.',
        'Worked on Lightning Web components (LWC) and LWR - Experience Sites (lightning Web Runtime)',
        'Design and Develop the Apex Classes, Flows, Standard & Custom Controllers, Apex Triggers for various functional needs in the application.',
        'Created design documents and developed technical design document.',
        'Designed and implemented scalable applications for data extraction and analysis.',
        'Involved in huge Data Migration from external system to Salesforce.',
        'Develop Lightning Components using SLDS and Bootstrap, CSS Styling and UI Design to enhance look and feel of Lighting apps and Leveraged Apex Controllers to retrieve data from various APIs and display on Lightning Components.',
        'Worked on customization of lightning experience for desktop and mobile applications.',
        'Worked as release coordinator during every deployment.',
        'Participate in sprint planning and define specific tasks that must be completed throughout each sprint.',
        'Participate in daily SCRUM and offer updates on what is done, what is planned, and what is impeding progress.',
        'Developed and documented test cases and scenarios for Salesforce platform.',
        'Participated in Daily Standup and demos with the client as part of Agile methodology.',
        'Made new feature enhancements on Service cloud console view and developed some lightning components.',
        'Performed Salesforce administrative tasks on a regular basis like creating Page Layouts, Email Services, and Validation rules, Approvals, Workflows, Process Builders, Einstein Reports & Dashboards, Custom Formula Fields, Tasks and Events.',
        'Used VS Code for code development and used Gearset for deployment.',
        'Extensively used Data Loader, Data Loader IO.',
      ],
    },
  ]

  const displayName       = showDemo ? demoName       : (fullName || 'Your Name')
  const displayProfession = showDemo ? demoProfession : profession
  const displayPhoto      = showDemo ? demoPhoto      : (p.photo || '')
  const displayEmail      = showDemo ? demoEmail      : (p.email || '')
  const displayPhone      = showDemo ? demoPhone      : (p.phone || '')
  const displayDob        = p.dob || ''
  const displayCity       = showDemo ? demoCity       : location
  const displayLinkedIn   = showDemo ? demoLinkedIn   : (websites.linkedin?.replace(/https?:\/\/(www\.)?/,'') || '')
  const displaySkills     = showDemo ? demoSkills     : skillList
  const displayEdu        = showDemo ? demoEdu        : education
  const displaySummary    = showDemo ? demoSummary    : summary
  const displayExp        = showDemo ? demoExp        : experiences

  return (
    <div style={{
      width: 794, minHeight: 1123,
      display: 'flex',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: DARK, boxSizing: 'border-box',
      background: '#fff',
    }}>

      {/* ════ LEFT SIDEBAR ════════════════════════════════════════════════ */}
      <div style={{
        width: 200, minWidth: 200, flexShrink: 0,
        background: NAVY,
        padding: '28px 16px 28px 16px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Photo */}
        {displayPhoto ? (
          <img src={displayPhoto} alt="profile"
            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.3)', marginBottom: 18 }} />
        ) : (
          <div style={{
            width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid rgba(255,255,255,0.25)', marginBottom: 18, fontSize: '28pt', color: 'rgba(255,255,255,0.5)',
          }}>👤</div>
        )}

        {/* CONTACT */}
        <div style={{ width: '100%' }}>
          <SideHead title="Contact" />
          {[
            displayDob && { icon: '', text: `DOB: ${displayDob}` },
            displayEmail  && { icon: '✉',  text: displayEmail  },
            displayPhone  && { icon: '📞', text: displayPhone  },
            displayCity   && { icon: '📍', text: displayCity   },
            displayLinkedIn && { icon: '🔗', text: displayLinkedIn },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.7)', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.88)', lineHeight: 1.45, wordBreak: 'break-all' }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* PROFESSIONAL SKILLS */}
        {displaySkills.length > 0 && (
          <div style={{ width: '100%' }}>
            <SideHead title="Professional Skills" />
            {displaySkills.map((s, i) => <SideBullet key={i} text={s} />)}
          </div>
        )}

        {/* EDUCATION */}
        {displayEdu.length > 0 && (
          <div style={{ width: '100%' }}>
            <SideHead title="Education" />
            {displayEdu.map((item, i) => {
              const dates = [item.startYear || item.startDate, item.endYear || item.endDate].filter(Boolean).join(' - ')
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: '9pt', fontWeight: 700, color: WHITE, lineHeight: 1.4 }}>
                    {item.degree || item.fieldStudy || 'Degree'}
                  </p>
                  {dates && <p style={{ margin: '1px 0 1px', fontSize: '8.5pt', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{dates}</p>}
                  {item.institution && <p style={{ margin: 0, fontSize: '8.5pt', fontWeight: 600, color: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }}>{item.institution}</p>}
                  {item.cgpa && <p style={{ margin: 0, fontSize: '8pt', color: 'rgba(255,255,255,0.6)' }}>CGPA: {item.cgpa}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ════ RIGHT MAIN ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, padding: '28px 28px 28px 24px', boxSizing: 'border-box' }}>

        {/* Name */}
        <h1 style={{
          margin: '0 0 3px', fontSize: '22pt', fontWeight: 800,
          color: DARK, letterSpacing: '0.06em', textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          {displayName}
        </h1>

        {/* Profession */}
        {displayProfession && (
          <p style={{
            margin: '0 0 16px', fontSize: '9.5pt', color: META,
            letterSpacing: '0.15em', textAlign: 'center',
            textTransform: 'uppercase',
          }}>
            {displayProfession}
          </p>
        )}

        {/* SUMMARY */}
        {displaySummary && (
          <>
            <MainHead title="Summary" />
            <p style={{ margin: '0 0 4px', fontSize: '9.5pt', color: MID, lineHeight: 1.65 }}>
              {displaySummary}
            </p>
          </>
        )}

        {/* EXPERIENCE */}
        {displayExp.length > 0 && (
          <>
            <MainHead title="Experience" />
            {displayExp.map((exp, i) => <ExpEntry key={i} {...exp} />)}
          </>
        )}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <>
            <MainHead title="Projects" />
            {projects.map((proj, i) => {
              const tech = Array.isArray(proj.techStack)
                ? proj.techStack.join(', ')
                : (proj.technologies || proj.techStack || '')
              const bullets = proj.points?.length
                ? proj.points
                : [proj.description, proj.highlights].filter(Boolean)
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: '11pt', fontWeight: 700, color: DARK }}>
                    {proj.name || proj.title || 'Project'}
                  </p>
                  {tech && <p style={{ margin: '1px 0 4px', fontSize: '9pt', color: META }}>{tech}</p>}
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {bullets.map((b, j) => <MainBullet key={j} text={b} />)}
                  </ul>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
