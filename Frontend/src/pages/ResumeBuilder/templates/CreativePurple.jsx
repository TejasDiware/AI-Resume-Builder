import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'

const C = { header: '#6d28d9', accent: '#7c3aed', light: '#ddd6fe', sidebar: '#f5f3ff' }
const SH = ({ title }) => (
  <div style={{ marginTop: 10 }}>
    <p style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.accent, margin: 0 }}>{title}</p>
    <div style={{ height: 1.5, background: C.accent, margin: '2px 0 5px' }} />
  </div>
)

export default function CreativePurple() {
  const d = buildResumeData(useResume())
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#fff', minHeight: 1100 }}>
      {/* Header */}
      <div style={{ background: C.header, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <img src={d.photo} alt={d.name} style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid #c4b5fd', objectFit: 'cover', flexShrink: 0 }} />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase' }}>{d.name}</h1>
          <p style={{ fontSize: '0.82rem', color: '#ddd6fe', fontWeight: 600, margin: '2px 0' }}>{d.title}</p>
          <p style={{ fontSize: '0.6rem', color: '#e9d5ff', margin: 0 }}>{d.email} · {d.phone} · {d.location}</p>
        </div>
      </div>
      {/* Body */}
      <div style={{ display: 'flex' }}>
        {/* Left */}
        <div style={{ width: 200, background: C.sidebar, padding: '20px 14px' }}>
          {[['Skills', d.skills], ['Tools', d.tools], ['Languages', d.languages], ['Soft Skills', d.softSkills], ['Interests', d.interests || []]].map(([label, items]) => (
            <div key={label}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.accent, margin: '12px 0 3px' }}>{label}</p>
              <div style={{ height: 1, background: C.light, marginBottom: 4 }} />
              {(items || []).map(it => <p key={it} style={{ fontSize: '0.6rem', color: '#374151', margin: '2px 0' }}>• {it}</p>)}
            </div>
          ))}
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.accent, margin: '12px 0 3px' }}>Links</p>
          <div style={{ height: 1, background: C.light, marginBottom: 4 }} />
          <p style={{ fontSize: '0.58rem', color: '#374151', margin: '2px 0', wordBreak: 'break-all' }}>{d.linkedin}</p>
          <p style={{ fontSize: '0.58rem', color: '#374151', margin: '2px 0', wordBreak: 'break-all' }}>{d.github}</p>
        </div>
        {/* Right */}
        <div style={{ flex: 1, padding: '20px 22px' }}>
          <SH title="Profile" /><p style={{ fontSize: '0.68rem', color: '#374151', lineHeight: 1.7 }}>{d.summary}</p>
          <SH title="Experience" />
          {d.expList.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.73rem', fontWeight: 700, margin: 0 }}>{e.role}</p>
                <p style={{ fontSize: '0.6rem', color: '#9ca3af', margin: 0 }}>{e.period}</p>
              </div>
              <p style={{ fontSize: '0.65rem', color: C.accent, fontWeight: 600, margin: '1px 0 3px' }}>{e.company}</p>
              {e.points.map((p, j) => <p key={j} style={{ fontSize: '0.63rem', color: '#374151', margin: '1px 0', paddingLeft: 8 }}>• {p}</p>)}
            </div>
          ))}
          <SH title="Education" />
          {d.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>{e.degree}</p>
                <p style={{ fontSize: '0.6rem', color: '#9ca3af', margin: 0 }}>{e.period}</p>
              </div>
              <p style={{ fontSize: '0.65rem', color: C.accent, fontWeight: 600, margin: '1px 0' }}>{e.institution}</p>
              <p style={{ fontSize: '0.62rem', color: '#6b7280', margin: 0 }}>{e.score}</p>
            </div>
          ))}
          <SH title="Projects" />
          {d.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>{p.name}</p>
              <p style={{ fontSize: '0.6rem', color: C.accent, fontStyle: 'italic', margin: '1px 0' }}>{p.tech}</p>
              {p.points.map((pt, j) => <p key={j} style={{ fontSize: '0.62rem', color: '#374151', margin: '1px 0', paddingLeft: 8 }}>• {pt}</p>)}
            </div>
          ))}
          <SH title="Certifications" />
          {d.certifications.map((c, i) => <p key={i} style={{ fontSize: '0.64rem', color: '#374151', margin: '2px 0' }}>• {c}</p>)}
        </div>
      </div>
    </div>
  )
}
