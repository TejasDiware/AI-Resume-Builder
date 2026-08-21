import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdArrowBack, MdArrowForward, MdSave, MdAdd, MdClose,
  MdDeleteOutline, MdAutoAwesome, MdOutlineFileUpload,
  MdKeyboardArrowDown, MdCheckCircle,
} from 'react-icons/md'
import { BsCalendar3, BsPlusCircle } from 'react-icons/bs'
import { useResume } from '../../context/ResumeContext'

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Education' },
  { id: 3, label: 'Experience' },
  { id: 4, label: 'Skills' },
  { id: 5, label: 'Review' },
]

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
  'Quick Management Services',
  'RP Business Solutions LLP',
  'Smart Software Services (I) Pvt. Ltd.',
  'SmartMatrix Digital Services Pvt. Ltd.',
  'Other',
]

const ROLE_SKILLS = {
  'Full Stack Developer': ['React.js','Node.js','JavaScript','TypeScript','HTML5','CSS3','MongoDB','PostgreSQL','REST API','Git & GitHub','Docker','Express.js','Next.js','Redux'],
  'Data Scientist':       ['Python','R','Machine Learning','Deep Learning','Pandas','NumPy','Scikit-learn','TensorFlow','SQL','Statistics','Matplotlib','Jupyter'],
  'AI/ML Engineer':       ['Python','TensorFlow','PyTorch','Scikit-learn','NLP','Computer Vision','LangChain','Hugging Face','FastAPI','Docker','MLflow','OpenAI API'],
  'Power BI Developer':   ['Power BI','DAX','Power Query','Data Visualization','SQL','Excel','Azure Data Factory','Report Design','Tableau','SSRS'],
  'SQL Support':          ['SQL','MySQL','PostgreSQL','Oracle','MS SQL Server','Query Optimization','Stored Procedures','Database Design','T-SQL','PL/SQL'],
  'Others':               [],
}

const SUMMARY_SUGGESTIONS = [
  'Passionate Full Stack Developer with 2+ years of experience building scalable web applications using React.js, Django, and Python.',
  'Results-driven Data Scientist with expertise in Machine Learning, NLP, and statistical analysis.',
  'Detail-oriented SQL Support Specialist with 3+ years of experience in database management and query optimization.',
  'Creative Power BI Developer skilled in building interactive dashboards and delivering business intelligence solutions.',
  'Dedicated AI/ML Engineer experienced in developing and deploying deep learning models using TensorFlow and PyTorch.',
]

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  label: { fontSize: '0.78rem', fontWeight: 600, color: '#000', marginBottom: 4, display: 'block' },
  input: {
    width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8,
    padding: '8px 12px', fontSize: '0.85rem', color: '#000',
    outline: 'none', background: '#fff',
  },
  select: {
    width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8,
    padding: '8px 12px', fontSize: '0.85rem', color: '#000',
    outline: 'none', background: '#fff', appearance: 'auto',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '28px 24px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 20,
  },
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
      {STEPS.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: s.id < current ? '#4f46e5' : s.id === current ? '#4f46e5' : '#e5e7eb',
              color: s.id <= current ? '#fff' : '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.82rem', flexShrink: 0,
              border: s.id === current ? '3px solid #c7d2fe' : 'none',
            }}>
              {s.id < current ? <MdCheckCircle size={18} /> : s.id}
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: s.id === current ? 700 : 500,
              color: s.id === current ? '#4f46e5' : s.id < current ? '#6b7280' : '#9ca3af',
              whiteSpace: 'nowrap',
            }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              height: 2, width: 40, background: s.id < current ? '#4f46e5' : '#e5e7eb',
              margin: '0 4px', marginBottom: 20, flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function StepBasicInfo({ data, onChange, onPhotoChange }) {
  const fileRef = useRef()
  return (
    <div style={S.card}>
      <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 4 }}>Basic Information</h2>
      <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 20 }}>Let's start with your basic details.</p>

      {/* Photo upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            width: 90, height: 90, borderRadius: 14, background: '#eef2ff',
            border: '2px dashed #a5b4fc', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {data.photo
            ? <img src={data.photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <>
                <MdOutlineFileUpload size={24} color="#4f46e5" />
                <span style={{ fontSize: '0.62rem', color: '#4f46e5', fontWeight: 600, marginTop: 2 }}>Upload Photo</span>
                <span style={{ fontSize: '0.57rem', color: '#9ca3af' }}>JPG, PNG (Max 2MB)</span>
              </>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhotoChange} />
        <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.7 }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>Profile Photo</p>
          <p style={{ margin: 0 }}>A professional photo helps recruiters recognise you.</p>
        </div>
      </div>

      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Full Name *">
          <input style={S.input} type="text" value={data.fullName} placeholder="Enter your full name"
            onChange={e => onChange('fullName', e.target.value)} />
        </Field>
        <Field label="Professional Title">
          <input style={S.input} type="text" value={data.profession} placeholder="e.g. Full Stack Developer"
            onChange={e => onChange('profession', e.target.value)} />
        </Field>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Email Address *">
          <input style={S.input} type="email" value={data.email} placeholder="example@email.com"
            onChange={e => onChange('email', e.target.value)} />
        </Field>
        <Field label="Phone Number *">
          <input style={S.input} type="tel" value={data.phone} placeholder="Enter your phone number"
            onChange={e => onChange('phone', e.target.value)} />
        </Field>
      </div>

      {/* Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Location *">
          <input style={S.input} type="text" value={data.location} placeholder="Enter your city and country"
            onChange={e => onChange('location', e.target.value)} />
        </Field>
        <Field label="LinkedIn Profile">
          <input style={S.input} type="text" value={data.linkedin} placeholder="https://linkedin.com/in/yourprofile"
            onChange={e => onChange('linkedin', e.target.value)} />
        </Field>
      </div>

      {/* Row 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Portfolio / Website">
          <input style={S.input} type="text" value={data.website} placeholder="https://yourwebsite.com"
            onChange={e => onChange('website', e.target.value)} />
        </Field>
        <Field label="GitHub Profile">
          <input style={S.input} type="text" value={data.github} placeholder="https://github.com/yourusername"
            onChange={e => onChange('github', e.target.value)} />
        </Field>
      </div>

      {/* Summary */}
      <Field label="Career Objective / Summary">
        <div style={{ position: 'relative' }}>
          <textarea
            style={{ ...S.input, minHeight: 110, resize: 'vertical', lineHeight: 1.7 }}
            value={data.summary}
            placeholder="Write your career objective or professional summary here..."
            maxLength={500}
            onChange={e => onChange('summary', e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{data.summary.length}/500</span>
          </div>
        </div>
      </Field>
    </div>
  )
}

// ─── Step 2: Education ────────────────────────────────────────────────────────
const emptyEdu = () => ({ id: Date.now() + Math.random(), school: '', city: '', state: '', degree: 'Select', field: '', startDate: '', endDate: '', current: false })

function StepEducation({ entries, setEntries }) {
  const update = (id, f, v) => setEntries(p => p.map(e => e.id === id ? { ...e, [f]: v } : e))
  return (
    <>
      {entries.map((e, idx) => (
        <div key={e.id} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Education {entries.length > 1 ? `#${idx + 1}` : ''}</p>
            {entries.length > 1 && (
              <button onClick={() => setEntries(p => p.filter(x => x.id !== e.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                <MdDeleteOutline size={17} /> Remove
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="School Name"><input style={S.input} value={e.school} onChange={ev => update(e.id, 'school', ev.target.value)} /></Field>
            <Field label="City"><input style={S.input} value={e.city} onChange={ev => update(e.id, 'city', ev.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="State"><input style={S.input} value={e.state} onChange={ev => update(e.id, 'state', ev.target.value)} /></Field>
            <Field label="Select a Degree">
              <select style={S.select} value={e.degree} onChange={ev => update(e.id, 'degree', ev.target.value)}>
                {DEGREE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Field label="Field of Study"><input style={S.input} value={e.field} onChange={ev => update(e.id, 'field', ev.target.value)} /></Field>
            <Field label="Start Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><BsCalendar3 size={13} /></span>
                <input type="date" style={{ ...S.input, paddingLeft: 32 }} value={e.startDate} onChange={ev => update(e.id, 'startDate', ev.target.value)} />
              </div>
            </Field>
            <Field label="End Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><BsCalendar3 size={13} /></span>
                <input type="date" style={{ ...S.input, paddingLeft: 32, opacity: e.current ? 0.4 : 1 }} value={e.current ? '' : e.endDate} disabled={e.current} onChange={ev => update(e.id, 'endDate', ev.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7 }}>
                <input type="checkbox" checked={e.current} onChange={ev => update(e.id, 'current', ev.target.checked)} style={{ width: 14, height: 14, accentColor: '#4f46e5', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>I currently study here</span>
              </div>
            </Field>
          </div>
        </div>
      ))}
      <button onClick={() => setEntries(p => [...p, emptyEdu()])}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px dashed #4f46e5', borderRadius: 12, padding: '10px 20px', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: '100%', justifyContent: 'center', marginBottom: 8 }}>
        <BsPlusCircle size={16} /> Add Another Education
      </button>
    </>
  )
}

// ─── Step 3: Experience ───────────────────────────────────────────────────────
const emptyExp = () => ({ id: Date.now() + Math.random(), jobTitle: '', employer: '', employerOther: '', city: '', state: '', startDate: '', endDate: '', current: false, description: '' })

function StepExperience({ entries, setEntries }) {
  const update = (id, f, v) => setEntries(p => p.map(e => e.id === id ? { ...e, [f]: v } : e))
  return (
    <>
      {entries.map((e, idx) => (
        <div key={e.id} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Experience {entries.length > 1 ? `#${idx + 1}` : ''}</p>
            {entries.length > 1 && (
              <button onClick={() => setEntries(p => p.filter(x => x.id !== e.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                <MdDeleteOutline size={17} /> Remove
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Job Title"><input style={S.input} value={e.jobTitle} onChange={ev => update(e.id, 'jobTitle', ev.target.value)} /></Field>
            <Field label="Company">
              <select style={S.select} value={e.employer} onChange={ev => update(e.id, 'employer', ev.target.value)}>
                <option value="">Select Company</option>
                {COMPANY_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
              {e.employer === 'Other' && (
                <input style={{ ...S.input, marginTop: 8 }} type="text" value={e.employerOther} placeholder="Enter company name..." onChange={ev => update(e.id, 'employerOther', ev.target.value)} />
              )}
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="City"><input style={S.input} value={e.city} onChange={ev => update(e.id, 'city', ev.target.value)} /></Field>
            <Field label="State"><input style={S.input} value={e.state} onChange={ev => update(e.id, 'state', ev.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Start Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><BsCalendar3 size={13} /></span>
                <input type="date" style={{ ...S.input, paddingLeft: 32 }} value={e.startDate} onChange={ev => update(e.id, 'startDate', ev.target.value)} />
              </div>
            </Field>
            <Field label="End Date">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><BsCalendar3 size={13} /></span>
                <input type="date" style={{ ...S.input, paddingLeft: 32, opacity: e.current ? 0.4 : 1 }} value={e.current ? '' : e.endDate} disabled={e.current} onChange={ev => update(e.id, 'endDate', ev.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7 }}>
                <input type="checkbox" checked={e.current} onChange={ev => update(e.id, 'current', ev.target.checked)} style={{ width: 14, height: 14, accentColor: '#4f46e5', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>I currently work here</span>
              </div>
            </Field>
          </div>
          <Field label="Description (Optional)">
            <textarea style={{ ...S.input, minHeight: 90, resize: 'vertical' }} value={e.description} placeholder="Describe your role..." onChange={ev => update(e.id, 'description', ev.target.value)} />
          </Field>
        </div>
      ))}
      <button onClick={() => setEntries(p => [...p, emptyExp()])}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px dashed #4f46e5', borderRadius: 12, padding: '10px 20px', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: '100%', justifyContent: 'center', marginBottom: 8 }}>
        <BsPlusCircle size={16} /> Add Another Experience
      </button>
    </>
  )
}

// ─── Step 4: Skills ───────────────────────────────────────────────────────────
const ROLES = Object.keys(ROLE_SKILLS)

function StepSkills({ skills, setSkills, role, setRole }) {
  const [dropOpen, setDropOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')

  const selectRole = (r) => {
    setRole(r)
    setDropOpen(false)
    if (r !== 'Others') setSkills(ROLE_SKILLS[r])
    else setSkills([])
  }
  const remove = (s) => setSkills(p => p.filter(x => x !== s))
  const add = () => {
    const t = inputVal.trim()
    if (t && !skills.includes(t)) setSkills(p => [...p, t])
    setInputVal('')
  }

  return (
    <div style={S.card}>
      <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>Skills</h2>
      <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 18 }}>Select your role to auto-fill skills or add custom ones.</p>

      {/* Role dropdown */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
        <label style={S.label}>Select Your Role</label>
        <button onClick={() => setDropOpen(!dropOpen)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.875rem', color: role ? '#1e293b' : '#9ca3af', fontWeight: role ? 600 : 400 }}>
          {role || 'Choose a role...'}
          <MdKeyboardArrowDown size={20} style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
        {dropOpen && (
          <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 100, overflow: 'hidden' }}>
            {ROLES.map(r => (
              <div key={r} onClick={() => selectRole(r)}
                style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: role === r ? '#4f46e5' : '#374151', background: role === r ? '#eef2ff' : '#fff', borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                onMouseLeave={e => e.currentTarget.style.background = role === r ? '#eef2ff' : '#fff'}>
                {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills tags */}
      {role && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {skills.map(s => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid #d1d5db', borderRadius: 999, padding: '4px 12px', fontSize: '0.8rem', color: '#374151', background: '#fff' }}>
                {s}
                <button onClick={() => remove(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}><MdClose size={13} /></button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, maxWidth: 360 }}>
            <input style={{ ...S.input, flex: 1, borderRadius: 999 }} value={inputVal} placeholder="Add custom skill..." onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
            <button onClick={add} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 16px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MdAdd size={15} /> Add
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────
function ReviewRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', width: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: '#1e293b' }}>{value}</span>
    </div>
  )
}

function StepReview({ basic, eduEntries, expEntries, skills }) {
  return (
    <div>
      {/* Basic */}
      <div style={S.card}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14, color: '#4f46e5' }}>Basic Information</h3>
        <ReviewRow label="Full Name"   value={basic.fullName} />
        <ReviewRow label="Profession"  value={basic.profession} />
        <ReviewRow label="Email"       value={basic.email} />
        <ReviewRow label="Phone"       value={basic.phone} />
        <ReviewRow label="Location"    value={basic.location} />
        <ReviewRow label="LinkedIn"    value={basic.linkedin} />
        <ReviewRow label="GitHub"      value={basic.github} />
        <ReviewRow label="Summary"     value={basic.summary} />
      </div>

      {/* Education */}
      {eduEntries.some(e => e.school) && (
        <div style={S.card}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14, color: '#4f46e5' }}>Education</h3>
          {eduEntries.filter(e => e.school).map((e, i) => (
            <div key={e.id} style={{ marginBottom: 12 }}>
              <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '0.88rem' }}>{e.degree !== 'Select' ? e.degree : ''} {e.field && `— ${e.field}`}</p>
              <p style={{ margin: '0 0 2px', fontSize: '0.82rem', color: '#4f46e5' }}>{e.school}{e.city ? `, ${e.city}` : ''}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{e.startDate} {e.endDate || e.current ? `– ${e.current ? 'Present' : e.endDate}` : ''}</p>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {expEntries.some(e => e.jobTitle) && (
        <div style={S.card}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14, color: '#4f46e5' }}>Work Experience</h3>
          {expEntries.filter(e => e.jobTitle).map((e, i) => (
            <div key={e.id} style={{ marginBottom: 12 }}>
              <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '0.88rem' }}>{e.jobTitle}</p>
              <p style={{ margin: '0 0 2px', fontSize: '0.82rem', color: '#4f46e5' }}>
                {e.employer === 'Other' ? e.employerOther : e.employer}
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#6b7280' }}>{e.startDate} {e.endDate || e.current ? `– ${e.current ? 'Present' : e.endDate}` : ''}</p>
              {e.description && <p style={{ margin: 0, fontSize: '0.78rem', color: '#374151' }}>{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14, color: '#4f46e5' }}>Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skills.map(s => (
              <span key={s} style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 999, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
export default function CreateResume() {
  const navigate = useNavigate()
  const ctx      = useResume()

  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)

  // Step 1 state
  const [basic, setBasic] = useState({
    fullName: '', profession: '', email: '', phone: '',
    location: '', linkedin: '', github: '', website: '', summary: '', photo: null,
  })

  const handleBasicChange = (field, val) => setBasic(p => ({ ...p, [field]: val }))
  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setBasic(p => ({ ...p, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  // Step 2 state
  const [eduEntries, setEduEntries] = useState([emptyEdu()])

  // Step 3 state
  const [expEntries, setExpEntries] = useState([emptyExp()])

  // Step 4 state
  const [skills, setSkills] = useState([])
  const [role, setRole]     = useState('')

  const canNext = () => {
    if (step === 1) return basic.fullName.trim() && basic.email.trim()
    return true
  }

  const handleSaveAndPreview = () => {
    // Split fullName into firstName/lastName
    const parts = basic.fullName.trim().split(' ')
    const firstName = parts[0] || ''
    const lastName  = parts.slice(1).join(' ') || ''

    ctx?.setProfileData({
      firstName, lastName, middleName: '',
      profession: basic.profession,
      email: basic.email, phone: basic.phone,
      city: basic.location, state: '', street: '',
      photo: basic.photo,
      linkedin: basic.linkedin, github: basic.github, website: basic.website,
    })

    ctx?.setEducation(eduEntries.filter(e => e.school).map(e => ({
      degree: e.degree !== 'Select' ? e.degree : '',
      institution: e.school,
      period: e.startDate ? `${e.startDate} – ${e.current ? 'Present' : e.endDate}` : '',
      fieldStudy: e.field, city: e.city, state: e.state,
    })))

    ctx?.setExperiences(expEntries.filter(e => e.jobTitle).map(e => ({
      jobTitle: e.jobTitle,
      employer: e.employer,
      employerOther: e.employerOther,
      city: e.city, state: e.state,
      startDate: e.startDate, endDate: e.endDate,
      currentWork: e.current,
      description: e.description,
    })))

    ctx?.setSkills([...skills])
    ctx?.setSummary?.(basic.summary)

    const title = basic.fullName.trim() || 'My Resume'
    ctx?.setResumeTitle?.(title)
    const resumeId = await ctx?.ensureResumeExists?.(title, 1)
    if (!resumeId) return

    setSaved(true)
    setTimeout(() => navigate('/app/templates'), 1000)
  }

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 20px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <button onClick={() => navigate('/app/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontWeight: 600, fontSize: '0.85rem' }}>
          <MdArrowBack size={18} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/app/templates')}
            style={{ background: '#fff', color: '#4f46e5', border: '1.5px solid #4f46e5', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdSave size={15} /> Save Draft
          </button>
          <button onClick={() => navigate('/app/resume-builder/preview?template=1')}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Preview Resume
          </button>
        </div>
      </div>

      {/* Step bar */}
      <StepBar current={step} />

      {/* Step content */}
      {step === 1 && <StepBasicInfo data={basic} onChange={handleBasicChange} onPhotoChange={handlePhoto} />}
      {step === 2 && <StepEducation entries={eduEntries} setEntries={setEduEntries} />}
      {step === 3 && <StepExperience entries={expEntries} setEntries={setExpEntries} />}
      {step === 4 && <StepSkills skills={skills} setSkills={setSkills} role={role} setRole={setRole} />}
      {step === 5 && <StepReview basic={basic} eduEntries={eduEntries} expEntries={expEntries} skills={skills} />}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8 }}>
        <button
          onClick={() => step > 1 && setStep(s => s - 1)}
          disabled={step === 1}
          style={{ background: step === 1 ? '#e5e7eb' : '#4f46e5', color: step === 1 ? '#9ca3af' : '#fff', border: 'none', borderRadius: 999, padding: '10px 24px', fontWeight: 600, fontSize: '0.85rem', cursor: step === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MdArrowBack size={16} /> Previous
        </button>

        {step < 5
          ? <button
              onClick={() => canNext() && setStep(s => s + 1)}
              style={{ background: canNext() ? '#4f46e5' : '#a5b4fc', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 24px', fontWeight: 600, fontSize: '0.85rem', cursor: canNext() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
              Save & Next <MdArrowForward size={16} />
            </button>
          : <button
              onClick={handleSaveAndPreview}
              style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 28px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdCheckCircle size={16} /> {saved ? 'Saved! ✓' : 'Save & Choose Template'}
            </button>
        }
      </div>

    </div>
  )
}
