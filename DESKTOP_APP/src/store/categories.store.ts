import { create } from 'zustand'

// Only system-detected category types (workspaces are separate)
export type CategoryType = 'browsers' | 'apps' | 'tabs' | 'files' | 'processes'

export const CATEGORY_META: Record<CategoryType, { label: string; symbol: string; description: string }> = {
  browsers:  { label: 'Browsers',  symbol: '○', description: 'Browser windows' },
  apps:      { label: 'Apps',      symbol: '+', description: 'Open applications' },
  tabs:      { label: 'Tabs',      symbol: '—', description: 'Browser tabs' },
  files:     { label: 'Files',     symbol: '□', description: 'Open files' },
  processes: { label: 'Processes', symbol: '×', description: 'Background processes' },
}

export interface CategoryItem {
  id: string
  title: string
  source: 'browser_tab' | 'window' | 'file' | 'process'
  url?: string
  path?: string
  categoryType: CategoryType
  workspaceId?: string
  lastActive?: number
  isActive?: boolean
  memoryMb?: number
}

// An item detected by the backend but not yet confirmed by the user
export interface PendingItem extends CategoryItem {
  detectedAt: number
  reason: string  // e.g., "new tab", "new window"
}

interface PendingMove {
  itemId: string
  fromCategory: CategoryType
  toCategory: CategoryType
  originalItem: CategoryItem
}

interface CategoriesState {
  categories: Record<CategoryType, CategoryItem[]>
  pendingMoves: PendingMove[]
  pendingNewItems: PendingItem[]
  manualOverrides: Record<string, CategoryType>
  lastSnapshotTime: number

  setCategories: (cats: Record<CategoryType, CategoryItem[]>) => void
  applyCategoriesFromBackend: (data: Record<string, any[]>) => void
  addPendingNewItems: (items: PendingItem[]) => void
  confirmNewItems: () => void
  discardNewItems: () => void
  hasPendingNewItems: () => boolean
  stageMoveItem: (itemId: string, from: CategoryType, to: CategoryType) => void
  confirmPendingMoves: () => void
  discardPendingMoves: () => void
  hasPendingChanges: () => boolean
}



const emptyCategories = (): Record<CategoryType, CategoryItem[]> => ({
  browsers: [], apps: [], tabs: [], files: [], processes: []
})

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: emptyCategories(),
  pendingMoves: [],
  pendingNewItems: [],
  manualOverrides: {},
  lastSnapshotTime: 0,

  setCategories: (cats) => set({ categories: cats }),

  applyCategoriesFromBackend: (data) => {
    const { manualOverrides } = get()
    const cats = emptyCategories()
    
    // Process each category type from backend
    const allTypes: CategoryType[] = ['browsers', 'apps', 'tabs', 'files', 'processes']
    
    allTypes.forEach((type) => {
      const items: any[] = data[type] || []
      items.forEach((item: any, i: number) => {
        const id = item.id || `${type}-${i}-${item.title}`
        const overrideCategory = manualOverrides[id]
        const finalCategory = overrideCategory || type

        const catItem: CategoryItem = {
          id,
          title: item.title || 'Unknown',
          source: item.source || 'window',
          url: item.url,
          path: item.path,
          categoryType: finalCategory,
          workspaceId: item.workspaceId,
          isActive: item.isActive !== undefined ? item.isActive : true,
          memoryMb: item.memoryMb || item.memory_mb,
        }
        if (finalCategory in cats) {
          cats[finalCategory].push(catItem)
        }
      })
    })
    
    set({ categories: cats, lastSnapshotTime: Date.now() })
  },

  addPendingNewItems: (items) => {
    set((state) => ({
      pendingNewItems: [...state.pendingNewItems, ...items]
    }))
  },

  confirmNewItems: () => {
    const { pendingNewItems } = get()
    set((state) => {
      const newCats = { ...state.categories }
      pendingNewItems.forEach((item) => {
        const type = item.categoryType
        if (type in newCats && !newCats[type].find(existing => existing.id === item.id)) {
          newCats[type] = [...newCats[type], item]
        }
      })
      return { categories: newCats, pendingNewItems: [] }
    })
  },

  discardNewItems: () => {
    set({ pendingNewItems: [] })
  },

  hasPendingNewItems: () => get().pendingNewItems.length > 0,

  stageMoveItem: (itemId, from, to) => {
    set((state) => {
      const cats = { ...state.categories }
      const fromArr = [...(cats[from] || [])]
      const toArr = [...(cats[to] || [])]
      const idx = fromArr.findIndex(i => i.id === itemId)
      if (idx === -1) return {}
      const [moved] = fromArr.splice(idx, 1)
      const originalItem = { ...moved }
      moved.categoryType = to
      toArr.push(moved)
      cats[from] = fromArr
      cats[to] = toArr

      const existing = state.pendingMoves.filter(m => m.itemId !== itemId)
      const newMoves = [...existing, { itemId, fromCategory: from, toCategory: to, originalItem }]
      return { categories: cats, pendingMoves: newMoves }
    })
  },

  confirmPendingMoves: () => {
    const { pendingMoves, manualOverrides } = get()
    const newOverrides = { ...manualOverrides }
    pendingMoves.forEach(m => { newOverrides[m.itemId] = m.toCategory })
    set({ pendingMoves: [], manualOverrides: newOverrides })
    fetch('http://127.0.0.1:8765/api/workspace/organize', { method: 'POST' }).catch(() => {})
  },

  discardPendingMoves: () => {
    const { pendingMoves } = get()
    set((state) => {
      const cats = { ...state.categories }
      // Reverse all moves
      ;[...pendingMoves].reverse().forEach((move) => {
        const toArr = [...(cats[move.toCategory] || [])]
        const fromArr = [...(cats[move.fromCategory] || [])]
        const idx = toArr.findIndex(i => i.id === move.itemId)
        if (idx !== -1) {
          toArr.splice(idx, 1)
          fromArr.push(move.originalItem)
          cats[move.toCategory] = toArr
          cats[move.fromCategory] = fromArr
        }
      })
      return { categories: cats, pendingMoves: [] }
    })
  },

  hasPendingChanges: () => get().pendingMoves.length > 0,
}))
