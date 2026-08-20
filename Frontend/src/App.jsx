import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'

// Providers
import { AuthProvider } from './context/AuthContext'

// Layout pieces
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ProfileGuard from './components/ProfileGuard'

// Public pages
import LandingPage from './pages/Landing/LandingPage'
import Login       from './pages/Auth/Login'
import Signup      from './pages/Auth/Signup'

// App pages (all protected)
import Dashboard  from './pages/Dashboard/Dashboard'
import Templates  from './pages/Templates/Templates'
import Resume     from './pages/Resume/Resume'
import Profile    from './pages/Profile/Profile'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import MyProfile from './pages/MyProfile/MyProfile'
import ATSChecker from './pages/ATS/ATSCheckerChat'

// Resume builder sections
import Skills     from './pages/ResumeBuilder/Skills'
import Experience from './pages/ResumeBuilder/Experience'
import Education  from './pages/ResumeBuilder/Education'
import Company    from './pages/ResumeBuilder/Company'
import Summary    from './pages/ResumeBuilder/Summary'
import Portfolio  from './pages/ResumeBuilder/Portfolio'
import Projects   from './pages/ResumeBuilder/Projects'
import Preview    from './pages/ResumeBuilder/Preview'
import Certifications from './pages/ResumeBuilder/Certifications'
import AIAssistant from './pages/AI/AIAssistant'

import './App.css'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div
        className="d-none d-md-flex"
        style={{ width: 220, minWidth: 220, height: '100vh', flexShrink: 0,
                 position: 'sticky', top: 0, alignSelf: 'flex-start' }}
      >
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 30 }}
          />
          <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Routes>
            <Route path="/"           element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="resume"      element={<Resume />} />
            <Route path="templates"   element={<Templates />} />
            <Route path="ats-checker" element={<ATSChecker />} />
            <Route path="profile"     element={<Profile />} />
            <Route path="my-profile"  element={<MyProfile />} />
            <Route path="change-password" element={<ChangePassword />} />

            {/* ── Resume-builder sections — locked until profile is complete ── */}
            <Route element={<ProfileGuard />}>
              <Route path="resume-builder/experience" element={<Experience />} />
              <Route path="resume-builder/education"  element={<Education />} />
              <Route path="resume-builder/skills"     element={<Skills />} />
              <Route path="resume-builder/projects"   element={<Projects />} />
              <Route path="resume-builder/portfolio"  element={<Portfolio />} />
              <Route path="resume-builder/summary"    element={<Summary />} />
              <Route path="resume-builder/company"    element={<Company />} />
              <Route path="resume-builder/certifications" element={<Certifications />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
            </Route>

            {/* Preview is outside the ProfileGuard — template switching on this
                page loads a different template's (possibly empty) data, which
                would reset profileSaved and cause a spurious redirect. */}
            <Route path="resume-builder/preview" element={<Preview />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/about"             element={<LandingPage />} />
          <Route path="/templates-preview" element={<LandingPage />} />
          <Route path="/contact"           element={<LandingPage />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/signup"            element={<Signup />} />

          {/* ── Protected app routes ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app/*" element={<AppLayout />} />
          </Route>
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
