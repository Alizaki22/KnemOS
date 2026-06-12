import { useEffect, useRef, useState } from 'react'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { MainArea } from './components/layout/MainArea'
import { OnboardingModal } from './components/onboarding/OnboardingModal'
import { useSettingsStore } from './store/settings.store'
import { useSystemStore } from './store/system.store'
import { useCategoriesStore } from './store/categories.store'
import { useWorkspaceStore } from './store/workspace.store'
import { useActivityStore } from './store/activity.store'
import { useUIStore } from './store/ui.store'

const API = 'http://127.0.0.1:8765'

function App() {
  const { applyAccentToDOM } = useSettingsStore()
  const { setRAMStats, setFocusScore } = useSystemStore()
  const { applyCategoriesFromBackend } = useCategoriesStore()
  const { fetchWorkspaces } = useWorkspaceStore()
  const { fetchTimeline, fetchCurrentSession } = useActivityStore()
  const { setPendingNewItems } = useUIStore()

  const wsRef = useRef<WebSocket | null>(null)
  const prevCategorySnapshot = useRef<string>('')
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

  // 3. Connect WebSocket for real-time updates
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>

    const connect = () => {
      try {
        const ws = new WebSocket('ws://127.0.0.1:8765/ws')
        wsRef.current = ws

        ws.onopen = () => {
          console.log('[WS] Connected to KnemOS backend')
          // Start keep-alive pings
          const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send('ping')
            }
          }, 20000)
          ws.onclose = () => {
            clearInterval(pingInterval)
            // Reconnect after 5s
            reconnectTimer = setTimeout(connect, 5000)
          }
        }

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            handleWebSocketMessage(msg)
          } catch {}
        }

        ws.onerror = () => {
          ws.close()
        }
      } catch {
        reconnectTimer = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
  }, [])

  const handleWebSocketMessage = (msg: any) => {
    switch (msg.type) {
      case 'ram_update':
        setRAMStats(msg.stats)
        break
      case 'focus_score_update':
        setFocusScore(msg.score)
        break
      case 'workspace_update':
        // Backend pushed new clustering — check if categories actually changed
        fetchCategoriesWithDiffCheck()
        break
      case 'capture_complete':
        // Screenshot taken — could refresh activity
        break
    }
  }

  const fetchCategoriesWithDiffCheck = async () => {
    try {
      const res = await fetch(`${API}/api/workspace/categories`)
      if (!res.ok) return
      const data = await res.json()
      const newSnapshot = JSON.stringify(data.categories)

      if (prevCategorySnapshot.current && prevCategorySnapshot.current !== newSnapshot) {
        // Something changed — compute the delta and show pending overlay
        const prevCats = JSON.parse(prevCategorySnapshot.current)
        const newCats = data.categories

        const newItems = detectNewItems(prevCats, newCats)
        if (newItems.length > 0) {
          const { addPendingNewItems } = useCategoriesStore.getState()
          addPendingNewItems(newItems.map((item: any) => ({
            ...item,
            detectedAt: Date.now(),
            reason: 'New item detected'
          })))
          setPendingNewItems(true, newItems.length)
          return
        }
      }

      // No overlay needed, apply directly
      prevCategorySnapshot.current = newSnapshot
      applyCategoriesFromBackend(data.categories)
    } catch {}
  }

  const detectNewItems = (prev: any, next: any): any[] => {
    const newItems: any[] = []
    const types = ['browsers', 'apps', 'tabs', 'files', 'processes']
    types.forEach((type) => {
      const prevTitles = new Set((prev[type] || []).map((i: any) => i.title))
      const nextItems: any[] = next[type] || []
      nextItems.forEach((item) => {
        if (!prevTitles.has(item.title)) {
          newItems.push({ ...item, categoryType: type })
        }
      })
    })
    return newItems
  }

  // 4. Start polling backend
  useEffect(() => {
    let active = true

    const fetchRam = async () => {
      try {
        const res = await fetch(`${API}/api/system/ram`)
        const data = await res.json()
        if (active) setRAMStats(data)
      } catch {
        if (active) setRAMStats(null)
      }
    }

    const fetchFocus = async () => {
      try {
        const res = await fetch(`${API}/api/system/focus`)
        const data = await res.json()
        if (active) setFocusScore(data)
      } catch {}
    }

    // Initial load
    fetchRam()
    fetchFocus()
    fetchCategoriesWithDiffCheck()
    fetchTimeline(8)
    fetchCurrentSession()

    // Polling intervals
    const idRam = setInterval(fetchRam, 5000)
    const idFocus = setInterval(fetchFocus, 30000)
    const idCategories = setInterval(() => {
      if (active) fetchCategoriesWithDiffCheck()
    }, 15000)
    const idSession = setInterval(() => {
      if (active) fetchCurrentSession()
    }, 60000)
    const idTimeline = setInterval(() => {
      if (active) fetchTimeline(8)
    }, 90000)

    return () => {
      active = false
      clearInterval(idRam)
      clearInterval(idFocus)
      clearInterval(idCategories)
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
