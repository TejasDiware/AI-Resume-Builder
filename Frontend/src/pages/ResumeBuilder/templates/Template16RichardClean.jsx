/**
 * Template 16 — Richard Clean (Two-Column, Minimal)
 *
 * Matches the "Richard Hendricks" style from the attached image:
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  [photo]  RICHARD                  ⊙ City, State, ZIP       │
 *  │           HENDRICKS                ☎ +1 123 456 7890        │
 *  │           FULL STACK WEB DEVELOPER ✉ email@domain.com       │
 *  ├──────────────────────┬──────────────────────────────────────┤
 *  │  LINKS               │  ABOUT ME                            │
 *  │  LANGUAGES           │  WORK EXPERIENCE                     │
 *  │  REFERENCE           │  EDUCATION                           │
 *  │  HOBBIES             │  SKILLS (2-col grid with underlines) │
 *  └──────────────────────┴──────────────────────────────────────┘
 *
 * Colors: black/dark-gray text, white background, no color accent.
 * Section headings: spaced uppercase + full-width black rule.
 * Entry bullet marker: filled circle ● before each role/degree.
 */

import { useResume } from '../../../context/ResumeContext'

const BLACK  = '#111'
const DARK   = '#222'
const MID    = '#444'
const LIGHT  = '#777'
const RULE   = '#111'

/* ── helpers ──────────────────────────────────────────────────────────────── */
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (!m) return val
  return `${SHORT_MONTHS[Number(m[2]) - 1].toUpperCase()} ${m[1]}`
}

/* ── Section heading: spaced caps + full-width rule ───────────────────────── */
function SectionHead({ title }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 18 }}>
      <p style={{
        margin: 0,
        fontSize: '9.5pt',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: BLACK,
      }}>
        {title}
      </p>
      <div style={{ height: 1.5, background: RULE, marginTop: 4 }} />
    </div>
  )
}

/* ── Circle-dot marker (⊙ style) ──────────────────────────────────────────── */
function Dot() {
  return (
    <span style={{
      display: 'inline-block',
      width: 10, height: 10,
      borderRadius: '50%',
      border: '1.5px solid #555',
      flexShrink: 0,
      marginTop: 2,
    }} />
  )
}

/* ── Sidebar bullet (plain •) ─────────────────────────────────────────────── */
function SideBullet({ text }) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
      <span style={{ fontSize: '9pt', color: MID, flexShrink: 0 }}>•</span>
      <span style={{ fontSize: '9pt', color: MID, lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

/* ── Skill underline bar ──────────────────────────────────────────────────── */
function SkillBar({ name }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ margin: '0 0 3px', fontSize: '9.5pt', color: DARK }}>{name}</p>
      <div style={{ height: 1.5, background: '#bbb', width: '80%' }} />
    </div>
  )
}

/* ── Language item with underline ─────────────────────────────────────────── */
function LangItem({ name }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ margin: '0 0 2px', fontSize: '9.5pt', color: DARK }}>{name}</p>
      <div style={{ height: 1.5, background: '#bbb', width: '70%' }} />
    </div>
  )
}

/* ── Work experience entry ────────────────────────────────────────────────── */
function ExpEntry({ jobTitle, employer, employerOther, city, state, startDate, endDate, currentWork, description, points }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'PRESENT' : fmtDate(endDate)
  const dates    = [start, end].filter(Boolean).join(' - ')

  const bullets = points?.length
    ? points
    : description
      ? [description]
      : []

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
      <div style={{ paddingTop: 2, flexShrink: 0 }}><Dot /></div>
      <div style={{ flex: 1 }}>
        {/* ROLE | DATES */}
        <p style={{ margin: 0, fontSize: '9.5pt', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLACK }}>
          {jobTitle || 'Job Title'}
          {dates && <span style={{ fontWeight: 400, letterSpacing: '0.04em', color: MID, marginLeft: 8 }}>| {dates}</span>}
        </p>
        {/* Company, Location */}
        {(company || location) && (
          <p style={{ margin: '2px 0 4px', fontSize: '9pt', color: MID, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {[company, location].filter(Boolean).join(', ')}
          </p>
        )}
        {/* Bullet points */}
        {bullets.map((pt, i) => (
          <p key={i} style={{ margin: '2px 0', fontSize: '9pt', color: MID, lineHeight: 1.5 }}>
            • {pt}
          </p>
        ))}
      </div>
    </div>
  )
}

/* ── Education entry ──────────────────────────────────────────────────────── */
function EduEntry({ degree, fieldStudy, institution, startYear, endYear, cgpa, description, highlights }) {
  const dates = [startYear, endYear || 'Present'].filter(Boolean).join(' - ')
  const degreeStr = [degree, fieldStudy].filter(Boolean).join(' – ') || 'Degree'
  const school = institution || 'Institution'

  const bullets = [description, highlights].filter(Boolean)

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
      <div style={{ paddingTop: 2, flexShrink: 0 }}><Dot /></div>
      <div style={{ flex: 1 }}>
        {/* DEGREE | YEAR */}
        <p style={{ margin: 0, fontSize: '9.5pt', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLACK }}>
          {degreeStr}
          {dates && <span style={{ fontWeight: 400, letterSpacing: '0.04em', color: MID, marginLeft: 8 }}>| {dates}</span>}
        </p>
        {/* School */}
        <p style={{ margin: '2px 0 4px', fontSize: '9pt', color: MID, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {school}
        </p>
        {bullets.map((b, i) => (
          <p key={i} style={{ margin: '2px 0', fontSize: '9pt', color: MID, lineHeight: 1.5 }}>
            • {b}
          </p>
        ))}
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Template16RichardClean() {
  const ctx = useResume?.() || {}

  const p           = ctx.profileData    || {}
  const experiences = ctx.experiences    || []
  const education   = ctx.education      || []
  const skills      = ctx.skills         || []
  const websites    = ctx.websites       || {}
  const summary     = ctx.summary        || ''
  const hobbies     = ctx.hobbies        || []
  const references  = ctx.references     || []
  const langs       = (p.languages || []).map(l => typeof l === 'string' ? l : l.language).filter(Boolean)

  const firstName = p.firstName || ''
  const lastName  = [p.middleName, p.lastName].filter(Boolean).join(' ')
  const fullName  = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''
  const photo      = p.photo || ''

  const locationStr = [p.street, p.city, p.state].filter(Boolean).join(', ')

  /* links list */
  const linksList = [
    websites.linkedin  && { label: 'LinkedIn',  url: websites.linkedin },
    websites.github    && { label: 'GitHub',     url: websites.github },
    websites.portfolio && { label: 'Portfolio',  url: websites.portfolio },
    websites.other     && { label: 'Website',    url: websites.other },
  ].filter(Boolean)

  /* skill names */
  const skillNames = skills.map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean)

  /* ── demo data ─────────────────────────────────────────────────────────── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demoFirstName  = 'Richard'
  const demoLastName   = 'Hendricks'
  const demoProfession = 'Full Stack Web Developer'
  const demoPhoto      = ''
  const demoLocation   = 'Silicon Valley, CA 94040, USA'
  const demoPhone      = '+1 123 456 7890'
  const demoEmail      = 'richard@piedpiper.com'
  const demoSummary    = 'A highly skilled Full Stack Web Developer with over 8 years of experience in the tech industry. Proven ability to lead a team and manage projects. Looking for a challenging role to utilize my skills.'
  const demoLinks      = [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/richard-hendricks' },
    { label: 'Twitter',  url: 'https://twitter.com/richardhendricks' },
  ]
  const demoLangs   = ['English', 'Spanish', 'French']
  const demoHobbies = ['Coding', 'Listening to Music', 'Playing Chess', 'Reading Tech Blogs', 'Hiking']
  const demoRefs    = [{ name: 'Erlich Bachman', company: 'Bachmanity', phone: 'P: +1 987 654 3210', email: 'E: erlich@bachmanity.com' }]
  const demoExp = [
    {
      jobTitle: 'CEO & Full Stack Developer', employer: 'Pied Piper', city: 'Silicon Valley', state: '',
      startDate: '2014-01', endDate: '2020-12', currentWork: false,
      points: [
        'Led a team of developers to create a revolutionary data compression platform.',
        'Developed both front-end and back-end of the platform using various technologies.',
      ],
    },
    {
      jobTitle: 'Software Developer', employer: 'Hooli', city: 'Silicon Valley', state: '',
      startDate: '2012-01', endDate: '2013-12', currentWork: false,
      points: [
        'Worked on Nucleus project, a comprehensive compression engine.',
        'Developed various web applications using modern technologies.',
      ],
    },
  ]
  const demoEdu = [
    {
      degree: "Bachelor's Degree in Computer Science", institution: 'Stanford University, Stanford',
      startYear: '', endYear: '2011',
      description: 'Specialized in software development and data structures.',
      highlights: 'Developed a music app as a part of the final year project.',
    },
    {
      degree: 'High School Diploma', institution: 'Mountain View High School, Mountain View',
      startYear: '', endYear: '2007',
      description: 'Excelled in Mathematics and Computer Science.',
      highlights: 'Developed a basic website as a part of a school project.',
    },
  ]
  const demoSkills = ['JavaScript', 'Python', 'HTML/CSS', 'React']

  const displayFirstName  = showDemo ? demoFirstName  : firstName
  const displayLastName   = showDemo ? demoLastName   : lastName
  const displayFullName   = showDemo ? `${demoFirstName} ${demoLastName}` : fullName
  const displayProfession = showDemo ? demoProfession : profession
  const displayPhoto      = showDemo ? demoPhoto      : photo
  const displayLocation   = showDemo ? demoLocation   : locationStr
  const displayPhone      = showDemo ? demoPhone      : (p.phone || '')
  const displayEmail      = showDemo ? demoEmail      : (p.email || '')
  const displayDob        = p.dob || ''
  const displaySummary    = showDemo ? demoSummary    : summary
  const displayLinks      = showDemo ? demoLinks      : linksList
  const displayLangs      = showDemo ? demoLangs      : langs
  const displayHobbies    = showDemo ? demoHobbies    : hobbies
  const displayRefs       = showDemo ? demoRefs       : references
  const displayExp        = showDemo ? demoExp        : experiences
  const displayEdu        = showDemo ? demoEdu        : education
  const displaySkills     = showDemo ? demoSkills     : skillNames

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: '#fff',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: BLACK,
      boxSizing: 'border-box',
    }}>

      {/* ════════════════════════════════════════════════════════════════
          TOP HEADER
          ════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '28px 36px 22px',
        gap: 20,
        borderBottom: '1px solid #ddd',
      }}>
        {/* Photo */}
        {displayPhoto ? (
          <img
            src={displayPhoto}
            alt="profile"
            style={{
              width: 82, height: 82,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              border: '2px solid #ccc',
            }}
          />
        ) : (
          <div style={{
            width: 82, height: 82, borderRadius: '50%', flexShrink: 0,
            background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '28pt', color: '#999' }}>👤</span>
          </div>
        )}

        {/* Name + Title */}
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '20pt', fontWeight: 400, letterSpacing: '0.04em', color: BLACK, lineHeight: 1.1, fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {displayFirstName.toUpperCase()}
          </p>
          <p style={{ margin: 0, fontSize: '20pt', fontWeight: 700, letterSpacing: '0.04em', color: BLACK, lineHeight: 1.15, fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {(displayLastName || displayFullName.split(' ').slice(1).join(' ') || '').toUpperCase()}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '9pt', letterSpacing: '0.2em', color: MID, textTransform: 'uppercase', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {displayProfession}
          </p>
        </div>

        {displayDob && <span style={{ fontSize: '9pt', color: MID, whiteSpace: 'nowrap' }}>DOB: {displayDob}</span>}

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '9pt', color: MID, minWidth: 180, fontFamily: 'Arial, Helvetica, sans-serif' }}>
          {displayLocation && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ marginTop: 1, flexShrink: 0 }}>📍</span>
              <span style={{ lineHeight: 1.45 }}>{displayLocation}</span>
            </div>
          )}
          {displayPhone && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span>📞</span>
              <span>{displayPhone}</span>
            </div>
          )}
          {displayEmail && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span>✉</span>
              <span style={{ wordBreak: 'break-all' }}>{displayEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BODY — two columns
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────── */}
        <div style={{
          width: 190,
          minWidth: 190,
          flexShrink: 0,
          padding: '20px 18px 30px 24px',
          borderRight: '1px solid #ddd',
          boxSizing: 'border-box',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>

          {/* LINKS */}
          {displayLinks.length > 0 && (
            <>
              <SectionHead title="Links" />
              <div style={{ marginBottom: 6 }}>
                {displayLinks.map((lnk, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ margin: '0 0 1px', fontSize: '9pt', fontWeight: 600, color: DARK }}>{lnk.label}</p>
                    <p style={{ margin: 0, fontSize: '8.5pt', color: '#1a6bb3', wordBreak: 'break-all', lineHeight: 1.4 }}>
                      {lnk.url?.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* LANGUAGES */}
          {displayLangs.length > 0 && (
            <>
              <SectionHead title="Languages" />
              <div style={{ marginBottom: 6 }}>
                {displayLangs.map((lang, i) => (
                  <LangItem key={i} name={lang} />
                ))}
              </div>
            </>
          )}

          {/* REFERENCE */}
          {displayRefs.length > 0 && (
            <>
              <SectionHead title="Reference" />
              <div style={{ marginBottom: 6 }}>
                {displayRefs.map((ref, i) => {
                  const refName    = typeof ref === 'string' ? ref : (ref.name || '')
                  const refCompany = typeof ref === 'string' ? '' : (ref.company || ref.title || '')
                  const refPhone   = typeof ref === 'string' ? '' : (ref.phone || '')
                  const refEmail   = typeof ref === 'string' ? '' : (ref.email || '')
                  return (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <div style={{ paddingTop: 3, flexShrink: 0 }}><Dot /></div>
                      <div>
                        <p style={{ margin: 0, fontSize: '9pt', fontWeight: 700, color: DARK, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{refName}</p>
                        {refCompany && <p style={{ margin: '2px 0 0', fontSize: '8.5pt', color: MID }}>{refCompany}</p>}
                        {refPhone   && <p style={{ margin: '1px 0 0', fontSize: '8.5pt', color: MID }}>{refPhone}</p>}
                        {refEmail   && <p style={{ margin: '1px 0 0', fontSize: '8.5pt', color: MID }}>{refEmail}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* HOBBIES */}
          {displayHobbies.length > 0 && (
            <>
              <SectionHead title="Hobbies" />
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <div style={{ paddingTop: 3, flexShrink: 0 }}><Dot /></div>
                <div>
                  {displayHobbies.map((h, i) => (
                    <SideBullet key={i} text={typeof h === 'string' ? h : h.name} />
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* ── RIGHT MAIN ─────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          padding: '20px 30px 30px 24px',
          boxSizing: 'border-box',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>

          {/* ABOUT ME */}
          {displaySummary && (
            <>
              <SectionHead title="About Me" />
              <p style={{ margin: '0 0 4px', fontSize: '9.5pt', color: MID, lineHeight: 1.6 }}>
                {displaySummary}
              </p>
            </>
          )}

          {/* WORK EXPERIENCE */}
          {displayExp.length > 0 && (
            <>
              <SectionHead title="Work Experience" />
              {displayExp.map((exp, i) => (
                <ExpEntry key={i} {...exp} />
              ))}
            </>
          )}

          {/* EDUCATION */}
          {displayEdu.length > 0 && (
            <>
              <SectionHead title="Education" />
              {displayEdu.map((edu, i) => (
                <EduEntry key={i} {...edu} />
              ))}
            </>
          )}

          {/* SKILLS — two-column grid with underline bars */}
          {displaySkills.length > 0 && (
            <>
              <SectionHead title="Skills" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                columnGap: 24,
              }}>
                {displaySkills.map((skill, i) => (
                  <SkillBar key={i} name={skill} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
