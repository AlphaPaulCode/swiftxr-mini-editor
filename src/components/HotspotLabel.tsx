import { useState } from 'react'
import { Html } from '@react-three/drei'
import type { Hotspot } from '../store'
import { useEditor } from '../store'

export default function HotspotLabel({ id, position, text }: Hotspot) {
  const { updateHotspot, removeHotspot } = useEditor()
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(text)

  return (
    <Html
      position={position}
      center
      occlude
      distanceFactor={6}
      transform
      style={{ pointerEvents: 'auto' }}
    >
      <div
        style={{
          background: '#0b133a',
          border: '1px solid #2a3e9b',
          borderRadius: 8,
          padding: '6px 8px',
          minWidth: 140,
          boxShadow: '0 10px 20px rgba(0,0,0,.35)',
        }}
      >
        {editing ? (
          <>
            <input
              style={{
                width: '100%',
                background: '#0e1a4f',
                color: '#e6eaff',
                border: '1px solid #22307a',
                borderRadius: 6,
                padding: '6px 8px',
                marginBottom: 6,
              }}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateHotspot(id, { text: val })
                  setEditing(false)
                }
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn ok"
                onClick={() => {
                  updateHotspot(id, { text: val })
                  setEditing(false)
                }}
              >
                Save
              </button>
              <button className="btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{text}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn danger" onClick={() => removeHotspot(id)}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </Html>
  )
}
