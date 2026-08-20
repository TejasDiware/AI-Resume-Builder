import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'

const C = { header: '#111827', accent: '#f59e0b' }
const SH = ({ title }) => (
  <div style={{ marginTop: 10 }}>
    <p style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.accent, margin: 0 }}>{title}</p>
    <div style={{ height: 2, background: C.accent, margin: '2px 0 5px' }} />
  </div>
)

export default function CleanBlack() {
  const d = buildResumeData(useResume())
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#fff', minHeight: 1100 }}>
      <div style={{ background: C.header, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <img src={d.photo} alt={d.name} style={{ width: 70, height: 70, borderRadius: '50%', border: '3px solid #374151', objectFit: 'cover', flexShrink: 0 }} />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase' }}>{d.name}</h1>
          <p style={{ fontSize: '0.8rem', color: C.accent, fontWeight: 600, margin: '2px 0' }}>{d.title}</p>
          <p style={{ fontSize: '0.6rem', color: '#9ca3af', margin: 0 }}>{d.email} · {d.phone} · {d.location}</p>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 195, background: '#f9fafb', padding: '18px 14px', borderRight: '1px solid #e5e7eb' }}>
          {[['Skills', d.skills], ['Tools', d.tools], ['Languages', d.languages], ['Soft Skills', d.softSkills]].map(([label, items]) => (
            <div key={label}>
              <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: C.header, margin: '10px 0 2px' }}>{label}</p>
              <div style={{ height: 1, background: '#e5e7eb', marginBottom: 4 }} />
              {(items || []).map(it => <p key={it} style={{ fontSize: '0.6rem', color: '#374151', margin: '2px 0' }}>• {it}</p>)}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '18px 22px' }}>
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
    </div>
  )
}
