import { create } from 'zustand'

interface WSState {
  ws: WebSocket | null
  isConnected: boolean
  outbox: any[]
  setWs: (ws: WebSocket | null) => void
  setIsConnected: (connected: boolean) => void
  send: (payload: any) => void
  flushOutbox: () => void
}

export const useWSStore = create<WSState>((set, get) => ({
  ws: null,
  isConnected: false,
  outbox: [],
  
  setWs: (ws) => set({ ws }),
  setIsConnected: (isConnected) => set({ isConnected }),
  
  send: (payload) => {
    const { ws, isConnected, outbox } = get()
    
    if (ws && isConnected && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
    } else {
      // Queue it
      set({ outbox: [...outbox, payload] })
      console.log('[WS] Disconnected. Queued message:', payload)
    }
  },
  
  flushOutbox: () => {
    const { ws, isConnected, outbox } = get()
    if (ws && isConnected && ws.readyState === WebSocket.OPEN && outbox.length > 0) {
      console.log(`[WS] Flushing ${outbox.length} queued messages...`)
      outbox.forEach(payload => {
        ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
      })
      set({ outbox: [] })
    }
  }
}))
