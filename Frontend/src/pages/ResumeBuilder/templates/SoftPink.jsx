import d from '../../../data/resumeData'
const C = { header: '#f9a8d4', accent: '#ec4899', sidebar: '#fdf2f8', light: '#fce7f3' }
const SH = ({ title }) => (
  <div className="mb-1 mt-3">
    <p className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '1.8px', color: C.accent }}>{title}</p>
    <div style={{ height: 2, background: C.accent, marginTop: 3 }} />
  </div>
)
export default function SoftPink() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#fff', minHeight: 1100 }}>
      <div style={{ background: C.header, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <img src={d.photo} alt={d.name} style={{ width: 70, height: 70, borderRadius: '50%', border: '3px solid #fff', objectFit: 'cover', flexShrink: 0 }} />
        <div>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#831843', textTransform: 'uppercase' }}>{d.name}</h1>
          <p style={{ fontSize: '0.82rem', color: '#be185d', fontWeight: 600, margin: 0 }}>{d.title}</p>
          <p style={{ fontSize: '0.6rem', color: '#9d174d', margin: 0, marginTop: 2 }}>{d.contact.email} · {d.contact.phone} · {d.contact.location}</p>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 195, background: C.sidebar, padding: '18px 14px' }}>
          {[['Skills', d.skills], ['Tools', d.tools], ['Languages', d.languages], ['Soft Skills', d.softSkills], ['Interests', d.interests]].map(([label, items]) => (
            <div key={label}>
              <p className="fw-bold text-uppercase mb-1 mt-3" style={{ fontSize: '0.58rem', letterSpacing: 1.5, color: C.accent }}>{label}</p>
              <div style={{ height: 1, background: C.light, marginBottom: 4 }} />
              {items.map(it => (
                <div key={it} className="d-flex align-items-center gap-1 mb-1">
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.6rem', color: '#374151' }}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '18px 22px' }}>
          <SH title="Profile" /><p style={{ fontSize: '0.68rem', color: '#374151', lineHeight: 1.7 }}>{d.profile}</p>
          <SH title="Experience" />
          {d.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="d-flex justify-content-between"><p className="fw-bold mb-0" style={{ fontSize: '0.73rem' }}>{e.role}</p><span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{e.period}</span></div>
              <p className="mb-1" style={{ fontSize: '0.65rem', color: C.accent, fontWeight: 600 }}>{e.company}</p>
              <ul className="mb-0 ps-3">{e.points.map((p, j) => <li key={j} style={{ fontSize: '0.63rem', color: '#374151', lineHeight: 1.7 }}>{p}</li>)}</ul>
            </div>
          ))}
          <SH title="Education" />
          {d.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="d-flex justify-content-between"><p className="fw-bold mb-0" style={{ fontSize: '0.72rem' }}>{e.degree}</p><span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{e.period}</span></div>
              <p className="mb-0" style={{ fontSize: '0.65rem', color: C.accent, fontWeight: 600 }}>{e.institution}</p>
              <p className="mb-0" style={{ fontSize: '0.62rem', color: '#6b7280' }}>{e.score}</p>
            </div>
          ))}
          <SH title="Projects" />
          {d.projects.map((p, i) => (
            <div key={i} className="mb-2">
              <p className="fw-bold mb-0" style={{ fontSize: '0.72rem' }}>{p.name}</p>
              <p className="mb-1" style={{ fontSize: '0.6rem', color: C.accent, fontStyle: 'italic' }}>{p.tech}</p>
              <ul className="mb-0 ps-3">{p.points.map((pt, j) => <li key={j} style={{ fontSize: '0.62rem', color: '#374151', lineHeight: 1.7 }}>{pt}</li>)}</ul>
            </div>
          ))}
          <SH title="Certifications" />
          <ul className="ps-3 mb-0">{d.certifications.map((c, i) => <li key={i} style={{ fontSize: '0.64rem', color: '#374151', lineHeight: 1.8 }}>{c}</li>)}</ul>
          <SH title="References" /><p style={{ fontSize: '0.67rem', color: '#6b7280', fontStyle: 'italic' }}>{d.references}</p>
        </div>
      </div>
    </div>
  )
}
