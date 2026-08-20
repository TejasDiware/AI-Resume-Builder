import staticData from '../../../data/resumeData'

export function buildResumeData(ctx) {
  const p          = ctx?.profileData
  const hasProfile = p && (p.firstName || p.lastName || p.email)

  const name     = hasProfile
    ? `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.replace(/\s+/g, ' ').trim()
    : staticData.name

  const title    = hasProfile ? (p.profession || staticData.title) : staticData.title
  const email    = hasProfile ? (p.email  || '') : staticData.contact.email
  const phone    = hasProfile ? (p.phone  || '') : staticData.contact.phone
  const dob      = hasProfile ? (p.dob || '') : ''
  const location = hasProfile
    ? [p.city, p.state, p.nationality].filter(Boolean).join(', ')
    : staticData.contact.location

  const rawExp    = ctx?.experiences?.length > 0 ? ctx.experiences : staticData.experience
  const rawSkills = ctx?.skills?.length > 0      ? ctx.skills      : staticData.skills
  const profileLanguages = (p?.languages || []).map(language => typeof language === 'string' ? language : language.language).filter(Boolean)
  const summary   = ctx?.summary                 ? ctx.summary     : staticData.profile
  const rawEdu    = ctx?.education?.length > 0   ? ctx.education   : staticData.education
  const websites  = ctx?.websites || {}
  const projects  = ctx?.projects?.length > 0    ? ctx.projects    : staticData.projects

  // photo — use uploaded photo from context, fallback to null
  const photo = p?.photo || null

  const expList = rawExp.map(e => ({
    role:    e.role    || e.jobTitle || '',
    company: e.company || (e.employer === 'Other' ? (e.employerOther || '') : (e.employer || '')) || '',
    period:  e.period  || (e.startDate
      ? `${e.startDate} – ${e.currentWork ? 'Present' : (e.endDate || '')}`
      : ''),
    points:  e.points  || (e.description ? [e.description] : []),
  }))

  return {
    name,
    title,
    email,
    phone,
    dob,
    location,
    summary,
    skills:         rawSkills,
    expList,
    photo,
    linkedin:       websites.linkedin || staticData.contact.linkedin,
    github:         websites.github   || staticData.contact.github,
    education:      rawEdu,
    projects,
    certifications: staticData.certifications,
    tools:          staticData.tools,
    languages:      profileLanguages.length ? profileLanguages : staticData.languages,
    softSkills:     staticData.softSkills,
    references:     staticData.references,
  }
}
