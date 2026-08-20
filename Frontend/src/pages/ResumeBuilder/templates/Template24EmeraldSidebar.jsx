/**
 * Template 24 — Emerald Sidebar
 *
 * Identical structure and demo data as Template1DarkNavy.
 * Color scheme: deep emerald green sidebar (#1a3a2e) with
 * soft green accent (#4fc89a).
 *
 * Sections (sidebar):
 *   Name / Profession header
 *   PERSONAL INFO
 *   WEBSITE & PORTFOLIO
 *   SKILLS
 *   LANGUAGES  (if present)
 *
 * Sections (main):
 *   PROFESSIONAL SUMMARY
 *   WORK EXPERIENCE
 *   PROJECTS
 *   EDUCATION
 */

import { useLayoutEffect, useRef, useState } from 'react'
import { useResume } from '../../../context/ResumeContext'

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const A4_HEIGHT = 1123

function formatDate(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (!match) return value
  const [, year, month, day] = match
  return day
    ? `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
    : `${MONTHS[Number(month) - 1]} ${year}`
}

function SidebarSection({ title, children, accentColor = '#4fc89a' }) {
  return (
    <section style={{ marginBottom: 15, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <h2 style={{
        margin: '0 0 6px', paddingBottom: 5,
        borderBottom: '1px solid rgba(255,255,255,0.28)',
        fontSize: '13pt', fontWeight: 700, letterSpacing: .6,
        color: accentColor,
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function MainSection({ title, children }) {
  return (
    <section style={{ marginBottom: 15 }}>
      <h2 style={{
        margin: '0 0 6px', paddingBottom: 5,
        borderBottom: '1px solid #c8cdd3',
        fontSize: '13pt', fontWeight: 700, letterSpacing: .6,
        color: '#1a3a2e',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Bullet({ children, accentColor = '#4fc89a' }) {
  return (
    <div style={{
      display: 'flex', gap: 6, marginTop: 3,
      fontSize: '11pt', fontWeight: 400, color: 'inherit', lineHeight: 1.45,
    }}>
      <span style={{ color: accentColor }}>•</span>
      <span>{children}</span>
    </div>
  )
}

export default function Template24EmeraldSidebar({
  sidebarColor = '#1a3a2e',
  accentColor  = '#4fc89a',
}) {
  const ctx     = useResume()
  const profile = ctx?.profileData || {}

  const name    = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'YOUR NAME'
  const title   = profile.profession || 'Full Stack Developer'
  const address = [profile.street, profile.city, profile.state].filter(Boolean).join(', ') || 'Address'
  const summary = ctx?.summary || 'Short 3–4 line summary about your experience, expertise, career goals and key strengths.'

  const skills = ctx?.skills?.length
    ? ctx.skills.map(s => s.name || s)
    : ['React.js','JavaScript','HTML / CSS','Bootstrap / Tailwind',
       'Node.js','Express.js','Python','Django','REST API',
       'MongoDB','MySQL','Git / GitHub']

  const languages = (profile.languages || [])
    .map(item => typeof item === 'string' ? item : item.language)
    .filter(Boolean)

  const experiences = ctx?.experiences?.length ? ctx.experiences : [
    {
      company: 'Company Name', role: 'Job Title',
      startDate: 'Start Date', endDate: 'End Date',
      points: ['Responsibility / Achievement', 'Responsibility / Achievement', 'Responsibility / Achievement'],
    },
    {
      company: 'Company Name', role: 'Job Title',
      startDate: 'Start Date', endDate: 'End Date',
      points: ['Responsibility / Achievement', 'Responsibility / Achievement'],
    },
  ]

  const projects = ctx?.projects?.length ? ctx.projects : [
    { title: 'Project Name', technologies: 'React, Node.js, MongoDB', description: 'Short project description', highlights: 'Key features / achievements' },
    { title: 'Project Name', technologies: 'Python, Django, SQL',     description: 'Short project description', highlights: 'Key features / achievements' },
  ]

  const education = ctx?.education?.length ? ctx.education : [
    { degree: 'Master of Computer Applications (MCA)',    institution: 'College / University', startYear: '2024', endYear: '2026', cgpa: '7.33/10' },
    { degree: 'Bachelor of Computer Applications (BCA)', institution: 'College / University', startYear: 'Year', endYear: '',     cgpa: 'Percentage / CGPA' },
  ]

  const certifications = ctx?.certifications?.length
    ? ctx.certifications
    : ['Certification Name – Issuing Organization', 'Certification Name – Issuing Organization']

  const websites = ctx?.websites || {}
  const links = [
    ['Website',   websites.other],
    ['LinkedIn',  websites.linkedin],
    ['GitHub',    websites.github],
    ['Portfolio', websites.portfolio],
  ].filter(([, value]) => value)

  const mainRef = useRef(null)
  const [pageHeight, setPageHeight] = useState(A4_HEIGHT)

  useLayoutEffect(() => {
    const contentHeight = (mainRef.current?.getBoundingClientRect().height || A4_HEIGHT) + 48
    const nextHeight = Math.max(A4_HEIGHT, Math.ceil(contentHeight / A4_HEIGHT) * A4_HEIGHT)
    setPageHeight(cur => cur === nextHeight ? cur : nextHeight)
  })

  return (
    <div style={{
      width: 794, minHeight: pageHeight,
      display: 'flex', alignItems: 'flex-start',
      boxSizing: 'border-box', padding: '24px 0',
      boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
      fontFamily: 'Arial, sans-serif', color: '#20252b', fontSize: 10,
      background: `linear-gradient(to right, ${sidebarColor} 0 238px, #fff 238px 100%)`,
    }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: 238, height: pageHeight - 48, minHeight: pageHeight - 48,
        flexShrink: 0, boxSizing: 'border-box',
        padding: '45px 26px 36px',
        background: sidebarColor, color: '#fff',
      }}>
        {/* Name / title header */}
        <header style={{
          paddingBottom: 20, marginBottom: 16,
          borderBottom: '1px solid rgba(255,255,255,0.28)',
          textAlign: 'center',
        }}>
          <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 700, letterSpacing: .2, lineHeight: 1.15 }}>
            {name}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '12pt', fontWeight: 500, color: accentColor, lineHeight: 1.3 }}>
            {title}
          </p>
        </header>

        {/* PERSONAL INFO */}
        <SidebarSection title="PERSONAL INFO" accentColor={accentColor}>
          <div style={{ display: 'grid', gap: 8, color: 'rgba(255,255,255,0.9)' }}>
            {[
              ['Email',         profile.email || 'Email'],
              ['Phone',         profile.phone || 'Phone'],
              ['Date of Birth', profile.dob   ? formatDate(profile.dob) : ''],
              ['Address',       address],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '8px 1fr',
                columnGap: 6, alignItems: 'start',
                fontSize: '9.5pt', lineHeight: 1.45, wordBreak: 'break-word',
              }}>
                <span style={{ color: accentColor, fontSize: '8pt', paddingTop: 2 }}>•</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '8.5pt', marginBottom: 1 }}>{label}</strong>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </SidebarSection>

        {/* WEBSITE & PORTFOLIO */}
        <SidebarSection title="WEBSITE & PORTFOLIO" accentColor={accentColor}>
          <div style={{ display: 'grid', gap: 6, fontSize: '9.5pt', fontWeight: 400, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
            {(links.length ? links : [['Website',''],['LinkedIn',''],['GitHub',''],['Portfolio','']]).map(([label, value]) => (
              <div key={label}>⌁&nbsp; {value ? value.replace(/^https?:\/\//, '') : label}</div>
            ))}
          </div>
        </SidebarSection>

        {/* SKILLS */}
        <SidebarSection title="SKILLS" accentColor={accentColor}>
          <div style={{ display: 'grid', gap: 2, color: 'rgba(255,255,255,0.9)' }}>
            {skills.map((skill, i) => (
              <Bullet key={`${skill}-${i}`} accentColor={accentColor}>{skill}</Bullet>
            ))}
          </div>
        </SidebarSection>

        {/* LANGUAGES (conditional) */}
        {languages.length > 0 && (
          <SidebarSection title="LANGUAGES" accentColor={accentColor}>
            <div style={{ display: 'grid', gap: 2, color: 'rgba(255,255,255,0.9)' }}>
              {languages.map((lang, i) => (
                <Bullet key={`${lang}-${i}`} accentColor={accentColor}>{lang}</Bullet>
              ))}
            </div>
          </SidebarSection>
        )}
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main ref={mainRef} style={{ flex: 1, boxSizing: 'border-box', padding: '45px 30px 34px' }}>

        {/* PROFESSIONAL SUMMARY */}
        <MainSection title="PROFESSIONAL SUMMARY">
          <p style={{ margin: 0, fontSize: '11pt', fontWeight: 400, color: '#363c42', lineHeight: 1.45 }}>
            {summary}
          </p>
        </MainSection>

        {/* WORK EXPERIENCE */}
        <MainSection title="WORK EXPERIENCE">
          {experiences.map((exp, index) => {
            const points   = exp.points || exp.responsibilities || (exp.description ? [exp.description] : [])
            const role     = exp.role || exp.jobTitle || 'Job Title'
            const dates    = [
              formatDate(exp.startDate),
              exp.endDate ? formatDate(exp.endDate) : exp.startDate ? 'Present' : '',
            ].filter(Boolean).join(' – ')
            const location = [exp.city, exp.state].filter(Boolean).join(', ')
            const company  = exp.company || (exp.employer === 'Other' ? exp.employerOther : exp.employer) || 'Company Name'

            return (
              <div key={exp.id || index} style={{ marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600 }}>
                  {company}
                  {location && (
                    <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>
                      | {location}
                    </span>
                  )}
                </p>
                <p style={{ margin: '2px 0 4px', fontSize: '13pt', fontWeight: 600, color: '#374151' }}>
                  {role}
                  {dates && (
                    <span style={{ marginLeft: 6, fontSize: '9.75pt', fontWeight: 400, color: '#6b7280' }}>
                      | {dates}
                    </span>
                  )}
                </p>
                {points.slice(0, 3).map((pt, i) => (
                  <Bullet key={i} accentColor={accentColor}>{pt}</Bullet>
                ))}
              </div>
            )
          })}
        </MainSection>

        {/* PROJECTS */}
        <MainSection title="PROJECTS">
          {projects.map((project, index) => (
            <div key={project.id || index} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <p style={{ margin: 0, fontSize: '13pt', fontWeight: 600 }}>
                  {project.title || project.name || 'Project Name'}
                </p>
                <p style={{ margin: 0, fontSize: '9.75pt', color: '#6b7280', whiteSpace: 'nowrap' }}>
                  {project.startDate && `${formatDate(project.startDate)} – ${project.ongoing ? 'Present' : formatDate(project.endDate)}`}
                </p>
              </div>
              <p style={{ margin: '2px 0 4px', fontSize: '10pt', fontWeight: 500, color: '#525a62' }}>
                Technologies: {project.technologies || project.techStack?.join(', ') || 'Technologies'}
              </p>
              {project.description && <Bullet accentColor={accentColor}>{project.description}</Bullet>}
              {project.highlights  && <Bullet accentColor={accentColor}>{project.highlights}</Bullet>}
            </div>
          ))}
        </MainSection>

        {/* EDUCATION */}
        <MainSection title="EDUCATION">
          {education.map((item, index) => {
            const dates = [item.startYear, item.endYear].filter(Boolean).join(' – ')
            return (
              <div key={item.id || index} style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600 }}>
                    {item.institution || item.schoolName || 'College / University'}
                  </p>
                  <p style={{ margin: 0, fontSize: '11.5pt', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {dates || 'Passing Year'}
                  </p>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '11pt', fontWeight: 400, fontStyle: 'italic', color: '#525a62' }}>
                  {item.degree || item.fieldStudy || 'Degree'}
                  {(item.cgpa || item.score) && ` | CGPA: ${item.cgpa || item.score}`}
                </p>
              </div>
            )
          })}
        </MainSection>

      </main>
    </div>
  )
}
