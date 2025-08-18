import { useState } from 'react'
import { Html } from '@react-three/drei'
import type { Hotspot } from '../store'
import { useEditor } from '../store'
import type { ChangeEvent, KeyboardEvent } from 'react'  // 👈 add

export default function HotspotLabel({ id, position, text }: Hotspot) {
  const { updateHotspot, removeHotspot } = useEditor()
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(text)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateHotspot(id, { text: val })
      setEditing(false)
    }
  }

  return (
    <Html position={position} center distanceFactor={6} transform style={{ pointerEvents: 'auto' }}>
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
              className="hotspot-input"
              value={val}
              onChange={handleChange}      // ✅ typed
              onKeyDown={handleKeyDown}    // ✅ typed
              placeholder="Enter label"
              title="Hotspot label input"
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
              <button className="btn danger" onClick={() => removeHotspot(id)}>Delete</button>
            </div>
          </>
        )}
      </div>
    </Html>
  )
}
