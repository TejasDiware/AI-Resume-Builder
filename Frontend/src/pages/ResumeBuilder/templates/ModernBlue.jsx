import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { useResume } from '../../../context/ResumeContext'
import staticData from '../../../data/resumeData'

const C = { sidebar: '#1e3a5f', accent: '#4f80c8', accentLight: '#93c5fd', text: '#cbd5e1' }

const LeftLabel = ({ title }) => (
  <div className="mb-1 mt-3">
    <p className="fw-bold text-uppercase mb-0" style={{ fontSize: '0.58rem', letterSpacing: '1.5px', color: C.accentLight }}>{title}</p>
    <div style={{ height: 1, background: '#2d5a8e', marginTop: 2 }} />
  </div>
)
const Bullet = ({ text }) => (
  <div className="d-flex align-items-start gap-1 mb-1">
    <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.accentLight, flexShrink: 0, marginTop: 4 }} />
    <span style={{ fontSize: '0.6rem', color: C.text, lineHeight: 1.5 }}>{text}</span>
  </div>
)
const SectionHead = ({ title }) => (
  <div className="mb-1 mt-3">
    <p className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '1.8px', color: C.sidebar }}>{title}</p>
    <div style={{ height: 2, background: C.sidebar, marginTop: 3 }} />
  </div>
)

export default function ModernBlue() {
  const ctx = useResume()

  // Merge: context data takes priority, fallback to static
  const p = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName || p.email)

  const name     = hasProfile ? `${p.firstName} ${p.middleName || ''} ${p.lastName}`.trim() : staticData.name
  const title    = hasProfile ? (p.profession || staticData.title) : staticData.title
  const email    = hasProfile ? p.email    : staticData.contact.email
  const phone    = hasProfile ? p.phone    : staticData.contact.phone
  const location = hasProfile ? `${p.city}${p.state ? ', ' + p.state : ''}${p.nationality ? ', ' + p.nationality : ''}`.replace(/^, |, $/g,'') : staticData.contact.location

  const experiences = (ctx?.experiences?.length > 0) ? ctx.experiences : staticData.experience
  const skills      = (ctx?.skills?.length > 0)      ? ctx.skills       : staticData.skills
  const summary     = ctx?.summary || staticData.profile
  const photo       = ctx?.profileData?.photo || null

  return (
    <div style={{ display: 'flex', minHeight: 1100, fontFamily: "'Segoe UI', sans-serif", background: '#fff' }}>
      {/* Left sidebar */}
      <div style={{ width: 210, minWidth: 210, background: C.sidebar, color: '#fff', padding: '28px 14px', display: 'flex', flexDirection: 'column' }}>
        <div className="d-flex justify-content-center mb-3">
          {photo && <img src={photo} alt={name} style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${C.accent}`, objectFit: 'cover' }} />}
        </div>

        <LeftLabel title="Contact" />
        {[
          { icon: <MdEmail size={10} />,      val: email },
          { icon: <MdPhone size={10} />,      val: phone },
          { icon: <MdLocationOn size={10} />, val: location },
          { icon: <FaLinkedin size={10} />,   val: staticData.contact.linkedin },
          { icon: <FaGithub size={10} />,     val: staticData.contact.github },
        ].map(({ icon, val }, i) => val ? (
          <div key={i} className="d-flex align-items-start gap-1 mb-1">
            <span style={{ color: C.accentLight, flexShrink: 0, marginTop: 2 }}>{icon}</span>
            <span style={{ fontSize: '0.58rem', color: C.text, wordBreak: 'break-all', lineHeight: 1.5 }}>{val}</span>
          </div>
        ) : null)}

        <LeftLabel title="Skills" />
        {skills.map(s => <Bullet key={s} text={s} />)}

        <LeftLabel title="Tools" />
        {staticData.tools.map(t => <Bullet key={t} text={t} />)}

        <LeftLabel title="Languages" />
        {staticData.languages.map(l => <Bullet key={l} text={l} />)}

        <LeftLabel title="Soft Skills" />
        {staticData.softSkills.map(s => <Bullet key={s} text={s} />)}
      </div>

      {/* Right content */}
      <div style={{ flex: 1, padding: '28px 24px' }}>
        <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: C.sidebar, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{name}</h1>
        <p style={{ fontSize: '0.82rem', color: C.accent, fontWeight: 600 }}>{title}</p>
        <div style={{ height: 2, background: C.sidebar, marginBottom: 4 }} />

        <SectionHead title="Profile" />
        <p style={{ fontSize: '0.68rem', color: '#374151', lineHeight: 1.7 }}>{summary}</p>

        <SectionHead title="Experience" />
        {experiences.map((e, i) => {
          // Support both context format (jobTitle/employer) and static format (role/company)
          const role    = e.role    || e.jobTitle  || ''
          const company = e.company || (e.employer === 'Other' ? e.employerOther : e.employer) || ''
          const period  = e.period  || (e.startDate ? `${e.startDate} – ${e.currentWork ? 'Present' : e.endDate}` : '')
          const points  = e.points  || (e.description ? [e.description] : [])
          return (
            <div key={i} className="mb-3">
              <div className="d-flex justify-content-between">
                <p className="fw-bold mb-0" style={{ fontSize: '0.75rem', color: '#1e293b' }}>{role}</p>
                <p className="mb-0" style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{period}</p>
              </div>
              <p className="mb-1" style={{ fontSize: '0.67rem', color: C.accent, fontWeight: 600 }}>{company}</p>
              <ul className="mb-0 ps-3">
                {points.map((pt, j) => <li key={j} style={{ fontSize: '0.65rem', color: '#374151', lineHeight: 1.7 }}>{pt}</li>)}
              </ul>
            </div>
          )
        })}

        <SectionHead title="Education" />
        {staticData.education.map((e, i) => (
          <div key={i} className="mb-2">
            <div className="d-flex justify-content-between">
              <p className="fw-bold mb-0" style={{ fontSize: '0.73rem', color: '#1e293b' }}>{e.degree}</p>
              <p className="mb-0" style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{e.period}</p>
            </div>
            <p className="mb-0" style={{ fontSize: '0.67rem', color: C.accent, fontWeight: 600 }}>{e.institution}</p>
            <p className="mb-0" style={{ fontSize: '0.62rem', color: '#6b7280' }}>{e.score}</p>
          </div>
        ))}

        <SectionHead title="Projects" />
        {staticData.projects.map((p, i) => (
          <div key={i} className="mb-2">
            <p className="fw-bold mb-0" style={{ fontSize: '0.73rem', color: '#1e293b' }}>{p.name}</p>
            <p className="mb-1" style={{ fontSize: '0.6rem', color: C.accent, fontStyle: 'italic' }}>{p.tech}</p>
            <ul className="mb-0 ps-3">{p.points.map((pt, j) => <li key={j} style={{ fontSize: '0.63rem', color: '#374151', lineHeight: 1.7 }}>{pt}</li>)}</ul>
          </div>
        ))}

        <SectionHead title="Certifications" />
        <ul className="ps-3 mb-0">{staticData.certifications.map((c, i) => <li key={i} style={{ fontSize: '0.65rem', color: '#374151', lineHeight: 1.8 }}>{c}</li>)}</ul>

        <SectionHead title="References" />
        <p style={{ fontSize: '0.67rem', color: '#6b7280', fontStyle: 'italic' }}>{staticData.references}</p>
      </div>
    </div>
  )
}
