import staticData from '../../../data/resumeData'

export function buildResumeData(ctx) {
  const isDemo = !ctx
  const p          = ctx?.profileData

  const name     = isDemo
    ? staticData.name
    : `${p?.firstName || ''} ${p?.middleName || ''} ${p?.lastName || ''}`.replace(/\s+/g, ' ').trim()

  const title    = isDemo ? staticData.title : (p?.profession || '')
  const email    = isDemo ? staticData.contact.email : (p?.email || '')
  const phone    = isDemo ? staticData.contact.phone : (p?.phone || '')
  const dob      = isDemo ? '' : (p?.dob || '')
  const location = isDemo
    ? staticData.contact.location
    : [p?.city, p?.state, p?.nationality].filter(Boolean).join(', ')

  const rawExp    = isDemo ? staticData.experience : (ctx.experiences || [])
  const rawSkills = isDemo ? staticData.skills : (ctx.skills || [])
  const profileLanguages = (p?.languages || []).map(language => typeof language === 'string' ? language : language.language).filter(Boolean)
  const summary   = isDemo ? staticData.profile : (ctx.summary || '')
  const rawEdu    = isDemo ? staticData.education : (ctx.education || [])
  const websites  = isDemo ? staticData.contact : (ctx.websites || {})
  const projects  = isDemo ? staticData.projects : (ctx.projects || [])

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
    linkedin:       websites.linkedin || '',
    github:         websites.github   || '',
    education:      rawEdu,
    projects,
    certifications: isDemo ? staticData.certifications : (ctx.certifications || []),
    tools:          isDemo ? staticData.tools : [],
    languages:      isDemo ? staticData.languages : profileLanguages,
    softSkills:     isDemo ? staticData.softSkills : [],
    references:     isDemo ? staticData.references : (ctx.references || []),
  }
}
