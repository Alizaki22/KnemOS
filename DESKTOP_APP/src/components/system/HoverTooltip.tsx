import React, { useState, useRef, useEffect } from 'react'
import { CategoryItem } from '../../store/categories.store'
import { useWorkspaceStore } from '../../store/workspace.store'

interface Props {
  item: CategoryItem
  children: React.ReactNode
}

export const HoverTooltip = ({ item, children }: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const { workspaces } = useWorkspaceStore()
  const workspaceName = item.workspaceId 
    ? workspaces.find(w => w.id === item.workspaceId)?.name 
    : 'Unassigned'

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPos({
          top: rect.bottom + 10,
          left: rect.left,
        })
      }
      setIsHovered(true)
    }, 400) // Delay to avoid jitter
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setIsHovered(false)
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      {children}
      
      {isHovered && (
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 10000,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '16px',
            width: 280,
            boxShadow: 'var(--shadow-lg)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontFamily: 'var(--font)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
            {item.title}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 4, fontSize: 10 }}>
            <span style={{ color: 'var(--ink-4)' }}>Type:</span>
            <span style={{ color: 'var(--ink-2)', textTransform: 'capitalize' }}>{item.categoryType}</span>
            
            {item.path && (
              <>
                <span style={{ color: 'var(--ink-4)' }}>Path:</span>
                <span style={{ color: 'var(--ink-2)', wordBreak: 'break-all' }}>{item.path}</span>
              </>
            )}
            
            {item.url && (
              <>
                <span style={{ color: 'var(--ink-4)' }}>URL:</span>
                <span style={{ color: 'var(--ink-2)', wordBreak: 'break-all' }}>{item.url}</span>
              </>
            )}
            
            <span style={{ color: 'var(--ink-4)' }}>Status:</span>
            <span style={{ color: item.isActive ? 'var(--accent)' : 'var(--ink-3)' }}>
              {item.isActive ? 'Active' : 'Idle'}
            </span>
            
            {item.memoryMb !== undefined && (
              <>
                <span style={{ color: 'var(--ink-4)' }}>Memory:</span>
                <span style={{ color: 'var(--ink-2)' }}>{item.memoryMb} MB</span>
              </>
            )}
            
            <span style={{ color: 'var(--ink-4)' }}>Workspace:</span>
            <span style={{ color: 'var(--ink-2)' }}>{workspaceName}</span>
          </div>
        </div>
      )}
    </div>
  )
}
