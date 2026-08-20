import { useResume } from '../../../context/ResumeContext'

const NAVY = '#1e2d45'
const YELLOW = '#f5c518'
const ACCENT = '#2b4ead'

function formatDate(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (!match) return value
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[2]) - 1]} ${match[1]}`
}

function SideSection({ title, children }) {
  return (
    <section style={{ marginBottom: 21 }}>
      <h2 style={{ margin: '0 0 6px', paddingBottom: 5, borderBottom: `1.5px solid ${ACCENT}`, fontSize: '13pt', fontWeight: 700, letterSpacing: .6, color: ACCENT }}>{title}</h2>
      {children}
    </section>
  )
}

function MainSection({ title, children }) {
  return (
    <section style={{ marginBottom: 18, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <h2 style={{ margin: '0 0 6px', paddingBottom: 5, borderBottom: '1px solid #d1d5db', fontSize: '13pt', fontWeight: 700, letterSpacing: .6, color: NAVY }}>{title}</h2>
      {children}
    </section>
  )
}

function Bullet({ children }) {
  return <div style={{ display: 'flex', gap: 6, marginTop: 3, fontSize: '11pt', color: '#374151', lineHeight: 1.45 }}><span style={{ color: ACCENT }}>•</span><span>{children}</span></div>
}

export default function Template5Fresher() {
  const ctx = useResume()
  const profile = ctx?.profileData || {}
  const name = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'YOUR NAME'
  const title = profile.profession || 'Full Stack Developer'
  const address = [profile.street, profile.city, profile.state].filter(Boolean).join(', ') || 'City, State'
  const summary = ctx?.summary || 'Short 3–4 line summary about your experience, expertise, career goals and key strengths.'
  const skills = ctx?.skills?.length ? ctx.skills.map(skill => skill.name || skill) : ['React.js', 'JavaScript', 'HTML / CSS', 'Bootstrap / Tailwind', 'Node.js', 'Express.js', 'Python', 'Django', 'REST API', 'MongoDB', 'MySQL', 'Git / GitHub']
  const languages = (profile.languages || []).map(item => typeof item === 'string' ? item : item.language).filter(Boolean)
  const experiences = ctx?.experiences?.length ? ctx.experiences : [
    { company: 'Company Name', role: 'Job Title', startDate: 'Start Date', endDate: 'End Date', points: ['Responsibility / Achievement', 'Responsibility / Achievement', 'Responsibility / Achievement'] },
    { company: 'Company Name', role: 'Job Title', startDate: 'Start Date', endDate: 'End Date', points: ['Responsibility / Achievement', 'Responsibility / Achievement'] },
  ]
  const projects = ctx?.projects?.length ? ctx.projects : [
    { title: 'Project Name', technologies: 'React, Node.js, MongoDB', description: 'Short project description', highlights: 'Key features / achievements' },
    { title: 'Project Name', technologies: 'Python, Django, SQL', description: 'Short project description', highlights: 'Key features / achievements' },
  ]
  const education = ctx?.education?.length ? ctx.education : [
    { degree: 'Master of Computer Applications (MCA)', institution: 'College / University', startYear: '2024', endYear: '2026', cgpa: '7.33/10' },
    { degree: 'Bachelor of Computer Applications (BCA)', institution: 'College / University', startYear: 'Year', endYear: '', cgpa: 'Percentage / CGPA' },
  ]
  const certifications = ctx?.certifications?.length ? ctx.certifications : ['Certification Name – Issuing Organization', 'Certification Name – Issuing Organization']
  const websites = ctx?.websites || {}
  const links = [['Website', websites.other], ['LinkedIn', websites.linkedin], ['GitHub', websites.github], ['Portfolio', websites.portfolio]].filter(([, value]) => value)

  return (
    <div style={{ width: 794, minHeight: 1123, boxSizing: 'border-box', fontFamily: "'Segoe UI', Arial, sans-serif", background: '#fff', border: `5px solid ${YELLOW}`, color: '#20252b' }}>
      <header style={{ background: NAVY, padding: '19px 27px', color: '#fff' }}>
        <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase' }}>{name}</h1>
        <p style={{ margin: '4px 0 0', color: '#d8e2f2', fontSize: '12pt', fontWeight: 500 }}>{title}</p>
      </header>

      <div style={{ display: 'flex', minHeight: 1000 }}>
        <aside style={{ width: 205, minHeight: 1000, flexShrink: 0, boxSizing: 'border-box', padding: '23px 16px', background: '#f4f5f7', borderRight: '1px solid #e5e7eb' }}>
          <SideSection title="PERSONAL INFO">
            <div style={{ display: 'grid', gap: 6, fontSize: 9.5, color: '#374151' }}>
              <div>✉&nbsp; {profile.email || 'Email'}</div>
              <div>☎&nbsp; {profile.phone || 'Phone'}</div>
              <div>⌖&nbsp; {address}</div>
              {profile.dob && <div>•&nbsp; Date of Birth: {formatDate(profile.dob)}</div>}
            </div>
          </SideSection>

          <SideSection title="WEBSITE & PORTFOLIO">
            <div style={{ display: 'grid', gap: 6, fontSize: 9.5, color: '#374151', wordBreak: 'break-word' }}>
              {(links.length ? links : [['Website', ''], ['LinkedIn', ''], ['GitHub', ''], ['Portfolio', '']]).map(([label, value]) => <div key={label}>⌁&nbsp; {value ? value.replace(/^https?:\/\//, '') : label}</div>)}
            </div>
          </SideSection>

          <SideSection title="SKILLS">
            <div style={{ display: 'grid', gap: 4 }}>
              {skills.map((skill, index) => <Bullet key={`${skill}-${index}`}>{skill}</Bullet>)}
            </div>
          </SideSection>
          {languages.length > 0 && <SideSection title="LANGUAGES"><div style={{ display: 'grid', gap: 4 }}>{languages.map((language, index) => <Bullet key={`${language}-${index}`}>{language}</Bullet>)}</div></SideSection>}
        </aside>

        <main style={{ flex: 1, boxSizing: 'border-box', padding: '23px 23px 30px' }}>
          <MainSection title="PROFESSIONAL SUMMARY"><p style={{ margin: 0, fontSize: 9.5, color: '#374151', lineHeight: 1.55 }}>{summary}</p></MainSection>

          <MainSection title="WORK EXPERIENCE">
            {experiences.map((experience, index) => {
              const points = experience.points || experience.responsibilities || (experience.description ? [experience.description] : [])
              const dates = [formatDate(experience.startDate), experience.endDate ? formatDate(experience.endDate) : experience.startDate ? 'Present' : ''].filter(Boolean).join(' – ')
              return <div key={experience.id || index} style={{ marginBottom: 13 }}><p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: NAVY }}>{experience.company || (experience.employer === 'Other' ? experience.employerOther : experience.employer) || 'Company Name'}</p><p style={{ margin: '2px 0 4px', fontSize: 9, color: '#6b7280' }}>{experience.role || experience.jobTitle || 'Job Title'}{dates && ` | ${dates}`}</p>{points.slice(0, 3).map((point, pointIndex) => <Bullet key={pointIndex}>{point}</Bullet>)}</div>
            })}
          </MainSection>

          <MainSection title="PROJECTS">
            {projects.map((project, index) => <div key={project.id || index} style={{ marginBottom: 13 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}><p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: NAVY }}>{project.title || project.name || 'Project Name'}</p><p style={{ margin: 0, fontSize: 9, color: '#6b7280', whiteSpace: 'nowrap' }}>{project.startDate && `${formatDate(project.startDate)} – ${project.ongoing ? 'Present' : formatDate(project.endDate)}`}</p></div><p style={{ margin: '2px 0 4px', fontSize: 9, color: ACCENT }}>Technologies: {project.technologies || project.techStack?.join(', ') || 'Technologies'}</p>{project.description && <Bullet>{project.description}</Bullet>}{project.highlights && <Bullet>{project.highlights}</Bullet>}</div>)}
          </MainSection>

          <MainSection title="EDUCATION">
            {education.map((item, index) => <div key={item.id || index} style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}><p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: NAVY }}>{item.institution || item.schoolName || 'College / University'}</p><p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{[item.startYear, item.endYear].filter(Boolean).join(' – ') || 'Passing Year'}</p></div><p style={{ margin: '2px 0 0', fontSize: 9, fontStyle: 'italic', color: '#6b7280' }}>{item.degree || item.fieldStudy || 'Degree'}{(item.cgpa || item.score) && ` | CGPA: ${item.cgpa || item.score}`}</p></div>)}
          </MainSection>

        </main>
      </div>
    </div>
  )
}
