import { useState } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import toast from 'react-hot-toast'
import { CategoryCard } from './CategoryCard'
import { ProcessCategoryCard } from './ProcessCategoryCard'
import { useCategoriesStore, CategoryType, CategoryItem } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'
import { useWorkspaceStore } from '../../store/workspace.store'
import { CategoryDetailModal } from './CategoryDetailModal'
import { WorkspacesSection } from '../workspace/WorkspacesSection'
import { PendingNewItemsOverlay } from '../dnd/PendingNewItemsOverlay'

const CATEGORY_ORDER: CategoryType[] = ['browsers', 'apps', 'tabs', 'files', 'processes']

export const CategoryGrid = () => {
  const { categories } = useCategoriesStore()
  const { activeCategoryModal } = useUIStore()
  const { addItemToWorkspace } = useWorkspaceStore()

  const [dragItem, setDragItem] = useState<CategoryItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStartEvent = (event: any) => {
    const { active } = event
    if (active.data.current?.item) {
      setDragItem(active.data.current.item)
    }
  }

  const handleDragEndEvent = async (event: any) => {
    const { over, active } = event
    if (over && dragItem) {
      const targetWsId = over.id as string
      const sourceWsId = active.data.current?.sourceWorkspaceId

      // Move item
      addItemToWorkspace(targetWsId, {
        id: dragItem.id,
        title: dragItem.title,
        source: dragItem.source,
        url: dragItem.url,
        path: dragItem.path,
        categoryType: dragItem.categoryType,
        memoryMb: dragItem.memoryMb,
        isActive: dragItem.isActive,
      })

      // If it came from another workspace, remove it from the old one
      if (sourceWsId && sourceWsId !== targetWsId) {
        useWorkspaceStore.getState().removeItemFromWorkspace(sourceWsId, dragItem.id)
      }
      
      toast.success(`Moved to workspace`, { position: 'bottom-right' })
    }
    setDragItem(null)
  }


  const totalItems = CATEGORY_ORDER.reduce((s, type) => s + (categories[type]?.length || 0), 0)

  if (totalItems === 0) {
    return (
      <DndContext sensors={sensors} onDragStart={handleDragStartEvent} onDragEnd={handleDragEndEvent}>
        <div>
          <div className="empty-state fade-in-section visible">
            <div className="empty-state-symbol">□</div>
            <div className="empty-state-title">No active items detected</div>
            <div className="empty-state-desc">
              Click "Auto Organize" to scan your open windows and tabs, or wait for the backend to detect activity.
            </div>
          </div>
          <WorkspacesSection onDragItem={dragItem} />
          <PendingNewItemsOverlay />
        </div>
      </DndContext>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStartEvent} onDragEnd={handleDragEndEvent}>
      <>
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ fontSize: 28, letterSpacing: -1 }}>Workspace</div>
          <div className="section-line" />
          <div className="section-subtitle">+ Organization</div>
        </div>

        {/* Category cards */}
        <div className="category-grid">
          {CATEGORY_ORDER.filter(c => c !== 'processes').map((cat) => (
            <CategoryCard
              key={cat}
              categoryType={cat}
              items={categories[cat] || []}
            />
          ))}
          
          {/* Full-width Process Card */}
          <ProcessCategoryCard 
            items={categories['processes'] || []} 
          />
        </div>

        {/* Workspace section — separated below categories */}
        <WorkspacesSection onDragItem={dragItem} />

        {/* Category detail modal */}
        {activeCategoryModal && (
          <CategoryDetailModal categoryType={activeCategoryModal as CategoryType} />
        )}

        {/* Detected new items overlay */}
        <PendingNewItemsOverlay />
        
        <DragOverlay dropAnimation={null}>
          {dragItem ? (
            <div style={{ 
              padding: '8px 12px', 
              background: 'var(--ink)', 
              color: 'var(--bg-panel)', 
              borderRadius: 8, 
              fontSize: 12, 
              boxShadow: 'var(--shadow-lg)' 
            }}>
              Dragging: {dragItem.title}
            </div>
          ) : null}
        </DragOverlay>
      </>
    </DndContext>
  )
}
