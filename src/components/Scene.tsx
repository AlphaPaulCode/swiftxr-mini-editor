import { Suspense, useRef, forwardRef, useImperativeHandle } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Html } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { useEditor } from '../store'
import HotspotLabel from './HotspotLabel'
import Model from './Model'
import ErrorBoundary from '../ErrorBoundary'

export type SceneHandle = {
  fit: () => void
  reset: () => void
}

const Scene = forwardRef<SceneHandle>((_props, ref) => {
  // pull actions if they exist; fall back safely
  const { modelUrl, hotspots, gridVisible, setModelUrl } = useEditor()
  const controlsRef = useRef<OrbitControlsImpl>(null)

  const fit = () => {
    const c = controlsRef.current
    if (!c) return
    c.target.set(0, 0, 0)
    c.object.position.set(0, 2, 6)
    c.update()
  }

  const reset = () => {
    controlsRef.current?.reset()
  }

  useImperativeHandle(ref, () => ({ fit, reset }), [])

  // When dismissing the error, also clear the invalid model so it doesn't re-throw
  const handleDismissError = () => {
    if (typeof setModelUrl === 'function') {
      setModelUrl(undefined as unknown as string) // TS-safe: store likely accepts string | undefined
    }
  }

  return (
   <Canvas
  shadows
  camera={{ position: [0, 2, 6], fov: 50, near: 0.01, far: 20000 }}
  dpr={[1, 2]}
>
      {/* Solid background; no remote HDRI */}
      <color attach="background" args={['#0B1020']} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      {gridVisible && <Grid infiniteGrid sectionColor="#24328a" cellColor="#1a2558" />}

      {/* Model is mounted exactly once, behind an error boundary. 
          The boundary resets when modelUrl changes and clears bad files on Dismiss. */}
      <ErrorBoundary watch={modelUrl} onDismiss={handleDismissError}>
        <Suspense fallback={<Html center>Loading model…</Html>}>
          {modelUrl && <Model url={modelUrl} />}
        </Suspense>
      </ErrorBoundary>

      {hotspots.map((h) => (
        <HotspotLabel key={h.id} {...h} />
      ))}

      <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ff6b6b', '#23c55e', '#7c9aff']} labelColor="white" />
      </GizmoHelper>
    </Canvas>
  )
})

export default Scene
