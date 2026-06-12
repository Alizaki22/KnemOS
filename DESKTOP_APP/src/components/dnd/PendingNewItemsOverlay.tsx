import { useCategoriesStore } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'

export const PendingNewItemsOverlay = () => {
  const { pendingNewItems, confirmNewItems, discardNewItems } = useCategoriesStore()
  const { setPendingNewItems } = useUIStore()

  if (pendingNewItems.length === 0) return null

  const handleConfirm = () => {
    confirmNewItems()
    setPendingNewItems(false, 0)
  }

  const handleDiscard = () => {
    discardNewItems()
    setPendingNewItems(false, 0)
  }

  return (
    <div className="pending-overlay" style={{ zIndex: 1001 }}>
      <div className="pending-card" style={{ minWidth: 280 }}>
        <div className="pending-card-title">
          Update detected items?
        </div>
        <div className="pending-card-desc">
          {pendingNewItems.length} new item{pendingNewItems.length > 1 ? 's' : ''} detected:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
          {pendingNewItems.slice(0, 5).map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1, width: 50, flexShrink: 0 }}>
                {item.categoryType}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </span>
            </div>
          ))}
          {pendingNewItems.length > 5 && (
            <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>
              +{pendingNewItems.length - 5} more...
            </div>
          )}
        </div>
        <div className="pending-card-actions">
          <button className="pending-btn-confirm" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="pending-btn-discard" onClick={handleDiscard}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
