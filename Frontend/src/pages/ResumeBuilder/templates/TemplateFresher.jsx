import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'
import { MdPhone, MdEmail, MdLocationOn } from 'react-icons/md'
import { FaLinkedin } from 'react-icons/fa'

const DARK = '#1e2a3a'
const YELLOW = '#f5c518'

const IconRow = ({ icon, val }) => {
  if (!val) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
      <span style={{ color: YELLOW, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: '0.6rem', color: '#ccc', lineHeight: 1.5, wordBreak: 'break-all' }}>{val}</span>
    </div>
  )
}

const SideHead = ({ title }) => (
  <div style={{ margin: '14px 0 6px' }}>
    <p style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: YELLOW, margin: 0 }}>{title}</p>
    <div style={{ height: 1.5, background: YELLOW, marginTop: 3 }} />
  </div>
)

const RightHead = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 6px' }}>
    <span style={{ fontSize: '1rem' }}>{icon}</span>
    <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: DARK, margin: 0 }}>{title}</p>
    <div style={{ flex: 1, height: 1.5, background: '#d1d5db' }} />
  </div>
)

export default function TemplateFresher() {
  const ctx = useResume()
  const d   = buildResumeData(ctx)
  const p   = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName)
  const fullName = hasProfile ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : d.name

  const experiences = ctx?.experiences?.length > 0
    ? ctx.experiences.map(e => ({
        role:    e.jobTitle || e.role || '',
        company: e.employer === 'Other' ? (e.employerOther || '') : (e.employer || e.company || ''),
        period:  e.startDate ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}` : (e.period || ''),
        points:  e.points || (e.description ? [e.description] : []),
      }))
    : d.expList

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Segoe UI', Arial, sans-serif", background: '#fff' }}>

      {/* ── TOP HEADER (yellow) ── */}
      <div style={{ background: YELLOW, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {d.photo ? (
          <img src={d.photo} alt="profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e0b800', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>👤</span>
          </div>
        )}
        <div>
          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: DARK, margin: 0, textTransform: 'uppercase', letterSpacing: -0.5 }}>[{fullName || 'YOUR FULL NAME'}]</p>
          <p style={{ fontSize: '0.72rem', color: DARK, fontWeight: 600, margin: '3px 0 0', letterSpacing: 1 }}>{d.title}</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'flex' }}>

        {/* Left sidebar */}
        <div style={{ width: 210, background: DARK, padding: '16px 14px', minHeight: 900 }}>
          <SideHead title="Contact" />
          <IconRow icon={<MdPhone size={10} />}    val={d.phone} />
          <IconRow icon={<MdEmail size={10} />}     val={d.email} />
          <IconRow icon={<MdLocationOn size={10} />} val={d.location} />
          <IconRow icon={<FaLinkedin size={9} />}   val={d.linkedin} />

          <SideHead title="Certifications" />
          {d.certifications?.map((c, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <p style={{ fontSize: '0.6rem', color: '#ccc', margin: 0 }}>• {c}</p>
            </div>
          ))}

          <SideHead title="Languages" />
          {d.languages?.map((l, i) => (
            <p key={i} style={{ fontSize: '0.62rem', color: '#ccc', margin: '0 0 4px' }}>• {l} (Fluent)</p>
          ))}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, padding: '16px 22px' }}>

          <RightHead icon="🎯" title="Career Objective" />
          <p style={{ fontSize: '0.67rem', color: '#374151', lineHeight: 1.8, textAlign: 'justify', margin: 0 }}>
            {d.summary || 'Motivated and detail-oriented professional seeking a position to apply skills and contribute to organizational growth.'}
          </p>

          <RightHead icon="💡" title="Key Skills" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <p style={{ fontSize: '0.65rem', color: '#374151', margin: '0 0 2px', fontWeight: 600 }}>Technical:</p>
            {d.skills?.slice(0, 7).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: DARK, fontSize: '0.65rem' }}>•</span>
                <span style={{ fontSize: '0.63rem', color: '#374151' }}>{s}</span>
              </div>
            ))}
            <p style={{ fontSize: '0.65rem', color: '#374151', margin: '6px 0 2px', fontWeight: 600 }}>Soft Skills:</p>
            {d.softSkills?.slice(0, 4).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: DARK, fontSize: '0.65rem' }}>•</span>
                <span style={{ fontSize: '0.63rem', color: '#374151' }}>{s}</span>
              </div>
            ))}
          </div>

          <RightHead icon="💼" title="Experience (Skip if Fresher)" />
          {experiences.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: 0, color: DARK }}>{e.role} — {e.company}</p>
                <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{e.period}</span>
              </div>
              {(e.points || []).map((pt, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                  <span style={{ color: DARK, fontSize: '0.65rem', flexShrink: 0 }}>•</span>
                  <p style={{ fontSize: '0.62rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{pt}</p>
                </div>
              ))}
            </div>
          ))}

          <RightHead icon="🎓" title="Education" />
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: 0, color: DARK }}>{e.degree}</p>
              <p style={{ fontSize: '0.65rem', color: '#6b7280', fontStyle: 'italic', margin: '1px 0' }}>{e.period} | {e.institution}</p>
              {e.score && <p style={{ fontSize: '0.6rem', color: '#374151', margin: 0 }}>{e.score}</p>}
            </div>
          ))}

          <RightHead icon="🗂️" title="Projects / Internships (For Freshers)" />
          {d.projects?.map((proj, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: '0 0 1px', color: DARK }}>{proj.name} — [{proj.tech}]</p>
              {proj.points.map((pt, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                  <span style={{ color: DARK, fontSize: '0.65rem', flexShrink: 0 }}>•</span>
                  <p style={{ fontSize: '0.62rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{pt}</p>
                </div>
              ))}
            </div>
          ))}

          <p style={{ fontSize: '0.55rem', color: '#9ca3af', textAlign: 'right', marginTop: 20 }}>© All rights reserved</p>
        </div>
      </div>
    </div>
  )
}
