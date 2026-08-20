import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { FaLinkedin, FaGlobe } from 'react-icons/fa'

const A = { sidebar: '#2e4057', accent: '#2e4057', divider: '#e0e0e0', text: '#222', muted: '#555', sideText: '#e8eaf0' }

const SideLabel = ({ title }) => (
  <div style={{ margin: '14px 0 5px' }}>
    <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#a8bcc8', margin: 0 }}>{title}</p>
    <div style={{ height: 1, background: '#4a6070', marginTop: 3 }} />
  </div>
)

const RightHead = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 6px' }}>
    <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: A.accent, margin: 0 }}>{title}</p>
    <div style={{ flex: 1, height: 1.5, background: A.accent }} />
  </div>
)

export default function TemplateBrian() {
  const ctx = useResume()
  const d   = buildResumeData(ctx)
  const p   = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName)
  const firstName = hasProfile ? (p.firstName || 'Alex') : 'Alex'
  const lastName  = hasProfile ? (p.lastName  || 'Johnson') : 'Johnson'

  const experiences = ctx?.experiences?.length > 0
    ? ctx.experiences.map(e => ({
        role:    e.jobTitle || e.role || '',
        company: e.employer === 'Other' ? (e.employerOther || '') : (e.employer || e.company || ''),
        period:  e.startDate ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}` : (e.period || ''),
        points:  e.points || (e.description ? [e.description] : []),
      }))
    : d.expList

  return (
    <div style={{ width: 794, minHeight: 1123, display: 'flex', fontFamily: "'Segoe UI', Arial, sans-serif", background: '#fff', color: A.text }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 230, background: A.sidebar, padding: '28px 16px', color: A.sideText, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Photo */}
        {d.photo && (
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <img src={d.photo} alt="profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #4a6070' }} />
          </div>
        )}

        {/* Name on sidebar */}
        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 2px', lineHeight: 1.2 }}>{firstName} {lastName}</p>
        <p style={{ fontSize: '0.65rem', color: '#a8bcc8', margin: '0 0 12px' }}>{d.title}</p>

        <SideLabel title="Contact" />
        {[
          { icon: <MdEmail size={10} />, val: d.email },
          { icon: <MdPhone size={10} />, val: d.phone },
          { icon: <MdLocationOn size={10} />, val: d.location },
          { icon: <FaLinkedin size={9} />, val: d.linkedin },
          { icon: <FaGlobe size={9} />, val: d.github },
        ].filter(x => x.val).map(({ icon, val }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 4 }}>
            <span style={{ color: '#a8bcc8', flexShrink: 0, marginTop: 2 }}>{icon}</span>
            <span style={{ fontSize: '0.58rem', color: '#cdd8e0', lineHeight: 1.5, wordBreak: 'break-all' }}>{val}</span>
          </div>
        ))}

        <SideLabel title="Profile" />
        <p style={{ fontSize: '0.6rem', color: '#cdd8e0', lineHeight: 1.7, margin: 0 }}>{d.summary}</p>

        <SideLabel title="Languages" />
        {d.languages?.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.6rem', color: '#cdd8e0' }}>{l}</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(dot => (
                <div key={dot} style={{ width: 7, height: 7, borderRadius: '50%', background: dot <= 4 ? '#7eb8d0' : '#4a6070' }} />
              ))}
            </div>
          </div>
        ))}

        <SideLabel title="Awards" />
        {d.certifications?.slice(0, 3).map((c, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <p style={{ fontSize: '0.6rem', color: '#cdd8e0', fontWeight: 600, margin: 0 }}>{c}</p>
          </div>
        ))}
      </div>

      {/* ── RIGHT CONTENT ── */}
      <div style={{ flex: 1, padding: '28px 24px' }}>

        {/* Work Experience */}
        <RightHead title="Work Experience" />
        {experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: 0, color: A.text }}>{e.role}</p>
              <span style={{ fontSize: '0.6rem', color: A.muted, whiteSpace: 'nowrap', marginLeft: 8 }}>{e.period}</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: A.accent, fontWeight: 600, margin: '1px 0 4px' }}>{e.company}</p>
            {(e.points || []).map((pt, j) => (
              <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                <span style={{ color: A.accent, fontSize: '0.62rem', flexShrink: 0 }}>•</span>
                <p style={{ fontSize: '0.62rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{pt}</p>
              </div>
            ))}
          </div>
        ))}

        {/* Education */}
        <RightHead title="Education" />
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: 0 }}>{e.degree}</p>
              <span style={{ fontSize: '0.6rem', color: A.muted }}>{e.period}</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: A.accent, fontWeight: 600, margin: '1px 0' }}>{e.institution}</p>
            {e.score && <p style={{ fontSize: '0.6rem', color: A.muted, margin: 0 }}>{e.score}</p>}
          </div>
        ))}

        {/* Skills */}
        <RightHead title="Skills" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
          {d.skills?.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <span style={{ color: A.accent, fontSize: '0.65rem' }}>•</span>
              <span style={{ fontSize: '0.63rem', color: '#374151' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Projects */}
        {d.projects?.length > 0 && (
          <>
            <RightHead title="Projects" />
            {d.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: '0 0 2px' }}>{p.name} <span style={{ fontWeight: 400, color: A.accent, fontStyle: 'italic', fontSize: '0.62rem' }}>— {p.tech}</span></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px' }}>
                  {p.points.map((pt, j) => (
                    <span key={j} style={{ fontSize: '0.6rem', color: '#374151' }}>• {pt}</span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
