import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'

const NAVY = '#1a2340'
const BLUE = '#3b5bdb'

const SideSection = ({ title, children }) => (
  <div style={{ marginBottom: 16 }}>
    <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff', margin: '0 0 4px' }}>{title}</p>
    <div style={{ height: 1.5, background: '#3b5bdb', marginBottom: 8 }} />
    {children}
  </div>
)

const RightSection = ({ title }) => (
  <div style={{ margin: '16px 0 8px' }}>
    <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: NAVY, margin: 0 }}>{title}</p>
    <div style={{ height: 2.5, background: NAVY, marginTop: 3 }} />
  </div>
)

export default function TemplateNavy() {
  const ctx = useResume()
  const d   = buildResumeData(ctx)
  const p   = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName)
  const firstName = hasProfile ? (p.firstName || 'Your') : 'Your'
  const lastName  = hasProfile ? (p.lastName  || 'Name') : 'Name'

  const experiences = ctx?.experiences?.length > 0
    ? ctx.experiences.map(e => ({
        role:    e.jobTitle || e.role || '',
        company: e.employer === 'Other' ? (e.employerOther || '') : (e.employer || e.company || ''),
        period:  e.startDate ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}` : (e.period || ''),
        points:  e.points || (e.description ? [e.description] : []),
      }))
    : d.expList

  return (
    <div style={{ width: 794, minHeight: 1123, display: 'flex', fontFamily: "'Segoe UI', Arial, sans-serif", background: '#fff' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 240, background: NAVY, padding: '0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Photo + Name area */}
        <div style={{ background: NAVY, padding: '28px 16px 20px', textAlign: 'center' }}>
          {d.photo ? (
            <img src={d.photo} alt="profile" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b5bdb', marginBottom: 10 }} />
          ) : (
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#2c3e6a', border: '3px solid #3b5bdb', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', color: '#7b8ec8' }}>👤</span>
            </div>
          )}
          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>{firstName} {lastName}</p>
          <p style={{ fontSize: '0.65rem', color: BLUE, fontWeight: 600, letterSpacing: 1, margin: 0 }}>{d.title}</p>
        </div>

        <div style={{ padding: '16px', flex: 1 }}>
          <SideSection title="Contact">
            {[
              { icon: <MdPhone size={11} />, val: d.phone },
              { icon: <MdEmail size={11} />, val: d.email },
              { icon: <MdLocationOn size={11} />, val: d.location },
            ].filter(x => x.val).map(({ icon, val }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                <span style={{ color: BLUE, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <span style={{ fontSize: '0.6rem', color: '#b0bec5', lineHeight: 1.5, wordBreak: 'break-all' }}>{val}</span>
              </div>
            ))}
          </SideSection>

          <SideSection title="Skills">
            {d.skills?.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ color: BLUE, fontSize: '0.7rem' }}>○</span>
                <span style={{ fontSize: '0.62rem', color: '#b0bec5' }}>{s}</span>
              </div>
            ))}
          </SideSection>

          <SideSection title="Languages">
            {d.languages?.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.62rem', color: '#b0bec5' }}>{l}</span>
                <span style={{ fontSize: '0.6rem', color: BLUE }}>Proficient</span>
              </div>
            ))}
          </SideSection>

          <SideSection title="Hobbies">
            {d.interests?.slice(0, 4).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: BLUE, fontSize: '0.7rem' }}>○</span>
                <span style={{ fontSize: '0.62rem', color: '#b0bec5' }}>{h}</span>
              </div>
            ))}
          </SideSection>
        </div>
      </div>

      {/* ── RIGHT CONTENT ── */}
      <div style={{ flex: 1, padding: '28px 24px' }}>

        <RightSection title="Profile" />
        <p style={{ fontSize: '0.67rem', color: '#374151', lineHeight: 1.8, textAlign: 'justify', margin: '0 0 4px' }}>{d.summary}</p>

        <RightSection title="Work Experience" />
        {experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: 0, color: NAVY }}>{e.role}</p>
              <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{e.period}</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: BLUE, fontWeight: 600, margin: '2px 0 4px' }}>{e.company}</p>
            {(e.points || []).map((pt, j) => (
              <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                <span style={{ color: NAVY, fontSize: '0.65rem', flexShrink: 0 }}>•</span>
                <p style={{ fontSize: '0.63rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>{pt}</p>
              </div>
            ))}
          </div>
        ))}

        <RightSection title="Education" />
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: 0, color: NAVY }}>{e.degree}</p>
            <p style={{ fontSize: '0.65rem', color: BLUE, fontStyle: 'italic', margin: '1px 0' }}>{e.institution}</p>
            <p style={{ fontSize: '0.6rem', color: '#6b7280', margin: 0 }}>{e.period}</p>
          </div>
        ))}

        {d.projects?.length > 0 && (
          <>
            <RightSection title="Projects" />
            {d.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: '0 0 2px', color: NAVY }}>{proj.name}</p>
                <p style={{ fontSize: '0.62rem', color: BLUE, fontStyle: 'italic', margin: '0 0 3px' }}>{proj.tech}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
                  {proj.points.map((pt, j) => <span key={j} style={{ fontSize: '0.6rem', color: '#374151' }}>• {pt}</span>)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
