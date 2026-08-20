import d from '../../../data/resumeData'
const C = { bg: '#111827', sidebar: '#1f2937', accent: '#f59e0b', light: '#fde68a' }
const SH = ({ title }) => (
  <div className="mb-1 mt-3">
    <p className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '1.8px', color: C.accent }}>{title}</p>
    <div style={{ height: 1, background: C.accent, marginTop: 3 }} />
  </div>
)
export default function CreativeResume() {
  return (
    <div style={{ display: 'flex', minHeight: 1100, fontFamily: "'Segoe UI', sans-serif", background: C.bg, color: '#e5e7eb' }}>
      <div style={{ width: 205, background: C.sidebar, padding: '28px 14px', display: 'flex', flexDirection: 'column' }}>
        <div className="d-flex justify-content-center mb-3">
          <img src={d.photo} alt={d.name} style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${C.accent}`, objectFit: 'cover' }} />
        </div>
        <p className="text-center fw-bold mb-0" style={{ fontSize: '0.82rem', color: C.light }}>{d.name}</p>
        <p className="text-center mb-3" style={{ fontSize: '0.62rem', color: '#9ca3af' }}>{d.title}</p>
        {[['Contact', [d.contact.email, d.contact.phone, d.contact.location, d.contact.linkedin, d.contact.github]], ['Skills', d.skills], ['Tools', d.tools], ['Languages', d.languages]].map(([label, items]) => (
          <div key={label}>
            <p className="fw-bold text-uppercase mb-1 mt-2" style={{ fontSize: '0.58rem', letterSpacing: 1.5, color: C.accent }}>{label}</p>
            <div style={{ height: 1, background: '#374151', marginBottom: 4 }} />
            {items.map((it, i) => (
              <div key={i} className="d-flex align-items-start gap-1 mb-1">
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.accent, flexShrink: 0, marginTop: 4 }} />
                <span style={{ fontSize: '0.58rem', color: '#9ca3af', lineHeight: 1.5, wordBreak: 'break-all' }}>{it}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '28px 24px' }}>
        <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: C.light, textTransform: 'uppercase' }}>{d.name}</h1>
        <p style={{ fontSize: '0.82rem', color: C.accent, fontWeight: 600 }}>{d.title}</p>
        <div style={{ height: 2, background: C.accent }} />
        <SH title="Profile" /><p style={{ fontSize: '0.68rem', color: '#9ca3af', lineHeight: 1.7 }}>{d.profile}</p>
        <SH title="Experience" />
        {d.experience.map((e, i) => (
          <div key={i} className="mb-3">
            <div className="d-flex justify-content-between"><p className="fw-bold mb-0" style={{ fontSize: '0.73rem', color: '#f3f4f6' }}>{e.role}</p><span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{e.period}</span></div>
            <p className="mb-1" style={{ fontSize: '0.65rem', color: C.accent, fontWeight: 600 }}>{e.company}</p>
            <ul className="mb-0 ps-3">{e.points.map((p, j) => <li key={j} style={{ fontSize: '0.63rem', color: '#9ca3af', lineHeight: 1.7 }}>{p}</li>)}</ul>
          </div>
        ))}
        <SH title="Education" />
        {d.education.map((e, i) => (
          <div key={i} className="mb-2">
            <div className="d-flex justify-content-between"><p className="fw-bold mb-0" style={{ fontSize: '0.72rem', color: '#f3f4f6' }}>{e.degree}</p><span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{e.period}</span></div>
            <p className="mb-0" style={{ fontSize: '0.65rem', color: C.accent, fontWeight: 600 }}>{e.institution}</p>
            <p className="mb-0" style={{ fontSize: '0.62rem', color: '#6b7280' }}>{e.score}</p>
          </div>
        ))}
        <SH title="Projects" />
        {d.projects.map((p, i) => (
          <div key={i} className="mb-2">
            <p className="fw-bold mb-0" style={{ fontSize: '0.72rem', color: '#f3f4f6' }}>{p.name}</p>
            <p className="mb-1" style={{ fontSize: '0.6rem', color: C.accent, fontStyle: 'italic' }}>{p.tech}</p>
            <ul className="mb-0 ps-3">{p.points.map((pt, j) => <li key={j} style={{ fontSize: '0.62rem', color: '#9ca3af', lineHeight: 1.7 }}>{pt}</li>)}</ul>
          </div>
        ))}
        <SH title="Certifications" />
        <ul className="ps-3 mb-0">{d.certifications.map((c, i) => <li key={i} style={{ fontSize: '0.64rem', color: '#9ca3af', lineHeight: 1.8 }}>{c}</li>)}</ul>
        <SH title="References" /><p style={{ fontSize: '0.67rem', color: '#6b7280', fontStyle: 'italic' }}>{d.references}</p>
      </div>
    </div>
  )
}
