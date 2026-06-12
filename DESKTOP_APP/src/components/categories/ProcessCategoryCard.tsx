import { CategoryItem, CATEGORY_META } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'
import { HoverTooltip } from '../system/HoverTooltip'

interface Props {
  items: CategoryItem[]
  onDragStart: (item: CategoryItem) => void
}

export const ProcessCategoryCard = ({ items, onDragStart }: Props) => {
  const { setActiveCategoryModal } = useUIStore()
  const meta = CATEGORY_META['processes']

  return (
    <div className="category-card" style={{ gridColumn: '1 / -1', minHeight: 180 }}>
      {/* Header */}
      <div
        className="category-card-header"
        onClick={() => setActiveCategoryModal('processes')}
      >
        <div className="category-card-title-row">
          <span className="category-card-symbol">{meta.symbol}</span>
          <span className="category-card-title">{meta.label}</span>
        </div>
        <span className="category-card-count">{items.length}</span>
      </div>

      {/* Body: Dense Table Layout */}
      <div className="category-card-body" style={{ padding: '0 16px 16px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-4)', fontSize: 11, padding: 20 }}>
            No background processes detected
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {items.map((item) => (
              <HoverTooltip key={item.id} item={item}>
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id)
                    onDragStart(item)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'var(--bg-hover)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    fontSize: 10,
                    cursor: 'grab',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                    <span style={{ color: 'var(--ink-4)' }}>×</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink-2)' }}>
                      {item.title}
                    </span>
                  </div>
                  <div style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                    {item.memoryMb}M
                  </div>
                </div>
              </HoverTooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
