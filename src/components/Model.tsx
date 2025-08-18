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
    controls: s.controls as OrbitControlsImpl | undefined
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

    group.position.sub(sphere.center)

    const fov = (camera as THREE.PerspectiveCamera).fov ?? 50
    const dist = sphere.radius / Math.tan((fov * Math.PI) / 360)
    camera.position.set(0, sphere.radius * 0.6, dist * 1.35)

    controls?.target.set(0, 0, 0)
    controls?.update()
  }, [group, camera, controls])

  // Ensure visibility and raycastability
  useEffect(() => {
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        const setSide = (m: THREE.Material) => {
          m.side = THREE.DoubleSide
        }

        const mat = mesh.material
        if (Array.isArray(mat)) {
          mat.forEach(setSide)
        } else {
          setSide(mat as THREE.Material)
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
