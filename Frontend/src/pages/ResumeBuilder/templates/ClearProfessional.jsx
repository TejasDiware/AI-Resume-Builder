import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { FaLinkedin, FaGithub } from 'react-icons/fa'

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  sidebar:     '#f4f5f7',
  accent:      '#2b4ead',
  accentDark:  '#1a3399',
  divider:     '#d1d5db',
  text:        '#1f2937',
  muted:       '#6b7280',
  sideText:    '#374151',
  tag:         '#e8edf8',
  tagText:     '#2b4ead',
}

// ── Small helpers ─────────────────────────────────────────────────────────────
const Divider = () => (
  <div style={{ height: 1.5, background: C.accent, margin: '3px 0 7px' }} />
)

const SideSection = ({ title, children }) => (
  <div style={{ marginBottom: 16 }}>
    <p style={{
      fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '1.8px', color: C.accent, margin: '0 0 3px',
    }}>{title}</p>
    <div style={{ height: 1.5, background: C.accent, marginBottom: 7 }} />
    {children}
  </div>
)

const RightSection = ({ title, children }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{
      fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '1.8px', color: C.accent, margin: 0,
    }}>{title}</p>
    <Divider />
    {children}
  </div>
)

const Tag = ({ text }) => (
  <span style={{
    display: 'inline-block', background: C.tag, color: C.tagText,
    fontSize: '0.56rem', fontWeight: 600, padding: '2px 7px',
    borderRadius: 3, margin: '2px 3px 2px 0', letterSpacing: '0.3px',
  }}>{text}</span>
)

const ContactRow = ({ icon, value }) => {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
      <span style={{ color: C.accent, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: '0.58rem', color: C.sideText, lineHeight: 1.5, wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ClearProfessional() {
  const ctx = useResume()
  const d   = buildResumeData(ctx)

  const p          = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName)

  const firstName  = hasProfile ? (p.firstName  || 'Alex')     : 'Alex'
  const lastName   = hasProfile ? (p.lastName   || 'Johnson')  : 'Johnson'
  const profession = hasProfile ? (p.profession || d.title)    : d.title
  const photo      = d.photo || null

  const address = hasProfile
    ? [p.street, p.city, p.state].filter(Boolean).join(', ')
    : d.location

  const experiences = ctx?.experiences?.length > 0
    ? ctx.experiences.map(e => ({
        role:    e.jobTitle  || e.role    || '',
        company: e.employer === 'Other' ? (e.employerOther || '') : (e.employer || e.company || ''),
        period:  e.startDate
          ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}`
          : (e.period || ''),
        points:  e.points || (e.description ? [e.description] : []),
      }))
    : d.expList

  const education = d.education?.length > 0 ? d.education : []
  const skills    = d.skills?.length > 0    ? d.skills    : []

  return (
    <div style={{
      display: 'flex', minHeight: 1100,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: '#fff', color: C.text,
    }}>

      {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════════ */}
      <div style={{
        width: 220, minWidth: 220, background: C.sidebar,
        padding: '32px 16px', borderRight: `1px solid ${C.divider}`,
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Photo */}
        {photo && (
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <img
              src={photo}
              alt={`${firstName} ${lastName}`}
              style={{
                width: 88, height: 88, borderRadius: '50%',
                border: `3px solid ${C.accent}`,
                objectFit: 'cover', display: 'inline-block',
              }}
            />
          </div>
        )}

        {/* Contact */}
        <SideSection title="Contact">
          <ContactRow icon={<MdEmail size={11} />}      value={d.email} />
          <ContactRow icon={<MdPhone size={11} />}      value={d.phone} />
          <ContactRow icon={<MdLocationOn size={11} />} value={address} />
          <ContactRow icon={<FaLinkedin size={10} />}   value={d.linkedin} />
          <ContactRow icon={<FaGithub size={10} />}     value={d.github} />
        </SideSection>

        {/* Skills */}
        {skills.length > 0 && (
          <SideSection title="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {skills.map((s, i) => <Tag key={i} text={s} />)}
            </div>
          </SideSection>
        )}

        {/* Languages */}
        {d.languages?.length > 0 && (
          <SideSection title="Languages">
            {d.languages.map((l, i) => (
              <p key={i} style={{ fontSize: '0.6rem', color: C.sideText, margin: '2px 0', lineHeight: 1.6 }}>
                • {l}
              </p>
            ))}
          </SideSection>
        )}

        {/* Tools */}
        {d.tools?.length > 0 && (
          <SideSection title="Tools">
            {d.tools.map((t, i) => (
              <p key={i} style={{ fontSize: '0.6rem', color: C.sideText, margin: '2px 0', lineHeight: 1.6 }}>
                • {t}
              </p>
            ))}
          </SideSection>
        )}

        {/* Soft Skills */}
        {d.softSkills?.length > 0 && (
          <SideSection title="Soft Skills">
            {d.softSkills.map((s, i) => (
              <p key={i} style={{ fontSize: '0.6rem', color: C.sideText, margin: '2px 0', lineHeight: 1.6 }}>
                • {s}
              </p>
            ))}
          </SideSection>
        )}

      </div>

      {/* ══ RIGHT CONTENT ═════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, padding: '32px 28px' }}>

        {/* Name & title */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800, margin: 0,
            color: C.text, textTransform: 'uppercase', letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}>
            {firstName}{' '}
            <span style={{ color: C.accent }}>{lastName}</span>
          </h1>
          <p style={{
            fontSize: '0.8rem', fontWeight: 600, color: C.muted,
            margin: '4px 0 10px', textTransform: 'uppercase', letterSpacing: '1.5px',
          }}>
            {profession}
          </p>
          {/* Bold top bar */}
          <div style={{ height: 3, background: C.accent, width: '100%' }} />
        </div>

        {/* Profile summary */}
        {d.summary && (
          <RightSection title="Profile Summary">
            <p style={{ fontSize: '0.67rem', color: '#374151', lineHeight: 1.8, margin: 0 }}>
              {d.summary}
            </p>
          </RightSection>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <RightSection title="Work Experience">
            {experiences.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, color: C.text }}>
                    {e.role}
                  </p>
                  <span style={{
                    fontSize: '0.58rem', color: '#fff', background: C.accent,
                    borderRadius: 3, padding: '1px 7px', whiteSpace: 'nowrap', marginLeft: 8,
                    fontWeight: 600, flexShrink: 0,
                  }}>
                    {e.period}
                  </span>
                </div>
                <p style={{ fontSize: '0.67rem', fontWeight: 600, color: C.accent, margin: '2px 0 4px' }}>
                  {e.company}
                </p>
                {(e.points || []).map((pt, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                    <span style={{ color: C.accent, fontSize: '0.6rem', flexShrink: 0, marginTop: 2 }}>▸</span>
                    <p style={{ fontSize: '0.63rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{pt}</p>
                  </div>
                ))}
              </div>
            ))}
          </RightSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <RightSection title="Education">
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: '0.73rem', fontWeight: 700, margin: 0, color: C.text }}>
                    {e.degree}
                  </p>
                  <span style={{
                    fontSize: '0.58rem', color: '#fff', background: C.accent,
                    borderRadius: 3, padding: '1px 7px', whiteSpace: 'nowrap', marginLeft: 8,
                    fontWeight: 600, flexShrink: 0,
                  }}>
                    {e.period}
                  </span>
                </div>
                <p style={{ fontSize: '0.67rem', color: C.accent, fontWeight: 600, margin: '1px 0' }}>
                  {e.institution}
                </p>
                {e.score && (
                  <p style={{ fontSize: '0.6rem', color: C.muted, margin: 0 }}>{e.score}</p>
                )}
              </div>
            ))}
          </RightSection>
        )}

        {/* Projects */}
        {d.projects?.length > 0 && (
          <RightSection title="Projects">
            {d.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.73rem', fontWeight: 700, margin: 0 }}>{p.name}</p>
                  <span style={{ fontSize: '0.57rem', color: C.accent, fontStyle: 'italic' }}>{p.tech}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 3 }}>
                  {p.points.map((pt, j) => (
                    <div key={j} style={{ display: 'flex', gap: 5, width: '50%', marginBottom: 2 }}>
                      <span style={{ color: C.accent, fontSize: '0.6rem', flexShrink: 0, marginTop: 2 }}>▸</span>
                      <p style={{ fontSize: '0.62rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{pt}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </RightSection>
        )}

        {/* Certifications */}
        {d.certifications?.length > 0 && (
          <RightSection title="Certifications">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
              {d.certifications.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, width: '50%' }}>
                  <span style={{ color: C.accent, fontSize: '0.6rem', flexShrink: 0, marginTop: 2 }}>✓</span>
                  <p style={{ fontSize: '0.63rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{c}</p>
                </div>
              ))}
            </div>
          </RightSection>
        )}

        {/* References */}
        {d.references && (
          <RightSection title="References">
            <p style={{ fontSize: '0.63rem', color: C.muted, fontStyle: 'italic', margin: 0 }}>
              {d.references}
            </p>
          </RightSection>
        )}

      </div>
    </div>
  )
}
