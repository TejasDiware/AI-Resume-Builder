import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import templateMap from '../pages/ResumeBuilder/templates/templateMap'

// A4 width = 794px; scale down to fit preview panel
const TEMPLATE_W = 794
const PANEL_W    = 480   // resume display width (increased for larger preview)
const PADDING    = 16    // padding around the resume card
const TOTAL_W    = PANEL_W + PADDING * 2

export default function LivePreviewPanel() {
  const location   = useLocation()
  const params     = new URLSearchParams(location.search)
  const templateId = parseInt(params.get('template') || '1', 10)

  const entry = templateMap[templateId] || templateMap[1]
  const { name, Component } = entry
  const resumeRef = useRef(null)
  const [resumeHeight, setResumeHeight] = useState(1123)

  // Measure the unscaled resume so multi-page content gets a matching
  // scrollable preview height instead of being clipped after the first A4 page.
  useEffect(() => {
    if (!resumeRef.current) return
    const updateHeight = () => {
      if (!resumeRef.current) return
      setResumeHeight(Math.max(1123, Math.ceil(resumeRef.current.scrollHeight)))
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(resumeRef.current)
    return () => observer.disconnect()
  }, [Component])

  const scale   = PANEL_W / TEMPLATE_W
  const scaledH = Math.round(resumeHeight * scale)

  return (
    <div style={{
      width: TOTAL_W,
      minWidth: TOTAL_W,
      maxWidth: TOTAL_W,
      height: 'calc(100vh - 56px)',
      background: '#e8eaf0',
      borderLeft: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* Header — exactly TOTAL_W wide, no extra space */}
      <div style={{
        width: '100%',
        padding: '10px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', margin: 0 }}>Live Preview</p>
          <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>{name}</p>
        </div>
        <span style={{
          background: '#eef2ff', color: '#4f46e5',
          borderRadius: 999, padding: '3px 10px',
          fontSize: '0.68rem', fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          Live · A4
        </span>
      </div>

      {/* Scaled template — no extra space below */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: PADDING,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        background: '#e8eaf0',
      }}>
        <div style={{
          width: PANEL_W,
          height: scaledH,
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          background: '#fff',
          flexShrink: 0,
          position: 'relative',
        }}>
          <div style={{
          width: TEMPLATE_W,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            pointerEvents: 'none',
            userSelect: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }} ref={resumeRef}>
            <Component />
          </div>
        </div>
      </div>

    </div>
  )
}