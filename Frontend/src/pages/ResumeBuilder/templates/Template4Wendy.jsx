/**
 * Template 4 – Wonsulting Wendy (Minimal ATS / Single-column)
 * Clean black/white, no sidebar, dense text, bold name header
 * A4: 794 × 1123 px
 */
import { useResume } from '../../../context/ResumeContext'

function formatMonthYear(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  return match ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[2]) - 1]} ${match[1]}` : value
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{
        fontSize: '13pt', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: 1, color: '#111',
        borderBottom: '1.5px solid #111',
        paddingBottom: 3, marginBottom: 8,
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function ExpEntry({ role, company, location, startDate, endDate, points, description }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{ fontWeight: 700, fontSize: 11, margin: 0, color: '#111' }}>{company}</p>
        <p style={{ fontSize: 10, color: '#555', margin: 0, whiteSpace: 'nowrap', marginLeft: 8 }}>{location}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p style={{ fontSize: 10.5, fontStyle: 'italic', color: '#333', margin: '1px 0 4px' }}>{role}</p>
        <p style={{ fontSize: 10, color: '#555', margin: '1px 0 4px', whiteSpace: 'nowrap', marginLeft: 8 }}>{formatMonthYear(startDate)} – {formatMonthYear(endDate) || 'Present'}</p>
      </div>
      {/* description string (from form) */}
      {description && !(points?.length) && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
          <span style={{ fontSize: 10, marginTop: 1, flexShrink: 0 }}>•</span>
          <span style={{ fontSize: 10.5, color: '#222', lineHeight: 1.55 }}>{description}</span>
        </div>
      )}
      {(points || []).map((pt, i) => (
        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
          <span style={{ fontSize: 10, marginTop: 1, flexShrink: 0 }}>•</span>
          <span style={{ fontSize: 10.5, color: '#222', lineHeight: 1.55 }}>{pt}</span>
        </div>
      ))}
    </div>
  )
}

export default function Template4Wendy() {
  const ctx = useResume()

  const p      = ctx?.profileData || {}
  const name   = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Wonsulting Wendy'
  const city   = [p.city, p.state].filter(Boolean).join(', ') || 'Los Angeles, CA'
  const email  = p.email || 'hello@wonsulting.com'
  const phone  = p.phone || '562-111-1111'
  const linkedin = ctx?.websites?.linkedin || p.linkedin || 'LinkedIn'
  const github = ctx?.websites?.github || p.github || 'GitHub'
  const profession = p.profession || 'Marketing Strategist'

  const summary        = ctx?.summary        || ''
  const experiences    = ctx?.experiences    || []
  const education      = ctx?.education      || []
  const skills         = ctx?.skills         || []
  const websites       = ctx?.websites       || {}
  const projects       = ctx?.projects       || []
  const certifications = ctx?.certifications || []
  const achievements   = ctx?.achievements   || []
  const ctxLanguages   = (p.languages || []).map(language => typeof language === 'string' ? language : language.language).filter(Boolean)
  const skillsDet      = ctx?.skillsDetailed || {}
  const interests      = ctx?.interests      || []
  const hobbies        = ctx?.hobbies        || []
  const references     = ctx?.references     || []

  const webLinks = [
    websites.linkedin  && websites.linkedin,
    websites.github    && websites.github,
    websites.portfolio && websites.portfolio,
    websites.other     && websites.other,
  ].filter(Boolean)

  const defaultExp = [
    {
      company: 'Sprout Social', location: 'Los Angeles, CA',
      role: 'Marketing Strategist', startDate: 'September 2020', endDate: 'Present',
      points: [
        'Generated reports on Sprout Social and Excel to conduct trend analyses for social media content, identifying niche to optimize organic reach from 13% to 27% in a span of 3 months.',
        'Collaborated with senior management including marketing lead to grow Instagram and LinkedIn accounts, implementing posting schedules for popular content which increased followers to 108k+.',
        'Provided recommendations to 20+ student groups for career tips, conducting market research on Qualtrics for 100+ infographics and video content on TikTok.',
        'Utilize CRM platforms including Salesforce and HubSpot to service 50+ clients daily, working with sales team to identify pain points and marketing opportunities for success stories.',
      ],
    },
    {
      company: 'Target', location: 'San Jose, CA',
      role: 'Sales Manager', startDate: 'January 2019', endDate: 'January 2020',
      points: [
        'Analyzed financial statements, business summary reports, and dashboard recaps to attain data based on product comparison, identifying a lead penetration rate for new customers that increased customer efficiency by 16%.',
        'Collaborated with senior management at multiple functions including customer success and finance, increasing survey submissions from 60% previous month to 73% by identifying the pain points of customer feedback.',
        'Evaluated 100+ employees in 6 departments through surveys and office hours assessing strengths and overall skills which improved productivity for tasks by 23% daily.',
      ],
    },
    {
      company: 'Nordstrom', location: 'San Francisco, CA',
      role: 'Seasonal Sales Associate', startDate: 'April 2018', endDate: 'September 2018',
      points: [
        'Presented recommendations for seasonal sale items including clothing and electronics to senior management, streamlining POS which accumulated to $1,500 in sales daily.',
        'Reviewed P&L with sales lead and district manager to identify highest & lowest penetration rates on all products, analyzing all products which increased efficiency of deliveries from store to customer by 17%.',
        'Maintained and built relationships with 100+ customers daily, providing exceptional customer service and efficient product deliverables which translated to a customer satisfaction rating score of 97%.',
      ],
    },
  ]

  const defaultEdu = [
    {
      degree: 'BS in Business Administration-Marketing (GPA: 3.9)',
      institution: 'San Jose State University',
      startYear: '', endYear: 'Graduation Date: June 2019',
      honors: 'Organizations/Awards: Honors Program, Second Harvest, Dean\'s Honors List, Chancellor\'s Honors List',
    },
  ]

  const displayExp = experiences.length ? experiences : defaultExp
  const displayEdu = education.length ? education : defaultEdu

  const displaySkills = skills.length
    ? skills.map(s => s.name || s).join(' | ')
    : 'Microsoft Office (Excel, PowerPoint) | Sprout Social | Salesforce | HubSpot | Qualtrics | CRM | Marketing & Operations, Analytics, Career Consulting, Speaking at Universities, Basketball'

  return (
    <div style={{
      width: 794, minHeight: 1123,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: '#fff', padding: '40px 48px',
      boxSizing: 'border-box', fontSize: 11,
    }}>
      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: 14, borderBottom: '1.5px solid #111', paddingBottom: 10 }}>
        <p style={{ fontSize: '18pt', fontWeight: 700, color: '#111', margin: '0 0 4px', letterSpacing: 0.5, fontFamily: "'Arial', sans-serif" }}>{name}</p>
        <p style={{ fontSize: '10pt', fontWeight: 600, color: '#333', margin: '0 0 4px' }}>{profession}</p>
        <p style={{ fontSize: '9.5pt', color: '#333', margin: 0 }}>
          {city} {city && (phone || linkedin || github || email || p.dob) ? '|' : ''} {linkedin} {github ? `| ${github}` : ''} {phone ? `| ${phone}` : ''} {email ? `| ${email}` : ''} {p.dob ? `| DOB: ${p.dob}` : ''}
        </p>
      </div>

      <Section title="Professional Summary">
        <p style={{ fontSize: 10.5, color: '#222', margin: 0, lineHeight: 1.6 }}>
          {summary || 'Write a short professional summary highlighting your experience, skills, and career goals.'}
        </p>
      </Section>

      {/* ── WORK EXPERIENCE ── */}
      <Section title="Work Experience">
        {displayExp.map((exp, i) => (
          <ExpEntry key={i}
            role={exp.role || exp.jobTitle}
            company={exp.company || (exp.employer === 'Other' ? exp.employerOther : exp.employer)}
            location={exp.location || [exp.city, exp.state].filter(Boolean).join(', ')}
            startDate={exp.startDate}
            endDate={exp.endDate}
            points={exp.points || exp.responsibilities || []}
            description={exp.description || ''}
          />
        ))}
      </Section>

      {/* ── EDUCATION ── */}
      <Section title="Education">
        {displayEdu.map((edu, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontWeight: 700, fontSize: 11, margin: 0 }}>{edu.institution || edu.degree}</p>
              <p style={{ fontSize: 10, color: '#555', margin: 0, whiteSpace: 'nowrap', marginLeft: 8 }}>
                {[edu.startYear, edu.endYear].filter(Boolean).join(' - ')}
              </p>
            </div>
            <p style={{ fontSize: 10.5, fontStyle: 'italic', color: '#333', margin: '2px 0 0' }}>
              {edu.degree}
              {edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ''}
            </p>
          </div>
        ))}
      </Section>

      {/* ── SKILLS & INTERESTS ── */}
      <Section title="Skills & Interests">
        <p style={{ fontSize: 10.5, color: '#222', margin: 0, lineHeight: 1.6 }}>
          <strong>Skills:</strong> {displaySkills}
        </p>
        {ctxLanguages.length > 0 && <p style={{ fontSize: 10.5, color: '#222', margin: '4px 0 0', lineHeight: 1.6 }}><strong>Languages:</strong> {ctxLanguages.join(', ')}</p>}
      </Section>

      {/* ── PROJECTS ── */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p style={{ fontWeight: 700, fontSize: 11, margin: 0, color: '#111' }}>{proj.title}</p>
                <p style={{ fontSize: 10, color: '#555', margin: 0, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {proj.startDate}{proj.ongoing ? ' – Present' : proj.endDate ? ` – ${proj.endDate}` : ''}
                </p>
              </div>
              {proj.role && <p style={{ fontSize: 10.5, fontStyle: 'italic', color: '#333', margin: '1px 0 3px' }}>{proj.role}</p>}
              {proj.technologies && <p style={{ fontSize: 10, color: '#555', margin: '0 0 4px' }}><strong>Tech:</strong> {proj.technologies}</p>}
              {proj.description && (
                <div style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, marginTop: 1, flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: 10.5, color: '#222', lineHeight: 1.55 }}>{proj.description}</span>
                </div>
              )}
              {proj.highlights && (
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ fontSize: 10, marginTop: 1, flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: 10.5, color: '#222', lineHeight: 1.55 }}>{proj.highlights}</span>
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── ACHIEVEMENTS ── */}
      {achievements.length > 0 && (
        <Section title="Achievements">
          {achievements.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 10, marginTop: 1 }}>•</span>
              <span style={{ fontSize: 10.5, color: '#222' }}>{typeof a === 'string' ? a : a.text}</span>
            </div>
          ))}
        </Section>
      )}

      {/* ── LANGUAGES ── */}
      {false && ctxLanguages.length > 0 && (
        <Section title="Languages">
          {ctxLanguages.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 10, marginTop: 1 }}>•</span>
              <span style={{ fontSize: 10.5, color: '#222' }}>{typeof l === 'string' ? l : l.name}</span>
            </div>
          ))}
        </Section>
      )}

      {/* ── INTERESTS & HOBBIES ── */}
      {(interests.length > 0 || hobbies.length > 0) && (
        <Section title="Interests & Hobbies">
          {[...interests, ...hobbies].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 10, marginTop: 1 }}>•</span>
              <span style={{ fontSize: 10.5, color: '#222' }}>{item}</span>
            </div>
          ))}
        </Section>
      )}

      {/* ── REFERENCES ── */}
      {references.length > 0 && (
        <Section title="References">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {references.map((ref, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <p style={{ fontWeight: 700, fontSize: 11, margin: '0 0 1px' }}>{ref.name}</p>
                {ref.title   && <p style={{ fontSize: 10.5, fontStyle: 'italic', color: '#333', margin: 0 }}>{ref.title}{ref.company ? ` – ${ref.company}` : ''}</p>}
                {ref.phone   && <p style={{ fontSize: 10, color: '#555', margin: 0 }}>{ref.phone}</p>}
                {ref.email   && <p style={{ fontSize: 10, color: '#555', margin: 0 }}>{ref.email}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── WEBSITES & PORTFOLIO ── */}
      {webLinks.length > 0 && (
        <Section title="Websites & Portfolio">
          {webLinks.map((link, i) => (
            <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 10, marginTop: 1 }}>•</span>
              <span style={{ fontSize: 10.5, color: '#222' }}>{link.replace(/^https?:\/\//, '')}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}
