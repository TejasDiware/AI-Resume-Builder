import { useEffect, useRef, useState } from 'react'
import { MdDeleteOutline, MdEdit, MdUploadFile } from 'react-icons/md'
import { jobDescriptionApi } from '../../utils/api'

const inputStyle = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8,
  padding: '9px 12px', fontSize: '0.85rem', color: '#1e293b',
  outline: 'none', boxSizing: 'border-box',
}

export default function JobDescriptions() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data } = await jobDescriptionApi.list()
      setItems(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load Job Descriptions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const resetForm = () => {
    setTitle('')
    setCompany('')
    setDescription('')
    setEditingId(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const save = async (event) => {
    event.preventDefault()
    if (!title.trim() || !description.trim()) return
    setSaving(true)
    try {
      const payload = { title: title.trim(), company: company.trim() || null, description: description.trim() }
      const response = editingId ? await jobDescriptionApi.update(editingId, payload) : await jobDescriptionApi.create(payload)
      setItems((current) => editingId
        ? current.map((item) => item.id === editingId ? response.data : item)
        : [response.data, ...current])
      resetForm()
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save Job Description.')
    } finally {
      setSaving(false)
    }
  }

  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !title.trim()) {
      setError('Enter a Job Description title before uploading a file.')
      return
    }
    setSaving(true)
    try {
      const { data } = await jobDescriptionApi.upload(file, title.trim(), company.trim())
      setItems((current) => [data, ...current])
      resetForm()
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not upload Job Description.')
    } finally {
      setSaving(false)
    }
  }

  const edit = (item) => {
    setEditingId(item.id)
    setTitle(item.title || '')
    setCompany(item.company || '')
    setDescription(item.description || '')
  }

  const remove = async (id) => {
    try {
      await jobDescriptionApi.delete(id)
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete Job Description.')
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ color: '#1e293b', margin: '0 0 6px', fontSize: '1.6rem' }}>Job Descriptions</h1>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: '0.9rem' }}>Save job descriptions to reuse them with ATS Checker.</p>
      <form onSubmit={save} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label style={{ color: '#374151', fontSize: '0.78rem', fontWeight: 600 }}>Title<input value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} required /></label>
          <label style={{ color: '#374151', fontSize: '0.78rem', fontWeight: 600 }}>Company<input value={company} onChange={(event) => setCompany(event.target.value)} style={inputStyle} /></label>
        </div>
        <label style={{ display: 'block', color: '#374151', fontSize: '0.78rem', fontWeight: 600, marginTop: 16 }}>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={7} style={{ ...inputStyle, resize: 'vertical' }} required /></label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
          <button type="submit" disabled={saving} style={{ background: '#4f46e5', color: '#fff', border: 0, borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}>{editingId ? 'Update' : 'Save Job Description'}</button>
          <button type="button" disabled={saving} onClick={() => fileRef.current?.click()} style={{ background: '#eef2ff', color: '#4338ca', border: 0, borderRadius: 8, padding: '10px 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><MdUploadFile size={18} /> Upload PDF, DOCX, or TXT</button>
          {editingId && <button type="button" onClick={resetForm} style={{ background: 'transparent', border: 0, color: '#6b7280', cursor: 'pointer' }}>Cancel</button>}
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={upload} style={{ display: 'none' }} />
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: 0 }}>{error}</p>}
      </form>
      {loading ? <p>Loading Job Descriptions...</p> : items.length === 0 ? <p style={{ color: '#6b7280' }}>No saved Job Descriptions yet.</p> : items.map((item) => (
        <div key={item.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div><h2 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{item.title} {item.company && <span style={{ color: '#6b7280', fontWeight: 500 }}>- {item.company}</span>}</h2><p style={{ color: '#9ca3af', fontSize: '0.72rem', margin: '4px 0 8px' }}>ID: {item.id}</p><p style={{ color: '#4b5563', fontSize: '0.82rem', margin: 0 }}>{item.description?.slice(0, 180)}{item.description?.length > 180 ? '...' : ''}</p></div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}><button type="button" onClick={() => edit(item)} aria-label={`Edit ${item.title}`} style={{ border: 0, background: '#eef2ff', color: '#4338ca', padding: 8, borderRadius: 7, cursor: 'pointer' }}><MdEdit size={18} /></button><button type="button" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`} style={{ border: 0, background: '#fef2f2', color: '#dc2626', padding: 8, borderRadius: 7, cursor: 'pointer' }}><MdDeleteOutline size={18} /></button></div>
        </div>
      ))}
    </div>
  )
}
