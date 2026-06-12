import { useUIStore } from '../../store/ui.store'
import { useCategoriesStore } from '../../store/categories.store'
import { CategoryGrid } from '../categories/CategoryGrid'
import { ChatPanel } from '../chat/ChatPanel'
import { AnalyticsPanel } from '../analytics/AnalyticsDashboard'
import { SettingsPanel } from '../settings/SettingsPanel'
import { PendingChangesOverlay } from '../dnd/PendingChangesOverlay'
import { DeepWorkOverlay } from '../system/DeepWorkOverlay'

export const MainArea = () => {
  const { activePanel, pendingChanges, deepWorkActive } = useUIStore()
  const { hasPendingChanges } = useCategoriesStore()

  const renderPanel = () => {
    switch (activePanel) {
      case 'categories': return <CategoryGrid />
      case 'chat':       return <ChatPanel />
      case 'analytics':  return <AnalyticsPanel />
      case 'settings':   return <SettingsPanel />
      default:           return <CategoryGrid />
    }
  }

  return (
    <div className="main-content">
      {/* Main panel content */}
      <div key={activePanel} className="fade-in-section visible" style={{ height: activePanel === 'chat' ? '100%' : 'auto' }}>
        {renderPanel()}
      </div>

      {/* Drag-and-drop pending changes overlay */}
      {(pendingChanges || hasPendingChanges()) && <PendingChangesOverlay />}

      {/* Deep Focus mode overlay */}
      {deepWorkActive && <DeepWorkOverlay />}
    </div>
  )
}
