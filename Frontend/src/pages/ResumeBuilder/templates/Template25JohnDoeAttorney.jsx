
import { useResume } from '../../../context/ResumeContext'

const OLIVE     = '#4a5e3a'
const BODY      = '#333333'
const META      = '#666666'
const RULE      = '#c8cfc0'
const HEADER_BG = '#f5f5f0'
const DARK      = '#111111'

/* ── helpers ──────────────────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return ''
  const m = String(val).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (m) {
    const months = ['JAN','FEB','MAR','APR','MAY','JUN',
                    'JUL','AUG','SEP','OCT','NOV','DEC']
    return `${months[parseInt(m[2], 10) - 1]} ${m[1]}`
  }
  return val
}

/* ── Section heading with bottom rule ────────────────────────────── */
function SectionHead({ title }) {
  return (
    <div style={{ marginBottom: 7, marginTop: 16 }}>
      <p style={{
        margin: 0,
        fontSize: '8pt',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: OLIVE,
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}>
        {title}
      </p>
      <div style={{ height: 1, background: RULE, marginTop: 3 }} />
    </div>
  )
}

/* ── Personal Info row: LABEL / value ────────────────────────────── */
function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 9 }}>
      <p style={{
        margin: 0, fontSize: '7pt', fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: OLIVE, fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        {label}
      </p>
      <p style={{ margin: '1px 0 0', fontSize: '9pt', color: BODY, lineHeight: 1.4 }}>
        {value}
      </p>
    </div>
  )
}

/* ── Language row ─────────────────────────────────────────────────── */
function LanguageRow({ name, level }) {
  if (!name) return null
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ margin: 0, fontSize: '9pt', fontWeight: 700, color: DARK }}>{name}</p>
      {level && (
        <p style={{ margin: '1px 0 0', fontSize: '8.3pt', color: META, fontStyle: 'italic' }}>
          {level}
        </p>
      )}
    </div>
  )
}

/* ── Education entry ──────────────────────────────────────────────── */
function EduEntry({ degree, institution, location, date, extra }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {degree && (
        <p style={{
          margin: 0, fontSize: '9pt', fontWeight: 700,
          color: DARK, lineHeight: 1.4,
        }}>
          {degree}{date ? ` \u2022 ${date}` : ''}
        </p>
      )}
      {institution && (
        <p style={{ margin: '2px 0 0', fontSize: '9pt', fontWeight: 700, color: BODY }}>
          {institution}
        </p>
      )}
      {location && (
        <p style={{ margin: '1px 0 0', fontSize: '8.5pt', color: META }}>{location}</p>
      )}
      {extra && (
        <p style={{ margin: '2px 0 0', fontSize: '8.5pt', color: META, fontStyle: 'italic' }}>
          {extra}
        </p>
      )}
    </div>
  )
}

/* ── Work Experience Entry ────────────────────────────────────────── */
function WorkEntry({ jobTitle, employer, employerOther, city, state,
                     startDate, endDate, currentWork, description, points }) {
  const company  = employer === 'Other' ? employerOther : (employer || '')
  const location = [city, state].filter(Boolean).join(', ')
  const start    = fmtDate(startDate)
  const end      = currentWork ? 'PRESENT' : fmtDate(endDate)
  const dateStr  = [start, end].filter(Boolean).join(' \u2013 ')

  const bullets = points?.length
    ? points
    : description ? description.split('\n').filter(Boolean) : []

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Role title • Date range */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{
          margin: 0,
          fontSize: '9pt',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: OLIVE,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          {jobTitle}
        </p>
        {dateStr && (
          <p style={{ margin: 0, fontSize: '8pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>
            • {dateStr}
          </p>
        )}
      </div>

      {/* Company • Location */}
      {(company || location) && (
        <p style={{ margin: '2px 0 4px', fontSize: '9pt', color: BODY }}>
          {[company, location].filter(Boolean).join(' \u2022 ')}
        </p>
      )}

      {/* Description paragraph */}
      {description && !points?.length && (
        <p style={{ margin: '0 0 4px', fontSize: '9pt', color: BODY, lineHeight: 1.65 }}>
          {description}
        </p>
      )}

      {/* Bullets */}
      {bullets.length > 0 && points?.length > 0 && (
        <ul style={{ margin: '3px 0 0', paddingLeft: 16 }}>
          {bullets.map((pt, i) => (
            <li key={i} style={{ fontSize: '9pt', color: BODY, lineHeight: 1.65, marginBottom: 2 }}>
              {pt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Project Entry ────────────────────────────────────────────────── */
function ProjectEntry({ title, dateStr, description, points, link }) {
  const bullets = points?.length
    ? points
    : description ? description.split('\n').filter(Boolean) : []

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{
          margin: 0,
          fontSize: '9pt',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: OLIVE,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          {title}
        </p>
        {dateStr && (
          <p style={{ margin: 0, fontSize: '8pt', color: META, whiteSpace: 'nowrap', marginLeft: 8 }}>
            • {dateStr}
          </p>
        )}
      </div>

      {link && (
        <p style={{ margin: '2px 0 4px', fontSize: '8.5pt', color: META }}>{link}</p>
      )}

      {description && !points?.length && (
        <p style={{ margin: '0 0 4px', fontSize: '9pt', color: BODY, lineHeight: 1.65 }}>
          {description}
        </p>
      )}

      {bullets.length > 0 && points?.length > 0 && (
        <ul style={{ margin: '3px 0 0', paddingLeft: 16 }}>
          {bullets.map((pt, i) => (
            <li key={i} style={{ fontSize: '9pt', color: BODY, lineHeight: 1.65, marginBottom: 2 }}>
              {pt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
export default function Template25JohnDoeAttorney() {
  const ctx = useResume?.() || {}

  const p           = ctx.profileData    || {}
  const experiences = ctx.experiences    || []
  const education   = ctx.education      || []
  const skills      = ctx.skills         || []
  const skillsDet   = ctx.skillsDetailed || {}
  const summary     = ctx.summary        || ''
  const languages   = ctx.languages      || []
  const projects    = ctx.projects       || []

  const fullName   = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  const profession = p.profession || ''

  /* skill list */
  const skillRows = [
    skillsDet.programmingLanguages, skillsDet.frameworks, skillsDet.frontend,
    skillsDet.backend, skillsDet.databases, skillsDet.tools, skillsDet.other,
  ].filter(Boolean)
  const skillList = skillRows.length
    ? skillRows.flatMap(r => r.split(/[,;]/)).map(s => s.trim()).filter(Boolean)
    : skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)

  /* language list */
  const languageList = languages.map(l =>
    typeof l === 'string' ? { name: l, level: '' } : { name: l.name || l.language || '', level: l.level || l.proficiency || '' }
  ).filter(l => l.name)

  /* project list */
  const projectList = projects.map(pr => ({
    title:       pr.title || pr.name || '',
    dateStr:     [fmtDate(pr.startDate), pr.currentWork ? 'PRESENT' : fmtDate(pr.endDate)].filter(Boolean).join(' \u2013 '),
    description: pr.description || '',
    points:      pr.points || [],
    link:        pr.link || pr.url || '',
  })).filter(pr => pr.title)

  /* ── Demo data (shown when no real data) ── */
  const showDemo = !p.firstName && !experiences.length && !education.length

  const demo = {
    name: 'JOHN DOE',
    profession: 'ATTORNEY',
    personal: {
      email: 'john@mybestsite.com',
      phone: '+1 718 555 0100',
      location: 'Brooklyn, New York',
      dob: '14 March 1990',
      website: 'www.interestingsite.com',
      linkedin: 'linkedin.com/in/johndoe',
    },
    summary: 'Detail-oriented and dynamic attorney with extensive experience in business and real estate law. Skilled in business formation, real estate transactions, distressed properties, due diligence, permitting, contract and lease negotiations, and landlord/tenant matters. Recognized for strong analytical abilities and energetic approach to complex legal issues.',
    skills: ['Legal research & writing', 'Contract negotiation', 'Due diligence', 'Data analytics', 'Client relations', 'Case strategy'],
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Spanish', level: 'Fluent' },
      { name: 'French', level: 'Conversational' },
    ],
    education: [
      {
        institution: 'Jasper University',
        location: 'Manhattan, NYC, New York',
        degree: 'Juris Doctor',
        date: 'JUNE 2016',
        extra: '1st place in Moot Court',
      },
      {
        institution: 'Mount Flores College',
        location: 'Small Town, Massachusetts',
        degree: 'BA in Political Science',
        date: 'JUNE 2012',
      },
    ],
    experiences: [
      {
        jobTitle: 'In-House Counsel',
        employer: 'Bandler Real Estate',
        city: 'New York', state: 'NY',
        startDate: '2020-03', currentWork: true,
        description: 'Draft, negotiate and enforce leases and agreements for a boutique real estate development firm. Negotiate purchase and sale contracts for residential and commercial properties, including foreclosures. Handle landlord tenant issues, including leasing, eviction, and dispute resolution.',
      },
      {
        jobTitle: 'Associate Attorney',
        employer: 'Luca Udinesi Law firm',
        city: 'New York', state: 'NY',
        startDate: '2018-02', endDate: '2020-11',
        description: 'Represented and advised parties on small business, real estate, and landlord tenant issues. Researched and analyzed a wide range of legal issues. Represented client in a corporate dissolution litigation and won a $25,000 supervised receivership and dissolution of corporation.',
      },
      {
        jobTitle: 'Junior Associate Attorney',
        employer: 'Law Offices of Keita Aoki',
        city: 'New York', state: 'NY',
        startDate: '2017-09', endDate: '2018-01',
        description: 'Researched legal issues for senior counsel and assisted in representation of clients on a range of small business matters. Drafted legal memoranda. Second chair in a multi-million-dollar telecom litigation.',
      },
    ],
    projects: [
      {
        title: 'Community Legal Aid Clinic',
        dateStr: '2021 \u2013 PRESENT',
        description: 'Founded a pro-bono clinic offering monthly legal consultations to low-income tenants facing eviction, resulting in over 60 successful case resolutions.',
      },
      {
        title: 'Zoning Reform Advisory Panel',
        dateStr: '2019 \u2013 2020',
        description: 'Served on a municipal advisory panel drafting recommendations for updated mixed-use zoning ordinances, adopted by the city council in 2020.',
      },
    ],
  }

  const displayName       = showDemo ? demo.name       : (fullName.toUpperCase() || 'YOUR NAME')
  const displayProfession = showDemo ? demo.profession  : profession.toUpperCase()
  const displaySummary    = showDemo ? demo.summary     : summary
  const displaySkills     = showDemo ? demo.skills      : skillList
  const displayLanguages  = showDemo ? demo.languages   : languageList
  const displayEdu        = showDemo ? demo.education   : education.map(e => ({
    degree:      e.degree || '',
    institution: e.institution || e.schoolName || '',
    location:    [e.city, e.state].filter(Boolean).join(', '),
    date:        e.endYear || fmtDate(e.endDate) || '',
    extra:       e.extra || '',
  }))
  const displayExp        = showDemo ? demo.experiences : experiences
  const displayProjects   = showDemo ? demo.projects    : projectList

  /* personal info */
  const personal = showDemo
    ? demo.personal
    : {
        email:    p.email || '',
        phone:    p.phone || '',
        location: [p.city, p.state].filter(Boolean).join(', '),
        dob:      p.dob || p.dateOfBirth || '',
        website:  p.website || '',
        linkedin: p.linkedin || p.linkedIn || '',
      }

  return (
    <div style={{
      width: 794, minHeight: 1123,
      background: '#fff',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: DARK,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ════ HEADER ═════════════════════════════════════════════════ */}
      <div style={{
        background: HEADER_BG,
        padding: '28px 36px 20px',
        borderBottom: `2px solid ${RULE}`,
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '28pt',
          fontWeight: 700,
          color: OLIVE,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1,
        }}>
          {displayName}
        </h1>
        {displayProfession && (
          <p style={{
            margin: '5px 0 0',
            fontSize: '10pt',
            fontWeight: 400,
            color: META,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}>
            {displayProfession}
          </p>
        )}
      </div>

      {/* ════ BODY ═══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
        <div style={{
          width: 210, minWidth: 210, flexShrink: 0,
          padding: '16px 18px 24px 24px',
          boxSizing: 'border-box',
          borderRight: `1px solid ${RULE}`,
        }}>

          {/* PERSONAL INFO */}
          <SectionHead title="Personal Info" />
          <InfoRow label="Email"    value={personal.email} />
          <InfoRow label="Phone"    value={personal.phone} />
          <InfoRow label="Location" value={personal.location} />
          <InfoRow label="DOB"      value={personal.dob} />
          <InfoRow label="Website"  value={personal.website} />
          <InfoRow label="LinkedIn" value={personal.linkedin} />

          {/* SKILLS */}
          {displaySkills.length > 0 && (
            <>
              <SectionHead title="Skills" />
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {displaySkills.map((s, i) => (
                  <li key={i} style={{ fontSize: '9pt', color: BODY, lineHeight: 1.9 }}>
                    {'\u2022 '}{s}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* LANGUAGES */}
          {displayLanguages.length > 0 && (
            <>
              <SectionHead title="Languages" />
              {displayLanguages.map((l, i) => (
                <LanguageRow key={i} name={l.name} level={l.level} />
              ))}
            </>
          )}

          {/* EDUCATION */}
          {displayEdu.length > 0 && (
            <>
              <SectionHead title="Education" />
              {displayEdu.map((item, i) => (
                <EduEntry key={i} {...item} />
              ))}
            </>
          )}

        </div>

        {/* ── RIGHT MAIN ────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          padding: '16px 32px 24px 24px',
          boxSizing: 'border-box',
        }}>

          {/* PROFESSIONAL SUMMARY */}
          {displaySummary && (
            <>
              <SectionHead title="Professional Summary" />
              <p style={{
                margin: '0 0 4px',
                fontSize: '9.5pt',
                color: BODY,
                lineHeight: 1.7,
              }}>
                {displaySummary}
              </p>
            </>
          )}

          {/* WORK EXPERIENCE */}
          {displayExp.length > 0 && (
            <>
              <SectionHead title="Work Experience" />
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

        </div>
      </div>
    </div>
  )
}


