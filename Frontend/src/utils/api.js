import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

/* ── Attach token on every outgoing request ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ── Handle 401 globally ── */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rb_token')
      localStorage.removeItem('rb_user')

      // Tell AuthContext that the session is no longer valid.
      window.dispatchEvent(new Event('rb:unauthorized'))
    }

    return Promise.reject(error)
  },
)

/* ── Auth endpoints ── */
export const authApi = {
  login:  (email, password)=> 
    api.post('/api/v1/auth/login',
    new URLSearchParams({ username: email, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  ),
  signup: (email, password) => 
    api.post('/api/v1/auth/register', { email, password }),
  me:() => 
    api.get('/api/v1/auth/me'),
}
/* ── ATS endpoint ── */
export const atsApi = {
  score: (resume_id, job_description_id) =>
    api.post(`/api/v1/ats/score/${resume_id}/${job_description_id}`),
  optimize: (resume_id, job_description_id) =>
    api.post(`/api/v1/ats/optimize/${resume_id}/${job_description_id}`),
  optimizeSection: (resume_id, job_description_id, data) =>
    api.post(`/api/v1/ats/optimize-section/${resume_id}/${job_description_id}`, data),
}

/* ── Profile endpoint ── */
export const profileApi = {
  get:    ()     => api.get('/api/v1/profile'),
  create: (data) => api.post('/api/v1/profile', data),
  update: (data) => api.put('/api/v1/profile', data),
  delete: ()     => api.delete('/api/v1/profile'),  
}

/* ── Resume endpoints ── */
export const resumeApi = {
  // Resume CRUD
  create: (data) =>
    api.post('/api/v1/resumes', data),

  list: () =>
    api.get('/api/v1/resumes'),

  get: (id) =>
    api.get(`/api/v1/resumes/${id}`),

  canonicalize: (id) =>
    api.post(`/api/v1/resumes/${id}/canonicalize`),

  update: (id, data) =>
    api.put(`/api/v1/resumes/${id}`, data),

  delete: (id) =>
    api.delete(`/api/v1/resumes/${id}`),

  upload: (resumeId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/v1/resumes/${resumeId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Education CRUD
  addEducation: (resumeId, data) =>
    api.post(`/api/v1/resumes/${resumeId}/education`, data),

  getEducation: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/education`),

  updateEducation: (resumeId, educationId, data) =>
    api.put(
      `/api/v1/resumes/${resumeId}/education/${educationId}`,
      data
    ),

  deleteEducation: (resumeId, educationId) =>
    api.delete(
      `/api/v1/resumes/${resumeId}/education/${educationId}`
    ),

  // Experience CRUD
  addExperience: (resumeId, data) =>
    api.post(`/api/v1/resumes/${resumeId}/experience`, data),

  getExperience: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/experience`),

  updateExperience: (resumeId, experienceId, data) =>
    api.put(
      `/api/v1/resumes/${resumeId}/experience/${experienceId}`,
      data
    ),

  deleteExperience: (resumeId, experienceId) =>
    api.delete(
      `/api/v1/resumes/${resumeId}/experience/${experienceId}`
    ),

  // Skills CRUD
  addSkill: (resumeId, data) =>
    api.post(`/api/v1/resumes/${resumeId}/skills`, data),

  getSkills: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/skills`),

  updateSkill: (resumeId, skillId, data) =>
    api.put(
      `/api/v1/resumes/${resumeId}/skills/${skillId}`,
      data
    ),

  deleteSkill: (resumeId, skillId) =>
    api.delete(
      `/api/v1/resumes/${resumeId}/skills/${skillId}`
    ),

  // Projects CRUD
  addProject: (resumeId, data) =>
    api.post(`/api/v1/resumes/${resumeId}/projects`, data),

  getProjects: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/projects`),

  updateProject: (resumeId, projectId, data) =>
    api.put(
      `/api/v1/resumes/${resumeId}/projects/${projectId}`,
      data
    ),

  deleteProject: (resumeId, projectId) =>
    api.delete(
      `/api/v1/resumes/${resumeId}/projects/${projectId}`
    ),
}

export const jobDescriptionApi = {
  create: (data)     => api.post('/api/v1/job-descriptions', data),
  upload: (file, title, company) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    if (company) formData.append('company', company)
    return api.post('/api/v1/job-descriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list:   ()         => api.get('/api/v1/job-descriptions'),
  get:    (id)        => api.get(`/api/v1/job-descriptions/${id}`),
  update: (id, data)  => api.put(`/api/v1/job-descriptions/${id}`, data),
  delete: (id)         => api.delete(`/api/v1/job-descriptions/${id}`),
}
export const certificationApi = {
  create: (resumeId, data) =>
    api.post(`/api/v1/resumes/${resumeId}/certifications`, data),

  list: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/certifications`),

  update: (resumeId, id, data) =>
    api.put(
      `/api/v1/resumes/${resumeId}/certifications/${id}`,
      data,
    ),

  delete: (resumeId, id) =>
    api.delete(
      `/api/v1/resumes/${resumeId}/certifications/${id}`,
    ),
}
export const languageApi = {
  create: (resumeId, data) =>
    api.post(`/api/v1/resumes/${resumeId}/languages`, data),

  list: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/languages`),

  update: (resumeId, id, data) =>
    api.put(
      `/api/v1/resumes/${resumeId}/languages/${id}`,
      data,
    ),

  delete: (resumeId, id) =>
    api.delete(
      `/api/v1/resumes/${resumeId}/languages/${id}`,
    ),
}
export const achievementApi = {
  create: (resumeId, data) =>
    api.post(`/api/v1/resumes/${resumeId}/achievements`, data),

  list: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/achievements`),

  update: (resumeId, id, data) =>
    api.put(
      `/api/v1/resumes/${resumeId}/achievements/${id}`,
      data,
    ),

  delete: (resumeId, id) =>
    api.delete(
      `/api/v1/resumes/${resumeId}/achievements/${id}`,
    ),
}
export const dashboardApi = {
  get: (resumeId, jobDescriptionId) =>
    api.get(`/api/v1/dashboard/${resumeId}`, {
      params: jobDescriptionId ? { job_description_id: jobDescriptionId } : undefined,
    }),
}

export const qualityApi = {
  get: (resumeId) =>
    api.get(`/api/v1/resume-quality/${resumeId}`),

  recommendations: (resumeId) =>
    api.get(
      `/api/v1/resume-quality/${resumeId}/ai-recommendations`,
    ),
}
export const pdfApi = {
  download: (resumeId) =>
    api.get(`/api/v1/resumes/${resumeId}/pdf`, {
      responseType: 'blob',
    }),
}

/* ── AI endpoints ── */
export const aiApi = {
  analyzeJobDescription: (jobDescriptionId) =>
    api.post(`/api/v1/ai/analyze-job-description/${jobDescriptionId}`),

  getJobDescriptionAnalysis: (jobDescriptionId) =>
    api.get(`/api/v1/ai/job-description-analysis/${jobDescriptionId}`),

  improveText: (data) =>
    api.post('/api/v1/ai/improve-text', data),

  improveSummary: (data) =>
    api.post('/api/v1/ai/improve-summary', data),

  improveExperience: (resumeId, experienceId, data) =>
    api.post(`/api/v1/ai/improve-experience/${resumeId}/${experienceId}`, data),

  improveProject: (resumeId, projectId, data) =>
    api.post(`/api/v1/ai/improve-project/${resumeId}/${projectId}`, data),

  generateResumeContent: (resumeId, data) =>
    api.post(`/api/v1/ai/generate-resume-content/${resumeId}`, data),

  generateResume: (resumeId, data) =>
    api.post(`/api/v1/ai/generate-resume/${resumeId}`, data),

  generateTailoredResume: (resumeId, jobDescriptionId, data) =>
    api.post(`/api/v1/ai/generate-tailored-resume/${resumeId}/${jobDescriptionId}`, data),

  applyChange: (resumeId, data) =>
    api.post(`/api/v1/ai/apply-change/${resumeId}`, data),

  applyTailoredResume: (resumeId, data) =>
    api.post(`/api/v1/ai/apply-tailored-resume/${resumeId}`, data),
}

export default api
