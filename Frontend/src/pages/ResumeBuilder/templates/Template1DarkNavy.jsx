import { useLayoutEffect, useRef, useState } from 'react'
import { useResume } from '../../../context/ResumeContext'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const A4_HEIGHT = 1123

function formatDate(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (!match) return value
  const [, year, month, day] = match
  return day ? `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}` : `${MONTHS[Number(month) - 1]} ${year}`
}

function formatMonthYear(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})-(\d{2})/)
  if (!match) return value
  const [, year, month] = match
  return `${MONTHS[Number(month) - 1]} ${year}`
}

function SidebarSection({ title, children, accentColor = '#4f80c8' }) {
  return (
    <section style={{ marginBottom: 15, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <h2 style={{ margin: '0 0 6px', paddingBottom: 5, borderBottom: '1px solid rgba(255,255,255,0.28)', fontSize: '13pt', fontWeight: 700, letterSpacing: .6, color: accentColor }}>{title}</h2>
      {children}
    </section>
  )
}

function MainSection({ title, children }) {
  return (
    <section style={{ marginBottom: 15 }}>
      <h2 style={{ margin: '0 0 6px', paddingBottom: 5, borderBottom: '1px solid #c8cdd3', fontSize: '13pt', fontWeight: 700, letterSpacing: .6, color: '#1a2332' }}>{title}</h2>
      {children}
    </section>
  )
}

function Bullet({ children }) {
  return <div style={{ display: 'flex', gap: 6, marginTop: 3, fontSize: '11pt', fontWeight: 400, color: 'inherit', lineHeight: 1.45 }}><span style={{ color: '#4f80c8' }}>•</span><span>{children}</span></div>
}

export default function Template1DarkNavy({ sidebarColor = '#1a2332', accentColor = '#4f80c8' }) {
  const ctx = useResume()
  const profile = ctx?.profileData || {}
  const name = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'YOUR NAME'
  const title = profile.profession || 'Full Stack Developer'
  const address = [profile.street, profile.city, profile.state].filter(Boolean).join(', ') || 'Address'
  const summary = ctx?.summary || 'Short 3–4 line summary about your experience, expertise, career goals and key strengths.'
  const skills = ctx?.skills?.length ? ctx.skills.map(skill => skill.name || skill) : ['React.js', 'JavaScript', 'HTML / CSS', 'Bootstrap / Tailwind', 'Node.js', 'Express.js', 'Python', 'Django', 'REST API', 'MongoDB', 'MySQL', 'Git / GitHub']
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
  const links = [
    ['Website', websites.other],
    ['LinkedIn', websites.linkedin],
    ['GitHub', websites.github],
    ['Portfolio', websites.portfolio],
  ].filter(([, value]) => value)
  const mainRef = useRef(null)
  const [pageHeight, setPageHeight] = useState(A4_HEIGHT)

  // When content flows onto another page, reserve a complete A4 page. This
  // makes the sidebar colour continue to the bottom of every rendered page.
  useLayoutEffect(() => {
    const contentHeight = (mainRef.current?.getBoundingClientRect().height || A4_HEIGHT) + 48
    const nextHeight = Math.max(A4_HEIGHT, Math.ceil(contentHeight / A4_HEIGHT) * A4_HEIGHT)
    setPageHeight(currentHeight => currentHeight === nextHeight ? currentHeight : nextHeight)
  })

  return (
    <div style={{ width: 794, minHeight: pageHeight, display: 'flex', alignItems: 'flex-start', boxSizing: 'border-box', padding: '24px 0', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', fontFamily: "Arial, sans-serif", color: '#20252b', background: `linear-gradient(to right, ${sidebarColor} 0 238px, #fff 238px 100%)`, fontSize: 10 }}>
      <aside style={{ width: 238, height: pageHeight - 48, minHeight: pageHeight - 48, flexShrink: 0, boxSizing: 'border-box', padding: '45px 26px 36px', background: sidebarColor, color: '#fff' }}>
        <header style={{ paddingBottom: 20, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.28)', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 700, letterSpacing: .2, lineHeight: 1.15 }}>{name}</h1>
          <p style={{ margin: '6px 0 0', fontSize: '12pt', fontWeight: 500, color: accentColor, lineHeight: 1.3 }}>{title}</p>
        </header>

        <SidebarSection title="PERSONAL INFO" accentColor={accentColor}>
          <div style={{ display: 'none' }}>
            <div>✉&nbsp; {profile.email || 'Email'}</div>
            <div>☎&nbsp; {profile.phone || 'Phone'}</div>
            <div>⌖&nbsp; {address}</div>
            {profile.dob && <div style={{ fontSize: '9.5pt', lineHeight: 1.7 }}><span style={{ color: accentColor }}>•</span>&nbsp; <strong>Date of Birth:</strong> {formatDate(profile.dob)}</div>}
          </div>
          <div style={{ display: 'grid', gap: 8, color: 'rgba(255,255,255,0.9)' }}>
            {[
              ['Email', profile.email || 'Email'],
              ['Phone', profile.phone || 'Phone'],
              ['Date of Birth', profile.dob ? formatDate(profile.dob) : ''],
              ['Address', address],
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '8px 1fr', columnGap: 6, alignItems: 'start', fontSize: '9.5pt', lineHeight: 1.45, wordBreak: 'break-word' }}>
                <span style={{ color: accentColor, fontSize: '8pt', paddingTop: 2 }}>•</span>
                <div><strong style={{ display: 'block', fontSize: '8.5pt', marginBottom: 1 }}>{label}</strong>{value}</div>
              </div>
            ))}
          </div>
        </SidebarSection>

        <SidebarSection title="WEBSITE & PORTFOLIO" accentColor={accentColor}>
          <div style={{ display: 'grid', gap: 6, fontSize: '9.5pt', fontWeight: 400, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
            {(links.length ? links : [['Website', ''], ['LinkedIn', ''], ['GitHub', ''], ['Portfolio', '']]).map(([label, value]) => (
              <div key={label}>⌁&nbsp; {value ? value.replace(/^https?:\/\//, '') : label}</div>
            ))}
          </div>
        </SidebarSection>

        <SidebarSection title="SKILLS" accentColor={accentColor}>
          <div style={{ display: 'grid', gap: 2, color: 'rgba(255,255,255,0.9)' }}>
            {skills.map((skill, index) => <Bullet key={`${skill}-${index}`}>{skill}</Bullet>)}
          </div>
        </SidebarSection>

      </aside>

      <main ref={mainRef} style={{ flex: 1, boxSizing: 'border-box', padding: '45px 30px 34px' }}>
        <MainSection title="PROFESSIONAL SUMMARY">
          <p style={{ margin: 0, fontSize: '11pt', fontWeight: 400, color: '#363c42', lineHeight: 1.45 }}>{summary}</p>
        </MainSection>

        <MainSection title="WORK EXPERIENCE">
          {experiences.map((experience, index) => {
            const points = experience.points || experience.responsibilities || (experience.description ? [experience.description] : [])
            const role = experience.role || experience.jobTitle || 'Job Title'
            const dates = [formatDate(experience.startDate), experience.endDate ? formatDate(experience.endDate) : experience.startDate ? 'Present' : ''].filter(Boolean).join(' – ')
            const location = [experience.city, experience.state].filter(Boolean).join(', ')
            return (
              <div key={experience.id || index} style={{ marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600 }}>{experience.company || (experience.employer === 'Other' ? experience.employerOther : experience.employer) || 'Company Name'}{location && <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>| {location}</span>}</p>
                <p style={{ margin: '2px 0 4px', fontSize: '13pt', fontWeight: 600, color: '#374151' }}>{role}{dates && <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>| {dates}</span>}</p>
                {points.slice(0, 3).map((point, pointIndex) => <Bullet key={pointIndex}>{point}</Bullet>)}
              </div>
            )
          })}
        </MainSection>

        <MainSection title="PROJECTS">
          {projects.map((project, index) => (
            <div key={project.id || index} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}><p style={{ margin: 0, fontSize: '13pt', fontWeight: 600 }}>{project.title || project.name || 'Project Name'}</p><p style={{ margin: 0, fontSize: '9.75pt', color: '#6b7280', whiteSpace: 'nowrap' }}>{project.startDate && `${formatMonthYear(project.startDate)} – ${project.ongoing ? 'Present' : formatMonthYear(project.endDate)}`}</p></div>
              <p style={{ margin: '2px 0 4px', fontSize: '10pt', fontWeight: 500, color: '#525a62' }}>Technologies: {project.technologies || project.techStack?.join(', ') || 'Technologies'}</p>
              {project.description && <Bullet>{project.description}</Bullet>}
              {project.highlights && <Bullet>{project.highlights}</Bullet>}
            </div>
          ))}
        </MainSection>

        <MainSection title="EDUCATION">
          {education.map((item, index) => {
            const dates = [item.startYear, item.endYear].filter(Boolean).join(' – ')
            return (
              <div key={item.id || index} style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600 }}>{item.institution || item.schoolName || 'College / University'}</p>
                  <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, whiteSpace: 'nowrap' }}>{dates || 'Passing Year'}</p>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '11pt', fontWeight: 400, fontStyle: 'italic', color: '#525a62' }}>{item.degree || item.fieldStudy || 'Degree'}{(item.cgpa || item.score) && ` | CGPA: ${item.cgpa || item.score}`}</p>
              </div>
            )
          })}
        </MainSection>

      </main>
    </div>
  )
}
