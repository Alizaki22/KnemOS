import { useState, useEffect } from 'react'
import { authenticatedFetch } from '../../store/auth.store'
import { useSettingsStore, ACCENTS, AccentColor, OllamaModel } from '../../store/settings.store'
import { useAuthStore } from '../../store/auth.store'
export const SettingsPanel = () => {
  const { accent, customColorHex, model, isInverted, deepFocusTimerSeconds, dismissedFeatureReminder, setAccent, setCustomColorHex, setModel, setInverted, setDeepFocusTimerSeconds, setDismissedFeatureReminder } = useSettingsStore()
  const [backendStatus, setBackendStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'ok' | 'missing' | 'fail'>('idle')
  const [extensionStatus, setExtensionStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [resources, setResources] = useState<any>(null)
  const { token: currentToken, setToken } = useAuthStore()
  const [tokenInput, setTokenInput] = useState('')

  useEffect(() => {
    setTokenInput(currentToken || '')
  }, [currentToken])

  useEffect(() => {
    authenticatedFetch('http://127.0.0.1:8765/api/system/resources')
      .then(r => r.json())
      .then(data => setResources(data))
      .catch(() => {})
  }, [])

  const handleTestBackend = async () => {
    setBackendStatus('idle')
    try {
      const res = await authenticatedFetch('http://127.0.0.1:8765/api/system/health', { signal: AbortSignal.timeout(3000) })
      setBackendStatus(res.ok ? 'ok' : 'fail')
    } catch {
      setBackendStatus('fail')
    }
  }

  const handleTestOllama = async () => {
    setOllamaStatus('idle')
    try {
      const res = await authenticatedFetch('http://127.0.0.1:8765/api/chat/status', { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = await res.json()
        if (data.ollama_running && data.model_available) setOllamaStatus('ok')
        else if (data.ollama_running) setOllamaStatus('missing')
        else setOllamaStatus('fail')
      } else {
        setOllamaStatus('fail')
      }
    } catch {
      setOllamaStatus('fail')
    }
  }

  const handleTestExtension = async () => {
    setExtensionStatus('idle')
    try {
      const res = await authenticatedFetch('http://127.0.0.1:8765/api/system/health', { signal: AbortSignal.timeout(2000) })
      // If backend is up, extension might be sending data
      setExtensionStatus(res.ok ? 'ok' : 'fail')
    } catch {
      setExtensionStatus('fail')
    }
  }

  const handleSaveToken = () => {
    if (tokenInput.trim() !== '') {
      setToken(tokenInput.trim())
      alert('Token saved securely. Please restart the backend connection or reload the app if connection fails.')
    }
  }

  const handleResetOnboarding = () => {
    if (confirm('This will show the setup guide next time you launch KNEMOS. Continue?')) {
      localStorage.removeItem('knemos-onboarded')
      alert('Onboarding reset. It will appear on next launch.')
    }
  }

  const statusBadge = (status: string, labels: Record<string, string>) => (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      padding: '3px 10px',
      borderRadius: 20,
      background: status === 'ok' ? 'var(--accent-light)' : status === 'fail' ? 'rgba(229,57,53,0.08)' : 'rgba(0,0,0,0.04)',
      color: status === 'ok' ? 'var(--accent)' : status === 'fail' ? '#E53935' : 'var(--ink-4)',
      border: `1px solid ${status === 'ok' ? 'var(--accent)' : status === 'fail' ? '#E53935' : 'var(--border)'}`,
    }}>
      {labels[status] || status}
    </span>
  )

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Title */}
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div className="section-title" style={{ fontSize: 28, letterSpacing: -1 }}>Settings</div>
        <div className="section-line" />
        <div className="section-subtitle">— Configuration</div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-header">Appearance</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Accent Color</div>
            <div className="settings-row-desc">Used for active states, highlights, and buttons.</div>
          </div>
          <div className="accent-swatches" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {(Object.keys(ACCENTS) as AccentColor[]).map((c) => (
              <div
                key={c}
                className={`accent-swatch ${accent === c ? 'active' : ''}`}
                style={{ backgroundColor: ACCENTS[c].value }}
                onClick={() => setAccent(c)}
                title={c}
              />
            ))}
            <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
            <input
              type="color"
              value={customColorHex}
              onChange={(e) => {
                setCustomColorHex(e.target.value)
                setAccent('custom')
              }}
              title="Custom Color"
              style={{
                width: 24, height: 24, padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer',
                outline: accent === 'custom' ? '2px solid var(--ink)' : 'none',
                outlineOffset: 2
              }}
            />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Theme Mode</div>
            <div className="settings-row-desc">Toggle between Minimal White and Pure Inverted (Monochrome Color Background).</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-3)' }}>Minimal White</span>
            <div 
              style={{
                width: 36, height: 20, borderRadius: 10, background: isInverted ? 'var(--accent)' : 'var(--border)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onClick={() => setInverted(!isInverted)}
            >
              <div style={{
                position: 'absolute', top: 2, left: isInverted ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-panel)',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-3)' }}>Inverted</span>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Deep Focus Timer</div>
            <div className="settings-row-desc">Time of inactivity before non-workspace apps are minimized.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={deepFocusTimerSeconds}
              onChange={(e) => setDeepFocusTimerSeconds(parseInt(e.target.value) || 300)}
              style={{
                padding: '4px 8px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 4,
                background: 'var(--bg-panel)', color: 'var(--ink)', width: 120
              }}
            >
              <option value="15">15 seconds</option>
              <option value="45">45 seconds</option>
              <option value="60">1 minute</option>
              <option value="120">2 minutes</option>
              <option value="300">5 minutes</option>
              <option value="900">15 minutes</option>
              <option value="3600">1 hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI & Memory */}
      <div className="settings-section">
        <div className="settings-section-header">Local AI Engine</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Language Model</div>
            <div className="settings-row-desc">
              7B recommended for capable systems. Use 3B if RAM is limited (&lt;8GB).
            </div>
          </div>
          <select
            className="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value as OllamaModel)}
          >
            <option value="qwen2.5:7b">Qwen 2.5 (7B) — Recommended</option>
            <option value="qwen2.5:3b">Qwen 2.5 (3B) — Low-end / Fast</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Ollama Status</div>
            <div className="settings-row-desc">Check if local Qwen2.5 model is available.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {ollamaStatus !== 'idle' && statusBadge(ollamaStatus, {
              ok: 'Ready',
              missing: 'Model Missing',
              fail: 'Offline'
            })}
            <button className="test-btn" onClick={handleTestOllama}>
              Test Ollama
            </button>
          </div>
        </div>

        {ollamaStatus === 'missing' && (
          <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 11, color: 'var(--accent)' }}>
            Ollama is running but the model is missing. Run: <code>ollama pull {model}</code>
          </div>
        )}
      </div>

      {/* Storage */}
      <div className="settings-section">
        <div className="settings-section-header">Storage & Memory</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Screenshot Retention</div>
            <div className="settings-row-desc">Screenshots older than 48 hours are automatically deleted. Max 100 stored.</div>
            {resources && (
              <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                {resources.screenshots_path} ({resources.screenshots_mb} MB)
              </div>
            )}
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: 1, textTransform: 'uppercase' }}>
            48h / 100 max
          </span>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Semantic Memory (ChromaDB)</div>
            <div className="settings-row-desc">Vector database uses v2 collection (1024-dim). Auto-versioned to prevent conflicts.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase' }}>
              v2 Active
            </span>
            {resources && (
              <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                {resources.chromadb_mb} MB Vector / {resources.sqlite_mb} MB SQLite
              </span>
            )}
          </div>
        </div>
      </div>

      {/* System & Connectivity */}
      <div className="settings-section">
        <div className="settings-section-header">Authentication & Connection</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Desktop App Auth Token</div>
            <div className="settings-row-desc">Paste your authentication token from the KNEMOS website.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="password"
              placeholder="eyJhbGci..."
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              style={{
                width: 140, padding: '4px 8px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 4,
                background: 'var(--bg-panel)', color: 'var(--ink)'
              }}
            />
            <button className="test-btn" onClick={handleSaveToken}>Save & Validate</button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Backend Connection</div>
            <div className="settings-row-desc">Python FastAPI backend on port 8765.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {backendStatus !== 'idle' && statusBadge(backendStatus, { ok: 'Connected', fail: 'Offline' })}
            <button className="test-btn" onClick={handleTestBackend}>
              Test Backend
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Browser Extension</div>
            <div className="settings-row-desc">Chrome extension sends tab data to backend in real time.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {extensionStatus !== 'idle' && statusBadge(extensionStatus, { ok: 'Backend Reachable', fail: 'Check Extension' })}
            <button className="test-btn" onClick={handleTestExtension}>
              Check
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding & Features */}
      <div className="settings-section">
        <div className="settings-section-header">Help & Setup</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Optional Features Reminder</div>
            <div className="settings-row-desc">Show a startup overlay if recommended features (Wolfram, LLM) are missing.</div>
          </div>
          <div 
            style={{
              width: 36, height: 20, borderRadius: 10, background: !dismissedFeatureReminder ? 'var(--accent)' : 'var(--border)',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onClick={() => setDismissedFeatureReminder(!dismissedFeatureReminder)}
          >
            <div style={{
              position: 'absolute', top: 2, left: !dismissedFeatureReminder ? 18 : 2,
              width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-panel)',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }} />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Setup Guide</div>
            <div className="settings-row-desc">Show the onboarding wizard again on next launch.</div>
          </div>
          <button className="test-btn" onClick={handleResetOnboarding}>
            Reset Onboarding
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-4)', fontSize: 11 }}>
        KNEMOS Desktop v2.0.0
        <br />
        Minimal White Theme — Local First — Offline First
      </div>
    </div>
  )
}
