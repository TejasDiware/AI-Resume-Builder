import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'

export default function TemplatePro() {
  const ctx = useResume()
  const d   = buildResumeData(ctx)
  const p   = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName)
  const fullName = hasProfile ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : d.name

  const experiences = ctx?.experiences?.length > 0
    ? ctx.experiences.map(e => ({
        role:    e.jobTitle || e.role || '',
        company: e.employer === 'Other' ? (e.employerOther || '') : (e.employer || e.company || ''),
        location: [e.city, e.state].filter(Boolean).join(', '),
        period:  e.startDate ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}` : (e.period || ''),
        points:  e.points || (e.description ? [e.description] : []),
      }))
    : d.expList.map(e => ({ ...e, location: '' }))

  return (
    <div style={{ width: 794, minHeight: 1123, padding: '36px 48px', fontFamily: 'Georgia, "Times New Roman", serif', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}>

      {/* Name */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>{fullName}</h1>
        <p style={{ fontSize: '0.72rem', color: '#374151', margin: '4px 0 0', fontFamily: 'Arial, sans-serif' }}>
          {[d.location, d.email, d.phone, d.linkedin].filter(Boolean).join('  |  ')}
        </p>
      </div>

      <div style={{ height: 2, background: '#1a1a1a', margin: '8px 0' }} />

      {/* Work Experience */}
      <Section title="WORK EXPERIENCE">
        {experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, fontFamily: 'Arial,sans-serif' }}>{e.company}</p>
              <span style={{ fontSize: '0.65rem', color: '#374151', fontFamily: 'Arial,sans-serif' }}>{e.location || d.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontSize: '0.73rem', fontStyle: 'italic', margin: '1px 0 4px', fontFamily: 'Arial,sans-serif' }}>{e.role}</p>
              <span style={{ fontSize: '0.65rem', fontStyle: 'italic', color: '#374151', fontFamily: 'Arial,sans-serif' }}>{e.period}</span>
            </div>
            {(e.points || []).map((pt, j) => (
              <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: '0.65rem', flexShrink: 0, marginTop: 1 }}>•</span>
                <p style={{ fontSize: '0.67rem', color: '#1a1a1a', margin: 0, lineHeight: 1.7, fontFamily: 'Arial,sans-serif' }}>{pt}</p>
              </div>
            ))}
          </div>
        ))}
      </Section>

      {/* Leadership */}
      <Section title="LEADERSHIP EXPERIENCE">
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, fontFamily: 'Arial,sans-serif' }}>Tech Community Lead</p>
            <span style={{ fontSize: '0.65rem', color: '#374151', fontFamily: 'Arial,sans-serif' }}>Online</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.73rem', fontStyle: 'italic', margin: '1px 0 4px', fontFamily: 'Arial,sans-serif' }}>Open Source Contributor</p>
            <span style={{ fontSize: '0.65rem', fontStyle: 'italic', fontFamily: 'Arial,sans-serif' }}>2022 – Present</span>
          </div>
          {['Contributed to multiple open source projects on GitHub.', 'Mentored junior developers in React and Python.'].map((pt, j) => (
            <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: '0.65rem', flexShrink: 0 }}>•</span>
              <p style={{ fontSize: '0.67rem', color: '#1a1a1a', margin: 0, lineHeight: 1.7, fontFamily: 'Arial,sans-serif' }}>{pt}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title="EDUCATION">
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, fontFamily: 'Arial,sans-serif' }}>{e.institution}</p>
              <span style={{ fontSize: '0.65rem', fontFamily: 'Arial,sans-serif' }}>{e.period}</span>
            </div>
            <p style={{ fontSize: '0.73rem', fontStyle: 'italic', margin: '1px 0 2px', fontFamily: 'Arial,sans-serif' }}>{e.degree}</p>
            {e.score && <p style={{ fontSize: '0.65rem', color: '#374151', margin: 0, fontFamily: 'Arial,sans-serif' }}>GPA / Score: {e.score}</p>}
          </div>
        ))}
      </Section>

      {/* Skills & Interests */}
      <Section title="SKILLS & INTERESTS">
        <p style={{ fontSize: '0.67rem', margin: '0 0 4px', fontFamily: 'Arial,sans-serif', lineHeight: 1.7 }}>
          <strong>Technical:</strong> {d.skills?.join(', ')}
        </p>
        <p style={{ fontSize: '0.67rem', margin: '0 0 4px', fontFamily: 'Arial,sans-serif', lineHeight: 1.7 }}>
          <strong>Tools:</strong> {d.tools?.join(', ')}
        </p>
        <p style={{ fontSize: '0.67rem', margin: 0, fontFamily: 'Arial,sans-serif', lineHeight: 1.7 }}>
          <strong>Interests:</strong> {d.interests?.join(', ')}
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 2px', fontFamily: 'Arial,sans-serif' }}>{title}</p>
      <div style={{ height: 1.5, background: '#1a1a1a', marginBottom: 8 }} />
      {children}
    </div>
  )
}
