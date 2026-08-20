import { useResume } from '../../../context/ResumeContext'

const fallbackExperiences = [
  { company: 'Borcelle Studio', role: 'Marketing Manager & Specialist', startDate: '2030', endDate: 'Present', points: ['Develop and execute comprehensive marketing strategies and campaigns aligned with the company’s goals and objectives.', 'Lead, mentor and manage a high-performing marketing team, fostering a collaborative and results-driven work environment.', 'Monitor brand consistency across marketing channels and materials.'] },
  { company: 'Fauget Studio', role: 'Marketing Manager & Specialist', startDate: '2026', endDate: '2029', points: ['Create and manage the marketing budget, ensuring efficient allocation of resources and optimizing ROI.', 'Oversee market research to identify emerging trends, customer needs and competitor strategies.'] },
  { company: 'Studio Shodwe', role: 'Marketing Manager & Specialist', startDate: '2024', endDate: '2025', points: ['Develop and maintain strong relationships with partners, agencies and vendors to support marketing initiatives.', 'Monitor and maintain brand consistency across all marketing channels and materials.'] },
]

function SidebarTitle({ children }) {
  return <h3 style={{ margin: '0 0 10px', paddingBottom: 6, borderBottom: '1px solid #6f7378', color: '#303642', fontSize: 12, letterSpacing: 1.6 }}>{children}</h3>
}

function MainTitle({ icon, children }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 11 }}><span style={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#3c4656', color: '#fff', fontSize: 11, flexShrink: 0 }}>{icon}</span><h2 style={{ flex: 1, margin: 0, paddingBottom: 6, borderBottom: '1px solid #7d8187', color: '#303642', fontSize: 14, letterSpacing: 1.6 }}>{children}</h2></div>
}

export default function Template27RichardSanchez() {
  const context = useResume()
  const profile = context?.profileData || {}
  const name = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'Richard Sanchez'
  const profession = profile.profession || 'Marketing Manager'
  const location = [profile.street, profile.city, profile.state].filter(Boolean).join(', ') || '123 Anywhere St., Any City'
  const summary = context?.summary || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation. Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  const experiences = context?.experiences?.length ? context.experiences.slice(0, 3) : fallbackExperiences
  const skills = context?.skills?.length ? context.skills.slice(0, 8).map(skill => skill.name || skill) : ['Project Management', 'Public Relations', 'Teamwork', 'Time Management', 'Leadership', 'Effective Communication', 'Critical Thinking', 'Digital Marketing']
  const languages = (profile.languages || []).map(language => typeof language === 'string' ? language : language.language).filter(Boolean)
  const projects = context?.projects?.length ? context.projects.slice(0, 2) : [{ title: 'Marketing Campaign', description: 'Planned and delivered a multi-channel campaign that improved customer engagement.' }, { title: 'Brand Strategy', description: 'Developed a consistent brand strategy for digital and print communications.' }]
  const certifications = (context?.certifications || []).filter(certification => typeof certification === 'string' ? certification.trim() : certification?.name?.trim())
  const education = context?.education?.length ? context.education.slice(0, 2) : [{ degree: 'Master of Business Management', institution: 'School of business | Wardiere University', startYear: '2029', endYear: '2031', cgpa: '3.8 / 4.0' }, { degree: 'Bachelor of Business Management', institution: 'School of business | Wardiere University', startYear: '2025', endYear: '2029', cgpa: '3.8 / 4.0' }]

  return (
    <div style={{ width: 794, minHeight: 1123, display: 'grid', gridTemplateColumns: '230px 1fr', gridTemplateRows: '145px 1fr', background: '#fff', color: '#393d43', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', paddingLeft: 290, background: '#364154', color: '#fff' }}>
        <div><h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: .4 }}>{name.toUpperCase()}</h1><p style={{ margin: '6px 0 0', fontSize: 14, letterSpacing: .6 }}>{profession.toUpperCase()}</p></div>
      </div>

      <aside style={{ position: 'relative', padding: '115px 23px 30px', background: '#e9e9e9', boxSizing: 'border-box' }}>
        {profile.photo ? <img src={profile.photo} alt="profile" style={{ position: 'absolute', top: -82, left: 35, width: 156, height: 156, borderRadius: '50%', objectFit: 'cover', border: '7px solid #f4f4f4' }} /> : <div style={{ position: 'absolute', top: -82, left: 35, width: 156, height: 156, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#c6c8ca', border: '7px solid #f4f4f4', color: '#fff', fontSize: 44 }}>{name.slice(0, 1)}</div>}

        <section style={{ marginBottom: 23 }}><SidebarTitle>CONTACT</SidebarTitle><div style={{ display: 'grid', gap: 7, fontSize: 9.5 }}><span>⌕ {profile.phone || '+123-456-7890'}</span><span>✉ {profile.email || 'hello@reallygreatsite.com'}</span><span>● {location}</span><span>◉ {profile.websites?.other || 'www.reallygreatsite.com'}</span>{profile.dob && <span>DOB: {profile.dob}</span>}</div></section>
        <section style={{ marginBottom: 23 }}><SidebarTitle>SKILLS</SidebarTitle><ul style={{ margin: 0, paddingLeft: 14, fontSize: 9.5, lineHeight: 1.7 }}>{skills.map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}</ul></section>
        <section style={{ marginBottom: 23 }}><SidebarTitle>LANGUAGES</SidebarTitle><ul style={{ margin: 0, paddingLeft: 14, fontSize: 9.5, lineHeight: 1.55 }}>{(languages.length ? languages : ['English (Fluent)', 'French (Fluent)', 'German (Basic)', 'Spanish (Intermediate)']).map((language, index) => <li key={`${language}-${index}`}>{language}</li>)}</ul></section>
      </aside>

      <main style={{ padding: '35px 42px 35px 34px', boxSizing: 'border-box' }}>
        {certifications.length > 0 && <section style={{ marginBottom: 23 }}><MainTitle icon="▣">CERTIFICATIONS</MainTitle><ul style={{ margin: '0 0 0 38px', paddingLeft: 14, fontSize: 9.5, lineHeight: 1.5 }}>{certifications.map((certification, index) => { const certificate = typeof certification === 'string' ? { name: certification } : certification; return <li key={`${certificate.name}-${index}`}><strong>{certificate.name}</strong>{certificate.issuer && ` — ${certificate.issuer}`}{certificate.year && ` (${certificate.year})`}</li> })}</ul></section>}
        <section style={{ marginBottom: 23 }}><MainTitle icon="●">PROFILE</MainTitle><p style={{ margin: '0 0 0 38px', fontSize: 10, lineHeight: 1.5 }}>{summary}</p></section>
        <section style={{ marginBottom: 25 }}><MainTitle icon="▣">WORK EXPERIENCE</MainTitle><div style={{ marginLeft: 11, paddingLeft: 27, borderLeft: '2px solid #c5c7c9' }}>{experiences.map((experience, index) => <div key={`${experience.company}-${index}`} style={{ position: 'relative', marginBottom: 21 }}><span style={{ position: 'absolute', left: -34, top: 1, width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #3c4656' }} /><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><strong style={{ fontSize: 11 }}>{experience.company}</strong><span style={{ fontSize: 9 }}>{[experience.startDate, experience.currentWork ? 'Present' : experience.endDate].filter(Boolean).join(' - ')}</span></div><span style={{ display: 'block', marginBottom: 6, fontSize: 9.5 }}>{experience.role || experience.jobTitle}</span><ul style={{ margin: 0, paddingLeft: 14, fontSize: 9.5, lineHeight: 1.45 }}>{(experience.points || []).slice(0, 3).map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}</ul></div>)}</div></section>
        <section style={{ marginBottom: 25 }}><MainTitle icon="▣">PROJECTS</MainTitle><div style={{ marginLeft: 38, display: 'grid', gap: 12 }}>{projects.map((project, index) => <div key={`${project.title || project.name}-${index}`}><strong style={{ display: 'block', fontSize: 10.5 }}>{project.title || project.name || 'Project'}</strong><span style={{ display: 'block', fontSize: 9.5 }}>{project.technologies || ''}</span><span style={{ display: 'block', fontSize: 9.5, lineHeight: 1.45 }}>{project.description || project.highlights || 'Project details'}</span></div>)}</div></section>
        <section><MainTitle icon="▣">EDUCATION</MainTitle><div style={{ marginLeft: 11, paddingLeft: 27, borderLeft: '2px solid #c5c7c9' }}>{education.map((item, index) => <div key={`${item.institution}-${index}`} style={{ position: 'relative', marginBottom: 17 }}><span style={{ position: 'absolute', left: -34, top: 1, width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #3c4656' }} /><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><strong style={{ fontSize: 10.5 }}>{item.degree}</strong><span style={{ fontSize: 9 }}>{[item.startYear, item.endYear].filter(Boolean).join(' - ')}</span></div><span style={{ display: 'block', fontSize: 9.5 }}>{item.institution}</span>{item.cgpa && <span style={{ display: 'block', fontSize: 9.5 }}>GPA: {item.cgpa}</span>}</div>)}</div></section>
      </main>
    </div>
  )
}
