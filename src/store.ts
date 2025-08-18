import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'

export type Vec3 = [number, number, number]

export type Hotspot = {
  id: string
  position: Vec3
  text: string
}

type State = {
  modelUrl: string | null
  hotspots: Hotspot[]
  gridVisible: boolean

  // actions
  setModelUrl: (url: string | null | undefined) => void
  clearModel: () => void

  addHotspot: (position: Vec3, text?: string) => void
  setHotspots: (hotspots: Hotspot[]) => void
  updateHotspot: (id: string, data: Partial<Hotspot>) => void
  removeHotspot: (id: string) => void
  clearHotspots: () => void

  setGridVisible: (v: boolean) => void
}

export const useEditor = create<State>((set, get) => ({
  modelUrl: null,
  hotspots: [],
  gridVisible: true,

  setModelUrl: (url) => set({ modelUrl: url ?? null }),

  clearModel: () => {
    const current = get().modelUrl
    if (current) {
      try {
        URL.revokeObjectURL(current)
      } catch {
        // ignore revoke errors (e.g., non-blob URLs)
      }
    }
    set({ modelUrl: null, hotspots: [] })
  },

  addHotspot: (position, text = 'New label') =>
    set((s) => ({
      hotspots: [...s.hotspots, { id: nanoid(), position, text }],
    })),

  setHotspots: (hotspots) => set({ hotspots }),

  updateHotspot: (id, data) =>
    set((s) => ({
      hotspots: s.hotspots.map((h) => (h.id === id ? { ...h, ...data } : h)),
    })),

  removeHotspot: (id) =>
    set((s) => ({ hotspots: s.hotspots.filter((h) => h.id !== id) })),

  clearHotspots: () => set({ hotspots: [] }),

  setGridVisible: (v) => set({ gridVisible: v }),
}))
