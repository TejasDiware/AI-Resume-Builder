import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdDashboard,
  MdOutlineArticle,
  MdOutlineAccountCircle,
  MdOutlineLogout,
  MdOutlineDescription,
  MdAssessment,
} from 'react-icons/md'
import { FaRobot } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard',   icon: <MdDashboard size={20} />,            path: '/app/dashboard' },
  { label: 'Resume',      icon: <MdOutlineDescription size={20} />,   path: '/app/resume' },
  { label: 'Templates',   icon: <MdOutlineArticle size={20} />,        path: '/app/templates' },
  { label: 'AI Assistant', icon: <FaRobot size={18} />,                path: '/app/ai-assistant', highlight: true },
  { label: 'ATS Checker', icon: <FaRobot size={18} />,                 path: '/app/ats-checker', highlight: true },
  { label: 'Job Descriptions', icon: <MdOutlineDescription size={20} />, path: '/app/job-descriptions' },
  { label: 'Resume Quality', icon: <MdAssessment size={20} />, path: '/app/resume-quality' },
  
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside style={{
      width: 220, minWidth: 220, height: '100vh',
      background: '#13142b',
      display: 'flex', flexDirection: 'column',
      borderRadius: '0 0 18px 0',
      overflow: 'hidden',
      position: 'sticky', top: 0,
    }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px 10px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: '#4f46e5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <MdOutlineAccountCircle size={24} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.2 }}>AI Resume</p>
          <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0 }}>Creator</p>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

        {navItems.map(({ label, icon, path, highlight }) => (
          <NavLink
            key={label}
            to={path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
              color: isActive ? '#fff' : highlight ? '#a5b4fc' : '#9499b8',
              background: isActive ? '#4f46e5' : highlight ? 'rgba(79,70,229,0.12)' : 'transparent',
              textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
              border: highlight && !isActive ? '1px solid rgba(79,70,229,0.25)' : '1px solid transparent',
            })}
            onMouseEnter={e => {
              if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                e.currentTarget.style.background = 'rgba(79,70,229,0.2)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseLeave={e => {
              if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                e.currentTarget.style.background = highlight ? 'rgba(79,70,229,0.12)' : 'transparent'
                e.currentTarget.style.color = highlight ? '#a5b4fc' : '#9499b8'
              }
            }}
          >
            {icon}
            {label}
            {highlight && (
              <span style={{
                marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 800,
                background: '#4f46e5', color: '#fff',
                padding: '2px 6px', borderRadius: 999, letterSpacing: '0.5px',
              }}>AI</span>
            )}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10,
            fontSize: '0.875rem', fontWeight: 500,
            color: '#9499b8', background: 'transparent',
            border: 'none', cursor: 'pointer', width: '100%',
            transition: 'background 0.15s, color 0.15s', marginTop: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9499b8' }}
        >
          <MdOutlineLogout size={20} />
          Logout
        </button>
      </nav>
    </aside>
  )
}
