import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccentColor = 'mint' | 'red' | 'blue' | 'purple' | 'orange' | 'black' | 'custom'
export type OllamaModel = 'qwen2.5:7b' | 'qwen2.5:3b'

interface AccentDef {
  value: string
  fg: string
  r: number
  g: number
  b: number
}

export const ACCENTS: Record<AccentColor, AccentDef> = {
  black: { value: '#000000', fg: '#FFFFFF', r: 0, g: 0, b: 0 },
  mint: { value: '#00C896', fg: '#FFFFFF', r: 0, g: 200, b: 150 },
  red: { value: '#E53935', fg: '#FFFFFF', r: 229, g: 57, b: 53 },
  blue: { value: '#1E88E5', fg: '#FFFFFF', r: 30, g: 136, b: 229 },
  purple: { value: '#8E24AA', fg: '#FFFFFF', r: 142, g: 36, b: 170 },
  orange: { value: '#FB8C00', fg: '#000000', r: 251, g: 140, b: 0 },
  custom: { value: '#000000', fg: '#FFFFFF', r: 0, g: 0, b: 0 },
}

interface SettingsState {
  accent: AccentColor
  customColorHex: string
  model: OllamaModel
  extensionConnected: boolean
  isInverted: boolean
  deepFocusTimerSeconds: number
  dismissedFeatureReminder: boolean
  setAccent: (a: AccentColor) => void
  setCustomColorHex: (c: string) => void
  setDeepFocusTimerSeconds: (s: number) => void
  setDismissedFeatureReminder: (v: boolean) => void
  setModel: (m: OllamaModel) => void

  setExtensionConnected: (v: boolean) => void
  setInverted: (v: boolean) => void
  applyAccentToDOM: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      accent: 'mint',
      customColorHex: '#00C896',
      model: 'qwen2.5:7b',
      extensionConnected: false,
      isInverted: false,
      deepFocusTimerSeconds: 300,
      dismissedFeatureReminder: false,

      setAccent: (accent) => {
        set({ accent })
        get().applyAccentToDOM()
      },
      setCustomColorHex: (c) => {
        set({ customColorHex: c })
        if (get().accent === 'custom') get().applyAccentToDOM()
      },
      setDeepFocusTimerSeconds: (s) => set({ deepFocusTimerSeconds: s }),
      setDismissedFeatureReminder: (v) => set({ dismissedFeatureReminder: v }),

      setModel: (model) => set({ model }),
      setExtensionConnected: (v) => set({ extensionConnected: v }),
      setInverted: (isInverted) => {
        set({ isInverted })
        get().applyAccentToDOM()
      },

      applyAccentToDOM: () => {
        const { accent, customColorHex, isInverted } = get()
        let def = ACCENTS[accent as keyof typeof ACCENTS]
        if (accent === 'custom') {
          // Parse hex
          const hex = customColorHex.replace('#', '')
          const r = parseInt(hex.substring(0, 2), 16) || 0
          const g = parseInt(hex.substring(2, 4), 16) || 0
          const b = parseInt(hex.substring(4, 6), 16) || 0
          // Simple perceived brightness for foreground
          const brightness = (r * 299 + g * 587 + b * 114) / 1000
          def = { value: customColorHex, fg: brightness > 128 ? '#000000' : '#FFFFFF', r, g, b }
        }
        
        const root = document.documentElement

        // Common accent properties that MUST remain consistent in both modes
        root.style.setProperty('--accent', def.value)
        root.style.setProperty('--accent-contrast', def.fg)
        root.style.setProperty('--accent-fg', def.fg) // Keep for backwards compatibility
        root.style.setProperty('--accent-r', String(def.r))
        root.style.setProperty('--accent-g', String(def.g))
        root.style.setProperty('--accent-b', String(def.b))

        if (isInverted) {
          // Inverted: Background becomes black/dark, ink becomes light
          root.style.setProperty('--bg', '#0A0A0A')
          root.style.setProperty('--bg-panel', '#111111')
          root.style.setProperty('--bg-hover', `rgba(255,255,255,0.05)`)
          root.style.setProperty('--ink', '#FFFFFF')
          root.style.setProperty('--ink-2', 'rgba(255,255,255,0.85)')
          root.style.setProperty('--ink-3', 'rgba(255,255,255,0.6)')
          root.style.setProperty('--ink-4', 'rgba(255,255,255,0.4)')
          root.style.setProperty('--border', 'rgba(255,255,255,0.15)')
          root.style.setProperty('--border-hard', 'rgba(255,255,255,0.3)')
          root.style.setProperty('--accent-light', `rgba(${def.r},${def.g},${def.b},0.15)`)
          root.style.setProperty('--accent-mid', `rgba(${def.r},${def.g},${def.b},0.25)`)
        } else {
          // Default: Minimal White with accent
          root.style.setProperty('--bg', '#F8F7F4')
          root.style.setProperty('--bg-panel', '#FFFFFF')
          root.style.setProperty('--bg-hover', `rgba(${def.r},${def.g},${def.b},0.03)`)
          root.style.setProperty('--ink', '#000000')
          root.style.setProperty('--ink-2', '#3A3A3A')
          root.style.setProperty('--ink-3', '#7A7A7A')
          root.style.setProperty('--ink-4', `rgba(${def.r},${def.g},${def.b},0.25)`)
          root.style.setProperty('--border', `rgba(${def.r},${def.g},${def.b},0.15)`)
          root.style.setProperty('--border-hard', `rgba(${def.r},${def.g},${def.b},0.4)`)
          root.style.setProperty('--accent-light', `rgba(${def.r},${def.g},${def.b},0.08)`)
          root.style.setProperty('--accent-mid', `rgba(${def.r},${def.g},${def.b},0.18)`)
        }
      },
    }),
    { name: 'knemos-settings' }
  )
)
