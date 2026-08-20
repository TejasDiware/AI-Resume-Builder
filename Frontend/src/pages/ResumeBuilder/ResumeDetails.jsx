import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdOutlineWork, MdOutlineSchool, MdSave, MdDeleteOutline } from 'react-icons/md'
import { GiBrain } from 'react-icons/gi'
import { BsCalendar3, BsPlusCircle } from 'react-icons/bs'
import { MdOutlineEdit, MdClose, MdAdd, MdInfoOutline, MdKeyboardArrowDown } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: '0.78rem', fontWeight: 600, color: '#000',
  marginBottom: 4, display: 'block',
}
const inputStyle = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8,
  padding: '8px 12px', fontSize: '0.85rem', color: '#000',
  outline: 'none', background: '#fff',
}
const selectStyle = { ...inputStyle, appearance: 'auto' }

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DEGREE_OPTIONS = [
  'Select', "Bachelor's Degree", "Master's Degree", 'MBA', 'Ph.D.',
  'Diploma', 'Certificate', 'High School Diploma', 'Associate Degree', 'Other',
]

const COMPANY_LIST = [
  'Cubeage Technologies Services Pvt. Ltd.',
  'Devcons Software Solutions Pvt. Ltd.',
  'JDIT Software Solutions Pvt. Ltd.',
  'Neweage Cloud Solution Pvt. Ltd.',
  'NIMBJA SECURITY SOLUTIONS Pvt. Ltd.',
  'Penta Software Consultancy Services (I) Pvt Ltd',
  'Quick Management Services', 'RP Business Solutions LLP',
  'Smart Software Services (I) Pvt. Ltd.',
  'SmartMatrix Digital Services Pvt. Ltd.', 'Other',
]

const ROLE_SKILLS = {
  'Full Stack Developer': ['React.js','Node.js','JavaScript','TypeScript','HTML5','CSS3','Tailwind CSS','MongoDB','PostgreSQL','REST API','Git & GitHub','Docker','Express.js','Next.js','Redux'],
  'Data Scientist':       ['Python','R','Machine Learning','Deep Learning','Pandas','NumPy','Scikit-learn','TensorFlow','Keras','SQL','Data Wrangling','Statistics','Matplotlib','Seaborn','Jupyter'],
  'AI/ML Engineer':       ['Python','TensorFlow','PyTorch','Scikit-learn','NLP','Computer Vision','LangChain','LangGraph','Hugging Face','FastAPI','Docker','MLflow','OpenAI API'],
  'Power BI Developer':   ['Power BI','DAX','Power Query','Data Visualization','SQL','Excel','Azure Data Factory','Data Modeling','Report Design','KPI Dashboard','Tableau','SSRS','Power Automate'],
  'SQL Support':          ['SQL','MySQL','PostgreSQL','Oracle','MS SQL Server','Query Optimization','Stored Procedures','Database Design','Indexing','Data Modeling','ETL','SSMS','T-SQL','PL/SQL'],
  'Others':               [],
}
const ROLES = Object.keys(ROLE_SKILLS)

const emptyExp = () => ({
  id: Date.now() + Math.random(),
  jobTitle: '', employer: '', employerOther: '',
  city: '', state: '', startDate: '', endDate: '',
  currentWork: false, description: '',
})

const emptyEdu = () => ({
  id: Date.now() + Math.random(),
  schoolName: '', city: '', state: '',
  degree: 'Select', fieldStudy: '',
  startDate: '', endDate: '', currentStudy: false,
})

// ── Tab: Work Experience ──────────────────────────────────────────────────────
function TabExperience({ entries, setEntries }) {
  const update = (id, f, v) => setEntries(p => p.map(e => e.id === id ? { ...e, [f]: v } : e))

  return (
    <>
      {entries.map((entry, idx) => (
        <div key={entry.id} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>
              Experience {entries.length > 1 ? `#${idx + 1}` : ''}
            </p>
            {entries.length > 1 && (
              <button onClick={() => setEntries(p => p.filter(e => e.id !== entry.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                <MdDeleteOutline size={18} /> Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <Field label="Job Title">
              <input style={inputStyle} type="text" value={entry.jobTitle}
                onChange={e => update(entry.id, 'jobTitle', e.target.value)} />
            </Field>
            <Field label="Company">
              <select style={selectStyle} value={entry.employer}
                onChange={e => update(entry.id, 'employer', e.target.value)}>
                <option value="">Select Company</option>
                {COMPANY_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
              {entry.employer === 'Other' && (
                <input style={{ ...inputStyle, marginTop: 8 }} type="text"
                  value={entry.employerOther} placeholder="Enter company name..."
                  onChange={e => update(entry.id, 'employerOther', e.target.value)} />
              )}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <Field label="City">
              <input style={inputStyle} value={entry.city} onChange={e => update(entry.id, 'city', e.target.value)} />
            </Field>
            <Field label="State">
              <input style={inputStyle} value={entry.state} onChange={e => update(entry.id, 'state', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <Field label="Start Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }}>
                  <BsCalendar3 size={14} />
                </span>
                <input type="date" style={{ ...inputStyle, paddingLeft: 32 }}
                  value={entry.startDate} onChange={e => update(entry.id, 'startDate', e.target.value)} />
              </div>
            </Field>
            <Field label="End Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }}>
                  <BsCalendar3 size={14} />
                </span>
                <input type="date"
                  style={{ ...inputStyle, paddingLeft: 32, opacity: entry.currentWork ? 0.4 : 1 }}
                  value={entry.currentWork ? '' : entry.endDate}
                  disabled={entry.currentWork}
                  onChange={e => update(entry.id, 'endDate', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input type="checkbox" id={`cw-${entry.id}`} checked={entry.currentWork}
                  onChange={e => update(entry.id, 'currentWork', e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#4f46e5', cursor: 'pointer' }} />
                <label htmlFor={`cw-${entry.id}`} style={{ fontSize: '0.78rem', color: '#6b7280', cursor: 'pointer', margin: 0 }}>
                  I currently work here
                </label>
              </div>
            </Field>
          </div>

          <Field label="Description (Optional)">
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              value={entry.description} placeholder="Describe your role and responsibilities..."
              onChange={e => update(entry.id, 'description', e.target.value)} />
          </Field>
        </div>
      ))}
      <button onClick={() => setEntries(p => [...p, emptyExp()])}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px dashed #4f46e5', borderRadius: 12, padding: '10px 20px', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: 24, width: '100%', justifyContent: 'center' }}>
        <BsPlusCircle size={17} /> Add Another Experience
      </button>
    </>
  )
}

// ── Tab: Education ────────────────────────────────────────────────────────────
function TabEducation({ entries, setEntries }) {
  const update = (id, f, v) => setEntries(p => p.map(e => e.id === id ? { ...e, [f]: v } : e))

  return (
    <>
      {entries.map((entry, idx) => (
        <div key={entry.id} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>
              Education {entries.length > 1 ? `#${idx + 1}` : ''}
            </p>
            {entries.length > 1 && (
              <button onClick={() => setEntries(p => p.filter(e => e.id !== entry.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                <MdDeleteOutline size={18} /> Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <Field label="School Name">
              <input style={inputStyle} value={entry.schoolName} onChange={e => update(entry.id, 'schoolName', e.target.value)} />
            </Field>
            <Field label="City">
              <input style={inputStyle} value={entry.city} onChange={e => update(entry.id, 'city', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <Field label="State">
              <input style={inputStyle} value={entry.state} onChange={e => update(entry.id, 'state', e.target.value)} />
            </Field>
            <Field label="Select a Degree">
              <select style={selectStyle} value={entry.degree} onChange={e => update(entry.id, 'degree', e.target.value)}>
                {DEGREE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Field label="Field of Study">
              <input style={inputStyle} value={entry.fieldStudy} onChange={e => update(entry.id, 'fieldStudy', e.target.value)} />
            </Field>
            <Field label="Graduation Start Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }}>
                  <BsCalendar3 size={14} />
                </span>
                <input type="date" style={{ ...inputStyle, paddingLeft: 32 }}
                  value={entry.startDate} onChange={e => update(entry.id, 'startDate', e.target.value)} />
              </div>
            </Field>
            <Field label="Graduation End Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }}>
                  <BsCalendar3 size={14} />
                </span>
                <input type="date"
                  style={{ ...inputStyle, paddingLeft: 32, opacity: entry.currentStudy ? 0.4 : 1 }}
                  value={entry.currentStudy ? '' : entry.endDate}
                  disabled={entry.currentStudy}
                  onChange={e => update(entry.id, 'endDate', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input type="checkbox" id={`cs-${entry.id}`} checked={entry.currentStudy}
                  onChange={e => update(entry.id, 'currentStudy', e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#4f46e5', cursor: 'pointer' }} />
                <label htmlFor={`cs-${entry.id}`} style={{ fontSize: '0.78rem', color: '#6b7280', cursor: 'pointer', margin: 0 }}>
                  I currently study here
                </label>
              </div>
            </Field>
          </div>
        </div>
      ))}
      <button onClick={() => setEntries(p => [...p, emptyEdu()])}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px dashed #4f46e5', borderRadius: 12, padding: '10px 20px', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: 24, width: '100%', justifyContent: 'center' }}>
        <BsPlusCircle size={17} /> Add Another Education
      </button>
    </>
  )
}

// ── Tab: Skills ───────────────────────────────────────────────────────────────
function TabSkills({ keySkills, setKeySkills, selectedRole, setSelectedRole }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editing, setEditing]           = useState(false)
  const [inputVal, setInputVal]         = useState('')
  const [customInput, setCustomInput]   = useState('')
  const isOthers = selectedRole === 'Others'

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setDropdownOpen(false)
    setKeySkills(role !== 'Others' ? ROLE_SKILLS[role] : [])
    setEditing(false)
    setInputVal('')
    setCustomInput('')
  }
  const removeSkill = (s) => setKeySkills(keySkills.filter(x => x !== s))
  const addSkill = () => {
    const t = inputVal.trim()
    if (t && !keySkills.includes(t)) setKeySkills([...keySkills, t])
    setInputVal('')
  }
  const addCustomSkill = () => {
    const t = customInput.trim()
    if (t && !keySkills.includes(t)) setKeySkills(p => [...p, t])
    setCustomInput('')
  }

  return (
    <div>
      {/* Role dropdown */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
        <label style={labelStyle}>Select Your Role</label>
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.875rem', color: selectedRole ? '#1e293b' : '#9ca3af', fontWeight: selectedRole ? 600 : 400 }}>
          {selectedRole || 'Choose a role...'}
          <MdKeyboardArrowDown size={20} style={{ transition: '0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
        </button>
        {dropdownOpen && (
          <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 100, overflow: 'hidden' }}>
            {ROLES.map(role => (
              <div key={role} onClick={() => handleRoleSelect(role)}
                style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: selectedRole === role ? '#4f46e5' : '#374151', background: selectedRole === role ? '#eef2ff' : '#fff', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                onMouseLeave={e => e.currentTarget.style.background = selectedRole === role ? '#eef2ff' : '#fff'}>
                {role}
                {role === 'Others' && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Custom input</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRole && (
        <>
          {isOthers && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4f46e5', marginBottom: 8 }}>Type your skills</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                  placeholder="e.g. Figma, Canva..."
                  style={{ ...inputStyle, flex: 1, borderRadius: 8 }} />
                <button onClick={addCustomSkill}
                  style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MdAdd size={16} /> Add
                </button>
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Key Skills</span>
                {!isOthers && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={() => setEditing(!editing)}><MdOutlineEdit size={17} /></button>}
              </div>
              <button onClick={() => setEditing(true)}
                style={{ border: '1px solid #4f46e5', color: '#4f46e5', background: 'none', borderRadius: 12, padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MdAdd size={16} /> Add Skill
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {keySkills.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>{isOthers ? 'Type skills above to add.' : 'No skills yet.'}</p>}
              {keySkills.map(skill => (
                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #d1d5db', borderRadius: 999, padding: '4px 12px', fontSize: '0.8rem', color: '#374151', background: '#fff' }}>
                  {skill}
                  <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}><MdClose size={13} /></button>
                </span>
              ))}
              {editing && !isOthers && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                    placeholder="Type & Enter" autoFocus
                    style={{ ...inputStyle, borderRadius: 999, padding: '4px 14px', width: 160, fontSize: '0.8rem' }} />
                  <button onClick={addSkill}
                    style={{ width: 28, height: 28, background: '#4f46e5', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <MdAdd size={15} color="#fff" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginTop: 14 }}>
            <MdInfoOutline size={22} color="#4f46e5" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 4px' }}>Tips</p>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>Add skills relevant to the job. Focus on your strongest ones.</p>
            </div>
          </div>
        </>
      )}
      {!selectedRole && (
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', paddingTop: 32 }}>☝️ Select a role from the dropdown above to get started</p>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'experience', label: 'Work Experience', icon: <MdOutlineWork size={17} /> },
  { id: 'education',  label: 'Education',       icon: <MdOutlineSchool size={17} /> },
  { id: 'skills',     label: 'Skills',          icon: <GiBrain size={17} /> },
]

export default function ResumeDetails() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const params     = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const { setExperiences, setEducation, setSkills: setContextSkills } = useResume()

  const [activeTab, setActiveTab] = useState('experience')
  const [saved, setSaved]         = useState(false)

  // Experience state
  const [expEntries, setExpEntries] = useState([emptyExp()])
  // Education state
  const [eduEntries, setEduEntries] = useState([emptyEdu()])
  // Skills state
  const [keySkills, setKeySkills]     = useState([])
  const [selectedRole, setSelectedRole] = useState('')

  const handleSave = () => {
    setExperiences(expEntries)
    setEducation(eduEntries.map(e => ({
      degree:      e.degree !== 'Select' ? e.degree : '',
      institution: e.schoolName,
      period:      e.startDate ? `${e.startDate} – ${e.currentStudy ? 'Present' : (e.endDate || '')}` : '',
      fieldStudy:  e.fieldStudy, city: e.city, state: e.state,
    })))
    setContextSkills([...keySkills])
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(`/app/resume-builder/summary?template=${templateId}`)
    }, 1000)
  }

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 20px' }}>

      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>Resume Details</h1>
      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 20 }}>
        Fill in your work experience, education and skills.
      </p>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff', borderRadius: 12, padding: 6, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              background: activeTab === tab.id ? '#4f46e5' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#6b7280',
              transition: 'all 0.15s',
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'experience' && <TabExperience entries={expEntries} setEntries={setExpEntries} />}
      {activeTab === 'education'  && <TabEducation  entries={eduEntries} setEntries={setEduEntries} />}
      {activeTab === 'skills'     && <TabSkills keySkills={keySkills} setKeySkills={setKeySkills} selectedRole={selectedRole} setSelectedRole={setSelectedRole} />}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '12px 0' }}>
        <button onClick={() => navigate(`/app/profile?template=${templateId}`)}
          style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 24px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
          ◀◀ Previous
        </button>
        <button onClick={handleSave}
          style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 32px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MdSave size={16} /> {saved ? '✓ Saved' : 'Save'}
        </button>
        <button onClick={() => navigate(`/app/resume-builder/summary?template=${templateId}`)}
          style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 24px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
          Next ▶▶
        </button>
      </div>
    </div>
  )
}
