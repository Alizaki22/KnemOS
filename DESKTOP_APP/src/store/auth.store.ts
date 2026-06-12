import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'

interface AuthState {
  token: string
  fetchToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: '',
  fetchToken: async () => {
    try {
      // In a real app we might handle web vs tauri better,
      // but assuming Tauri desktop for this local auth
      const token: string = await invoke('get_auth_token')
      set({ token })
    } catch (e) {
      console.error('[Auth] Failed to get auth token', e)
    }
  }
}))

// Helper to attach token to fetch requests
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  let { token } = useAuthStore.getState()
  
  if (!token) {
    await useAuthStore.getState().fetchToken()
    token = useAuthStore.getState().token
  }
  
  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(url, { ...options, headers })
}
