import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useEditor } from '../store'

export default function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url)
  const { addHotspot } = useEditor()
  const { camera, controls } = useThree((s) => ({
    camera: s.camera,
    controls: s.controls as any
  }))

  const group = useMemo(() => {
    const g = new THREE.Group()
    g.add(gltf.scene)
    return g
  }, [gltf])

  // Autocenter & fit camera
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(group)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    if (!sphere) return

    // center at origin
    group.position.sub(sphere.center)

    // position camera
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 50
    const dist = sphere.radius / Math.tan((fov * Math.PI) / 360)
    camera.position.set(0, sphere.radius * 0.6, dist * 1.35)
    ;(controls as any)?.target.set(0, 0, 0)
    ;(controls as any)?.update()
  }, [group, camera, controls])

  // Ensure visibility and raycastability
  useEffect(() => {
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
        // Make single-sided assets visible from both sides
        const setSide = (m: any) => { if (m && 'side' in m) m.side = THREE.DoubleSide }
        const mat = mesh.material as any
        if (Array.isArray(mat)) {
          mat.forEach(setSide)
        } else {
          setSide(mat)
        }
      }
    })
  }, [group])

  return (
    <primitive
      object={group}
      onPointerDown={(e) => {
        if (e.shiftKey) {
          e.stopPropagation()
          const p = e.point
          addHotspot([p.x, p.y, p.z])
        }
      }}
    />
  )
}
