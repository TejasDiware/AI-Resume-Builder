import { Link, useLocation } from 'react-router-dom'
import { MdAutoAwesome, MdArrowForward, MdDescription, MdShield, MdEdit, MdCloudDownload, MdOutlineFileCopy, MdPhoneInTalk, MdEmail, MdShare } from 'react-icons/md'
import { FaLinkedinIn, FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa'
import LandingNavbar from '../../components/LandingNavbar'
import templateMap from '../ResumeBuilder/templates/templateMap'
import { ResumeContext } from '../../context/ResumeContext'
import './LandingTemplates.css'

const features = [
  { icon: <MdDescription />, title: 'Professional Templates', text: 'Choose from a variety of beautiful and ATS-friendly resume templates.', tone: 'purple' },
  { icon: <MdAutoAwesome />, title: 'AI Content Suggestions', text: 'Get AI-powered suggestions to write better summaries and job descriptions.', tone: 'green' },
  { icon: <MdShield />, title: 'ATS Score Checker', text: 'Check your resume score and improve it to pass ATS screening.', tone: 'blue' },
  { icon: <MdEdit />, title: 'Easy Customization', text: 'Easily customize fonts, colors, sections, and layouts to match your style.', tone: 'orange' },
  { icon: <MdCloudDownload />, title: 'Download & Share', text: 'Download your resume in PDF or DOCX format and share it instantly.', tone: 'pink' },
]

const landingTemplateIds = [1, 2, 4, 5,7, 15]

function LandingTemplatePreview({ Component }) {
  return (
    <div className="landing-template-list__preview landing-template-list__preview--actual">
      <ResumeContext.Provider value={null}>
        <div className="landing-template-list__page">
          <Component />
        </div>
      </ResumeContext.Provider>
    </div>
  )
}

function ResumeCard({ className = '', name, role, dark = false }) {
  return (
    <article className={`reference-resume-card ${dark ? 'reference-resume-card--dark' : ''} ${className}`}>
      <div className="reference-resume-card__head">
        <div className="reference-resume-card__avatar">{name.slice(0, 1)}</div>
        <div><strong>{name}</strong><small>{role}</small></div>
      </div>
      <div className="reference-resume-card__section">SUMMARY</div>
      <div className="reference-resume-card__lines"><i /><i /><i /></div>
      <div className="reference-resume-card__section">EXPERIENCE</div>
      <div className="reference-resume-card__job"><b>Senior Developer</b><span>Tech Solutions Inc.</span></div>
      <div className="reference-resume-card__lines"><i /><i /><i /></div>
      <div className="reference-resume-card__section">SKILLS</div>
      <div className="reference-resume-card__tags"><em>JavaScript</em><em>React.js</em><em>Python</em></div>
      <div className="reference-resume-card__section">EDUCATION</div>
      <div className="reference-resume-card__lines"><i /><i /></div>
    </article>
  )
}

export default function LandingPage() {
  const location = useLocation()
  const page = location.pathname === '/about' ? 'about' : location.pathname === '/templates-preview' ? 'templates' : 'home'

  return (
    <div className="reference-home">
      <LandingNavbar />
      <main>
        {page === 'about' ? (
          <section className="reference-subpage">
            <span>ABOUT RESUME BUILDER</span>
            <h1>Build your career story with confidence.</h1>
            <p>Resume Builder makes it simple to create a professional, ATS-friendly resume that clearly presents your skills, experience, and achievements.</p>
            <div className="reference-subpage__cards"><article><MdDescription /><h2>Professional design</h2><p>Clean, recruiter-ready layouts for every career stage.</p></article><article><MdAutoAwesome /><h2>Smart guidance</h2><p>Helpful tools and suggestions whenever you need them.</p></article><article><MdShield /><h2>Built for hiring</h2><p>Structure your resume for ATS systems and recruiters.</p></article></div>
            <Link to="/signup" className="reference-button reference-button--solid">Create Your Resume <MdArrowForward /></Link>
          </section>
        ) : page === 'templates' ? (
          <section className="reference-subpage">
            <span>RESUME TEMPLATES</span>
            <h1>Choose a template that fits your career.</h1>
            <Link to="/signup" className="reference-button reference-button--solid" style={{ marginBottom: 28 }}>Create Your New CV <MdArrowForward /></Link>
            <p>Explore modern, professional, and ATS-friendly resume designs. You can customize every template after signing up.</p>
            <div className="reference-template-list landing-template-list">{landingTemplateIds.map(templateId => { const template = templateMap[templateId]; return <article key={templateId}><LandingTemplatePreview Component={template.Component} /><h2>{template.name}</h2><span style={{ color: '#4f46e5', fontWeight: 600 }}>Use this template</span></article> })}</div>
          </section>
        ) : (
          <>
        <section className="reference-hero" id="home">
          <div className="reference-hero__inner">
            <div className="reference-hero__copy">
              <p className="reference-hero__eyebrow"><MdAutoAwesome /> Create. Customize. Get Hired.</p>
              <h1>Build a Resume that <span>Opens Doors to Your Future</span></h1>
              <p className="reference-hero__intro">Create professional resumes in minutes with our easy-to-use tools, ATS-friendly templates, and AI-powered suggestions.</p>
              <div className="reference-hero__actions">
                <Link to="/signup" className="reference-button reference-button--solid">Create Your Resume <MdArrowForward /></Link>
                <a href="#templates" className="reference-button reference-button--outline"><MdOutlineFileCopy /> Explore Templates</a>
              </div>
              <div className="reference-benefits">
                <div><span className="reference-benefit-icon reference-benefit-icon--purple"><MdShield /></span><p><b>ATS Friendly</b><small>Pass ATS with ease</small></p></div>
                <div><span className="reference-benefit-icon reference-benefit-icon--green"><MdAutoAwesome /></span><p><b>AI Powered</b><small>Smart suggestions</small></p></div>
                <div><span className="reference-benefit-icon reference-benefit-icon--blue"><MdDescription /></span><p><b>Professional Templates</b><small>Designed by experts</small></p></div>
              </div>
            </div>
            <div className="reference-hero__visual" aria-hidden="true">
              <div className="reference-hero__halo" />
              <ResumeCard className="reference-resume-card--left" name="Jessica Lee" role="UI/UX Designer" />
              <ResumeCard className="reference-resume-card--main" name="Daniel Smith" role="Senior Developer" dark />
              <ResumeCard className="reference-resume-card--right" name="Michael Brown" role="Data Analyst" />
            </div>
          </div>
        </section>

        <section className="reference-features" id="about">
          <h2>Everything You Need to Build the Perfect Resume</h2>
          <span className="reference-heading-line" />
          <div className="reference-features__grid">
            {features.map((feature) => <article key={feature.title} className="reference-feature"><span className={`reference-feature__icon reference-feature__icon--${feature.tone}`}>{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
          </div>
        </section>

        <section className="reference-subpage" id="templates">
          <span>RESUME TEMPLATES</span>
          <h2>Choose a template that fits your career.</h2>
          <p>Explore modern, professional, and ATS-friendly resume designs. You can customize every template after signing up.</p>
          <Link to="/signup" className="reference-button reference-button--solid" style={{ marginBottom: 28 }}>Create Your New CV <MdArrowForward /></Link>
          <div className="reference-template-list landing-template-list">{landingTemplateIds.map(templateId => { const template = templateMap[templateId]; return <article key={templateId}><LandingTemplatePreview Component={template.Component} /><h2>{template.name}</h2><span style={{ color: '#4f46e5', fontWeight: 600 }}>Use this template</span></article> })}</div>
        </section>

        <section className="reference-subpage">
          <span>ABOUT RESUME BUILDER</span>
          <h1>Build your career story with confidence.</h1>
          <p>Resume Builder makes it simple to create a professional, ATS-friendly resume that clearly presents your skills, experience, and achievements.</p>
          <div className="reference-subpage__cards"><article><MdDescription /><h2>Professional design</h2><p>Clean, recruiter-ready layouts for every career stage.</p></article><article><MdAutoAwesome /><h2>Smart guidance</h2><p>Helpful tools and suggestions whenever you need them.</p></article><article><MdShield /><h2>Built for hiring</h2><p>Structure your resume for ATS systems and recruiters.</p></article></div>
          <Link to="/signup" className="reference-button reference-button--solid">Create Your Resume <MdArrowForward /></Link>
        </section>
          </>
        )}
      </main>
      <footer className="reference-footer" id="contact">
        <div className="reference-footer__inner">
          <section className="reference-footer__contact"><h2>Contact Info</h2><div className="reference-footer__rule" /><div className="reference-footer__contact-row"><MdPhoneInTalk /><p><small>MON TO SUN : 24/7</small><b>+91 98765 43210</b></p></div><div className="reference-footer__contact-row"><MdEmail /><p><small>DO YOU HAVE A QUESTION?</small><b>support@resumebuilder.com</b></p></div><div className="reference-footer__contact-row"><MdShare /><p><small>SOCIALS NETWORK</small><span className="reference-social"><a href="#facebook" aria-label="Facebook"><FaFacebookF /></a><a href="#linkedin" aria-label="LinkedIn"><FaLinkedinIn /></a><a href="#twitter" aria-label="Twitter"><FaTwitter /></a><a href="#instagram" aria-label="Instagram"><FaInstagram /></a></span></p></div></section>
          <section><h2>Quick Links</h2><div className="reference-footer__rule" /><div className="reference-footer__link-grid"><a href="#home">Home</a><a href="#about">About Us</a><a href="#templates">Resume Templates</a><a href="#templates">Portfolio</a><a href="#about">Cover Letter</a><a href="#contact">Contact Us</a><a href="#blog">Blog</a><Link to="/app/ats-checker">ATS Checker</Link><a href="#ai-tools">AI Tools</a><a href="#careers">Career</a></div></section>
          <section><h2>Our Company</h2><div className="reference-footer__rule" /><div className="reference-footer__link-grid"><a href="#about">About Us</a><a href="#privacy">Privacy Policy</a><a href="#contact">Contact Us</a><a href="#terms">Terms & Conditions</a><a href="#sponsorship">Sponsorship Program</a></div></section>
        </div>
        <div className="reference-footer__bottom"><span>© Copyright 2026 Resume Builder. All rights reserved</span><div><a href="#terms">Terms & Conditions</a><i /> <a href="#privacy">Privacy Policy</a></div></div>
      </footer>
    </div>
  )
}
