/**
 * Template 19 — Resume Worded (First Last style)
 *
 * Layout:
 *   Left main (wider, ~530px):
 *     First Last   ← large bold blue
 *     Python Developer  ← gray subtitle
 *     ─────────────────────────────────────────
 *     WORK EXPERIENCE   ← blue spaced caps heading
 *       Company, City   ← bold + location
 *       italic tagline
 *       Job Title        dates right
 *         • bullet
 *     ─────────────────────────────────────────
 *     PREVIOUS EXPERIENCE  ← same heading style
 *       Bold Role, Company, City    dates right
 *
 *   Right sidebar (~200px, light blue-gray bg #e8f0f8):
 *     CONTACT  ← blue heading + rule
 *       • city
 *       • phone
 *       • email
 *     SKILLS
 *       Hard Skills:  ← italic label
 *         • skill
 *       Scripting:
 *         • skill
 *     EDUCATION
 *     OTHER
 *
 * Accent: #1a5ea8  (steel blue)
 */

import { useResume } from '../../../context/ResumeContext'

const BLUE    = '#1a5ea8'
const DARK    = '#1a1a1a'
const MID     = '#333'
const META    = '#555'
const SIDEBAR = '#e8f0f8'

/* ── helpers ──────────────────────────────────────────────────────────────── */
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) return `${String(m[2]).padStart(2,'0')}/${m[1]}`
  return val
}

/* ── Main section heading (blue spaced caps + no rule) ────────────────────── */
function MainHead({ title }) {
  return (
    <p style={{
      margin: '0 0 10px',
      fontSize: '9.5pt',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: BLUE,
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      {title}
    </p>
  )
}

/* ── Sidebar section heading (blue + thin rule) ───────────────────────────── */
function SideHead({ title }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{
        margin: '0 0 4px',
        fontSize: '9.5pt',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: BLUE,
      }}>
        {title}
      </p>
      <div style={{ height: 1, background: '#bcd0e8' }} />
    </div>
  )
}

/* ── Sidebar bullet ───────────────────────────────────────────────────────── */
function SideBullet({ text }) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
      <span style={{ fontSize: '9pt', color: META, flexShrink: 0, marginTop: 1 }}>•</span>
      <span style={{ fontSize: '9pt', color: META, lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

/* ── Main bullet ──────────────────────────────────────────────────────────── */
function MainBullet({ text }) {
  if (!text) return null
  return (
    <li style={{ fontSize: '9.5pt', color: MID, lineHeight: 1.55, marginBottom: 3 }}>
      {text}
    </li>
  )
}

/* ── Experience entry (detailed) ─────────────────────────────────────────── */
function ExpEntry({ jobTitle, employer, employerOther, city, state,
                    startDate, endDate, currentWork, description, points,
                    tagline }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'Present' : fmtDate(endDate)
  const dateStr  = [start, end].filter(Boolean).join(' – ')

  const bullets = points?.length
    ? points
    : description ? [description] : []

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Company + location */}
      <p style={{ margin: 0, fontSize: '10.5pt', color: DARK, lineHeight: 1.3 }}>
        <strong>{company || 'Company'}</strong>
        {location && <span style={{ fontWeight: 400, color: META }}>, {location}</span>}
      </p>
      {/* Tagline */}
      {tagline && (
        <p style={{ margin: '1px 0 4px', fontSize: '9pt', color: META, fontStyle: 'italic' }}>
          {tagline}
        </p>
      )}
      {/* Job title + dates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <p style={{ margin: 0, fontSize: '10pt', fontWeight: 700, color: DARK }}>
          {jobTitle || 'Job Title'}
        </p>
        {dateStr && (
          <p style={{ margin: 0, fontSize: '9pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>
            {dateStr}
          </p>
        )}
      </div>
      {/* Bullets */}
      {bullets.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {bullets.map((pt, i) => <MainBullet key={i} text={pt} />)}
        </ul>
      )}
    </div>
  )
}

/* ── Previous experience row (compact) ───────────────────────────────────── */
function PrevExpRow({ jobTitle, employer, employerOther, city, state,
                      startDate, endDate, currentWork }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'Present' : fmtDate(endDate)
  const dateStr  = [start, end].filter(Boolean).join(' – ')

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
      <p style={{ margin: 0, fontSize: '9.5pt', color: DARK }}>
        <strong>{jobTitle || 'Role'}</strong>
        {company && <span style={{ fontWeight: 400 }}>, {company}</span>}
        {location && <span style={{ fontWeight: 400, color: META }}>, {location}</span>}
      </p>
      {dateStr && (
        <p style={{ margin: 0, fontSize: '9pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>
          {dateStr}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════════════════ */
export default function Template19ResumeWorded() {
  const ctx = useResume?.() || {}

  const p            = ctx.profileData    || {}
  const experiences  = ctx.experiences    || []
  const education    = ctx.education      || []
  const skills       = ctx.skills         || []
  const skillsDet    = ctx.skillsDetailed || {}
  const websites     = ctx.websites       || {}
  const certs        = ctx.certifications || []
  const achievements = ctx.achievements   || []
  const langs        = (p.languages || []).map(l => typeof l === 'string' ? l : l.language).filter(Boolean)

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''
  const location   = [p.city, p.state].filter(Boolean).join(', ')

  /* skill categories from skillsDetailed */
  const skillCategories = [
    { label: 'Hard Skills',               value: skillsDet.programmingLanguages },
    { label: 'Frameworks',                value: skillsDet.frameworks },
    { label: 'Frontend',                  value: skillsDet.frontend },
    { label: 'Backend',                   value: skillsDet.backend },
    { label: 'Databases',                 value: skillsDet.databases },
    { label: 'Source Code Management',    value: skillsDet.tools },
    { label: 'Other',                     value: skillsDet.other },
  ].filter(r => r.value?.trim())

  const flatSkills = skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)

  /* split experiences: first 3 are detailed, rest are "previous" */
  const mainExp = experiences.slice(0, 3)
  const prevExp = experiences.slice(3)

  /* cert texts */
  const certTexts = certs.map(c =>
    typeof c === 'string' ? c : [c.name, c.issuer].filter(Boolean).join(' – ')
  ).filter(Boolean)

  /* ── demo data ─────────────────────────────────────────────────────────── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoName      = 'First Last'
  const demoProfession = 'Python Developer'
  const demoEmail     = 'first.last@gmail.com'
  const demoPhone     = '+44 1234567890'
  const demoCity      = 'Bradford, United Kingdom'
  const demoMainExp = [
    {
      jobTitle: 'Python Developer', employer: 'Resume Worded',
      city: 'London', state: 'United Kingdom',
      tagline: 'VR gaming startup with 50+ employees and $100m+ annual revenue',
      startDate: '2022-01', endDate: '', currentWork: true,
      points: [
        'Created the back-end financial systems that made 20+ RW applications user-friendly and seamless to navigate.',
        'Developed and updated productivity applications, which increased user downloads by 30% within 96 hours of release.',
        'Supervised programming tasks and maintained 10+ company websites with a 50% success rate in product update deployment.',
        'Designed a marketing lead MySQL database that categorized and filtered 740+ leads from several sources.',
      ],
    },
    {
      jobTitle: 'Technical Support Specialist', employer: 'Polyhire',
      city: 'London', state: 'United Kingdom',
      tagline: 'NYSE-listed recruitment and employer branding company',
      startDate: '2019-10', endDate: '2021-12', currentWork: false,
      points: [
        'Responded to and resolved 300+ customer questions about implementing access software, CMS, IP Cameras, DVRs, and Access Control.',
        'Provided technical solutions for 70+ Small and Medium-sized enterprises (SMEs) and 20+ micro-merchants, which accounted for 38% of Polyhire card payments.',
        'Discovered a software glitch that prevented 150+ customers from accessing their accounts in the first week of employment.',
        'Answered customers\' inquiries within 60+ seconds of contact via chat sessions and live support.',
      ],
    },
    {
      jobTitle: 'Junior Software Developer', employer: 'Growthsi',
      city: 'London, United Kingdom & Barcelona', state: 'Spain',
      tagline: 'Career training and membership SaaS with 150,000 users',
      startDate: '2018-11', endDate: '2019-09', currentWork: false,
      points: [
        'Created a user interface as a single-page application using React and MobX; increased the productivity of 1100+ users by 64%.',
        'Implemented functionality to support disconnected client machines, which enabled 420+ customers to work offline without losing data.',
        'Designed a data dictionary generator that creates documentation for 1200+ developers as spreadsheets and web pages.',
        'Launched a search engine for consumers to search for ATM locations in 20+ states, saving institutions $50K on data research.',
      ],
    },
  ]
  const demoPrevExp = [
    { jobTitle: 'Coder',                employer: 'ABC Company', city: 'London', state: 'UK',           startDate: '2017-06', endDate: '2018-10' },
    { jobTitle: 'Ethical Hacker',       employer: 'XYZ Company', city: 'New York City', state: 'USA',   startDate: '2016-01', endDate: '2017-05' },
    { jobTitle: 'Application Developer',employer: 'ABC',          city: 'New York', state: 'USA',        startDate: '2014-07', endDate: '2015-12' },
  ]
  const demoEdu = [
    {
      degree: 'Associate in Applied Science',
      fieldStudy: 'Computer Science\nCultural Studies',
      institution: 'New York City, New York',
      startYear: '10/2011', endYear: '06/2014',
    },
  ]
  const demoSkillCats = [
    { label: 'Hard Skills',                 value: 'Deep Learning\nData Structures\nGenerators\nIterators\nMulti-Process Architecture\nObject Relational Mapping' },
    { label: 'Scripting',                   value: 'Python\nShell\nPerl' },
    { label: 'Source Code Management Tools', value: 'GitLab\nMercurial\nApache Subversion (SVN)\nCVS' },
    { label: 'Languages',                   value: 'English (Native)\nRomanian (Native)\nSpanish (Conversational)' },
  ]
  const demoCerts = ['Certified Entry-Level Python Programmer', 'Certified Associate in Python Programming']

  const displayName       = showDemo ? demoName       : (fullName || 'Your Name')
  const displayProfession = showDemo ? demoProfession : profession
  const displayEmail      = showDemo ? demoEmail      : (p.email || '')
  const displayPhone      = showDemo ? demoPhone      : (p.phone || '')
  const displayDob        = p.dob || ''
  const displayCity       = showDemo ? demoCity       : location
  const displayMainExp    = showDemo ? demoMainExp    : mainExp
  const displayPrevExp    = showDemo ? demoPrevExp    : prevExp
  const displayEdu        = showDemo ? demoEdu        : education
  const displaySkillCats  = showDemo ? demoSkillCats  : skillCategories
  const displayFlatSkills = showDemo ? []             : flatSkills
  const displayCerts      = showDemo ? demoCerts      : certTexts
  const displayLangs      = showDemo ? []             : langs

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: '#fff',
      display: 'flex',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: DARK,
      boxSizing: 'border-box',
    }}>

      {/* ════ LEFT MAIN ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        padding: '30px 24px 30px 30px',
        boxSizing: 'border-box',
        borderRight: '1px solid #dde6f0',
      }}>
        {/* Name */}
        <h1 style={{
          margin: '0 0 2px',
          fontSize: '22pt',
          fontWeight: 700,
          color: BLUE,
          letterSpacing: '0.01em',
          lineHeight: 1.1,
        }}>
          {displayName}
        </h1>
        {/* Profession */}
        {displayProfession && (
          <p style={{ margin: '0 0 14px', fontSize: '10.5pt', color: META }}>
            {displayProfession}
          </p>
        )}

        {/* WORK EXPERIENCE */}
        {displayMainExp.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <MainHead title="Work Experience" />
            <div style={{ height: 1, background: '#dde6f0', marginBottom: 12 }} />
            {displayMainExp.map((exp, i) => (
              <ExpEntry key={i} {...exp} />
            ))}
          </section>
        )}

        {/* PREVIOUS EXPERIENCE */}
        {displayPrevExp.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <MainHead title="Previous Experience" />
            <div style={{ height: 1, background: '#dde6f0', marginBottom: 10 }} />
            {displayPrevExp.map((exp, i) => (
              <PrevExpRow key={i} {...exp} />
            ))}
          </section>
        )}
      </div>

      {/* ════ RIGHT SIDEBAR ══════════════════════════════════════════════════ */}
      <div style={{
        width: 200,
        minWidth: 200,
        flexShrink: 0,
        background: SIDEBAR,
        padding: '30px 14px 30px 14px',
        boxSizing: 'border-box',
      }}>

        {/* CONTACT */}
        <section style={{ marginBottom: 18 }}>
          <SideHead title="Contact" />
          {displayCity  && <SideBullet text={displayCity} />}
          {displayPhone && <SideBullet text={displayPhone} />}
          {displayEmail && <SideBullet text={displayEmail} />}
          {displayDob && <SideBullet text={`DOB: ${displayDob}`} />}
          {websites.linkedin && (
            <div style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
              <span style={{ fontSize: '9pt', color: META, flexShrink: 0, marginTop: 1 }}>•</span>
              <span style={{ fontSize: '9pt', color: BLUE, lineHeight: 1.5 }}>LinkedIn</span>
            </div>
          )}
          {websites.github && (
            <div style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
              <span style={{ fontSize: '9pt', color: META, flexShrink: 0, marginTop: 1 }}>•</span>
              <span style={{ fontSize: '9pt', color: BLUE, lineHeight: 1.5 }}>Github</span>
            </div>
          )}
        </section>

        {/* SKILLS */}
        {(displaySkillCats.length > 0 || displayFlatSkills.length > 0) && (
          <section style={{ marginBottom: 18 }}>
            <SideHead title="Skills" />
            {displaySkillCats.map((cat, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ margin: '0 0 3px', fontSize: '8.5pt', fontStyle: 'italic', color: MID }}>
                  {cat.label}:
                </p>
                {cat.value.split('\n').map((skill, j) => (
                  <SideBullet key={j} text={skill.trim()} />
                ))}
              </div>
            ))}
            {displayFlatSkills.length > 0 && (
              <div>
                {displayFlatSkills.map((s, i) => <SideBullet key={i} text={s} />)}
              </div>
            )}
            {displayLangs.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: '0 0 3px', fontSize: '8.5pt', fontStyle: 'italic', color: MID }}>Languages:</p>
                {displayLangs.map((l, i) => <SideBullet key={i} text={l} />)}
              </div>
            )}
          </section>
        )}

        {/* EDUCATION */}
        {displayEdu.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <SideHead title="Education" />
            {displayEdu.map((item, i) => {
              const degree   = item.degree || ''
              const fields   = (item.fieldStudy || '').split('\n').filter(Boolean)
              const school   = item.institution || item.schoolName || ''
              const dates    = [item.startYear || item.startDate, item.endYear || item.endDate].filter(Boolean).join(' - ')
              const loc      = [item.city, item.state].filter(Boolean).join(', ')
              return (
                <div key={i} style={{ marginBottom: 10, fontSize: '9pt', color: MID, lineHeight: 1.6 }}>
                  {degree && <p style={{ margin: 0, fontWeight: 700, color: DARK }}>{degree}</p>}
                  {fields.map((f, j) => <p key={j} style={{ margin: 0 }}>{f}</p>)}
                  {school && <p style={{ margin: 0 }}>{school}</p>}
                  {dates  && <p style={{ margin: 0 }}>{dates}</p>}
                  {loc    && <p style={{ margin: 0 }}>{loc}</p>}
                </div>
              )
            })}
          </section>
        )}

        {/* OTHER (certifications + achievements) */}
        {(displayCerts.length > 0 || achievements.length > 0) && (
          <section style={{ marginBottom: 18 }}>
            <SideHead title="Other" />
            {displayCerts.map((c, i) => <SideBullet key={i} text={c} />)}
            {achievements.map((a, i) => (
              <SideBullet key={`a${i}`} text={typeof a === 'string' ? a : a.text} />
            ))}
          </section>
        )}

      </div>
    </div>
  )
}
