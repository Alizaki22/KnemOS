import { create } from 'zustand'
import { authenticatedFetch } from './auth.store'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  mode?: 'query' | 'rag'
  context?: {
    screenshots?: string[]
    workspaceNames?: string[]
    mode?: string
    model?: string
  }
}

interface ChatState {
  messages: ChatMessage[]
  isLoadingQuery: boolean
  isLoadingRag: boolean
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  sendMessage: (text: string, mode?: 'query' | 'rag') => Promise<void>
  clearChat: () => void
}

const API = 'http://127.0.0.1:8765'

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoadingQuery: false,
  isLoadingRag: false,

  addMessage: (msg) => {
    const full: ChatMessage = {
      ...msg,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    }
    set((s) => ({ messages: [...s.messages, full] }))
  },

  sendMessage: async (text: string, mode: 'query' | 'rag' = 'query') => {
    const { addMessage } = get()

    addMessage({ role: 'user', content: text, mode })
    
    if (mode === 'rag') set({ isLoadingRag: true })
    else set({ isLoadingQuery: true })

    try {
      const history = get().messages
        .filter((m: ChatMessage) => m.mode === mode)
        .slice(-8)
        .map((m: ChatMessage) => ({ role: m.role, content: m.content }))

      const res = await authenticatedFetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, mode }),
      })

      if (!res.ok) throw new Error('Backend error')
      const data = await res.json()

      addMessage({
        role: 'assistant',
        content: data.reply || 'I could not find an answer.',
        mode,
        context: data.context,
      })
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Could not reach KnemOS AI backend. Make sure the backend is running on port 8765 and Ollama is started.',
        mode,
      })
    } finally {
      if (mode === 'rag') set({ isLoadingRag: false })
      else set({ isLoadingQuery: false })
    }
  },

  clearChat: () => set({ messages: [] }),
}))
