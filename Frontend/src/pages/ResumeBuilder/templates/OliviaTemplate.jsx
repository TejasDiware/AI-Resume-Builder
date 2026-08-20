import { useRef } from 'react'
import { useResume } from '../../../context/ResumeContext'
import { buildResumeData } from './templateHelpers'
import './OliviaTemplate.css'
import { MdPhone, MdEmail, MdLanguage, MdLocationOn } from 'react-icons/md'
// ── Default data ──────────────────────────────────────────────────────────────
const defaults = {
  firstName:  'Olivia',
  lastName:   'Wilson',
  profession: 'Designer and Architect',
  photo:      null,
  about:      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi.',
  phone:      '+123-456-7890',
  email:      'hello@reallygreatsite.com',
  website:    'www.reallygreatsite.com',
  address:    '123 Anywhere St., Any City, ST 12345',
  skills:     ['Editing Software', 'Architectural Software', 'Photo Editing', 'Video Editing'],
  languages:  ['Spanish', 'English', 'Italian'],
  experience: [
    {
      role:    'Designer and Team Leader',
      company: 'Wardiere Inc.',
      period:  '2020 - 2025',
      desc:    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi.',
    },
    {
      role:    'Architect',
      company: 'Larana Company',
      period:  '2015 - 2020',
      desc:    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi.',
    },
    {
      role:    'Designer (Internship)',
      company: 'Studio Shodwe',
      period:  '2012 - 2014',
      desc:    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi.',
    },
  ],
  education: [
    { degree: 'Bachelor of Design',      school: 'Borcelle University', period: '2008 - 2012' },
    { degree: 'Bachelor of Architecture', school: 'Borcelle University', period: '2005 - 2009' },
  ],
}

export default function OliviaTemplate() {
  const pageRef = useRef()
  const ctx     = useResume()
  const d       = buildResumeData(ctx)

  // Merge context with defaults
  const p          = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName)

  const firstName  = hasProfile ? (p.firstName || defaults.firstName) : defaults.firstName
  const lastName   = hasProfile ? (p.lastName  || defaults.lastName)  : defaults.lastName
  const profession = hasProfile ? (p.profession || defaults.profession) : defaults.profession
  const photo      = ctx?.profileData?.photo || d.photo || defaults.photo
  const email      = d.email || defaults.email
  const phone      = d.phone || defaults.phone
  const address    = hasProfile
    ? [p.street, p.city, p.state].filter(Boolean).join(', ') || defaults.address
    : defaults.address
  const website    = defaults.website
  const about      = d.summary || defaults.about
  const skills     = d.skills?.length     > 0 ? d.skills     : defaults.skills
  const languages  = d.languages?.length  > 0 ? d.languages  : defaults.languages

  const experience = ctx?.experiences?.length > 0
    ? ctx.experiences.map(e => ({
        role:    e.jobTitle  || e.role    || '',
        company: e.employer === 'Other' ? (e.employerOther || '') : (e.employer || e.company || ''),
        period:  e.startDate ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}` : (e.period || ''),
        desc:    e.description || (e.points?.join('. ') || ''),
      }))
    : defaults.experience

  const education = d.education?.length > 0
    ? d.education.map(e => ({
        degree: e.degree,
        school: e.institution,
        period: e.period,
      }))
    : defaults.education

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownload = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin:      0,
      filename:    `${firstName}_${lastName}_Resume.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:       { unit: 'px', format: [794, 1123], orientation: 'portrait' },
    }
    html2pdf().set(opt).from(pageRef.current).save()
  }

  return (
    <div className="olivia-wrapper">

      {/* Download button — outside page */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100 }}>
        <button
          onClick={handleDownload}
          style={{
            background: '#b07a6a', color: '#fff', border: 'none',
            borderRadius: 999, padding: '10px 24px',
            fontFamily: 'Arial, sans-serif', fontSize: '0.85rem',
            fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* ── A4 Page ── */}
      <div className="olivia-page" ref={pageRef} id="olivia-resume">

        {/* ════ LEFT COLUMN ════ */}
        <div className="olivia-left">

          {/* Photo */}
          {photo && (
            <div className="olivia-photo-frame">
              <img src={photo} alt={`${firstName} ${lastName}`} />
            </div>
          )}

          {/* About Me */}
          <div className="olivia-left-section">
            <div className="olivia-section-label">About Me</div>
            <p className="olivia-about-text">{about}</p>
          </div>

          {/* Contact */}
          <div className="olivia-left-section">
            <div className="olivia-section-label">Contact</div>
            <div className="olivia-contact-item">
              <MdPhone className="olivia-contact-icon" />
              <span>{phone}</span>
            </div>
            <div className="olivia-contact-item">
              <MdEmail className="olivia-contact-icon" />
              <span>{email}</span>
            </div>
            <div className="olivia-contact-item">
              <MdLanguage className="olivia-contact-icon" />
              <span>{website}</span>
            </div>
            <div className="olivia-contact-item">
              <MdLocationOn className="olivia-contact-icon" />
              <span>{address}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="olivia-left-section">
            <div className="olivia-section-label">Skills</div>
            {skills.map((s, i) => (
              <div key={i} className="olivia-list-item">{s}</div>
            ))}
          </div>

          {/* Languages */}
          <div className="olivia-left-section">
            <div className="olivia-section-label">Languages</div>
            {languages.map((l, i) => (
              <div key={i} className="olivia-list-item">{l}</div>
            ))}
          </div>

        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div className="olivia-right">

          {/* Name */}
          <p className="olivia-name-script">{firstName}</p>
          <p className="olivia-name-last">{lastName}</p>
          <div className="olivia-divider-rose" />
          <p className="olivia-profession">{profession}</p>

          {/* Work Experience */}
          <div className="olivia-right-section-heading">Work Experience</div>

          {experience.map((exp, i) => (
            <div key={i} className="olivia-exp-entry">
              <p className="olivia-exp-role">{exp.role}</p>
              <p className="olivia-exp-company">{exp.company}</p>
              <p className="olivia-exp-period">{exp.period}</p>
              <p className="olivia-exp-desc">{exp.desc}</p>
            </div>
          ))}

          {/* Education */}
          <div className="olivia-right-section-heading" style={{ marginTop: 8 }}>Education</div>

          {education.map((edu, i) => (
            <div key={i} className="olivia-edu-entry">
              <p className="olivia-edu-degree">{edu.degree}</p>
              <p className="olivia-edu-school">{edu.school}</p>
              <p className="olivia-edu-period">{edu.period}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
