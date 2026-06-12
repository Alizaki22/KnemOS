import { useState, useRef } from 'react'
import { CategoryCard } from './CategoryCard'
import { useCategoriesStore, CategoryType, CategoryItem } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'
import { useWorkspaceStore } from '../../store/workspace.store'
import { CategoryDetailModal } from './CategoryDetailModal'
import { WorkspacesSection } from '../workspace/WorkspacesSection'
import { PendingNewItemsOverlay } from '../dnd/PendingNewItemsOverlay'

const CATEGORY_ORDER: CategoryType[] = ['browsers', 'apps', 'tabs', 'files', 'processes']

export const CategoryGrid = () => {
  const { categories, stageMoveItem } = useCategoriesStore()
  const { setPendingChanges, activeCategoryModal } = useUIStore()
  const { addItemToWorkspace } = useWorkspaceStore()

  const [dragItem, setDragItem] = useState<CategoryItem | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<CategoryType | null>(null)
  const pendingCount = useRef(0)

  const handleDragStart = (item: CategoryItem) => {
    setDragItem(item)
  }

  const handleDragOver = (e: React.DragEvent, to: CategoryType) => {
    e.preventDefault()
    setDragOverCategory(to)
  }

  const handleDragLeave = () => {
    setDragOverCategory(null)
  }

  const handleDrop = (to: CategoryType) => {
    setDragOverCategory(null)
    if (!dragItem) return
    if (dragItem.categoryType === to) {
      setDragItem(null)
      return
    }
    stageMoveItem(dragItem.id, dragItem.categoryType, to)
    pendingCount.current += 1
    setPendingChanges(true, pendingCount.current)
    setDragItem(null)
  }

  const handleDropOnWorkspace = (workspaceId: string) => {
    if (!dragItem) return
    addItemToWorkspace(workspaceId, {
      id: dragItem.id,
      title: dragItem.title,
      source: dragItem.source,
      url: dragItem.url,
      path: dragItem.path,
      categoryType: dragItem.categoryType,
      memoryMb: dragItem.memoryMb,
      isActive: dragItem.isActive,
    })
    setDragItem(null)
  }

  const totalItems = CATEGORY_ORDER.reduce((s, type) => s + (categories[type]?.length || 0), 0)

  if (totalItems === 0) {
    return (
      <div>
        <div className="empty-state fade-in-section visible">
          <div className="empty-state-symbol">□</div>
          <div className="empty-state-title">No active items detected</div>
          <div className="empty-state-desc">
            Click "Auto Organize" to scan your open windows and tabs, or wait for the backend to detect activity.
          </div>
        </div>
        <WorkspacesSection onDragItem={dragItem} onDropOnWorkspace={handleDropOnWorkspace} />
        <PendingNewItemsOverlay />
      </div>
    )
  }

  return (
    <>
      {/* Section Header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ fontSize: 28, letterSpacing: -1 }}>Workspace</div>
        <div className="section-line" />
        <div className="section-subtitle">+ Organization</div>
      </div>

      {/* Category cards */}
      <div className="category-grid">
        {CATEGORY_ORDER.map((cat) => (
          <CategoryCard
            key={cat}
            categoryType={cat}
            items={categories[cat] || []}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            isDragOver={dragOverCategory === cat}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          />
        ))}
      </div>

      {/* Workspace section — separated below categories */}
      <WorkspacesSection onDragItem={dragItem} onDropOnWorkspace={handleDropOnWorkspace} />

      {/* Category detail modal */}
      {activeCategoryModal && (
        <CategoryDetailModal categoryType={activeCategoryModal as CategoryType} />
      )}

      {/* Detected new items overlay */}
      <PendingNewItemsOverlay />
    </>
  )
}
