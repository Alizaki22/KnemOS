import { create } from 'zustand'


interface AuthState {
  token: string
  fetchToken: () => Promise<void>
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: '',
  fetchToken: async () => {
    try {
      let token = localStorage.getItem('knemos_jwt') || ''
      if (!token) {
        const { invoke } = await import('@tauri-apps/api/core')
        token = await invoke('get_auth_token')
        if (token) {
          localStorage.setItem('knemos_jwt', token)
        }
      }
      set({ token })
    } catch (e) {
      console.error('[Auth] Failed to get auth token', e)
    }
  },
  setToken: (token: string) => {
    localStorage.setItem('knemos_jwt', token)
    set({ token })
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
