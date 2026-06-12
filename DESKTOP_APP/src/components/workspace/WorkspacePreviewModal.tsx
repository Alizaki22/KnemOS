import { useWorkspaceStore } from '../../store/workspace.store'
import { authenticatedFetch } from '../../store/auth.store'
import { CategoryCard } from '../categories/CategoryCard'
import { CategoryType } from '../../store/categories.store'


interface Props {
  workspaceId: string
  onClose: () => void
}

import { useState, useEffect } from 'react'

export const WorkspacePreviewModal = ({ workspaceId, onClose }: Props) => {
  const { workspaces } = useWorkspaceStore()
  const workspace = workspaces.find((w) => w.id === workspaceId)
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    if (!workspace) return
    setLoadingSummary(true)
    authenticatedFetch('http://127.0.0.1:8765/api/workspace/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_name: workspace.name, items: workspace.items })
    })
    .then(r => r.json())
    .then(data => {
      setSummary(data.summary)
      setLoadingSummary(false)
    })
    .catch(() => setLoadingSummary(false))
  }, [workspace])

  if (!workspace) return null

  // Group items by categoryType
  const groupedItems = workspace.items.reduce((acc, item) => {
    const type = item.categoryType as CategoryType
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type]!.push(item as any)
    return acc
  }, {} as Partial<Record<CategoryType, any[]>>)

  const CATEGORY_ORDER: CategoryType[] = ['browsers', 'apps', 'tabs', 'files', 'processes']

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 900,
          background: 'var(--bg)',
          borderRadius: 'var(--r-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
              Workspace Preview
            </div>
            <div style={{ fontSize: 24, fontWeight: 300, color: 'var(--ink)' }}>
              {workspace.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--ink-4)',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* AI Semantic Summary */}
        <div style={{
          marginBottom: 24, padding: '16px 20px', background: 'var(--accent-light)',
          borderLeft: '3px solid var(--accent)', borderRadius: '0 var(--r-md) var(--r-md) 0'
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            AI Semantic Summary
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            {loadingSummary ? 'Generating intelligence summary...' : (summary || 'Context summary not available.')}
          </div>
        </div>

        <div className="category-grid">
          {CATEGORY_ORDER.map((cat) => {
            const items = groupedItems[cat] || []
            if (items.length === 0) return null
            return (
              <CategoryCard
                key={cat}
                categoryType={cat}
                items={items}
              />
            )
          })}
        </div>
        
        {workspace.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-4)' }}>
            This workspace is empty.
          </div>
        )}
      </div>
    </div>
  )
}
