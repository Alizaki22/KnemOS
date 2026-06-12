import { create } from 'zustand'

export interface ActivityEvent {
  timestamp: number
  event_type: string
  title: string
  metadata: Record<string, any>
}

export interface Session {
  id: string
  start_time: number
  duration_minutes?: number
  dominant_apps: string[]
  app_count: number
  tab_count: number
  focus_score: number
  focus_grade: string
  interruptions: number
  status?: string
}

interface ActivityState {
  timeline: ActivityEvent[]
  currentSession: Session | null
  sessions: Session[]
  isLoading: boolean

  fetchTimeline: (hours?: number) => Promise<void>
  fetchCurrentSession: () => Promise<void>
  fetchSessions: () => Promise<void>
  logEvent: (type: string, title: string, metadata?: Record<string, any>) => void
}

const API = 'http://127.0.0.1:8765'

export const useActivityStore = create<ActivityState>((set) => ({
  timeline: [],
  currentSession: null,
  sessions: [],
  isLoading: false,

  fetchTimeline: async (hours = 24) => {
    try {
      const res = await fetch(`${API}/api/activity/timeline?hours=${hours}&limit=100`)
      if (!res.ok) return
      const data = await res.json()
      set({ timeline: data.events || [] })
    } catch {}
  },

  fetchCurrentSession: async () => {
    try {
      const res = await fetch(`${API}/api/sessions/current`)
      if (!res.ok) return
      const data = await res.json()
      set({ currentSession: data })
    } catch {}
  },

  fetchSessions: async () => {
    try {
      const res = await fetch(`${API}/api/sessions/list`)
      if (!res.ok) return
      const data = await res.json()
      set({ sessions: data.sessions || [] })
    } catch {}
  },

  logEvent: (type, title, metadata = {}) => {
    fetch(`${API}/api/activity/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: type, title, metadata })
    }).catch(() => {})
  },
}))
