import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md'
import { useResume } from '../../../context/ResumeContext'

const FALLBACK_EXPERIENCE = [
  {
    company: 'Acme Global',
    role: 'Customer Service Representative',
    startDate: '11/2021',
    endDate: 'Current',
    points: [
      'Manage inbound customer inquiries through phone, email and chat, resolving over 50 issues daily with a focus on first-call resolution.',
      'Collaborate with cross-functional teams to address and escalate complex customer concerns, achieving a 95% resolution rate.',
      'Utilize CRM software to document customer interactions, ensuring accurate customer records and follow-ups.',
    ],
  },
  {
    company: 'Gigs',
    role: 'Customer Support Specialist',
    startDate: '09/2018',
    endDate: '10/2021',
    points: [
      'Assisted customers with product inquiries, order placements and tracking, managing a high call volume.',
      'Conducted product training sessions for customers, resulting in a 30% decrease in product-related issues.',
      'Resolved billing discrepancies and processed refunds, reducing customer complaints by 25%.',
    ],
  },
  {
    company: 'Workco Technologies',
    role: 'Client Services Representative',
    startDate: '06/2015',
    endDate: '08/2018',
    points: [
      'Provided support to clients, addressing technical issues and coordinating with the technical support team for timely resolutions.',
      'Managed a portfolio of over 100 clients, ensuring contract renewals and fostering long-term relationships.',
      'Achieved a 98% client retention rate through proactive communication and issue resolution.',
    ],
  },
]

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 25 }}>
      <h3 style={{ margin: '0 0 12px', color: '#3f3f3f', fontSize: 14, fontStyle: 'italic', fontWeight: 700, fontFamily: 'Georgia, serif' }}>{title}</h3>
      {children}
    </section>
  )
}

export default function Template26DanielaMurray() {
  const context = useResume()
  const profile = context?.profileData || {}
  const fullName = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'Daniela Murray'
  const email = profile.email || 'example@example.com'
  const phone = profile.phone || '(555) 555-5555'
  const location = [profile.city, profile.state].filter(Boolean).join(', ') || 'San Francisco, CA 94132'
  const summary = context?.summary || 'Dedicated and results-oriented customer service representative with a proven track record of delivering exceptional customer experiences. Adept at handling inquiries, resolving issues and building positive customer relationships. Demonstrated success in meeting and exceeding customer satisfaction goals.'
  const experiences = context?.experiences?.length ? context.experiences.slice(0, 3) : FALLBACK_EXPERIENCE
  const skills = context?.skills?.length
    ? context.skills.slice(0, 8).map(skill => skill.name || skill)
    : ['Effective communication', 'Data analysis', 'Customer service', 'Technical proficiency: CRM software, Microsoft Office', 'Upselling and cross-selling', 'Conflict resolution', 'Multitasking', 'Time management']
  const education = context?.education?.[0] || { startYear: '06/2015', institution: 'University of San Francisco', degree: 'Bachelor of Science: Marketing' }
  const certification = context?.certifications?.[0] || 'Certified Customer Service Professional (CCSP) - Updated 2023'

  return (
    <div style={{ width: 794, minHeight: 1123, boxSizing: 'border-box', background: '#fff', color: '#383838', fontFamily: 'Arial, sans-serif', fontSize: 10, lineHeight: 1.4 }}>
      <header style={{ height: 170, boxSizing: 'border-box', paddingTop: 28, textAlign: 'center', color: '#fff', background: '#cbb794' }}>
        <div style={{ width: 42, height: 42, margin: '0 auto 10px', borderTop: '1px solid rgba(255,255,255,.75)', borderBottom: '1px solid rgba(255,255,255,.75)', display: 'grid', placeItems: 'center', fontSize: 15 }}>DM</div>
        <h1 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 25, fontStyle: 'italic', fontWeight: 700 }}>{fullName}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '64% 36%', minHeight: 953 }}>
        <main style={{ padding: '28px 26px 35px 35px', boxSizing: 'border-box' }}>
          <Section title="Professional Summary">
            <p style={{ margin: 0 }}>{summary}</p>
          </Section>

          <Section title="Work History">
            {experiences.map((experience, index) => (
              <div key={`${experience.company}-${index}`} style={{ marginBottom: 17 }}>
                <strong style={{ display: 'block', fontSize: 10.5 }}>{experience.company} - {experience.role}</strong>
                <span style={{ display: 'block', marginBottom: 5 }}>{experience.startDate} - {experience.endDate}</span>
                <ul style={{ margin: 0, paddingLeft: 17 }}>
                  {(experience.points || []).slice(0, 3).map((point, pointIndex) => <li key={pointIndex} style={{ marginBottom: 2 }}>{point}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        </main>

        <aside style={{ padding: '27px 25px', boxSizing: 'border-box', background: '#f4f4f4', borderLeft: '1px solid #e4e4e4' }}>
          <div style={{ display: 'grid', gap: 8, paddingBottom: 20, marginBottom: 22, borderBottom: '1px solid #c8c8c8' }}>
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MdEmail size={13} />{email}</span>
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MdPhone size={13} />{phone}</span>
            {profile.dob && <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>DOB: {profile.dob}</span>}
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MdLocationOn size={13} />{location}</span>
          </div>

          <Section title="Skills">
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {skills.map((skill, index) => <li key={`${skill}-${index}`} style={{ marginBottom: 3 }}>{skill}</li>)}
            </ul>
          </Section>

          <Section title="Education">
            <strong style={{ display: 'block' }}>{education.startYear || education.endYear || ''}</strong>
            <strong style={{ display: 'block' }}>{education.institution || 'University of San Francisco'}</strong>
            <span>{education.degree || 'Bachelor of Science: Marketing'}</span>
          </Section>

          <Section title="Certifications">
            <ul style={{ margin: 0, paddingLeft: 16 }}><li>{typeof certification === 'string' ? certification : certification.name}</li></ul>
          </Section>
        </aside>
      </div>
    </div>
  )
}
