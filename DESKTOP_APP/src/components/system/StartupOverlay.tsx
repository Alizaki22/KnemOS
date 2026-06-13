import { useState, useEffect } from 'react'
import { authenticatedFetch } from '../../store/auth.store'
import { useSettingsStore } from '../../store/settings.store'

export const StartupOverlay = () => {
  const { dismissedFeatureReminder, setDismissedFeatureReminder } = useSettingsStore()
  const [missingFeatures, setMissingFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (dismissedFeatureReminder) return

    const checkFeatures = async () => {
      const missing: string[] = []
      try {
        const [wolframRes, ollamaRes, healthRes] = await Promise.all([
          authenticatedFetch('http://127.0.0.1:8765/api/wolfram/status'),
          authenticatedFetch('http://127.0.0.1:8765/api/chat/status'),
          authenticatedFetch('http://127.0.0.1:8765/api/system/health')
        ])

        const wolframData = await wolframRes.json().catch(() => ({}))
        const ollamaData = await ollamaRes.json().catch(() => ({}))
        const healthData = await healthRes.json().catch(() => ({}))

        if (!wolframData.active) missing.push('Wolfram Engine (for deep analytics)')
        if (!ollamaData.ollama_running || !ollamaData.model_available) missing.push('Local LLM (Qwen2.5 for AI Assistant)')
        if (!healthData.extension_active) missing.push('Browser Extension (for tab tracking)')

        if (missing.length > 0) {
          setMissingFeatures(missing)
          setVisible(true)
        }
      } catch (err) {
        console.error('Failed feature check', err)
      } finally {
        setLoading(false)
      }
    }

    checkFeatures()
  }, [dismissedFeatureReminder])

  if (!visible || dismissedFeatureReminder || loading) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 340, background: 'var(--bg-panel)',
      border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 20,
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)', zIndex: 9999,
      animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>
          KNEMOS Modules Missing
        </div>
        <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 16 }}>
          ×
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.5 }}>
        Your core local system is running perfectly, but some optional modules are offline:
      </div>

      <ul style={{ paddingLeft: 16, margin: 0, marginBottom: 20, fontSize: 11, color: 'var(--ink-3)' }}>
        {missingFeatures.map((f, i) => (
          <li key={i} style={{ marginBottom: 4 }}>{f}</li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--ink-4)', cursor: 'pointer' }}>
          <input type="checkbox" onChange={(e) => setDismissedFeatureReminder(e.target.checked)} />
          Don't show this again
        </label>
        <button className="organize-btn" onClick={() => setVisible(false)} style={{ fontSize: 10, padding: '6px 12px' }}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
