/**
 * Template 3 – Steven Terry (Pink Accent)
 * Left column: photo, contact, objective, skills, interests
 * Right column: pink ribbon section headers, education, work experience, activities, honors, references
 * A4: 794 × 1123 px
 */
import { useResume } from '../../../context/ResumeContext'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
function formatMonthYear(d) {
  if (!d) return ''
  const m = String(d)
  const mMatch = m.match(/^(\d{4})-(\d{2})/)
  if (mMatch) {
    const year = mMatch[1]
    const month = parseInt(mMatch[2], 10) - 1
    return `${MONTHS[month] || mMatch[2]} ${year}`
  }
  return d
}

const PINK   = '#e8837a'
const DARK   = '#2d2d2d'

function RibbonHeader({ icon, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: PINK, color: '#fff',
      padding: '5px 12px', borderRadius: '0 20px 20px 0',
      marginBottom: 8, marginLeft: -24,
      width: 'calc(100% + 24px)',
    }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', margin: 0 }}>{title}</p>
    </div>
  )
}

function LeftLabel({ icon, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: PINK, color: '#fff',
      padding: '4px 10px', borderRadius: 4,
      marginBottom: 7, fontSize: 10, fontWeight: 700,
    }}>
      <span>{icon}</span> {children}
    </div>
  )
}

export default function Template3StevenTerry() {
  const ctx = useResume()

  const p      = ctx?.profileData || {}
  const name   = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Steven Terry'
  const title  = p.profession || 'Sales Staff'
  const email  = p.email || 'Steven@3223.com'
  const phone  = p.phone || '986-2323-3434'
  const city   = [p.city, p.state].filter(Boolean).join(', ') || 'London, England'
  const dob    = p.dob || 'May 19, 1992'
  const gender = p.gender || 'Male'

  const summary        = ctx?.summary        || 'Take advantages of sales skills & experience and understanding of market to become a professional Sales Staff.'
  const experiences    = ctx?.experiences    || []
  const education      = ctx?.education      || []
  const skills         = ctx?.skills         || []
  const websites       = ctx?.websites       || {}
  const projects       = ctx?.projects       || []
  const certifications = ctx?.certifications || []
  const achievements   = ctx?.achievements   || []
  const ctxLanguages   = ctx?.languages      || []
  const interests      = ctx?.interests      || []
  const hobbies        = ctx?.hobbies        || []
  const references     = ctx?.references     || []

  const webLinks = [
    websites.linkedin  && websites.linkedin,
    websites.github    && websites.github,
    websites.portfolio && websites.portfolio,
    websites.other     && websites.other,
  ].filter(Boolean)

  return (
    <div style={{
      width: 794, minHeight: 1123, display: 'flex',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: '#fff', fontSize: 11,
    }}>
      {/* ── LEFT ── */}
      <div style={{ width: 230, height: 1123, minHeight: 1123, background: '#fafafa', borderRight: '1px solid #f3f4f6', padding: '28px 18px', flexShrink: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {/* Photo */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: '#e0d0cc', border: `4px solid ${PINK}`,
          margin: '0 auto 14px', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {p.photo
            ? <img src={p.photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <svg width="55" height="55" viewBox="0 0 55 55" fill="none">
                <circle cx="27" cy="20" r="13" fill="rgba(0,0,0,0.2)" />
                <ellipse cx="27" cy="48" rx="20" ry="13" fill="rgba(0,0,0,0.2)" />
              </svg>
          }
        </div>
        <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, color: DARK, margin: '0 0 2px' }}>{name}</p>
        <p style={{ textAlign: 'center', fontSize: 9.5, color: PINK, fontWeight: 600, margin: '0 0 16px' }}>{title}</p>

        {/* Contact section */}
        <LeftLabel icon="📋">Contacts</LeftLabel>
        {[
          { icon: '♂', val: gender }, { icon: '🎂', val: dob },
          { icon: '📞', val: phone }, { icon: '✉', val: email },
          { icon: '🌐', val: 'Http://steven-info.me' },
          { icon: '📍', val: city },
        ].map(({ icon, val }) => (
          <div key={val} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 9, marginTop: 1 }}>{icon}</span>
            <span style={{ fontSize: 9.5, color: '#4b5563', lineHeight: 1.4, wordBreak: 'break-word' }}>{val}</span>
          </div>
        ))}

        {/* Objective */}
        <div style={{ marginTop: 14 }}>
          <LeftLabel icon="🎯">Objective</LeftLabel>
          <p style={{ fontSize: 9.5, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </div>

        {/* Skills */}
        <div style={{ marginTop: 14 }}>
          <LeftLabel icon="✏">Skills</LeftLabel>
          <p style={{ fontSize: 9.5, color: '#4b5563', margin: '0 0 3px' }}>
            <strong>Language:</strong> {skills.length ? skills.map(s => s.name || s).slice(0, 3).join(', ') : 'English, Japanese, Chinese'}
          </p>
          <p style={{ fontSize: 9.5, color: '#4b5563', margin: 0 }}>
            <strong>Computer:</strong> Word, Excel, Powerpoint
          </p>
        </div>

        {/* Interests */}
        <div style={{ marginTop: 14 }}>
          <LeftLabel icon="♡">Interests</LeftLabel>
          <p style={{ fontSize: 9.5, color: '#4b5563', margin: 0 }}>I like soccer, music.</p>
        </div>

        {/* Languages from context */}
        {ctxLanguages.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <LeftLabel icon="🌐">Languages</LeftLabel>
            {ctxLanguages.map((l, i) => (
              <p key={i} style={{ fontSize: 9.5, color: '#4b5563', margin: '0 0 3px' }}>
                • {typeof l === 'string' ? l : l.name}
              </p>
            ))}
          </div>
        )}

        {/* Certifications from context */}
        {certifications.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <LeftLabel icon="🏅">Certifications</LeftLabel>
            {certifications.map((c, i) => (
              <p key={i} style={{ fontSize: 9.5, color: '#4b5563', margin: '0 0 3px' }}>
                • {typeof c === 'string' ? c : [c.name, c.issuer, c.year].filter(Boolean).join(' – ')}
              </p>
            ))}
          </div>
        )}

        {/* Achievements from context */}
        {achievements.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <LeftLabel icon="🏆">Achievements</LeftLabel>
            {achievements.map((a, i) => (
              <p key={i} style={{ fontSize: 9.5, color: '#4b5563', margin: '0 0 3px' }}>
                • {typeof a === 'string' ? a : a.text}
              </p>
            ))}
          </div>
        )}

        {/* Hobbies from context */}
        {hobbies.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <LeftLabel icon="♡">Hobbies</LeftLabel>
            {hobbies.map((h, i) => (
              <p key={i} style={{ fontSize: 9.5, color: '#4b5563', margin: '0 0 3px' }}>• {h}</p>
            ))}
          </div>
        )}

        {/* Interests from context */}
        {interests.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <LeftLabel icon="⭐">Interests</LeftLabel>
            {interests.map((item, i) => (
              <p key={i} style={{ fontSize: 9.5, color: '#4b5563', margin: '0 0 3px' }}>• {item}</p>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT ── */}
      <div style={{ flex: 1, padding: '28px 24px', minHeight: '100%', boxSizing: 'border-box' }}>

        {/* Education */}
        <div style={{ marginBottom: 16 }}>
          <RibbonHeader icon="🎓" title="Education" />
          {(education.length ? education : [
            { degree: 'Corporate Administration', institution: 'TOPCV University', startYear: 'Oct 2010', endYear: 'May 2014', score: 'GPA: 3.6/4' },
            { degree: 'Corporate Administration', institution: 'TOPCV University', startYear: 'Oct 2010', endYear: 'May 2014', score: 'GPA: 3.6/4' },
          ]).map((edu, i) => (
            <div key={i} style={{ marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid ${PINK}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p style={{ fontWeight: 700, fontSize: 11, margin: '1px 0' }}>{edu.institution || edu.degree}</p>
                <p style={{ fontSize: 9, color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {[edu.startYear, edu.endYear].filter(Boolean).join(' - ')}
                </p>
              </div>
              <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0', fontStyle: 'italic' }}>
                {edu.degree}
                {(edu.cgpa || edu.score) ? ` | CGPA: ${edu.cgpa || edu.score}` : ''}
              </p>
            </div>
          ))}
        </div>

        {/* Work Experience */}
        <div style={{ marginBottom: 16 }}>
          <RibbonHeader icon="💼" title="Work Experience" />
          {(experiences.length ? experiences : [
            { role: 'Sales Staff', company: 'TOPCV JSC', startDate: 'June 2014', endDate: 'Present', points: ['Write and upload product advertising post via Facebook, Forum...', 'Introduce, consult products and answer customers\' queries via phone and email.'] },
            { role: 'Part-time Sales Staff', company: 'TOPCV Shop', startDate: 'Nov 2013', endDate: 'Jun 2014', points: ['Sell goods for Foreigners and Vietnamese at the Shop', 'Advertise products on media publications such as: banner, posters,leaflets..', 'Makes of sales every day.'] },
          ]).map((exp, i) => (
            <div key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${PINK}` }}>
              <p style={{ fontSize: 9, color: '#9ca3af', margin: 0 }}>{formatMonthYear(exp.startDate)} - {exp.endDate ? formatMonthYear(exp.endDate) : 'Present'}</p>
              <p style={{ fontWeight: 700, fontSize: 11, margin: '1px 0' }}>{exp.company}</p>
              <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 4px' }}>{exp.role || exp.jobTitle}</p>
              {/* description string (from form) */}
              {exp.description && !(exp.points?.length) && (
                <p style={{ fontSize: 10, color: '#374151', margin: '1px 0', paddingLeft: 4 }}>- {exp.description}</p>
              )}
              {(exp.points || []).map((pt, j) => (
                <p key={j} style={{ fontSize: 10, color: '#374151', margin: '1px 0', paddingLeft: 4 }}>- {pt}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Activities */}
        <div style={{ marginBottom: 16 }}>
          <RibbonHeader icon="⚡" title="Activities" />
          <div style={{ paddingLeft: 10, borderLeft: `2px solid ${PINK}` }}>
            <p style={{ fontSize: 9, color: '#9ca3af', margin: 0 }}>Jan 2014 - Feb 2014</p>
            <p style={{ fontWeight: 700, fontSize: 11, margin: '1px 0' }}>TOPCV - EDUCATION TALK 2014,</p>
            <p style={{ fontSize: 9.5, color: '#4b5563', margin: 0 }}>Member of US Ambassador</p>
            <p style={{ fontSize: 9.5, color: '#374151', margin: '3px 0 1px' }}>- Organize monthly events, network with US alumni</p>
            <p style={{ fontSize: 9.5, color: '#374151', margin: '1px 0' }}>- Share how to hunt scholarships and US student&apos;s life experiences to all students who have received offers from US universities</p>
          </div>
        </div>

        {/* Honors & Awards */}
        <div style={{ marginBottom: 16 }}>
          <RibbonHeader icon="🏆" title="Honors & Awards" />
          <div style={{ paddingLeft: 10, borderLeft: `2px solid ${PINK}` }}>
            <p style={{ fontSize: 10, color: '#374151', margin: 0 }}>2013-2014: TOPCV Scholarship in 2nd semester 2012-2013 and 1st semester 2013-2014</p>
          </div>
        </div>

        {/* References */}
        <div>
          <RibbonHeader icon="👤" title="References" />
          <div style={{ paddingLeft: 10 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, margin: '0 0 1px' }}>Mr. Jack Harison – Director of TOPCV JSC</p>
            <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>Phone: 986-2323-3434</p>
          </div>
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <RibbonHeader icon="🗂️" title="Projects" />
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${PINK}` }}>
                <p style={{ fontWeight: 700, fontSize: 11, margin: '0 0 1px' }}>{proj.title}</p>
                {proj.role && <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 2px', fontStyle: 'italic' }}>{proj.role}</p>}
                {proj.technologies && <p style={{ fontSize: 9.5, color: PINK, margin: '0 0 3px', fontWeight: 600 }}>{proj.technologies}</p>}
                {proj.description && <p style={{ fontSize: 9.5, color: '#374151', margin: '1px 0' }}>• {proj.description}</p>}
                {proj.highlights && <p style={{ fontSize: 9.5, color: '#374151', margin: '1px 0' }}>• {proj.highlights}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Websites & Portfolio */}
        {webLinks.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <RibbonHeader icon="🔗" title="Websites & Portfolio" />
            <div style={{ paddingLeft: 10 }}>
              {webLinks.map((link, i) => (
                <p key={i} style={{ fontSize: 9.5, color: '#374151', margin: '0 0 4px' }}>
                  • {link.replace(/^https?:\/\//, '')}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <RibbonHeader icon="👤" title="References" />
            <div style={{ paddingLeft: 10 }}>
              {references.map((ref, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, margin: '0 0 1px' }}>{ref.name}</p>
                  {ref.title   && <p style={{ fontSize: 10, color: '#374151', margin: 0 }}>{ref.title}{ref.company ? ` – ${ref.company}` : ''}</p>}
                  {ref.phone   && <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{ref.phone}</p>}
                  {ref.email   && <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{ref.email}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
