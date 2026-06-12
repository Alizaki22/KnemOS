import { useDraggable } from '@dnd-kit/core'
import { CategoryItem, CategoryType, CATEGORY_META } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'
import { HoverTooltip } from '../system/HoverTooltip'

interface Props {
  categoryType: CategoryType
  items: CategoryItem[]
}

// Items threshold: compact = <=7, expanded = >7
const COMPACT_THRESHOLD = 7

// Symbol map for items
const SOURCE_SYMBOL: Record<string, string> = {
  browser_tab: '○',
  window: '+',
  file: '—',
  process: '×',
  chrome: 'C',
  firefox: 'F',
  edge: 'E',
  brave: 'B',
  safari: 'S',
  opera: 'O',
}

const getBrowserSymbol = (title: string, path: string = '') => {
  const t = (title + path).toLowerCase()
  if (t.includes('chrome')) return SOURCE_SYMBOL.chrome
  if (t.includes('firefox')) return SOURCE_SYMBOL.firefox
  if (t.includes('edge')) return SOURCE_SYMBOL.edge
  if (t.includes('brave')) return SOURCE_SYMBOL.brave
  if (t.includes('safari')) return SOURCE_SYMBOL.safari
  if (t.includes('opera')) return SOURCE_SYMBOL.opera
  return SOURCE_SYMBOL.window
}

const DraggableCompactItem = ({ item }: { item: CategoryItem }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item }
  })
  
  return (
    <HoverTooltip item={item}>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`compact-icon-item ${isDragging ? 'opacity-50' : ''}`}
        title={item.title}
        style={{ touchAction: 'none' }}
      >
        <div className="compact-icon-bubble">
          {item.source === 'browser_tab' && item.url ? (
            <img 
              src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}`} 
              alt=""
              style={{ width: 16, height: 16, opacity: 0.8 }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : item.categoryType === 'browsers' ? (
            getBrowserSymbol(item.title, item.path || '')
          ) : (
            SOURCE_SYMBOL[item.source] || '+'
          )}
        </div>
        <span className="compact-icon-label">
          {item.title.length > 10 ? item.title.slice(0, 9) + '...' : item.title}
        </span>
      </div>
    </HoverTooltip>
  )
}

const DraggableExpandedItem = ({ item }: { item: CategoryItem }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item }
  })
  
  return (
    <HoverTooltip item={item}>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`expanded-item-row ${isDragging ? 'opacity-50' : ''}`}
        title={item.title}
        style={{ touchAction: 'none' }}
      >
        <span className="expanded-item-symbol">
          {item.source === 'browser_tab' && item.url ? (
            <img 
              src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}`} 
              alt=""
              style={{ width: 12, height: 12, opacity: 0.8 }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : item.categoryType === 'browsers' ? (
            getBrowserSymbol(item.title, item.path || '')
          ) : (
            SOURCE_SYMBOL[item.source] || '+'
          )}
        </span>
        <span className="expanded-item-title">{item.title}</span>
        {item.isActive && (
          <span className="expanded-item-meta" style={{ color: 'var(--accent)', fontSize: 9 }}>
            live
          </span>
        )}
      </div>
    </HoverTooltip>
  )
}

// Compact card (<=7 items) — iOS small folder style
const CompactCard = ({ categoryType, items }: Props) => {
  const { setActiveCategoryModal } = useUIStore()
  const meta = CATEGORY_META[categoryType]
  const displayItems = items.slice(0, 9)

  return (
    <div className="category-card compact-card">
      <div className="category-card-header" onClick={() => setActiveCategoryModal(categoryType)}>
        <div className="category-card-title-row">
          <span className="category-card-symbol">{meta.symbol}</span>
          <span className="category-card-title">{meta.label}</span>
        </div>
        <span className="category-card-count">{items.length}</span>
      </div>

      <div className="category-card-body">
        {items.length === 0 ? (
          <div style={{ padding: '12px 10px 14px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 11 }}>
            Empty
          </div>
        ) : (
          <div className="compact-icon-grid">
            {displayItems.map((item) => (
              <DraggableCompactItem key={item.id} item={item} />
            ))}
            {items.length > 9 && (
              <div
                className="compact-icon-item"
                onClick={() => setActiveCategoryModal(categoryType)}
                style={{ cursor: 'pointer' }}
              >
                <div className="compact-icon-bubble" style={{ fontSize: 12, fontWeight: 400 }}>
                  +{items.length - 9}
                </div>
                <span className="compact-icon-label">more</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Expanded card (>7 items) — iOS large folder / dense list
const ExpandedCard = ({ categoryType, items }: Props) => {
  const { setActiveCategoryModal } = useUIStore()
  const meta = CATEGORY_META[categoryType]
  const displayItems = items.slice(0, 12)

  return (
    <div className="category-card expanded-card">
      <div className="category-card-header" onClick={() => setActiveCategoryModal(categoryType)}>
        <div className="category-card-title-row">
          <span className="category-card-symbol">{meta.symbol}</span>
          <span className="category-card-title">{meta.label}</span>
        </div>
        <span className="category-card-count">{items.length}</span>
      </div>

      <div className="category-card-body">
        <div className="expanded-item-list">
          {items.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 11 }}>
              Empty
            </div>
          ) : (
            displayItems.map((item) => (
              <DraggableExpandedItem key={item.id} item={item} />
            ))
          )}
        </div>
        {items.length > 12 && (
          <div className="card-show-more" onClick={() => setActiveCategoryModal(categoryType)}>
            + {items.length - 12} more items
          </div>
        )}
      </div>
    </div>
  )
}

// Unified export: picks compact vs expanded automatically
export const CategoryCard = (props: Props) => {
  if (props.items.length <= COMPACT_THRESHOLD) {
    return <CompactCard {...props} />
  }
  return <ExpandedCard {...props} />
}
