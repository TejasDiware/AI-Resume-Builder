import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdClose, MdAdd, MdKeyboardArrowDown, MdInfoOutline } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import LivePreviewPanel from '../../components/LivePreviewPanel'
import ResumeSectionTabs from '../../components/ResumeSectionTabs'
import { safeNavigate } from '../../utils/safeNavigate'

const roleSkillsMap = {
  'SQL Support': [
    'SQL', 'MySQL', 'PostgreSQL', 'Oracle', 'MS SQL Server',
    'Query Optimization', 'Stored Procedures', 'Database Design',
    'Indexing', 'Data Modeling', 'ETL', 'SSMS', 'T-SQL', 'PL/SQL',
  ],
  'Power BI Developer': [
    'Power BI', 'DAX', 'Power Query', 'Data Visualization', 'SQL',
    'Excel', 'Azure Data Factory', 'Data Modeling', 'Report Design',
    'KPI Dashboard', 'M Language', 'Tableau', 'SSRS', 'Power Automate',
  ],
  'Data Scientist': [
    'Python', 'R', 'Machine Learning', 'Deep Learning', 'Pandas',
    'NumPy', 'Scikit-learn', 'TensorFlow', 'Keras', 'SQL',
    'Data Wrangling', 'Statistics', 'Matplotlib', 'Seaborn', 'Jupyter',
  ],
  'AI/ML Engineer': [
    'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP',
    'Computer Vision', 'LangChain', 'LangGraph', 'Hugging Face',
    'FastAPI', 'Docker', 'MLflow', 'OpenAI API', 'Artificial Intelligence',
  ],
  'Full Stack Developer': [
    'React.js', 'Node.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3',
    'Tailwind CSS', 'MongoDB', 'PostgreSQL', 'REST API', 'Git & GitHub',
    'Docker', 'Express.js', 'Next.js', 'Redux',
  ],
  'Others': [],
}

const roles = Object.keys(roleSkillsMap)

const inputStyle = {
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: '0.85rem',
  color: '#1e293b',
  outline: 'none',
  background: '#fff',
  transition: 'border-color 0.2s',
}

export default function Skills() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const params     = new URLSearchParams(location.search)
  const templateId = params.get('template') || '1'

  const { skills: ctxSkills, setSkills: setContextSkills, setSkillsSaved,
      currentResumeId, saveSkillsToBackend } = useResume()

    const toSkillObject = (skill) => typeof skill === 'string'
      ? { name: skill, category: '', proficiency: '' }
      : { ...skill, name: skill.name || '', category: skill.category || '', proficiency: skill.proficiency || '' }

    const [selectedRole, setSelectedRole] = useState(() => ctxSkills?.length ? 'Others' : '')
  const [dropdownOpen, setDropdownOpen] = useState(false)
    const [keySkills, setKeySkills]       = useState(() => (ctxSkills || []).map(toSkillObject))
  const [editing, setEditing]           = useState(false)
  const [inputVal, setInputVal]         = useState('')
  const [customInput, setCustomInput]   = useState('')
  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const syncingFromContextRef = useRef(false)

  const isOthers = selectedRole === 'Others'

  useEffect(() => {
    const incoming = (ctxSkills || []).map(toSkillObject)
    syncingFromContextRef.current = true
    setKeySkills(incoming)
    if (!incoming.length) setSelectedRole('')
    else if (!selectedRole) setSelectedRole('Others')
  }, [ctxSkills])

  useEffect(() => {
    if (syncingFromContextRef.current) {
      syncingFromContextRef.current = false
      return
    }
    const isSame = ctxSkills?.length === keySkills.length && ctxSkills.every((skill, idx) => {
      const current = toSkillObject(skill)
      const next = keySkills[idx]
      return current.id === next.id && current.name === next.name &&
        current.category === next.category && current.proficiency === next.proficiency
    })
    if (!isSame) setContextSkills(keySkills.map(toSkillObject))
  }, [ctxSkills, keySkills, setContextSkills])

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setDropdownOpen(false)
    setKeySkills(role !== 'Others' ? roleSkillsMap[role].map(name => toSkillObject(name)) : [])
    setEditing(false)
    setInputVal('')
    setCustomInput('')
  }

  const removeSkill = index => setKeySkills(prev => prev.filter((_, skillIndex) => skillIndex !== index))

  const addSkill = () => {
    const t = inputVal.trim()
    if (t && !keySkills.some(skill => skill.name === t)) setKeySkills(prev => [...prev, toSkillObject(t)])
    setInputVal('')
  }

  const addCustomSkill = () => {
    const t = customInput.trim()
    if (t && !keySkills.some(skill => skill.name === t)) setKeySkills(prev => [...prev, toSkillObject(t)])
    setCustomInput('')
  }

  const handleSave = async () => {
    if (!keySkills || keySkills.length === 0) {
      setError('Please add at least one skill before continuing.')
      return
    }

    setError('')
    setSaving(true)
    try {
      const rid = currentResumeId
      if (!rid) throw new Error('Select or create a resume before saving skills.')
      await saveSkillsToBackend(keySkills, rid)
      setSkillsSaved(true)
      setSaved(true)
      safeNavigate(navigate, `/app/resume-builder/projects?template=${templateId}`, { replace: true })
    } catch (err) {
      console.error('Backend save failed (skills):', err)
      setError(err.response?.data?.detail || err.message || 'Unable to save skills.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── LEFT: form ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', padding: '24px 20px' }}>
        <ResumeSectionTabs />

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>Skills</h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 24 }}>
          Showcase your technical and professional skills.
        </p>

        {/* Role dropdown card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 20 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            Select Your Role
          </label>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px', borderRadius: 8,
                border: `1.5px solid ${dropdownOpen ? '#4f46e5' : '#d1d5db'}`,
                background: '#fff', cursor: 'pointer', fontSize: '0.85rem',
                color: selectedRole ? '#1e293b' : '#9ca3af',
                fontWeight: selectedRole ? 600 : 400,
                transition: 'border-color 0.2s',
              }}
            >
              {selectedRole || 'Choose a role…'}
              <MdKeyboardArrowDown
                size={20}
                style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '100%',
                background: '#fff', border: '1.5px solid #e5e7eb',
                borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                zIndex: 100, overflow: 'hidden',
              }}>
                {roles.map(role => (
                  <div
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    style={{
                      padding: '10px 16px', cursor: 'pointer',
                      fontSize: '0.85rem', fontWeight: 500,
                      color: selectedRole === role ? '#4f46e5' : '#374151',
                      background: selectedRole === role ? '#eef2ff' : '#fff',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f3ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = selectedRole === role ? '#eef2ff' : '#fff')}
                  >
                    {role}
                    {role === 'Others' && (
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 400 }}>Custom input</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skills content — shown after role selected */}
        {selectedRole && (
          <>
            {/* Others: custom input box */}
            {isOthers && (
              <div style={{
                background: '#eef2ff', border: '1px solid #c7d2fe',
                borderRadius: 12, padding: '16px 18px', marginBottom: 20,
              }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4f46e5', margin: '0 0 10px' }}>
                  Type your skills
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                    placeholder="e.g. Figma, Canva, AutoCAD…"
                    autoFocus
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                  />
                  <button
                    onClick={addCustomSkill}
                    style={{
                      background: '#4f46e5', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '9px 16px',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <MdAdd size={16} /> Add
                  </button>
                </div>
              </div>
            )}

            {/* Skills card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>Key Skills <span style={{ color: '#ef4444', marginLeft: 6 }}>*</span></p>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    border: '1.5px solid #4f46e5', color: '#4f46e5',
                    background: '#fff', borderRadius: 8,
                    padding: '6px 12px', fontSize: '0.78rem',
                    fontWeight: 600, cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#eef2ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <MdAdd size={15} /> Add Skill
                </button>
              </div>

              {/* Skill tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {keySkills.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                    {isOthers ? 'Type your skills above to add them here.' : 'No skills added yet.'}
                  </p>
                )}
                {keySkills.map((skill, index) => (
                  <span key={skill.id || `new-${index}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#eef2ff', color: '#4f46e5',
                    borderRadius: 999, padding: '5px 12px',
                    fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    {skill.name}
                    <button
                      onClick={() => removeSkill(index)}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        cursor: 'pointer', color: '#818cf8',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <MdClose size={13} />
                    </button>
                  </span>
                ))}

                {/* Inline add input */}
                {editing && !isOthers && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addSkill() }}
                      placeholder="Type & Enter"
                      autoFocus
                      style={{
                        ...inputStyle,
                        borderRadius: 999,
                        padding: '5px 14px',
                        fontSize: '0.8rem',
                        width: 160,
                      }}
                      onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                      onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                    />
                    <button
                      onClick={addSkill}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#4f46e5', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <MdAdd size={15} color="#fff" />
                    </button>
                  </div>
                )}
              </div>

              {(editing || (isOthers && keySkills.length > 0)) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      background: '#4f46e5', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '7px 20px',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
              {error && (
                <div style={{ color: '#dc2626', background: '#fff7f7', padding: 10, borderRadius: 8, border: '1px solid #fecaca', marginTop: 12 }}>{error}</div>
              )}
            </div>

            {/* Tips card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <MdInfoOutline size={18} color="#4f46e5" />
                <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', margin: 0 }}>Tips</p>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                Add skills that are relevant to the job you are applying for. Focus on your strongest and most recent skills.
              </p>
            </div>
          </>
        )}

        {/* Empty state */}
        {!selectedRole && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '40px 24px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            textAlign: 'center', color: '#9ca3af',
            marginBottom: 20,
          }}>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              ☝️ Select a role from the dropdown above to get started
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, gap: 12 }}>
          <button type="button" onClick={() => navigate(`/app/resume-builder/education?template=${templateId}`)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: '2px solid #4f46e5', background: '#fff', color: '#4f46e5', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            ← Previous
          </button>
          <button type="button" onClick={handleSave}
            style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: 'none', background: saved ? '#22c55e' : '#4f46e5', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.3s', opacity: saving ? 0.7 : 1 }}
            disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>

      </div>

      {/* ── RIGHT: live preview ── */}
      <LivePreviewPanel />
    </div>
  )
}
