import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { MdDescription } from 'react-icons/md'

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Templates', to: '/templates-preview' },
    { label: 'About Us', to: '/about' },
  ]

  const isActive = (to) => location.pathname === to

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar__inner">
        {/* Logo */}
        <Link to="/" className="landing-navbar__logo">
          <span className="landing-navbar__logo-icon">
            <MdDescription size={22} />
          </span>
          <span className="landing-navbar__logo-text">Resume<span>Builder</span></span>
        </Link>

        {/* Desktop links */}
        <ul className="landing-navbar__links">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`landing-navbar__link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth buttons */}
        <div className="landing-navbar__auth">
          <Link to="/login" className="landing-navbar__login">Login</Link>
          <Link to="/signup" className="landing-navbar__signup">Sign Up</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="landing-navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="landing-navbar__mobile-menu">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`landing-navbar__mobile-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="landing-navbar__mobile-auth">
            <Link to="/login" className="landing-navbar__login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="landing-navbar__signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
