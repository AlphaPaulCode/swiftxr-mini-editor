import React, { useRef } from 'react'
import { useEditor } from '../store'

type Props = {
  fitCamera: () => void
  resetCamera: () => void
  clearModel: () => void
  importHotspots: (file: File) => void
  exportHotspots: () => void
}

export default function Toolbar(props: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const jsonRef = useRef<HTMLInputElement>(null)
  const { setModelUrl } = useEditor()

  return (
    <div className="toolbar">
      <div className="file btn">
        Import .GLB
        <input
          ref={fileRef}
          type="file"
          accept=".glb,.GLB,model/gltf-binary"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            // Revoke previous blob to avoid leaks
            const prev = useEditor.getState().modelUrl
            if (prev) URL.revokeObjectURL(prev)
            const url = URL.createObjectURL(f)
            setModelUrl(url)
            // Allow re-selecting the same file later
            e.currentTarget.value = ''
          }}
        />
      </div>

      <button className="btn" onClick={props.fitCamera}>Fit model</button>
      <button className="btn" onClick={props.resetCamera}>Reset view</button>

      <div className="spacer" />

      <button className="btn" onClick={props.exportHotspots}>Export hotspots</button>

      <div className="file btn">
        Import hotspots
        <input
          ref={jsonRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) props.importHotspots(f)
            e.currentTarget.value = ''
          }}
        />
      </div>

      <button className="btn danger" onClick={props.clearModel}>Clear model</button>
    </div>
  )
}
