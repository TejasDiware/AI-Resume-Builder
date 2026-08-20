import { useResume } from '../../../context/ResumeContext'

const SIDE_BG = '#3b4a3f'
const ACCENT = '#8aab7e'

function formatDate(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (!match) return value
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[2]) - 1]} ${match[1]}`
}

function SideSection({ title, children }) {
  return <section style={{ marginBottom: 15 }}><h2 style={{ margin: '0 0 6px', paddingBottom: 5, borderBottom: '1px solid rgba(255,255,255,0.22)', fontSize: '13pt', fontWeight: 700, letterSpacing: .6, color: ACCENT }}>{title}</h2>{children}</section>
}

function MainSection({ title, children }) {
  return <section style={{ marginBottom: 15, breakInside: 'avoid', pageBreakInside: 'avoid' }}><h2 style={{ margin: '0 0 6px', paddingBottom: 5, borderBottom: '1px solid #d9dcde', fontSize: '13pt', fontWeight: 700, letterSpacing: .6, color: SIDE_BG }}>{title}</h2>{children}</section>
}

function Bullet({ children, light = false }) {
  return <div style={{ display: 'flex', gap: 6, marginTop: 3, fontSize: '11pt', fontWeight: 400, lineHeight: 1.45, color: light ? 'rgba(255,255,255,0.88)' : '#374151' }}><span style={{ color: ACCENT }}>•</span><span>{children}</span></div>
}

export default function Template2Brian() {
  const ctx = useResume()
  const profile = ctx?.profileData || {}
  const name = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'Brian T. Wayne'
  const title = profile.profession || 'Business Development Consultant'
  const address = [profile.street, profile.city, profile.state].filter(Boolean).join(', ') || 'Malibu, California, USA'
  const summary = ctx?.summary || 'Short 3–4 line summary about your experience, expertise, career goals and key strengths.'
  const skills = ctx?.skills?.length ? ctx.skills.map(skill => skill.name || skill) : ['Strategic thinking and problem-solving', 'Relationship building and networking', 'Effective communication and negotiation', 'Sales and business development strategy', 'Team management and leadership', 'Creative and innovative thinking']
  const languages = (profile.languages || []).map(item => typeof item === 'string' ? item : item.language).filter(Boolean)
  const experiences = ctx?.experiences?.length ? ctx.experiences : [
    { company: 'Appleseed Inc.', role: 'Business Development Consultant', startDate: '2022', endDate: 'Present', points: ['Developed and implemented strategic plans resulting in new business opportunities.', 'Collaborated with cross-functional teams to drive business growth and expansion.', 'Established and maintained relationships with key partners.'] },
    { company: 'Denso', role: 'Business Development', startDate: '2018', endDate: '2022', points: ['Worked closely with software companies to provide sales advisory services.', 'Built and managed dedicated sales teams across regions.'] },
  ]
  const projects = ctx?.projects?.length ? ctx.projects : [
    { title: 'Project Name', technologies: 'React, Node.js, MongoDB', description: 'Short project description', highlights: 'Key features / achievements' },
    { title: 'Project Name', technologies: 'Python, Django, SQL', description: 'Short project description', highlights: 'Key features / achievements' },
  ]
  const education = ctx?.education?.length ? ctx.education : [
    { degree: 'Master of Business Administration', institution: 'Harvard Business School', startYear: '2016', endYear: '2018', cgpa: '' },
    { degree: 'Bachelor Degree', institution: 'College / University', startYear: '2012', endYear: '2016', cgpa: '' },
  ]
  const certifications = ctx?.certifications?.length ? ctx.certifications : ['Certification Name – Issuing Organization', 'Certification Name – Issuing Organization']
  const websites = ctx?.websites || {}
  const links = [['Website', websites.other], ['LinkedIn', websites.linkedin], ['GitHub', websites.github], ['Portfolio', websites.portfolio]].filter(([, value]) => value)

  return (
    <div style={{ width: 794, minHeight: 1123, display: 'flex', alignItems: 'stretch', boxSizing: 'border-box', fontFamily: "'Segoe UI', Arial, sans-serif", background: `linear-gradient(to right, ${SIDE_BG} 0 238px, #fff 238px 100%)`, color: '#20252b' }}>
      <aside style={{ width: 238, height: 1123, minHeight: 1123, flexShrink: 0, boxSizing: 'border-box', padding: '45px 26px 36px', background: SIDE_BG, color: '#fff' }}>
        <header style={{ paddingBottom: 20, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.22)', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 700, lineHeight: 1.15 }}>{name}</h1>
          <p style={{ margin: '6px 0 0', fontSize: '12pt', fontWeight: 500, lineHeight: 1.3, color: ACCENT }}>{title}</p>
        </header>

        <SideSection title="PERSONAL INFO"><div style={{ display: 'grid', gap: 6, fontSize: '9.5pt', fontWeight: 400, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}><div>✉&nbsp; {profile.email || 'Email'}</div><div>☎&nbsp; {profile.phone || 'Phone'}</div><div>⌖&nbsp; {address}</div>{profile.dob && <div>•&nbsp; Date of Birth: {formatDate(profile.dob)}</div>}</div></SideSection>
        <SideSection title="WEBSITE & PORTFOLIO"><div style={{ display: 'grid', gap: 6, fontSize: '9.5pt', fontWeight: 400, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', wordBreak: 'break-word' }}>{(links.length ? links : [['Website', ''], ['LinkedIn', ''], ['GitHub', ''], ['Portfolio', '']]).map(([label, value]) => <div key={label}>⌁&nbsp; {value ? value.replace(/^https?:\/\//, '') : label}</div>)}</div></SideSection>
        <SideSection title="SKILLS"><div style={{ display: 'grid', gap: 2 }}>{skills.map((skill, index) => <Bullet key={`${skill}-${index}`} light>{skill}</Bullet>)}</div></SideSection>
        {languages.length > 0 && <SideSection title="LANGUAGES"><div style={{ display: 'grid', gap: 2 }}>{languages.map((language, index) => <Bullet key={`${language}-${index}`} light>{language}</Bullet>)}</div></SideSection>}
      </aside>

      <main style={{ flex: 1, boxSizing: 'border-box', padding: '45px 30px 34px' }}>
        <MainSection title="PROFESSIONAL SUMMARY"><p style={{ margin: 0, fontSize: '11pt', fontWeight: 400, color: '#374151', lineHeight: 1.45 }}>{summary}</p></MainSection>
        <MainSection title="WORK EXPERIENCE">{experiences.map((experience, index) => { const points = experience.points || experience.responsibilities || (experience.description ? [experience.description] : []); const dates = [formatDate(experience.startDate), experience.endDate ? formatDate(experience.endDate) : experience.startDate ? 'Present' : ''].filter(Boolean).join(' – '); const company = experience.company || (experience.employer === 'Other' ? experience.employerOther : experience.employer) || 'Company Name'; const location = [experience.city, experience.state].filter(Boolean).join(', '); return <div key={experience.id || index} style={{ marginBottom: 11 }}><p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, color: SIDE_BG }}>{company}{location && <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>| {location}</span>}</p><p style={{ margin: '2px 0 4px', fontSize: '13pt', fontWeight: 600, color: '#374151' }}>{experience.role || experience.jobTitle || 'Job Title'}{dates && <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>| {dates}</span>}</p>{points.slice(0, 3).map((point, pointIndex) => <Bullet key={pointIndex}>{point}</Bullet>)}</div> })}</MainSection>
        <MainSection title="PROJECTS">{projects.map((project, index) => <div key={project.id || index} style={{ marginBottom: 11 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}><p style={{ margin: 0, fontSize: '13pt', fontWeight: 600, color: SIDE_BG }}>{project.title || project.name || 'Project Name'}</p><p style={{ margin: 0, fontSize: '9.75pt', color: '#6b7280', whiteSpace: 'nowrap' }}>{project.startDate && `${formatDate(project.startDate)} – ${project.ongoing ? 'Present' : formatDate(project.endDate)}`}</p></div><p style={{ margin: '2px 0 4px', fontSize: '10pt', fontWeight: 500, color: '#6b7280' }}>Technologies: {project.technologies || project.techStack?.join(', ') || 'Technologies'}</p>{project.description && <Bullet>{project.description}</Bullet>}{project.highlights && <Bullet>{project.highlights}</Bullet>}</div>)}</MainSection>
        <MainSection title="EDUCATION">{education.map((item, index) => { const years = [item.startYear, item.endYear].filter(Boolean).join(' - ') || 'Passing Year'; const score = item.cgpa || item.score; return <div key={item.id || index} style={{ marginBottom: 11 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}><p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, color: '#20252b' }}>{item.institution || item.schoolName || 'College / University'}</p><p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, color: '#20252b', whiteSpace: 'nowrap' }}>{years}</p></div><p style={{ margin: '2px 0 0', fontSize: '11pt', fontWeight: 400, fontStyle: 'italic', color: '#4b5563' }}>{item.degree || item.fieldStudy || 'Degree'}{score && ` | CGPA: ${score}`}</p></div> })}</MainSection>
      </main>
    </div>
  )
}
