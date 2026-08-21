import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import {
  achievementApi,
  certificationApi,
  languageApi,
  profileApi,
  resumeApi,
} from '../utils/api'

const ResumeContext = createContext(null)

export { ResumeContext }

const STORAGE_KEY = 'rb_resume_data'
const SHARED_KEY = 'rb_resume_shared'
const RESUME_SCOPED_FIELDS = new Set([
  'experiences',
  'education',
  'skills',
  'skillsDetailed',
  'projects',
  'summary',
  'resumeTitle',
  'certifications',
  'achievements',
  'languages',
  'interests',
  'hobbies',
  'references',
  'profileSaved',
  'experienceSaved',
  'educationSaved',
  'skillsSaved',
  'projectsSaved',
  'portfolioSaved',
])

function readStore(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(key, obj) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(obj)
    )
  } catch {
    /* quota */
  }
}

function load(field, fallback) {
  if (RESUME_SCOPED_FIELDS.has(field)) return fallback

  const store = readStore(STORAGE_KEY)

  return store[field] !== undefined
    ? store[field]
    : fallback
}

function usePersisted(field, fallback) {
  const [value, setValue] = useState(
    () => load(field, fallback)
  )

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function'
            ? next(prev)
            : next

        if (!RESUME_SCOPED_FIELDS.has(field)) {
          const store = readStore(STORAGE_KEY)
          store[field] = resolved
          writeStore(STORAGE_KEY, store)
        }

        return resolved
      })
    },
    [field]
  )

  return [value, set]
}

function toEditorDate(value) {
  return value ? String(value).slice(0, 10) : ''
}

function normalizeResumeSections({
  profile,
  experience,
  education,
  skills,
  projects,
  certifications,
  languages,
  achievements,
}) {
  const normalizedProfile = profile
    ? {
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        profession: profile.professional_title || '',
        summary: profile.summary || '',
        city: profile.location || '',
        email: profile.email || '',
        languages: (languages || []).map((item) => ({
          language: item.name || '',
          proficiency: item.proficiency || '',
        })).filter((item) => item.language),
      }
    : null

  return {
    profile: normalizedProfile,
    websites: {
      linkedin: profile?.linkedin_url || '',
      github: profile?.github_url || '',
      portfolio: profile?.portfolio_url || '',
      other: '',
    },
    experience: (experience || []).map((item) => ({
      id: item.id,
      jobTitle: item.job_title || '',
      employer: item.company || '',
      employerOther: '',
      city: item.location || '',
      state: '',
      startDate: toEditorDate(item.start_date),
      endDate: toEditorDate(item.end_date),
      currentWork: Boolean(item.is_current),
      description: item.description || '',
    })),
    education: (education || []).map((item) => ({
      id: item.id,
      institution: item.institution || '',
      schoolName: item.institution || '',
      degree: item.degree || '',
      fieldStudy: item.field_of_study || '',
      fieldOfStudy: item.field_of_study || '',
      startYear: item.start_date ? String(item.start_date).slice(0, 4) : '',
      endYear: item.end_date ? String(item.end_date).slice(0, 4) : '',
      startDate: toEditorDate(item.start_date),
      endDate: toEditorDate(item.end_date),
      description: item.description || '',
    })),
    skills: (skills || []).map((item) => ({
      id: item.id,
      name: item.name || '',
      category: item.category || '',
      proficiency: item.proficiency || '',
    })),
    projects: (projects || []).map((item) => ({
      ...item,
      id: item.id,
      title: item.title || '',
      role: item.role || '',
      description: item.description || '',
      technologies: item.technologies || '',
      project_url: item.project_url || '',
      startDate: toEditorDate(item.start_date),
      endDate: toEditorDate(item.end_date),
      ongoing: !item.end_date,
    })),
    certifications: (certifications || []).map((item) => ({
      ...item,
      id: item.id,
      name: item.name || '',
      issuer: item.issuing_organization || '',
      year: item.issue_date ? String(item.issue_date).slice(0, 4) : '',
      credentialId: item.credential_id || '',
      credentialUrl: item.credential_url || '',
    })),
    languages: (languages || []).map((item) => ({
      ...item,
      id: item.id,
      name: item.name || '',
      language: item.name || '',
      proficiency: item.proficiency || '',
    })),
    achievements: (achievements || []).map((item) => ({
      ...item,
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      organization: item.organization || '',
      year: item.year || '',
    })),
  }
}

async function reconcileResumeCollection({
  api,
  resumeId,
  entries,
  toPayload,
  assertActive,
}) {
  assertActive()
  const { data: existing } = await api.list(resumeId)
  const existingById = new Map((existing || []).map((item) => [String(item.id), item]))
  const retainedIds = new Set()

  for (const entry of entries || []) {
    assertActive()
    const existingItem = entry.id == null
      ? null
      : existingById.get(String(entry.id))
    const payload = toPayload(entry)

    if (existingItem) {
      retainedIds.add(String(existingItem.id))
      await api.update(resumeId, existingItem.id, payload)
    } else {
      await api.create(resumeId, payload)
    }
  }

  for (const item of existing || []) {
    assertActive()
    if (!retainedIds.has(String(item.id))) {
      await api.delete(resumeId, item.id)
    }
  }

  assertActive()
  const { data: saved } = await api.list(resumeId)
  assertActive()
  return Array.isArray(saved) ? saved : []
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ResumeProvider
 * ───────────────────────────────────────────────────────────────────────────── */

export function ResumeProvider({ children }) {
  /* ── Resume data ───────────────────────────────────────────────────────── */

  const [profileData, setProfileData] =
    usePersisted('profileData', {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dob: '',
      marital: '',
      profession: '',
      languages: [],
      street: '',
      city: '',
      state: '',
      nationality: '',
      passport: '',
      phone: '',
      email: '',
      photo: '',
    })

  const [experiences, setExperiences] =
    usePersisted(
      'experiences',
      []
    )

  const [education, setEducation] =
    usePersisted(
      'education',
      []
    )

  const [skills, setSkills] =
    usePersisted(
      'skills',
      []
    )

  const [skillsDetailed, setSkillsDetailed] =
    usePersisted(
      'skillsDetailed',
      {
        programmingLanguages: '',
        frameworks: '',
        frontend: '',
        backend: '',
        databases: '',
        tools: '',
        versionControl: '',
        other: '',
      }
    )

  const [websites, setWebsites] =
    usePersisted(
      'websites',
      {
        linkedin: '',
        github: '',
        portfolio: '',
        other: '',
      }
    )

  const [projects, setProjects] =
    usePersisted(
      'projects',
      []
    )

  const [summary, setSummary] =
    usePersisted(
      'summary',
      ''
    )

  const [resumeTitle, setResumeTitle] =
    usePersisted(
      'resumeTitle',
      ''
    )

  const [certifications, setCertifications] =
    usePersisted(
      'certifications',
      []
    )

  const [achievements, setAchievements] =
    usePersisted(
      'achievements',
      []
    )

  const [languages, setLanguages] =
    usePersisted(
      'languages',
      []
    )

  const [interests, setInterests] =
    usePersisted(
      'interests',
      []
    )

  const [hobbies, setHobbies] =
    usePersisted(
      'hobbies',
      []
    )

  const [references, setReferences] =
    usePersisted(
      'references',
      []
    )

  const [profileSaved, setProfileSaved] =
    usePersisted(
      'profileSaved',
      false
    )

  const [experienceSaved, setExperienceSaved] =
    usePersisted(
      'experienceSaved',
      false
    )

  const [educationSaved, setEducationSaved] =
    usePersisted(
      'educationSaved',
      false
    )

  const [skillsSaved, setSkillsSaved] =
    usePersisted(
      'skillsSaved',
      false
    )

  const [projectsSaved, setProjectsSaved] =
    usePersisted(
      'projectsSaved',
      false
    )

  const [portfolioSaved, setPortfolioSaved] =
    usePersisted(
      'portfolioSaved',
      false
    )



  const [savedResumes, setSavedResumes] =
    useState([])

  const [resumesLoading, setResumesLoading] =
    useState(false)

  const [resumesError, setResumesError] =
    useState('')

  const [resumeLoading, setResumeLoading] =
    useState(false)

  const [resumeError, setResumeError] =
    useState('')

  const [currentResumeId, setCurrentResumeIdRaw] =
    useState(() => {
      const store = readStore(SHARED_KEY)
      const stored = store.currentResumeId

      // Reject fake local IDs (Date.now() timestamps > PostgreSQL int max).
      // These were written before backend creation was wired up correctly.
      const MAX_BACKEND_ID = 2_147_483_647
      const n = Number(stored)
      if (stored && Number.isInteger(n) && n > 0 && n <= MAX_BACKEND_ID) {
        return stored
      }

      // Stale fake ID found — clear it so the dashboard doesn't fire a bad request.
      if (stored) {
        try {
          const cleaned = readStore(SHARED_KEY)
          delete cleaned.currentResumeId
          writeStore(SHARED_KEY, cleaned)
        } catch { /* ignore */ }
      }

      return null
    })

  const [currentResume, setCurrentResume] = useState(null)
  const hydratedResumeIdRef = useRef(null)
  const hydrationRequestRef = useRef(0)
  const loadingResumeIdRef = useRef(null)
  const activeResumeIdRef = useRef(currentResumeId)

  /* ── Current resume ID persistence ───────────────────────────────────── */

  const setCurrentResumeId =
    useCallback((next) => {
      setCurrentResumeIdRaw((prev) => {
        const resolved =
          typeof next === 'function'
            ? next(prev)
            : next

        // Only persist real backend IDs — never fake Date.now() timestamps.
        const MAX_BACKEND_ID = 2_147_483_647
        const n = Number(resolved)
        const isRealId =
          resolved !== null &&
          Number.isInteger(n) &&
          n > 0 &&
          n <= MAX_BACKEND_ID

        const store = readStore(SHARED_KEY)

        if (isRealId) {
          store.currentResumeId = resolved
        } else {
          delete store.currentResumeId
        }

        writeStore(SHARED_KEY, store)

        activeResumeIdRef.current = isRealId ? resolved : null

        return isRealId ? resolved : null
      })
    }, [])

  /* ── Active template ─────────────────────────────────────────────────── */



  const [activeTemplateId, setActiveTemplateId] =
    useState(() => {
      try {
        const params =
          new URLSearchParams(
            window.location.search
          )

        const fromUrl = Number(
          params.get('template')
        )

        if (
          Number.isInteger(fromUrl) &&
          fromUrl > 0
        ) {
          return fromUrl
        }

        const store =
          readStore(SHARED_KEY)

        const storedTemplate =
          Number(
            store.activeTemplateId
          )

        if (
          Number.isInteger(
            storedTemplate
          ) &&
          storedTemplate > 0
        ) {
          return storedTemplate
        }

        return 1
      } catch {
        return 1
      }
    })

  const switchTemplate =
    useCallback((newId) => {
      const id = Number(newId)

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return
      }

      setActiveTemplateId(id)

      const store =
        readStore(SHARED_KEY)

      store.activeTemplateId = id

      writeStore(
        SHARED_KEY,
        store
      )
    }, [])

  /* ── Transient flags ─────────────────────────────────────────────────── */

  const [cvImported, setCvImported] =
    useState(false)

  const [isAuthenticated, setIsAuthenticated] =
    useState(false)

  
  const loadResumes =
    useCallback(async () => {
      try {
        setResumesLoading(true)
        setResumesError('')

        const { data } =
          await resumeApi.list()

        const resumes =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.items
              )
              ? data.items
              : []

        const uniqueResumes = Array.from(
          new Map(
            resumes
              .filter((resume) => resume?.id != null)
              .map((resume) => [String(resume.id), resume])
          ).values()
        )

        setSavedResumes(uniqueResumes)

        // If the stored currentResumeId is not in the fetched list,
        // it's a stale or fake ID — clear it so the dashboard doesn't
        // fire a request with a non-existent ID.
        setCurrentResumeIdRaw((prev) => {
          if (!prev) return prev
          const exists = uniqueResumes.some((r) => String(r.id) === String(prev))
          if (exists) return prev
          // Clear from localStorage too
          try {
            const store = readStore(SHARED_KEY)
            delete store.currentResumeId
            writeStore(SHARED_KEY, store)
          } catch { /* ignore */ }
          return null
        })

        return uniqueResumes
      } catch (err) {
        console.error(
          'loadResumes failed:',
          err
        )

        setResumesError(
          err.response?.data?.detail ||
          'Failed to load resumes'
        )

        return []
      } finally {
        setResumesLoading(false)
      }
    }, [])

  const loadResume = useCallback(async (resumeId) => {
    if (!resumeId) {
      throw new Error('A resume ID is required to load a resume.')
    }

    const requestId = hydrationRequestRef.current + 1
    hydrationRequestRef.current = requestId
    const normalizedResumeId = String(resumeId)
    loadingResumeIdRef.current = normalizedResumeId
    hydratedResumeIdRef.current = null
    activeResumeIdRef.current = resumeId
    setResumeLoading(true)
    setResumeError('')
    setCurrentResumeId(resumeId)
    setCurrentResume(null)
    setExperiences([])
    setEducation([])
    setSkills([])
    setProjects([])
    setCertifications([])
    setLanguages([])
    setAchievements([])

    try {
      const [resumeResponse, profileResponse, experienceResponse,
        educationResponse, skillsResponse, projectsResponse,
        certificationsResponse, languagesResponse, achievementsResponse] =
        await Promise.all([
          resumeApi.get(resumeId),
          profileApi.get().catch((error) => {
            if (error.response?.status === 404) return { data: null }
            throw error
          }),
          resumeApi.getExperience(resumeId),
          resumeApi.getEducation(resumeId),
          resumeApi.getSkills(resumeId),
          resumeApi.getProjects(resumeId),
          certificationApi.list(resumeId),
          languageApi.list(resumeId),
          achievementApi.list(resumeId),
        ])

      const resume = resumeResponse.data
      if (
        hydrationRequestRef.current !== requestId ||
        String(resume.id) !== normalizedResumeId
      ) {
        return null
      }

      const sectionForResume = (items) =>
        (Array.isArray(items) ? items : []).filter(
          (item) => String(item.resume_id) === normalizedResumeId
        )

      const normalized = normalizeResumeSections({
        profile: profileResponse.data,
        experience: sectionForResume(experienceResponse.data),
        education: sectionForResume(educationResponse.data),
        skills: sectionForResume(skillsResponse.data),
        projects: sectionForResume(projectsResponse.data),
        certifications: sectionForResume(certificationsResponse.data),
        languages: sectionForResume(languagesResponse.data),
        achievements: sectionForResume(achievementsResponse.data),
      })

      setCurrentResume(resume)
      hydratedResumeIdRef.current = String(resume.id)
      switchTemplate(resume.template_id)

      if (normalized.profile) setProfileData(normalized.profile)
      else setProfileData((previous) => ({ ...previous, languages: [] }))
      setWebsites(normalized.websites)
      setExperiences(normalized.experience)
      setEducation(normalized.education)
      setSkills(normalized.skills)
      setProjects(normalized.projects)
      setCertifications(normalized.certifications)
      setLanguages(normalized.languages)
      setAchievements(normalized.achievements)
      setSkillsDetailed({
        programmingLanguages: '',
        frameworks: '',
        frontend: '',
        backend: '',
        databases: '',
        tools: '',
        versionControl: '',
        other: '',
      })
      setInterests([])
      setHobbies([])
      setReferences([])
      setSummary(normalized.profile?.summary || '')
      setResumeTitle(resume.title || '')

      return resume
    } finally {
      if (hydrationRequestRef.current === requestId) {
        setResumeLoading(false)
        loadingResumeIdRef.current = null
      }
    }
  }, [
    setCurrentResumeId,
    setProfileData,
    setWebsites,
    setExperiences,
    setEducation,
    setSkills,
    setProjects,
    setCertifications,
    setLanguages,
    setAchievements,
    setSkillsDetailed,
    setInterests,
    setHobbies,
    setReferences,
    setSummary,
    setResumeTitle,
    switchTemplate,
  ])

  /* ─────────────────────────────────────────────────────────────────────────
   * Refresh resumes
   * ───────────────────────────────────────────────────────────────────────── */

  const refreshResumes =
    useCallback(async () => {
      return await loadResumes()
    }, [loadResumes])

  const finalizeResume =
    useCallback(
      async (resumeId) => {
        if (!resumeId) {
          throw new Error('A resume ID is required to finalize a resume.')
        }

        const { data } = await resumeApi.canonicalize(resumeId)
        const canonicalResumeId = data?.canonical_resume_id

        if (!canonicalResumeId) {
          throw new Error('The backend did not return a canonical resume ID.')
        }

        await loadResume(canonicalResumeId)
        await loadResumes()
        return canonicalResumeId
      },
      [loadResume, loadResumes]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * Load backend resumes when authenticated
   * ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    const token =
      localStorage.getItem('rb_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem(
        'access_token'
      )

    if (!token) return

    loadResumes()
  }, [loadResumes])

  useEffect(() => {
    const token = localStorage.getItem('rb_token')
    if (!token || !currentResumeId) return
    if (hydratedResumeIdRef.current === String(currentResumeId)) return

    loadResume(currentResumeId).catch((error) => {
      loadingResumeIdRef.current = null
      setResumeLoading(false)
      setResumeError(
        error.response?.data?.detail ||
        'Unable to load resume.',
      )
      console.error('loadResume failed:', error)
      setResumesError(
        error.response?.data?.detail ||
        'Failed to load the selected resume',
      )
    })
  }, [currentResumeId, loadResume])

  /* ─────────────────────────────────────────────────────────────────────────
   * Load profile from backend on mount
   * ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    const token =
      localStorage.getItem('rb_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem(
        'access_token'
      )

    if (!token || currentResumeId) return

    profileApi
      .get()
      .then(({ data }) => {
        if (!data) return

        setProfileData((prev) => ({
          ...prev,

          firstName:
            data.first_name ||
            prev.firstName ||
            '',

          lastName:
            data.last_name ||
            prev.lastName ||
            '',

          phone:
            data.phone ||
            prev.phone ||
            '',

          profession:
            data.professional_title ||
            prev.profession ||
            '',

          summary:
            data.summary ||
            prev.summary ||
            '',

          // Combine location into city if it's a single string
          city:
            data.location ||
            prev.city ||
            '',
        }))

        // Also restore summary to context
        if (data.summary) {
          setSummary((prev) => prev || data.summary)
        }

        // Restore website links from CandidateProfileResponse
        setWebsites((prev) => ({
          ...prev,
          linkedin:  data.linkedin_url  || prev.linkedin  || '',
          github:    data.github_url    || prev.github    || '',
          portfolio: data.portfolio_url || prev.portfolio || '',
        }))
      })
      .catch(() => {
        /* use localStorage if backend unavailable */
      })
  }, [currentResumeId, setProfileData, setSummary, setWebsites])

  /* ── Auth ─────────────────────────────────────────────────────────────── */

  const login =
    useCallback(() => {
      setIsAuthenticated(true)
      loadResumes()
    }, [loadResumes])

  const logout =
    useCallback(() => {
      setIsAuthenticated(false)
      setSavedResumes([])
      setCurrentResumeId(null)
      setCurrentResume(null)
      hydratedResumeIdRef.current = null
      loadingResumeIdRef.current = null

      switchTemplate(1)
    }, [
      setCurrentResumeId,
      switchTemplate,
    ])

  /* ─────────────────────────────────────────────────────────────────────────
   * saveProfileToBackend
   * ───────────────────────────────────────────────────────────────────────── */

  const saveProfileToBackend =
    useCallback(
      async (data) => {
        try {
          // Backend CandidateProfileUpdate only accepts these fields:
          // first_name, last_name, phone, professional_title,
          // summary, location, linkedin_url, github_url, portfolio_url
          const isValidUrl = (v) =>
            v && /^https?:\/\/.+/.test(String(v).trim())

          const payload = {
            first_name:
              data.firstName ||
              null,

            last_name:
              data.lastName ||
              null,

            phone:
              data.phone ||
              null,

            professional_title:
              data.profession ||
              data.professional_title ||
              null,

            summary:
              data.summary ||
              null,

            location:
              data.location ||
              (data.city && data.state
                ? `${data.city}, ${data.state}`
                : data.city ||
                  data.state ||
                  null),

            linkedin_url:
              isValidUrl(data.linkedin_url) ? data.linkedin_url :
              isValidUrl(data.linkedin)     ? data.linkedin :
              isValidUrl(data.websites?.linkedin) ? data.websites.linkedin :
              null,

            github_url:
              isValidUrl(data.github_url) ? data.github_url :
              isValidUrl(data.github)     ? data.github :
              isValidUrl(data.websites?.github) ? data.websites.github :
              null,

            portfolio_url:
              isValidUrl(data.portfolio_url) ? data.portfolio_url :
              isValidUrl(data.portfolio)     ? data.portfolio :
              isValidUrl(data.websites?.portfolio) ? data.websites.portfolio :
              null,
          }

          // Strip null/undefined values so we only send fields the user
          // actually provided — backend uses exclude_unset for update,
          // but sending explicit nulls would overwrite existing data.
          const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([, v]) => v !== null && v !== undefined && v !== '')
          )

          try {
            await profileApi.update(cleanPayload)
          } catch (updateErr) {
            // If profile doesn't exist yet (404), create it first.
            // first_name and last_name are required for create.
            if (
              updateErr.response?.status === 404 &&
              cleanPayload.first_name &&
              cleanPayload.last_name
            ) {
              await profileApi.create(cleanPayload)
            } else {
              throw updateErr
            }
          }

          return true
        } catch (err) {
          console.error(
            'saveProfileToBackend failed:',
            err
          )

          return false
        }
      },
      []
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * ensureResumeExists
   * ───────────────────────────────────────────────────────────────────────── */

  /* ─────────────────────────────────────────────────────────────────────────
 * ensureResumeExists
 *
 * Creates the backend Resume exactly once.
 *
 * templateIdOverride is important because the Profile/Template page can
 * explicitly tell us which template was selected in the current navigation.
 * This prevents stale activeTemplateId state from creating the resume with
 * the wrong template.
 * ───────────────────────────────────────────────────────────────────────── */

const ensureResumeExists =
  useCallback(
    async (
      title,
      templateIdOverride = null
    ) => {
      /*
       * If we already have a real backend resume ID,
       * NEVER create another resume.
       */
      if (currentResumeId) {
        return currentResumeId
      }

      try {
        const requestedTemplateId =
          templateIdOverride ??
          activeTemplateId ??
          1

        const normalizedTemplateId =
          Number(requestedTemplateId)

        const templateId =
          Number.isInteger(
            normalizedTemplateId
          ) && normalizedTemplateId > 0
            ? normalizedTemplateId
            : 1

        /*
         * Keep Context synchronized with the template being used
         * to create this resume.
         */
        switchTemplate(templateId)

        const { data } =
          await resumeApi.create({
            title:
              title ||
              'Untitled Resume',

            /*
             * This is the actual template selected by the user.
             */
            template_id: templateId,

            /*
             * Keep the old category for backend compatibility.
             */
            template: 'classic',
          })

        if (!data?.id) {
          console.error(
            'Resume creation succeeded but no resume ID was returned:',
            data
          )

          return null
        }

        /*
         * Store ONLY the real backend ID.
         */
        setCurrentResumeId(
          data.id
        )

        /*
         * Prefer the template returned by backend.
         * Fall back to the template we requested.
         */
        const createdTemplateId =
          Number(
            data?.template_id ??
            data?.templateId ??
            templateId
          )

        if (
          Number.isInteger(
            createdTemplateId
          ) &&
          createdTemplateId > 0
        ) {
          switchTemplate(
            createdTemplateId
          )
        }

        /*
         * Refresh dashboard/resume list so the newly-created
         * resume immediately exists in savedResumes.
         */
        await loadResumes()

        return data.id
      } catch (err) {
        console.error(
          'ensureResumeExists failed:',
          err
        )

        return null
      }
    },
    [
      currentResumeId,
      activeTemplateId,
      setCurrentResumeId,
      switchTemplate,
      loadResumes,
    ]
  )

  /* ─────────────────────────────────────────────────────────────────────────
   * saveExperiencesToBackend
   * ───────────────────────────────────────────────────────────────────────── */

  const saveExperiencesToBackend =
    useCallback(
      async (
        entries,
        resumeId
      ) => {
        const rid = resumeId || currentResumeId
        if (!rid) throw new Error('An active resume is required to save experience.')
        const assertActive = () => {
          if (String(activeResumeIdRef.current) !== String(rid)) {
            throw new Error('The active resume changed while saving experience.')
          }
        }
        assertActive()
        const { data: existing } = await resumeApi.getExperience(rid)
        const existingById = new Map((existing || []).map((item) => [String(item.id), item]))
        const retainedIds = new Set()
        const toFullDate = (val) => {
          if (!val) return null
          const value = String(val).trim()
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
          if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`
          if (/^\d{4}$/.test(value)) return `${value}-01-01`
          return null
        }
        const toPayload = (entry) => ({
          company: entry.employer || entry.company || null,
          job_title: entry.jobTitle || entry.job_title || null,
          location: entry.city || entry.location || null,
          employment_type: entry.employmentType || entry.employment_type || null,
          start_date: toFullDate(entry.startDate || entry.start_date),
          end_date: entry.currentWork || entry.is_current ? null : toFullDate(entry.endDate || entry.end_date),
          is_current: Boolean(entry.currentWork || entry.is_current),
          description: entry.description || null,
        })

        for (const entry of entries || []) {
          assertActive()
          const existingItem = existingById.get(String(entry.id))
          if (existingItem) {
            retainedIds.add(String(existingItem.id))
            await resumeApi.updateExperience(rid, existingItem.id, toPayload(entry))
          } else {
            await resumeApi.addExperience(rid, toPayload(entry))
          }
        }
        for (const item of existing || []) {
          assertActive()
          if (!retainedIds.has(String(item.id))) {
            await resumeApi.deleteExperience(rid, item.id)
          }
        }
        assertActive()
        const { data: saved } = await resumeApi.getExperience(rid)
        assertActive()
        setExperiences(normalizeResumeSections({ experience: saved }).experience)
        return saved || []
      },
      [currentResumeId, setExperiences]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * saveEducationToBackend
   * ───────────────────────────────────────────────────────────────────────── */

  const saveEducationToBackend =
    useCallback(
      async (
        entries,
        resumeId
      ) => {
        const rid = resumeId || currentResumeId
        if (!rid) throw new Error('An active resume is required to save education.')
        const assertActive = () => {
          if (String(activeResumeIdRef.current) !== String(rid)) {
            throw new Error('The active resume changed while saving education.')
          }
        }
        assertActive()
        const { data: existing } = await resumeApi.getEducation(rid)
        const existingById = new Map((existing || []).map((item) => [String(item.id), item]))
        const retainedIds = new Set()
        const toFullDate = (value) => {
          if (!value || String(value).toLowerCase() === 'present') return null
          const dateValue = String(value).trim()
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue
          if (/^\d{4}-\d{2}$/.test(dateValue)) return `${dateValue}-01`
          if (/^\d{4}$/.test(dateValue)) return `${dateValue}-01-01`
          return null
        }
        for (const entry of entries || []) {
          assertActive()
          const existingItem = existingById.get(String(entry.id))
          const payload = {
            institution: entry.institution || entry.schoolName || null,
            degree: entry.degree || null,
            field_of_study: entry.fieldOfStudy || entry.field_of_study || null,
            start_date: toFullDate(entry.startYear || entry.startDate || entry.start_date),
            end_date: toFullDate(entry.endYear || entry.endDate || entry.end_date),
            description: entry.description || null,
          }
          if (existingItem) {
            retainedIds.add(String(existingItem.id))
            await resumeApi.updateEducation(rid, existingItem.id, payload)
          } else {
            await resumeApi.addEducation(rid, payload)
          }
        }
        for (const item of existing || []) {
          assertActive()
          if (!retainedIds.has(String(item.id))) {
            await resumeApi.deleteEducation(rid, item.id)
          }
        }
        assertActive()
        const { data: saved } = await resumeApi.getEducation(rid)
        assertActive()
        setEducation(normalizeResumeSections({ education: saved }).education)
        return saved || []
      },
      [currentResumeId, setEducation]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * saveSkillsToBackend
   * ───────────────────────────────────────────────────────────────────────── */

  const saveSkillsToBackend =
    useCallback(
      async (
        skillsList,
        resumeId
      ) => {
        const rid = resumeId || currentResumeId
        if (!rid) throw new Error('An active resume is required to save skills.')
        const assertActive = () => {
          if (String(activeResumeIdRef.current) !== String(rid)) {
            throw new Error('The active resume changed while saving skills.')
          }
        }
        assertActive()
        const { data: existing } = await resumeApi.getSkills(rid)
        const existingById = new Map((existing || []).map((item) => [String(item.id), item]))
        const retainedIds = new Set()
        for (const skill of skillsList || []) {
          assertActive()
          const existingItem = existingById.get(String(skill.id))
          const payload = {
            name: typeof skill === 'string' ? skill : skill.name || '',
            category: typeof skill === 'string' ? null : skill.category || null,
            proficiency: typeof skill === 'string' ? null : skill.proficiency || skill.level || null,
          }
          if (existingItem) {
            retainedIds.add(String(existingItem.id))
            await resumeApi.updateSkill(rid, existingItem.id, payload)
          } else {
            await resumeApi.addSkill(rid, payload)
          }
        }
        for (const item of existing || []) {
          assertActive()
          if (!retainedIds.has(String(item.id))) {
            await resumeApi.deleteSkill(rid, item.id)
          }
        }
        assertActive()
        const { data: saved } = await resumeApi.getSkills(rid)
        assertActive()
        setSkills(normalizeResumeSections({ skills: saved }).skills)
        return saved || []
      },
      [currentResumeId, setSkills]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * saveProjectsToBackend
   * ───────────────────────────────────────────────────────────────────────── */

  const saveProjectsToBackend =
    useCallback(
      async (
        projectsList,
        resumeId
      ) => {
        const rid = resumeId || currentResumeId
        if (!rid) throw new Error('An active resume is required to save projects.')
        const assertActive = () => {
          if (String(activeResumeIdRef.current) !== String(rid)) {
            throw new Error('The active resume changed while saving projects.')
          }
        }
        const saved = await reconcileResumeCollection({
          api: {
            list: resumeApi.getProjects,
            create: resumeApi.addProject,
            update: resumeApi.updateProject,
            delete: resumeApi.deleteProject,
          },
          resumeId: rid,
          entries: projectsList,
          assertActive,
          toPayload: (project) => {
            const rawUrl = project.project_url || project.projectLink || project.link || project.url || null
            const projectUrl = rawUrl && /^https?:\/\/.+/.test(String(rawUrl).trim())
              ? String(rawUrl).trim()
              : null
            return {
              title: project.title || project.name || null,
              description: project.description || null,
              role: project.role || null,
              technologies: project.technologies || project.techStack || project.tech_stack || null,
              project_url: projectUrl,
              start_date: project.startDate || project.start_date || null,
              end_date: project.ongoing ? null : project.endDate || project.end_date || null,
            }
          },
        })
        setProjects(normalizeResumeSections({ projects: saved }).projects)
        return saved
      },
      [currentResumeId, setProjects]
    )

  const saveCertificationsToBackend = useCallback(async (entries, resumeId) => {
    const rid = resumeId || currentResumeId
    if (!rid) throw new Error('An active resume is required to save certifications.')
    const assertActive = () => {
      if (String(activeResumeIdRef.current) !== String(rid)) {
        throw new Error('The active resume changed while saving certifications.')
      }
    }
    const saved = await reconcileResumeCollection({
      api: certificationApi,
      resumeId: rid,
      entries,
      assertActive,
      toPayload: (certification) => ({
        name: certification.name || '',
        issuing_organization: certification.issuing_organization || certification.issuer || 'Unknown',
        issue_date: certification.issue_date || (certification.year ? `${certification.year}-01-01` : null),
        expiration_date: certification.expiration_date || null,
        credential_id: certification.credential_id || certification.credentialId || null,
        credential_url: certification.credential_url || certification.credentialUrl || null,
      }),
    })
    setCertifications(normalizeResumeSections({ certifications: saved }).certifications)
    return saved
  }, [currentResumeId, setCertifications])

  const saveLanguagesToBackend = useCallback(async (entries, resumeId) => {
    const rid = resumeId || currentResumeId
    if (!rid) throw new Error('An active resume is required to save languages.')
    const assertActive = () => {
      if (String(activeResumeIdRef.current) !== String(rid)) {
        throw new Error('The active resume changed while saving languages.')
      }
    }
    const saved = await reconcileResumeCollection({
      api: languageApi,
      resumeId: rid,
      entries,
      assertActive,
      toPayload: (language) => ({
        name: typeof language === 'string' ? language : language.name || language.language || '',
        proficiency: typeof language === 'string' ? null : language.proficiency || null,
      }),
    })
    setLanguages(normalizeResumeSections({ languages: saved }).languages)
    return saved
  }, [currentResumeId, setLanguages])

  const saveAchievementsToBackend = useCallback(async (entries, resumeId) => {
    const rid = resumeId || currentResumeId
    if (!rid) throw new Error('An active resume is required to save achievements.')
    const assertActive = () => {
      if (String(activeResumeIdRef.current) !== String(rid)) {
        throw new Error('The active resume changed while saving achievements.')
      }
    }
    const saved = await reconcileResumeCollection({
      api: achievementApi,
      resumeId: rid,
      entries,
      assertActive,
      toPayload: (achievement) => ({
        title: typeof achievement === 'string' ? achievement : achievement.title || '',
        description: typeof achievement === 'string' ? null : achievement.description || null,
        organization: typeof achievement === 'string' ? null : achievement.organization || null,
        year: typeof achievement === 'string' ? null : achievement.year || null,
      }),
    })
    setAchievements(normalizeResumeSections({ achievements: saved }).achievements)
    return saved
  }, [currentResumeId, setAchievements])

  /* ─────────────────────────────────────────────────────────────────────────
   * saveResumeMeta
   * ───────────────────────────────────────────────────────────────────────── */

  const saveResumeMeta =
    useCallback(
      async (
        fields,
        resumeId
      ) => {
        try {
          const rid =
            resumeId ||
            currentResumeId

          if (!rid) return false

          const normalizedFields = {
            ...fields,
          }

          // Frontend callers may use templateId while the backend expects
          // template_id. Normalize it before sending the request.
          const requestedTemplateId =
            fields?.template_id ??
            fields?.templateId

          if (
            requestedTemplateId !== undefined &&
            requestedTemplateId !== null
          ) {
            const normalizedTemplateId = Number(requestedTemplateId)

            if (
              Number.isInteger(normalizedTemplateId) &&
              normalizedTemplateId > 0
            ) {
              normalizedFields.template_id = normalizedTemplateId
              delete normalizedFields.templateId
            }
          }

          await resumeApi.update(
            rid,
            normalizedFields
          )

          await loadResumes()

          const templateId =
            Number(
              normalizedFields?.template_id
            )

          if (
            Number.isInteger(
              templateId
            ) &&
            templateId > 0
          ) {
            switchTemplate(
              templateId
            )
          }

          return true
        } catch (err) {
          console.error(
            'saveResumeMeta failed:',
            err
          )

          return false
        }
      },
      [
        currentResumeId,
        loadResumes,
        switchTemplate,
      ]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * addResume
   * ───────────────────────────────────────────────────────────────────────── */

  const addResume =
    useCallback(
      (resume) => {
        setSavedResumes(
          (prev) => {
            const byId =
              prev.findIndex(
                (r) =>
                  String(r.id) ===
                  String(resume.id)
              )

            if (byId !== -1) {
              const next = [
                ...prev,
              ]

              next[byId] = {
                ...prev[byId],
                ...resume,
              }

              return next
            }

            return [
              ...prev,
              resume,
            ]
          }
        )

        if (resume?.id) {
          setCurrentResumeId(
            resume.id
          )
        }

        /*
         * IMPORTANT:
         * Preserve the template associated
         * with this resume.
         */
        const resumeTemplateId =
          Number(
            resume?.template_id ??
            resume?.templateId
          )

        if (
          Number.isInteger(
            resumeTemplateId
          ) &&
          resumeTemplateId > 0
        ) {
          switchTemplate(
            resumeTemplateId
          )
        }
      },
      [
        setCurrentResumeId,
        switchTemplate,
      ]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * Select an existing resume
   * ───────────────────────────────────────────────────────────────────────── */

  const selectResume =
    useCallback(
      async (resumeId) => {
        try {
          if (!resumeId) {
            return null
          }

          return await loadResume(resumeId)
        } catch (err) {
          console.error(
            'selectResume failed:',
            err
          )

          return null
        }
      },
      [
        loadResume,
      ]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * Delete resume
   * ───────────────────────────────────────────────────────────────────────── */

  const deleteResume =
    useCallback(
      async (resumeId) => {
        try {
          if (!resumeId) {
            return false
          }

          await resumeApi.delete(
            resumeId
          )

          setSavedResumes(
            (prev) =>
              prev.filter(
                (resume) =>
                  resume.id !==
                  resumeId
              )
          )

          if (
            currentResumeId ===
            resumeId
          ) {
            setCurrentResumeId(
              null
            )
            setCurrentResume(null)
            hydratedResumeIdRef.current = null
            loadingResumeIdRef.current = null

            /*
             * Reset template when the
             * currently edited resume is deleted.
             */
            switchTemplate(1)
          }

          return true
        } catch (err) {
          console.error(
            'deleteResume failed:',
            err
          )

          throw err
        }
      },
      [
        currentResumeId,
        setCurrentResumeId,
        switchTemplate,
      ]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * Section unlock logic
   * ───────────────────────────────────────────────────────────────────────── */

  const isSectionUnlocked =
    useCallback(
      (section) => {
        switch (section) {
          case 'profile':
            return true

          case 'experience':
            return profileSaved

          case 'education':
            return (
              profileSaved &&
              experienceSaved
            )

          case 'skills':
            return (
              profileSaved &&
              experienceSaved &&
              educationSaved
            )

          case 'projects':
            return (
              profileSaved &&
              experienceSaved &&
              educationSaved &&
              skillsSaved
            )

          case 'portfolio':
            return (
              profileSaved &&
              experienceSaved &&
              educationSaved &&
              skillsSaved &&
              projectsSaved
            )

          case 'summary':
            return (
              profileSaved &&
              experienceSaved &&
              educationSaved &&
              skillsSaved &&
              projectsSaved &&
              portfolioSaved
            )

          case 'preview':
            return (
              profileSaved &&
              experienceSaved &&
              educationSaved &&
              skillsSaved &&
              projectsSaved &&
              portfolioSaved
            )

          default:
            return profileSaved
        }
      },
      [
        profileSaved,
        experienceSaved,
        educationSaved,
        skillsSaved,
        projectsSaved,
        portfolioSaved,
      ]
    )

  const isProfileComplete =
    useCallback(
      () =>
        isSectionUnlocked(
          'experience'
        ),
      [isSectionUnlocked]
    )

  /* ─────────────────────────────────────────────────────────────────────────
   * Wipe all persisted resume data
   * ───────────────────────────────────────────────────────────────────────── */

  const clearResumeData =
    useCallback(() => {
      try {
        localStorage.removeItem(
          STORAGE_KEY
        )
      } catch {
        /* ignore */
      }

      setCurrentResumeId(null)

      setProfileData({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dob: '',
        marital: '',
        profession: '',
        languages: [],
        street: '',
        city: '',
        state: '',
        nationality: '',
        passport: '',
        phone: '',
        email: '',
        photo: '',
      })

      setExperiences([])
      setEducation([])
      setSkills([])

      setSkillsDetailed({
        programmingLanguages: '',
        frameworks: '',
        frontend: '',
        backend: '',
        databases: '',
        tools: '',
        versionControl: '',
        other: '',
      })

      setWebsites({
        linkedin: '',
        github: '',
        portfolio: '',
        other: '',
      })

      setProjects([])
      setSummary('')
      setResumeTitle('')
      setCertifications([])
      setAchievements([])
      setLanguages([])
      setInterests([])
      setHobbies([])
      setReferences([])

      setProfileSaved(false)
      setExperienceSaved(false)
      setEducationSaved(false)
      setSkillsSaved(false)
      setProjectsSaved(false)
      setPortfolioSaved(false)
      setCurrentResume(null)

      /*
       * Reset active template for a fresh resume.
       */
      switchTemplate(1)
    }, [
      setProfileData,
      setExperiences,
      setEducation,
      setSkills,
      setSkillsDetailed,
      setWebsites,
      setProjects,
      setSummary,
      setResumeTitle,
      setCertifications,
      setAchievements,
      setLanguages,
      setInterests,
      setHobbies,
      setReferences,
      setProfileSaved,
      setCurrentResumeId,
      setExperienceSaved,
      setEducationSaved,
      setSkillsSaved,
      setProjectsSaved,
      setPortfolioSaved,
      setCurrentResume,
      switchTemplate,
    ])

  /* ─────────────────────────────────────────────────────────────────────────
   * Import CV data
   * ───────────────────────────────────────────────────────────────────────── */

  const importCvData = (parsed) => {
    if (parsed.profileData) {
      setProfileData(
        parsed.profileData
      )
    }

    if (
      parsed.experiences?.length
    ) {
      setExperiences(
        parsed.experiences
      )
    }

    if (
      parsed.education?.length
    ) {
      setEducation(
        parsed.education
      )
    }

    if (parsed.skills?.length) {
      setSkills(
        parsed.skills
      )
    }

    if (
      parsed.projects?.length
    ) {
      setProjects(
        parsed.projects
      )
    }

    if (parsed.summary) {
      setSummary(
        parsed.summary
      )
    }

    if (parsed.websites) {
      setWebsites(
        parsed.websites
      )
    }

    if (
      parsed.certifications?.length
    ) {
      setCertifications(
        parsed.certifications
      )
    }

    if (
      parsed.achievements?.length
    ) {
      setAchievements(
        parsed.achievements
      )
    }

    if (
      parsed.languages?.length
    ) {
      setLanguages(
        parsed.languages
      )
    }

    if (
      parsed.interests?.length
    ) {
      setInterests(
        parsed.interests
      )
    }

    if (
      parsed.hobbies?.length
    ) {
      setHobbies(
        parsed.hobbies
      )
    }

    setCvImported(true)
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Provider
   * ───────────────────────────────────────────────────────────────────────── */

  return (
    <ResumeContext.Provider
      value={{
        /* active template */
        activeTemplateId,
        switchTemplate,

        /* resume data */
        profileData,
        setProfileData,

        experiences,
        setExperiences,

        education,
        setEducation,

        skills,
        setSkills,

        skillsDetailed,
        setSkillsDetailed,

        websites,
        setWebsites,

        projects,
        setProjects,

        summary,
        setSummary,

        resumeTitle,
        setResumeTitle,

        /* backend resumes */
        savedResumes,
        setSavedResumes,

        resumesLoading,
        resumesError,
        resumeLoading,
        resumeError,

        loadResumes,
        loadResume,
        refreshResumes,
        finalizeResume,

        currentResumeId,
        setCurrentResumeId,
        currentResume,

        selectResume,
        addResume,
        deleteResume,

        certifications,
        setCertifications,

        achievements,
        setAchievements,

        languages,
        setLanguages,

        interests,
        setInterests,

        hobbies,
        setHobbies,

        references,
        setReferences,

        /* section flags */
        profileSaved,
        setProfileSaved,

        experienceSaved,
        setExperienceSaved,

        educationSaved,
        setEducationSaved,

        skillsSaved,
        setSkillsSaved,

        projectsSaved,
        setProjectsSaved,

        portfolioSaved,
        setPortfolioSaved,

        /* helpers */
        isSectionUnlocked,
        isProfileComplete,
        clearResumeData,

        /* CV import */
        cvImported,
        setCvImported,
        importCvData,

        /* auth */
        isAuthenticated,
        login,
        logout,

        /* backend sync */
        ensureResumeExists,
        saveProfileToBackend,
        saveExperiencesToBackend,
        saveEducationToBackend,
        saveSkillsToBackend,
        saveProjectsToBackend,
        saveCertificationsToBackend,
        saveLanguagesToBackend,
        saveAchievementsToBackend,
        saveResumeMeta,
      }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  return useContext(ResumeContext)
}