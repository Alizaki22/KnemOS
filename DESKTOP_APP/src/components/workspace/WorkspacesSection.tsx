import { useState } from 'react'
import { useWorkspaceStore, UserWorkspace, WorkspaceItem } from '../../store/workspace.store'
import { WorkspacePreviewModal } from './WorkspacePreviewModal'
import { AISuggestionsModal } from './AISuggestionsModal'
import { useDroppable } from '@dnd-kit/core'

interface Props {
  onDragItem: WorkspaceItem | null
}

export const WorkspacesSection = ({ onDragItem }: Props) => {
  const { workspaces, createWorkspace, renameWorkspace, deleteWorkspace, focusWorkspaceId } = useWorkspaceStore()
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [dragOverId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewWorkspaceId, setPreviewWorkspaceId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleCreate = async () => {
    const name = newWorkspaceName.trim()
    if (!name) return
    setIsCreating(true)
    await createWorkspace(name)
    setNewWorkspaceName('')
    setIsCreating(false)
  }

  const handleRenameSubmit = (id: string) => {
    if (editingName.trim()) {
      renameWorkspace(id, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div style={{ marginTop: 36, borderTop: '1px solid var(--border)', paddingTop: 28 }}>
      {/* Section header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          ◇ — Workspaces
        </div>
        <div className="section-line" />
        
        <button 
          onClick={() => setShowSuggestions(true)}
          style={{
            padding: '4px 10px', fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
            background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)',
            borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s', marginRight: 12
          }}
        >
          AI Suggestions
        </button>

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'var(--ink-4)', textTransform: 'uppercase' }}>
          {workspaces.length} defined
        </div>
      </div>

      {/* Workspace cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {workspaces.map((ws) => (
          <WorkspaceCard
            key={ws.id}
            workspace={ws}
            isFocused={focusWorkspaceId === ws.id}
            isDragOver={dragOverId === ws.id}
            isDragging={!!onDragItem}
            onEdit={() => {
              setEditingId(ws.id)
              setEditingName(ws.name)
            }}
            onDelete={() => deleteWorkspace(ws.id)}
            isEditing={editingId === ws.id}
            editingName={editingName}
            onEditNameChange={setEditingName}
            onEditSubmit={() => handleRenameSubmit(ws.id)}
            onEditCancel={() => setEditingId(null)}
            onPreview={() => setPreviewWorkspaceId(ws.id)}
          />
        ))}

        {/* Create new workspace card */}
        <div
          style={{
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            minHeight: 100,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 6 }}>
            + New Workspace
          </div>
          <div style={{ display: 'flex', gap: 6, width: '100%' }}>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Workspace name..."
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                fontSize: 11,
                background: 'var(--bg-panel)',
                color: 'var(--ink)',
                outline: 'none',
                fontFamily: 'var(--font)',
              }}
            />
            <button
              onClick={handleCreate}
              disabled={isCreating || !newWorkspaceName.trim()}
              style={{
                padding: '6px 12px',
                background: 'var(--ink)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: (!newWorkspaceName.trim() || isCreating) ? 0.4 : 1,
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {previewWorkspaceId && (
        <WorkspacePreviewModal 
          workspaceId={previewWorkspaceId} 
          onClose={() => setPreviewWorkspaceId(null)} 
        />
      )}

      {showSuggestions && (
        <AISuggestionsModal onClose={() => setShowSuggestions(false)} />
      )}
    </div>
  )
}


interface WorkspaceCardProps {
  workspace: UserWorkspace
  isFocused: boolean
  isDragOver: boolean
  isDragging: boolean
  isEditing: boolean
  editingName: string
  onEdit: () => void
  onDelete: () => void
  onPreview: () => void
  onEditNameChange: (name: string) => void
  onEditSubmit: () => void
  onEditCancel: () => void
}

const WorkspaceCard = ({
  workspace, isFocused, isDragging, isEditing, editingName,
  onEdit, onDelete, onPreview,
  onEditNameChange, onEditSubmit, onEditCancel
}: WorkspaceCardProps) => {
  const itemCount = workspace.items.length
  
  const { isOver, setNodeRef } = useDroppable({
    id: workspace.id,
  })
  const isDragOver = isOver

  return (
    <div
      ref={setNodeRef}
      className={`category-card ${isDragOver ? 'drag-over' : ''}`}
      style={{
        border: isFocused ? '2px solid var(--accent)' : undefined,
        background: isFocused ? 'var(--accent-light)' : undefined,
        cursor: isDragging ? 'copy' : 'default',
        transition: 'all 0.2s var(--ease)',
        minHeight: 100,
      }}
    >
      <div className="category-card-header">
        <div className="category-card-title-row">
          <span className="category-card-symbol" style={{ color: isFocused ? 'var(--accent)' : undefined }}>◇</span>
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              autoFocus
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditSubmit()
                if (e.key === 'Escape') onEditCancel()
              }}
              onBlur={onEditSubmit}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
                color: 'var(--ink)',
                outline: '1px solid var(--accent)',
                borderRadius: 2,
                padding: '0 4px',
                width: 100,
                fontFamily: 'var(--font)',
                textTransform: 'uppercase',
              }}
            />
          ) : (
            <span
              className="category-card-title"
              onDoubleClick={onEdit}
              onClick={onPreview}
              title="Click to preview, double-click to rename"
              style={{ color: isFocused ? 'var(--accent)' : undefined, cursor: 'pointer' }}
            >
              {workspace.name}
            </span>
          )}
          {workspace.isPinned && (
            <span style={{ fontSize: 8, color: 'var(--accent)', fontWeight: 700 }}>PINNED</span>
          )}
        </div>
        <span className="category-card-count">{itemCount}</span>
      </div>

      {/* Item previews */}
      <div style={{ padding: '0 14px 10px', minHeight: 40 }}>
        {itemCount === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', padding: '8px 0' }}>
            {isDragging ? 'Drop here' : 'Empty — drag items here'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {workspace.items.slice(0, 6).map((item) => (
              <span
                key={item.id}
                style={{
                  fontSize: 9,
                  background: 'var(--bg-hover)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  color: 'var(--ink-2)',
                  maxWidth: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  border: '1px solid var(--border)',
                }}
              >
                {item.title}
              </span>
            ))}
            {itemCount > 6 && (
              <span style={{ fontSize: 9, color: 'var(--ink-4)', padding: '2px 0' }}>
                +{itemCount - 6} more
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: 4,
        padding: '8px 14px',
        borderTop: '1px solid var(--border)',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onEdit}
          style={{
            padding: '5px 8px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
            fontSize: 10,
            color: 'var(--ink-3)',
          }}
          title="Rename"
        >
          /
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '5px 8px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
            fontSize: 10,
            color: 'var(--ink-4)',
          }}
          title="Delete"
        >
          x
        </button>
      </div>
    </div>
  )
}
