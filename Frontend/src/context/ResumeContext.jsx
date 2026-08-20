import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { resumeApi, profileApi } from '../utils/api'

const ResumeContext = createContext(null)

export { ResumeContext }

const STORAGE_KEY = 'rb_resume_data'
const SHARED_KEY = 'rb_resume_shared'

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

        const store =
          readStore(STORAGE_KEY)

        store[field] = resolved

        writeStore(
          STORAGE_KEY,
          store
        )

        return resolved
      })
    },
    [field]
  )

  return [value, set]
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

        setSavedResumes(resumes)

        // If the stored currentResumeId is not in the fetched list,
        // it's a stale or fake ID — clear it so the dashboard doesn't
        // fire a request with a non-existent ID.
        setCurrentResumeIdRaw((prev) => {
          if (!prev) return prev
          const exists = resumes.some((r) => r.id === prev)
          if (exists) return prev
          // Clear from localStorage too
          try {
            const store = readStore(SHARED_KEY)
            delete store.currentResumeId
            writeStore(SHARED_KEY, store)
          } catch { /* ignore */ }
          return null
        })

        return resumes
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

  /* ─────────────────────────────────────────────────────────────────────────
   * Refresh resumes
   * ───────────────────────────────────────────────────────────────────────── */

  const refreshResumes =
    useCallback(async () => {
      return await loadResumes()
    }, [loadResumes])

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

    if (!token) return

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
  }, [setProfileData, setSummary, setWebsites])

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

  const ensureResumeExists =
    useCallback(
      async (title) => {
        if (currentResumeId) {
          return currentResumeId
        }

        try {
          
          const { data } =
            await resumeApi.create({
              title:
                title ||
                'Untitled Resume',

              template: 'classic',
            })

          setCurrentResumeId(
            data.id
          )

      
          const createdTemplateId =
            Number(
              data?.template_id ??
              data?.templateId ??
              activeTemplateId ??
              1
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
        try {
          const rid =
            resumeId ||
            currentResumeId

          if (!rid) return false

          const {
            data: experiences,
          } = await resumeApi.getExperience(
            rid
          )

          await Promise.all(
            (
              experiences ||
              []
            ).map((e) =>
              resumeApi.deleteExperience(
                rid,
                e.id
              )
            )
          )

          for (
            let i = 0;
            i < entries.length;
            i++
          ) {
            const e = entries[i]

            // Normalize YYYY-MM (from <input type="month">) to YYYY-MM-DD
            // Pydantic's date type rejects partial dates.
            const toFullDate = (val) => {
              if (!val) return null
              const s = String(val).trim()
              // Already YYYY-MM-DD
              if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
              // YYYY-MM → YYYY-MM-01
              if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`
              // Bare year → YYYY-01-01
              if (/^\d{4}$/.test(s)) return `${s}-01-01`
              return null
            }

            await resumeApi.addExperience(
              rid,
              {
                company:
                  e.employer ||
                  e.company ||
                  null,

                job_title:
                  e.jobTitle ||
                  e.job_title ||
                  null,

                location:
                  e.city ||
                  e.location ||
                  null,

                employment_type:
                  e.employmentType ||
                  e.employment_type ||
                  null,

                start_date:
                  toFullDate(
                    e.startDate ||
                    e.start_date
                  ),

                end_date:
                  e.currentWork || e.is_current
                    ? null
                    : toFullDate(
                        e.endDate ||
                        e.end_date
                      ),

                is_current:
                  e.currentWork ||
                  e.is_current ||
                  false,

                description:
                  e.description ||
                  null,
              }
            )
          }

          return true
        } catch (err) {
          console.error(
            'saveExperiencesToBackend failed:',
            err
          )

          return false
        }
      },
      [currentResumeId]
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
        try {
          const rid =
            resumeId ||
            currentResumeId

          if (!rid) return false

          const {
            data: education,
          } = await resumeApi.getEducation(
            rid
          )

          await Promise.all(
            (
              education ||
              []
            ).map((e) =>
              resumeApi.deleteEducation(
                rid,
                e.id
              )
            )
          )

          for (
            let i = 0;
            i < entries.length;
            i++
          ) {
            const e = entries[i]

            await resumeApi.addEducation(
              rid,
              {
                degree:
                  e.degree ||
                  null,

                institution:
                  e.institution ||
                  e.schoolName ||
                  null,

                field_of_study:
                  e.fieldOfStudy ||
                  e.field_of_study ||
                  null,

                start_date:
                  e.startYear ||
                  e.startDate ||
                  e.start_date ||
                  null,

                end_date:
                  e.endYear ||
                  e.endDate ||
                  e.end_date ||
                  null,

                description:
                  e.description ||
                  null,
              }
            )
          }

          return true
        } catch (err) {
          console.error(
            'saveEducationToBackend failed:',
            err
          )

          return false
        }
      },
      [currentResumeId]
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
        try {
          const rid =
            resumeId ||
            currentResumeId

          if (!rid) return false

          const {
            data: skills,
          } = await resumeApi.getSkills(
            rid
          )

          await Promise.all(
            (
              skills ||
              []
            ).map((s) =>
              resumeApi.deleteSkill(
                rid,
                s.id
              )
            )
          )

          for (
            let i = 0;
            i < skillsList.length;
            i++
          ) {
            const s =
              skillsList[i]

            await resumeApi.addSkill(
              rid,
              {
                name:
                  typeof s ===
                  'string'
                    ? s
                    : s.name || '',

                category:
                  typeof s === 'string'
                    ? null
                    : s.category ||
                      null,

                proficiency:
                  typeof s === 'string'
                    ? null
                    : s.proficiency ||
                      s.level ||
                      null,
              }
            )
          }

          return true
        } catch (err) {
          console.error(
            'saveSkillsToBackend failed:',
            err
          )

          return false
        }
      },
      [currentResumeId]
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
        try {
          const rid =
            resumeId ||
            currentResumeId

          if (!rid) return false

          const {
            data: projects,
          } = await resumeApi.getProjects(
            rid
          )

          await Promise.all(
            (
              projects ||
              []
            ).map((p) =>
              resumeApi.deleteProject(
                rid,
                p.id
              )
            )
          )

          for (
            let i = 0;
            i < projectsList.length;
            i++
          ) {
            const p =
              projectsList[i]

            // Only send project_url if it looks like a valid URL —
            // Pydantic HttpUrl validation rejects empty strings and plain text.
            const rawUrl =
              p.project_url ||
              p.projectLink ||
              p.link ||
              p.url ||
              null

            const projectUrl = (() => {
              if (!rawUrl) return null
              const s = String(rawUrl).trim()
              if (!s) return null
              // Must start with http:// or https://
              return /^https?:\/\/.+/.test(s) ? s : null
            })()

            await resumeApi.addProject(
              rid,
              {
                title:
                  p.title ||
                  p.name ||
                  null,

                description:
                  p.description ||
                  null,

                role:
                  p.role ||
                  null,

                technologies:
                  p.technologies ||
                  p.techStack ||
                  p.tech_stack ||
                  null,

                project_url: projectUrl,

                start_date:
                  p.startDate ||
                  p.start_date ||
                  null,

                end_date:
                  p.ongoing
                    ? null
                    : p.endDate ||
                      p.end_date ||
                      null,
              }
            )
          }

          return true
        } catch (err) {
          console.error(
            'saveProjectsToBackend failed:',
            err
          )

          return false
        }
      },
      [currentResumeId]
    )

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

          await resumeApi.update(
            rid,
            fields
          )

          await loadResumes()

          const templateId =
            Number(
              fields?.template_id ??
              fields?.templateId
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
                  r.id ===
                  resume.id
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

            const byTitle =
              prev.findIndex(
                (r) =>
                  r.title ===
                  resume.title
              )

            if (byTitle !== -1) {
              const next = [
                ...prev,
              ]

              next[byTitle] = {
                ...prev[byTitle],
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

          /*
           * Fetch complete resume from backend.
           */
          const {
            data,
          } = await resumeApi.get(
            resumeId
          )

          /*
           * Keep the SAME resume ID.
           */
          setCurrentResumeId(
            resumeId
          )

          const resumeTemplateId =
            Number(
              data?.template_id ??
              data?.templateId ??
              1
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

          return data
        } catch (err) {
          console.error(
            'selectResume failed:',
            err
          )

          return null
        }
      },
      [
        setCurrentResumeId,
        switchTemplate,
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
      setExperienceSaved,
      setEducationSaved,
      setSkillsSaved,
      setProjectsSaved,
      setPortfolioSaved,
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

        loadResumes,
        refreshResumes,

        currentResumeId,
        setCurrentResumeId,

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
