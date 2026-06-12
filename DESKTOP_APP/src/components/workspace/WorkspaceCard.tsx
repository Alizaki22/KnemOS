import { motion } from 'framer-motion'
import { authenticatedFetch } from '../../store/auth.store'
import { useState } from 'react'
import { UserWorkspace, useWorkspaceStore } from '../../store/workspace.store'
import { WorkspaceItem } from './WorkspaceItem'
import { useSystemStore } from '../../store/system.store'

interface Props {
  workspace: UserWorkspace;
}

export const WorkspaceCard = ({ workspace }: Props) => {
  const [expanded, setExpanded] = useState(false)
  const { focusWorkspaceId, setFocusWorkspace } = useWorkspaceStore()
  const { deepWorkActive } = useSystemStore()

  const isActive = focusWorkspaceId === workspace.id
  
  // In deep work mode, unrelated cards are dimmed out
  const isDimmed = deepWorkActive && !isActive && focusWorkspaceId !== null

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setFocusWorkspace(workspace.id)
    try {
      await authenticatedFetch(`http://127.0.0.1:8765/api/workspace/restore/${workspace.id}`, {
        method: 'POST'
      })
    } catch (err) {
      console.error('Failed to restore workspace', err)
    }
  }

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className={`mb-2 rounded-lg border transition-all duration-300 cursor-pointer overflow-hidden
        ${isActive ? 'bg-mint/10 border-mint/40 shadow-[0_0_15px_rgba(0,200,150,0.15)]' : 'glass-card hover:bg-surface-3'}
        ${isDimmed ? 'opacity-30 grayscale blur-[1px]' : 'opacity-100'}
      `}
    >
      <div className="p-3 flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-mint' : 'text-white'}`}>
            {workspace.name}
          </h3>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
            {workspace.items?.length || 0} items
          </p>
        </div>
        
        <button
          onClick={handleRestore}
          className={`shrink-0 w-7 h-7 rounded flex items-center justify-center transition-colors focus-ring
            ${isActive ? 'bg-mint text-black' : 'bg-surface border border-border text-text-secondary hover:text-white hover:border-mint/50'}
          `}
          title="Restore Workspace"
        >
          {isActive ? '' : ''}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        className="overflow-hidden bg-surface-3/50"
      >
        <div className="p-2 border-t border-border/50">
          {workspace.items?.map((item: any, idx: number) => (
            <WorkspaceItem key={`${item.title}-${idx}`} item={item} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
