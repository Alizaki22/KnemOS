import { useEffect, useState } from 'react'
import { authenticatedFetch } from './store/auth.store'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { MainArea } from './components/layout/MainArea'
import { OnboardingModal } from './components/onboarding/OnboardingModal'
import { useSettingsStore } from './store/settings.store'
import { useSystemStore } from './store/system.store'

import { useWorkspaceStore } from './store/workspace.store'
import { useActivityStore } from './store/activity.store'
import { useStableWebSocket } from './hooks/useStableWebSocket'

const API = 'http://127.0.0.1:8765'

function App() {
  const { applyAccentToDOM } = useSettingsStore()
  const { setRAMStats, setFocusScore } = useSystemStore()

  const { fetchWorkspaces } = useWorkspaceStore()
  const { fetchTimeline, fetchCurrentSession } = useActivityStore()

  // 1. WebSocket singleton connection
  useStableWebSocket()

  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem('knemos-onboarded') === 'true'
  )

  // 1. Apply user accent on load
  useEffect(() => {
    applyAccentToDOM()
  }, [applyAccentToDOM])

  // 2. Load workspaces once
  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  // 4. Start low-frequency polling for non-WS fallbacks
  useEffect(() => {
    let active = true

    const fetchRam = async () => {
      try {
        const res = await authenticatedFetch(`${API}/api/system/ram`)
        const data = await res.json()
        if (active) setRAMStats(data)
      } catch {
        if (active) setRAMStats(null)
      }
    }

    const fetchFocus = async () => {
      try {
        const res = await authenticatedFetch(`${API}/api/system/focus`)
        const data = await res.json()
        if (active) setFocusScore(data)
      } catch {}
    }

    fetchRam()
    fetchFocus()
    fetchTimeline(8)
    fetchCurrentSession()

    // Polling intervals (reduced for Phase 6)
    const idSession = setInterval(() => {
      if (active) fetchCurrentSession()
    }, 60000)
    const idTimeline = setInterval(() => {
      if (active) fetchTimeline(8)
    }, 90000)

    return () => {
      active = false
      clearInterval(idSession)
      clearInterval(idTimeline)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('knemos-onboarded', 'true')
    setOnboardingDone(true)
  }

  return (
    <div className="app-shell">
      {/* Background decorations */}
      <div className="floating-objects">
        <div className="floating-circle" style={{ width: 300, height: 300, left: '10%', top: '20%' }} />
        <div className="floating-circle" style={{ width: 500, height: 500, right: '-10%', bottom: '-10%', animationDelay: '-5s' }} />
        <div className="floating-square" style={{ width: 8, height: 8, left: '50%', top: '80%' }} />
      </div>

      <TitleBar />

      <div className="app-body">
        <Sidebar />
        <MainArea />
      </div>

      {/* One-time onboarding */}
      {!onboardingDone && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </div>
  )
}

export default App
