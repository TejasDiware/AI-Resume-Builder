import { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdDownload, MdSave, MdCheckCircle } from 'react-icons/md'
import { useResume } from '../../context/ResumeContext'
import templateMap from './templates/templateMap'

const A4_W = 794
const A4_H = 1123
const PDF_MARGIN = [24, 0, 24, 0]

function addInvisibleTextLayer(pdf, root) {
  const rootRect = root.getBoundingClientRect()
  const scale = A4_W / rootRect.width
  const pageContentHeight = A4_H - PDF_MARGIN[0] - PDF_MARGIN[2]
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.replace(/\s+/g, ' ').trim()
    const element = node.parentElement
    if (!text || !element) continue

    let current = element
    let isHidden = false
    while (current && current !== root) {
      const currentStyle = window.getComputedStyle(current)
      if (
        currentStyle.display === 'none' ||
        currentStyle.visibility === 'hidden' ||
        currentStyle.opacity === '0'
      ) {
        isHidden = true
        break
      }
      current = current.parentElement
    }
    if (isHidden) continue

    const style = window.getComputedStyle(element)

    const range = document.createRange()
    range.selectNodeContents(node)
    const rect = range.getBoundingClientRect()
    if (!rect.width || !rect.height) continue

    const textTop = (rect.top - rootRect.top) * scale
    const pageIndex = Math.floor(textTop / pageContentHeight)
    if (pageIndex >= pdf.getNumberOfPages()) continue

    const x = (rect.left - rootRect.left) * scale
    const y = PDF_MARGIN[0] + textTop - pageIndex * pageContentHeight
    const fontSize = Math.max(1, parseFloat(style.fontSize || '10') * scale)

    pdf.setPage(pageIndex + 1)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(fontSize)
    pdf.text(text, x, y, {
      baseline: 'top',
      renderingMode: 'invisible',
    })
  }
}

// ── Small thumbnail for template cards ───────────────────────────────────────
function ThumbPreview({ Component }) {
  const ref = useRef(null)
  const [w, setW] = useState(160)

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const scale = w / A4_W
  const h     = Math.round(A4_H * scale)

  return (
    <div ref={ref} style={{ width: '100%', height: h, overflow: 'hidden', position: 'relative', borderRadius: '8px 8px 0 0' }}>
      <div style={{ width: A4_W, transformOrigin: 'top left', transform: `scale(${scale})`, pointerEvents: 'none', userSelect: 'none', position: 'absolute', top: 0, left: 0 }}>
        <Component />
      </div>
    </div>
  )
}

export default function Preview() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const printRef  = useRef()
  const ctx       = useResume()

  const params     = new URLSearchParams(location.search)
  const initId     = parseInt(params.get('template') || '1', 10)

  const [selectedId, setSelectedId] = useState(templateMap[initId] ? initId : 1)
  const [saved, setSaved]           = useState(false)
  const [downloading, setDownloading] = useState(false)

  // On mount: sync the context to the template id from the URL
  useEffect(() => {
    const id = templateMap[initId] ? initId : 1
    ctx?.switchTemplate?.(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep context in sync whenever a different template is picked
  const handleTemplateSwitch = (id) => {
    setSelectedId(id)
    ctx?.switchTemplate?.(id)
  }

  const entry     = templateMap[selectedId] || templateMap[1]
  const { name, Component } = entry

  const allTemplates = Object.entries(templateMap).map(([id, t]) => ({ id: Number(id), ...t }))

  // ── Save resume to dashboard ──────────────────────────────────────────────
  const handleSave = () => {
    const p     = ctx?.profileData
    const title = ctx?.resumeTitle || (p ? `${p.firstName} ${p.lastName}`.trim() : '') || 'My Resume'
    const score = (() => {
      let s = 0
      if (p?.firstName || p?.lastName)   s += 20
      if (p?.email)                       s += 10
      if (p?.phone)                       s += 10
      if (ctx?.experiences?.length > 0)  s += 20
      if (ctx?.skills?.length > 0)       s += 20
      if (ctx?.summary)                  s += 20
      return s
    })()

    // addResume handles deduplication by title — same resume will be updated,
    // not pushed as a new entry. No duplicate on repeated Save clicks.
    ctx?.addResume?.({ id: Date.now(), title, templateId: selectedId, score, createdAt: new Date().toLocaleDateString() })

    setSaved(true)
    setTimeout(() => { setSaved(false); navigate('/app/dashboard') }, 1000)
  }

  // ── Download PDF ──────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!printRef.current || downloading) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const p     = ctx?.profileData
      const fname = (p?.firstName && p?.lastName) ? `${p.firstName}_${p.lastName}_Resume` : 'Resume'

      const worker = html2pdf()
        .set({
          margin: PDF_MARGIN,
          filename: `${fname}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true, logging: false, width: A4_W, windowWidth: A4_W },
          jsPDF: { unit: 'px', format: [A4_W, A4_H], orientation: 'portrait' },
        })
        .from(printRef.current)
        .toPdf()
      const pdf = await worker.get('pdf')

      addInvisibleTextLayer(pdf, printRef.current)
      pdf.save(`${fname}.pdf`)
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', background: '#f3f4f6' }}>

      {/* ── LEFT: Template selector panel ── */}
      <div style={{
        width: 240, minWidth: 240, flexShrink: 0,
        background: '#fff', borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: '0 0 2px' }}>
            Choose Template
          </p>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
            Click to switch template
          </p>
        </div>

        {/* Template cards */}
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {allTemplates.map(t => {
            const isSelected = selectedId === t.id
            return (
              <div
                key={t.id}
                onClick={() => handleTemplateSwitch(t.id)}
                style={{
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  border: isSelected ? '2.5px solid #4f46e5' : '2px solid #e5e7eb',
                  boxShadow: isSelected ? '0 0 0 3px #c7d2fe' : '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s',
                  background: '#fff',
                }}
              >
                <ThumbPreview Component={t.Component} />
                <div style={{
                  padding: '7px 10px', borderTop: '1px solid #f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#4f46e5' : '#374151', margin: 0 }}>
                    {t.name}
                  </p>
                  {isSelected && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="9" fill="#fff" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: Resume preview + action bar ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Action bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          flexShrink: 0,
        }}>
          <button
            onClick={() => navigate(`/app/resume-builder/summary?template=${selectedId}`)}
            style={{
              background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db',
              borderRadius: 999, padding: '8px 18px', fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← Previous
          </button>

          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
            Template: <span style={{ color: '#4f46e5' }}>{name}</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {saved && (
              <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MdCheckCircle size={15} /> Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              style={{
                background: '#22c55e', color: '#fff', border: 'none',
                borderRadius: 999, padding: '8px 18px', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <MdSave size={15} /> Save
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              title="Download PDF"
              style={{
                background: downloading ? '#818cf8' : '#4f46e5', color: '#fff', border: 'none',
                borderRadius: 999, padding: '8px 18px', fontSize: '0.82rem',
                fontWeight: 600, cursor: downloading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s',
              }}
            >
              <MdDownload size={15} />
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* A4 resume — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
          <div
            ref={printRef}
            id="resume-paper"
            style={{
              width: 794,
              flexShrink: 0,
              boxShadow: '0 4px 32px rgba(0,0,0,0.13)',
              background: '#fff',
            }}
          >
            <Component />
          </div>
        </div>

      </div>
    </div>
  )
}
