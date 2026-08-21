import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ResumeContext } from '../../context/ResumeContext'
import templateMap from '../ResumeBuilder/templates/templateMap'

const API_BASE =
  window.location.hostname === 'host.docker.internal'
    ? 'http://host.docker.internal:8000'
    : (import.meta.env.VITE_API_URL || 'http://localhost:8000')
const A4_WIDTH = 794

function normalizeProfile(profile) {
  return {
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    middleName: '',
    dob: '',
    profession: profile?.professional_title || '',
    summary: profile?.summary || '',
    city: profile?.location || '',
    state: '',
    street: '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    languages: [],
    photo: '',
  }
}

function normalizeList(items, mapper) {
  return Array.isArray(items) ? items.map(mapper).filter(Boolean) : []
}

export default function ResumePdfRenderPage() {
  const { resumeId } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [resumeData, setResumeData] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [experienceData, setExperienceData] = useState([])
  const [educationData, setEducationData] = useState([])
  const [skillsData, setSkillsData] = useState([])
  const [projectData, setProjectData] = useState([])
  const [certificationData, setCertificationData] = useState([])
  const [languageData, setLanguageData] = useState([])
  const [achievementData, setAchievementData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!resumeId || !token) {
      setError('Missing resume render token.')
      setLoading(false)
      return
    }

    async function loadRenderData() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }

        const [resumeResponse, profileResponse, experienceResponse, educationResponse, skillResponse, projectResponse, certificationResponse, languageResponse, achievementResponse] = await Promise.all([
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}`, { headers }),
          fetch(`${API_BASE}/api/v1/profile`, { headers }),
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}/experience`, { headers }),
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}/education`, { headers }),
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}/skills`, { headers }),
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}/projects`, { headers }),
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}/certifications`, { headers }),
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}/languages`, { headers }),
          fetch(`${API_BASE}/api/v1/resumes/${resumeId}/achievements`, { headers }),
        ])

        const resume = await resumeResponse.json()
        if (!resumeResponse.ok) throw new Error(resume.detail || 'Unable to load resume.')

        const profile = await profileResponse.json().catch(() => null)
        const experience = await experienceResponse.json().catch(() => [])
        const education = await educationResponse.json().catch(() => [])
        const skills = await skillResponse.json().catch(() => [])
        const projects = await projectResponse.json().catch(() => [])
        const certifications = await certificationResponse.json().catch(() => [])
        const languages = await languageResponse.json().catch(() => [])
        const achievements = await achievementResponse.json().catch(() => [])

        setResumeData(resume)
        setProfileData(profile ? normalizeProfile(profile) : normalizeProfile({
          first_name: 'Your',
          last_name: 'Name',
          professional_title: 'Professional',
          summary: '',
          location: '',
          phone: '',
          email: '',
        }))
        setExperienceData(normalizeList(experience, (item) => ({
          ...item,
          company: item.company || item.employer || 'Company Name',
          role: item.job_title || item.role || 'Job Title',
          employer: item.company || item.employer || 'Company Name',
          employerOther: '',
          city: item.location || '',
          state: '',
          startDate: item.start_date || '',
          endDate: item.end_date || '',
          currentWork: Boolean(item.is_current),
          description: item.description || '',
          points: Array.isArray(item.points) ? item.points : (item.description ? [item.description] : []),
        })))
        setEducationData(normalizeList(education, (item) => ({
          ...item,
          institution: item.institution || 'College / University',
          schoolName: item.institution || 'College / University',
          degree: item.degree || '',
          fieldStudy: item.field_of_study || '',
          fieldOfStudy: item.field_of_study || '',
          startYear: item.start_date ? String(item.start_date).slice(0, 4) : '',
          endYear: item.end_date ? String(item.end_date).slice(0, 4) : '',
          startDate: item.start_date || '',
          endDate: item.end_date || '',
          description: item.description || '',
        })))
        setSkillsData(normalizeList(skills, (item) => ({
          ...item,
          name: item.name || '',
          category: item.category || '',
          proficiency: item.proficiency || '',
        })))
        setProjectData(normalizeList(projects, (item) => ({
          ...item,
          id: item.id,
          title: item.title || '',
          role: item.role || '',
          description: item.description || '',
          technologies: item.technologies || '',
          project_url: item.project_url || '',
          startDate: item.start_date || '',
          endDate: item.end_date || '',
          ongoing: !item.end_date,
        })))
        setCertificationData(normalizeList(certifications, (item) => ({
          ...item,
          id: item.id,
          name: item.name || '',
          issuer: item.issuing_organization || '',
          year: item.issue_date ? String(item.issue_date).slice(0, 4) : '',
          credentialId: item.credential_id || '',
          credentialUrl: item.credential_url || '',
        })))
        setLanguageData(normalizeList(languages, (item) => ({
          ...item,
          id: item.id,
          name: item.name || '',
          language: item.name || '',
          proficiency: item.proficiency || '',
        })))
        setAchievementData(normalizeList(achievements, (item) => ({
          ...item,
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          organization: item.organization || '',
          year: item.year || '',
        })))

        setLoading(false)
        window.__resumePdfReady__ = true
      } catch (err) {
        console.error('Resume PDF render prep failed:', err)
        setError(err.message || 'Unable to load resume data.')
        setLoading(false)
        window.__resumePdfReady__ = false
      }
    }

    loadRenderData()
  }, [resumeId, token])

  const templateId = Number(resumeData?.template_id || 1)
  const templateEntry = templateMap[templateId] || templateMap[1]
  const TemplateComponent = templateEntry.Component

  const contextValue = useMemo(() => ({
    profileData,
    
    experiences: experienceData,
    education: educationData,
    skills: skillsData,
    projects: projectData,
    summary: profileData?.summary || '',
    certifications: certificationData,
    languages: languageData,
    achievements: achievementData,
    activeTemplateId: templateId,
    switchTemplate: () => {},
    currentResume: resumeData,
    currentResumeId: resumeId,
    resumeLoading: false,
    resumeError: '',
  }), [profileData, experienceData, educationData, skillsData, projectData, certificationData, languageData, achievementData, resumeData, resumeId, templateId])

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f3f4f6' }}>Preparing PDF render…</div>
  }

  if (error) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fff2f2', color: '#991b1b' }}>{error}</div>
  }

  return (
    <ResumeContext.Provider value={contextValue}>
      <div style={{ width: '100%', minHeight: '100vh', background: '#f5f7fa', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: A4_WIDTH, minHeight: 1123, background: '#fff', boxShadow: '0 0 0 1px rgba(15,23,42,0.05)' }}>
          <TemplateComponent />
        </div>
      </div>
    </ResumeContext.Provider>
  )
}
