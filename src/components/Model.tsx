// Model.tsx
import { useEffect, useMemo, useState } from 'react'
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

  // Put the GLTF under a group we can position/scale
  const group = useMemo(() => {
    const g = new THREE.Group()
    g.add(gltf.scene)
    return g
  }, [gltf])

  // Debug box helper (shows a wireframe around the model)
  const [boxHelper, setBoxHelper] = useState<THREE.Box3Helper | null>(null)

  useEffect(() => {
    // Compute initial bounds
    const box = new THREE.Box3().setFromObject(group)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    if (!sphere) return

    // Center at origin
    group.position.sub(sphere.center)

    // Normalize scale so giant/tiny models fit consistently
    const targetRadius = 3 // world units
    const r = Math.max(sphere.radius, 1e-6)
    const scale = targetRadius / r
    group.scale.setScalar(scale)

    // Drop the model so it rests on the grid (y = 0)
    const box2 = new THREE.Box3().setFromObject(group)
    const dy = box2.min.y
    if (Number.isFinite(dy)) group.position.y -= dy

    // Camera framing
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 50
    const dist = targetRadius / Math.tan((fov * Math.PI) / 360)
    camera.position.set(0, targetRadius * 0.6, dist * 1.35)

    // Ensure far plane isn’t clipping
    const persp = camera as THREE.PerspectiveCamera
    const neededFar = dist * 3
    if (persp.far < neededFar) {
      persp.far = neededFar
      persp.updateProjectionMatrix()
    }

    // Controls target
    controls?.target.set(0, 0, 0)
    controls?.update()

    // Build a fresh helper so you can SEE where the model is
    const helper = new THREE.Box3Helper(box2, new THREE.Color('#ff6b6b'))
    setBoxHelper(helper)

    // Log bounds for sanity
    // console.log('model radius:', targetRadius, 'raw radius:', r)

    return () => {
      setBoxHelper(null)
      helper.geometry.dispose()
      ;(helper.material as THREE.Material).dispose?.()
    }
  }, [group, camera, controls])

  // Make meshes double-sided & visible (guard against invisible materials)
  useEffect(() => {
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        const ensureVisible = (m: THREE.Material) => {
          // If material is fully transparent/alpha ~ 0, make it visible
          type MaterialWithOpacity = THREE.Material & { transparent?: boolean; opacity?: number }
          const matWithOpacity = m as MaterialWithOpacity
          if (matWithOpacity.transparent && typeof matWithOpacity.opacity === 'number' && matWithOpacity.opacity < 0.05) {
            matWithOpacity.opacity = 1
            matWithOpacity.transparent = false
          }
          // Always render both sides to avoid culling surprises
          m.side = THREE.DoubleSide
        }

        if (Array.isArray(mat)) {
          mat.forEach(ensureVisible)
        } else if (mat) {
          ensureVisible(mat)
        } else {
          // Some GLBs can have no material; give them something visible
          mesh.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
        }
      }
    })
  }, [group])

  // Hide helper/wireframe geometry that often ships in GLBs
useEffect(() => {
  const nameLooksLikeHelper = (name?: string) =>
    !!name && /collider|helper|bound|bbox|box|wire|outline/i.test(name)

  group.traverse((obj) => {
    const object3d = obj as THREE.Object3D & { isLineSegments?: boolean; isLine?: boolean; isPoints?: boolean }

    // 1) Hide line-like nodes (common for outlines/collision boxes)
    if (object3d.isLineSegments || object3d.isLine || object3d.isPoints) {
      obj.visible = false
      return
    }

    // 2) If it's a mesh, turn off wireframe materials and optionally hide helpers by name
    if ((obj as THREE.Mesh).isMesh) {
      if (nameLooksLikeHelper(obj.name)) {
        obj.visible = false
        return
      }

      const mesh = obj as THREE.Mesh
      const mm = mesh.material as THREE.Material | THREE.Material[] | undefined
      const disableWire = (m: THREE.Material) => {
        if ('wireframe' in m && (m as THREE.Material & { wireframe?: boolean }).wireframe) {
          (m as THREE.Material & { wireframe?: boolean }).wireframe = false
        }
      }
      if (Array.isArray(mm)) mm.forEach(disableWire)
      else if (mm) disableWire(mm)
    }
  })
}, [group])


  return (
    <>
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
      {/* DEBUG: shows a wireframe bounding box. Remove when satisfied. */}
      {boxHelper && <primitive object={boxHelper} />}
    </>
  )
}