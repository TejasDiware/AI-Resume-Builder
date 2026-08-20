import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'
import { MdEmail, MdPhone, MdLocationOn, MdOutlineLanguage } from 'react-icons/md'

const PINK = '#f4a7b9'
const DARK = '#2c2c2c'

const SideSection = ({ title, icon, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: PINK, padding: '4px 10px', borderRadius: 4, marginBottom: 6 }}>
      <span style={{ fontSize: '0.75rem' }}>{icon}</span>
      <p style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff', margin: 0 }}>{title}</p>
    </div>
    {children}
  </div>
)

const RibbonHead = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: PINK, padding: '5px 12px', borderRadius: 4, margin: '14px 0 8px' }}>
    <span style={{ fontSize: '0.85rem' }}>{icon}</span>
    <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff', margin: 0 }}>{title}</p>
  </div>
)

export default function TemplatePink() {
  const ctx = useResume()
  const d   = buildResumeData(ctx)
  const p   = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName)
  const firstName = hasProfile ? (p.firstName || 'Steven') : 'Steven'
  const lastName  = hasProfile ? (p.lastName  || 'Terry')  : 'Terry'

  const experiences = ctx?.experiences?.length > 0
    ? ctx.experiences.map(e => ({
        role:    e.jobTitle || e.role || '',
        company: e.employer === 'Other' ? (e.employerOther || '') : (e.employer || e.company || ''),
        period:  e.startDate ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}` : (e.period || ''),
        points:  e.points || (e.description ? [e.description] : []),
      }))
    : d.expList

  return (
    <div style={{ width: 794, minHeight: 1123, display: 'flex', fontFamily: "'Segoe UI', Arial, sans-serif", background: '#fff', color: DARK }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 220, background: '#f9f9f9', padding: '24px 14px', borderRight: '1px solid #f0f0f0', flexShrink: 0 }}>

        {/* Photo */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          {d.photo ? (
            <img src={d.photo} alt="profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${PINK}` }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e8e8e8', border: `3px solid ${PINK}`, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem' }}>👤</span>
            </div>
          )}
          <p style={{ fontWeight: 800, fontSize: '0.88rem', color: DARK, margin: '8px 0 2px' }}>{firstName} {lastName}</p>
          <p style={{ fontSize: '0.6rem', color: PINK, fontWeight: 600, margin: 0 }}>{d.title}</p>
        </div>

        <SideSection title="Contacts" icon="📋">
          {[
            { icon: <MdPhone size={10} />, val: d.phone },
            { icon: <MdEmail size={10} />, val: d.email },
            { icon: <MdLocationOn size={10} />, val: d.location },
            { icon: <MdOutlineLanguage size={10} />, val: d.github },
          ].filter(x => x.val).map(({ icon, val }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
              <span style={{ color: PINK, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <span style={{ fontSize: '0.58rem', color: '#555', lineHeight: 1.5, wordBreak: 'break-all' }}>{val}</span>
            </div>
          ))}
        </SideSection>

        <SideSection title="Objective" icon="🎯">
          <p style={{ fontSize: '0.6rem', color: '#555', lineHeight: 1.7, margin: 0 }}>{d.summary}</p>
        </SideSection>

        <SideSection title="Skills" icon="✏️">
          {d.skills?.slice(0, 6).map((s, i) => (
            <p key={i} style={{ fontSize: '0.6rem', color: '#555', margin: '0 0 3px' }}>• {s}</p>
          ))}
        </SideSection>

        <SideSection title="Interests" icon="⭐">
          {d.interests?.slice(0, 4).map((h, i) => (
            <p key={i} style={{ fontSize: '0.6rem', color: '#555', margin: '0 0 3px' }}>• {h}</p>
          ))}
        </SideSection>
      </div>

      {/* ── RIGHT CONTENT ── */}
      <div style={{ flex: 1, padding: '24px 20px' }}>

        <RibbonHead icon="🎓" title="Education" />
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 10, paddingLeft: 8, borderLeft: `3px solid ${PINK}` }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: 0, color: DARK }}>{e.degree}</p>
            <p style={{ fontSize: '0.65rem', color: PINK, fontStyle: 'italic', margin: '1px 0' }}>{e.institution}</p>
            <p style={{ fontSize: '0.6rem', color: '#6b7280', margin: 0 }}>{e.period}{e.score ? ` · ${e.score}` : ''}</p>
          </div>
        ))}

        <RibbonHead icon="💼" title="Work Experience" />
        {experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: 12, paddingLeft: 8, borderLeft: `3px solid ${PINK}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: 0, color: DARK }}>{e.role}</p>
              <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{e.period}</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: PINK, fontStyle: 'italic', margin: '1px 0 4px' }}>{e.company}</p>
            {(e.points || []).map((pt, j) => (
              <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                <span style={{ color: PINK, fontSize: '0.65rem', flexShrink: 0 }}>-</span>
                <p style={{ fontSize: '0.62rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>{pt}</p>
              </div>
            ))}
          </div>
        ))}

        <RibbonHead icon="🏅" title="Honors & Awards" />
        <div style={{ paddingLeft: 8, borderLeft: `3px solid ${PINK}` }}>
          {d.certifications?.map((c, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <p style={{ fontSize: '0.67rem', fontWeight: 600, margin: 0, color: DARK }}>{c}</p>
            </div>
          ))}
        </div>

        <RibbonHead icon="📎" title="References" />
        <div style={{ paddingLeft: 8, borderLeft: `3px solid ${PINK}` }}>
          <p style={{ fontSize: '0.65rem', color: '#6b7280', fontStyle: 'italic', margin: 0 }}>{d.references}</p>
        </div>
      </div>
    </div>
  )
}
