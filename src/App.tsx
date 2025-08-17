import React, { useCallback, useRef } from 'react'
import './styles.css'
import Toolbar from './components/Toolbar'
import Scene from './components/Scene'
import type { SceneHandle } from './components/Scene'
import { useEditor } from './store'

export default function App() {
  const { hotspots, updateHotspot, removeHotspot, clearHotspots, setModelUrl, setGridVisible, gridVisible } = useEditor()
  const sceneRef = useRef<SceneHandle>(null)

  // Export/import hotspots JSON
  const exportHotspots = useCallback(() => {
    const blob = new Blob([JSON.stringify({ hotspots }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'hotspots.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }, [hotspots])

  const importHotspots = useCallback((file: File) => {
    const r = new FileReader()
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result))
        if (Array.isArray(parsed.hotspots)) {
          const hs = parsed.hotspots
            .filter((h: any) => Array.isArray(h.position) && typeof h.text === 'string' && h.position.length === 3)
            .map((h: any) => ({ ...h, id: String(h.id || crypto.randomUUID()) }))
          ;(useEditor as any).setState({ hotspots: hs })
        }
      } catch {
        alert('Invalid hotspots file')
      }
    }
    r.readAsText(file)
  }, [])

  const clearModel = useCallback(() => {
    const currentUrl = useEditor.getState().modelUrl
    if (currentUrl) URL.revokeObjectURL(currentUrl)
    setModelUrl(null)
    clearHotspots()
  }, [setModelUrl, clearHotspots])

  const fitCamera = useCallback(() => sceneRef.current?.fit(), [])
  const resetCamera = useCallback(() => sceneRef.current?.reset(), [])

  return (
    <div className="app">
      <Toolbar
        fitCamera={fitCamera}
        resetCamera={resetCamera}
        clearModel={clearModel}
        importHotspots={importHotspots}
        exportHotspots={exportHotspots}
      />

      <div className="canvas-wrap">
        <Scene ref={sceneRef} />
      </div>

      <div className="bottom">
        <div className="panel help">
          <h3>How to use</h3>
          <p>1. Click <span className="kbd">Import .GLB</span> and choose any <b>.glb</b> file.</p>
          <p>2. Rotate/pan with the mouse using the orbit controls.</p>
          <p>3. Hold <span className="kbd">Shift</span> and click on the model to drop a hotspot label.</p>
          <p>4. Click a label’s <b>Edit</b> to rename; use <b>Delete</b> to remove.</p>
          <p>5. Use <b>Export/Import hotspots</b> to save/load your annotations as JSON.</p>
          <hr />
          <div className="row">
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={gridVisible}
                onChange={(e) => setGridVisible(e.target.checked)}
              />
              Show grid
            </label>
          </div>
        </div>

        <div className="panel">
          <h3>Hotspots ({hotspots.length})</h3>
          <div className="list">
            {hotspots.map((h) => (
              <div className="card" key={h.id}>
                <div style={{ fontSize: 12, color: '#7d89ff' }}>ID: {h.id}</div>
                <input
                  value={h.text}
                  onChange={(e) => updateHotspot(h.id, { text: e.target.value })}
                />
                <div className="row" style={{ fontSize: 13, color: '#a6b0ff' }}>
                  Position: [{h.position.map((n) => n.toFixed(3)).join(', ')}]
                </div>
                <div className="row">
                  <button className="btn danger" onClick={() => removeHotspot(h.id)}>Delete</button>
                </div>
              </div>
            ))}
            {hotspots.length === 0 && (
              <div style={{ color: '#a6b0ff' }}>
                No hotspots yet. Hold <span className="kbd">Shift</span> and click on the model.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
