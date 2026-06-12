import { useState, useEffect } from 'react'
import { authenticatedFetch } from '../../store/auth.store'
import { useWorkspaceStore } from '../../store/workspace.store'

interface Props {
  onClose: () => void
}

interface Suggestion {
  name: string
  reason: string
}

export const AISuggestionsModal = ({ onClose }: Props) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState<string | null>(null)
  const { createWorkspace } = useWorkspaceStore()

  useEffect(() => {
    authenticatedFetch('http://127.0.0.1:8765/api/workspace/suggest')
      .then(r => r.json())
      .then(data => {
        setSuggestions(data.suggestions || [])
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  const handleSelect = async (name: string) => {
    setIsCreating(name)
    await createWorkspace(name)
    setIsCreating(null)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000
    }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-panel)', width: 400, borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-xl)', border: '2px solid var(--ink)',
          padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            AI Suggested Workspaces
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--ink-4)' }}>×</button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Based on your current open tabs, apps, and recent focus patterns, the AI suggests the following workspaces:
        </div>

        {isLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            Analyzing semantic context...
          </div>
        ) : suggestions.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
            No suggestions available right now.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {suggestions.map((s, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                  cursor: isCreating ? 'wait' : 'pointer', transition: 'all 0.2s',
                  background: 'var(--bg-hover)'
                }}
                onClick={() => !isCreating && handleSelect(s.name)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div>
                  {isCreating === s.name && <span style={{ fontSize: 10, color: 'var(--accent)' }}>Creating...</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
