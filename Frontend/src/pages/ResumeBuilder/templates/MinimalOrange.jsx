import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'

const C = { sidebar: '#ea580c', accent: '#f97316' }
const SH = ({ title }) => (
  <div style={{ marginTop: 10 }}>
    <p style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.accent, margin: 0 }}>{title}</p>
    <div style={{ height: 2, background: C.accent, margin: '2px 0 5px' }} />
  </div>
)

export default function MinimalOrange() {
  const d = buildResumeData(useResume())
  return (
    <div style={{ display: 'flex', minHeight: 1100, fontFamily: "'Segoe UI', sans-serif", background: '#fff' }}>
      <div style={{ width: 200, background: C.sidebar, padding: '28px 14px' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <img src={d.photo} alt={d.name} style={{ width: 78, height: 78, borderRadius: '50%', border: '3px solid #fed7aa', objectFit: 'cover' }} />
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', margin: '6px 0 2px' }}>{d.name}</p>
          <p style={{ fontSize: '0.62rem', color: '#ffedd5', margin: 0 }}>{d.title}</p>
        </div>
        {[['Contact', [d.email, d.phone, d.location, d.linkedin, d.github]], ['Skills', d.skills], ['Tools', d.tools], ['Languages', d.languages], ['Soft Skills', d.softSkills]].map(([label, items]) => (
          <div key={label}>
            <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#ffedd5', margin: '10px 0 2px' }}>{label}</p>
            <div style={{ height: 1, background: 'rgba(255,237,213,0.4)', marginBottom: 4 }} />
            {(items || []).filter(Boolean).map((it, i) => <p key={i} style={{ fontSize: '0.58rem', color: '#ffedd5', margin: '2px 0', wordBreak: 'break-all' }}>• {it}</p>)}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '28px 24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.sidebar, textTransform: 'uppercase', margin: '0 0 2px' }}>{d.name}</h1>
        <p style={{ fontSize: '0.82rem', color: C.accent, fontWeight: 600, margin: '0 0 6px' }}>{d.title}</p>
        <div style={{ height: 2, background: C.accent }} />
        <SH title="Profile" /><p style={{ fontSize: '0.68rem', color: '#374151', lineHeight: 1.7 }}>{d.summary}</p>
        <SH title="Experience" />
        {d.expList.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.73rem', fontWeight: 700, margin: 0 }}>{e.role}</p>
              <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{e.period}</span>
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
              <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{e.period}</span>
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
        <SH title="References" /><p style={{ fontSize: '0.67rem', color: '#6b7280', fontStyle: 'italic' }}>{d.references}</p>
      </div>
    </div>
  )
}
