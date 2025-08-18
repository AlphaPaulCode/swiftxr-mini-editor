// Model.tsx
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useEditor } from '../store'

export default function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url)
  const { addHotspot } = useEditor()

  const { camera, controls } = useThree((s) => ({
    camera: s.camera,
    controls: s.controls as OrbitControlsImpl | undefined,
  }))

  const group = useMemo(() => {
    const g = new THREE.Group()
    g.add(gltf.scene)
    return g
  }, [gltf])

  useEffect(() => {
    // Compute bounds
    const box = new THREE.Box3().setFromObject(group)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    if (!sphere) return

    // Center at origin
    group.position.sub(sphere.center)

    // Normalize scale so giant/tiny models fit consistently
    const targetRadius = 3 // units
    const r = Math.max(sphere.radius, 1e-6)
    const scale = targetRadius / r
    group.scale.setScalar(scale)

    // Recompute placement after scaling
    const scaledRadius = targetRadius
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 50
    const dist = scaledRadius / Math.tan((fov * Math.PI) / 360)

    // Camera + controls
    camera.position.set(0, scaledRadius * 0.6, dist * 1.35)

    // Ensure far plane isn’t clipping the model
    const neededFar = dist * 3
    const persp = camera as THREE.PerspectiveCamera
    if (persp.far < neededFar) {
      persp.far = neededFar
      persp.updateProjectionMatrix()
    }

    controls?.target.set(0, 0, 0)
    controls?.update()
  }, [group, camera, controls])

  // Make meshes double-sided & shadowed (type-safe)
  useEffect(() => {
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        const setSide = (m: THREE.Material) => {
          m.side = THREE.DoubleSide
        }

        if (Array.isArray(mat)) {
          mat.forEach(setSide)
        } else if (mat) {
          setSide(mat)
        }
      }
    })
  }, [group])

  return (
    <primitive
      object={group}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        if (e.shiftKey) {
          e.stopPropagation()
          const p = e.point
          addHotspot([p.x, p.y, p.z])
        }
      }}
    />
  )
}
