import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { HiMenu } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { useResume } from '../context/ResumeContext'

export default function Navbar({ onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const { profileData } = useResume()
  const navigate = useNavigate()

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const openChangePassword = () => {
    setDropdownOpen(false)
    navigate('/app/change-password')
  }

  const openMyProfile = () => {
    setDropdownOpen(false)
    navigate('/app/my-profile')
  }

  /* Display name: prefer first_name + last_name from profile,
     fall back to email prefix from auth user object */
  const firstName   = profileData?.firstName || ''
  const lastName    = profileData?.lastName  || ''
  const fullName    = [firstName, lastName].filter(Boolean).join(' ').trim()
  const displayName = fullName || user?.email?.split('@')[0] || 'User'
  const initials    = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="top-navbar d-flex align-items-center">

      {/* Left — Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="btn btn-link d-md-none text-secondary p-0 me-3"
        aria-label="Open menu"
      >
        <HiMenu size={24} />
      </button>

      {/* Spacer */}
      <div className="flex-fill" />

      {/* Right Section */}
      <div className="d-flex align-items-center gap-3">

        {/* User Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ border: 'none' }}
          >
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
            }}>
              {initials}
            </div>
            {/* Name + Role */}
            <div className="text-start d-none d-sm-block">
              <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>{displayName}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Candidate</p>
            </div>
            {/* Dropdown Arrow */}
            <MdKeyboardArrowDown
              size={20}
              className={`text-secondary ${dropdownOpen ? 'rotate-180' : ''}`}
              style={{ transition: 'transform 0.2s' }}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="dropdown-menu dropdown-menu-end show position-absolute" style={{ top: '100%', right: 0, minWidth: 160 }}>
              <button className="dropdown-item" onClick={openMyProfile}>My Profile</button>
              <button className="dropdown-item" onClick={openChangePassword}>Change Password</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
