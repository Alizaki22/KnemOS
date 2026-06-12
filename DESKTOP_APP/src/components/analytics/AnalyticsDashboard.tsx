import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'
import { useSystemStore } from '../../store/system.store'
import { useCategoriesStore } from '../../store/categories.store'
import { useWorkspaceStore } from '../../store/workspace.store'
import { useActivityStore } from '../../store/activity.store'

type Tab = 'overview' | 'system' | 'activity' | 'timeline' | 'export'

const formatTime = (ts: number) => {
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (ts: number) => {
  const d = new Date(ts * 1000)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const EVENT_SYMBOLS: Record<string, string> = {
  screenshot: '○',
  tab_detected: '—',
  window_open: '+',
  focus_activate: '◇',
  focus_deactivate: '◇',
  organize: '□',
  workspace_created: '+',
  workspace_focus: '◇',
  default: '·',
}

export const AnalyticsPanel = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { ramStats, focusScore } = useSystemStore()
  const { categories } = useCategoriesStore()
  const { workspaces } = useWorkspaceStore()
  const { timeline, currentSession } = useActivityStore()

  const totalApps      = categories.apps?.length || 0
  const totalBrowsers  = categories.browsers?.length || 0
  const totalTabs      = categories.tabs?.length || 0
  const totalFiles     = categories.files?.length || 0
  const totalProc      = categories.processes?.length || 0

  const score = focusScore?.score ?? 0
  const grade = focusScore?.grade ?? '—'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'system',    label: 'System' },
    { id: 'activity',  label: 'Activity' },
    { id: 'timeline',  label: 'Timeline' },
    { id: 'export',    label: 'Export' },
  ]

  return (
    <div style={{ maxWidth: 920 }}>
      {/* Title */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ fontSize: 28, letterSpacing: -1 }}>Analytics</div>
        <div className="section-line" />
        <div className="section-subtitle">+ Live metrics</div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--ink)', marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 20px',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              background: activeTab === t.id ? 'var(--ink)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--ink-3)',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--ink)' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'var(--font)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab
          totalApps={totalApps}
          totalBrowsers={totalBrowsers}
          totalTabs={totalTabs}
          totalFiles={totalFiles}
          totalProc={totalProc}
          totalWorkspaces={workspaces.length}
          session={currentSession}
        />
      )}

      {activeTab === 'system' && (
        <SystemTab ramStats={ramStats} categories={categories} />
      )}

      {activeTab === 'activity' && (
        <ActivityTab focusScore={focusScore} score={score} grade={grade} session={currentSession} />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab timeline={timeline} />
      )}

      {activeTab === 'export' && (
        <ExportTab categories={categories} ramStats={ramStats} focusScore={focusScore} workspaces={workspaces} />
      )}
    </div>
  )
}


// ───────────────────────────────────────
// Tab: Overview
// ───────────────────────────────────────
const OverviewTab = ({ totalApps, totalBrowsers, totalTabs, totalFiles, totalProc, totalWorkspaces, session }: any) => (
  <div>
    <div className="analytics-stats-grid">
      {[
        { label: 'Apps',       value: totalApps,       symbol: '+' },
        { label: 'Browsers',   value: totalBrowsers,   symbol: '○' },
        { label: 'Tabs',       value: totalTabs,       symbol: '—' },
        { label: 'Files',      value: totalFiles,      symbol: '□' },
        { label: 'Processes',  value: totalProc,       symbol: '×' },
        { label: 'Workspaces', value: totalWorkspaces, symbol: '◇' },
      ].map((s) => (
        <div key={s.label} className="analytics-stat-cell">
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 4 }}>{s.symbol}</div>
          <div className="analytics-stat-number">{s.value}</div>
          <div className="analytics-stat-label">{s.label}</div>
        </div>
      ))}
    </div>

    {/* Current session */}
    {session && (
      <div style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
          Current Session
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Duration', value: `${session.duration_minutes ?? 0}m` },
            { label: 'Apps', value: session.app_count ?? 0 },
            { label: 'Tabs', value: session.tab_count ?? 0 },
            { label: 'Interruptions', value: session.interruptions ?? 0 },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 100 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {session.dominant_apps?.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-3)' }}>
            Focus: {session.dominant_apps.slice(0, 2).join(' · ')}
          </div>
        )}
      </div>
    )}
  </div>
)


// ───────────────────────────────────────
// Tab: System
// ───────────────────────────────────────
const SystemTab = ({ ramStats, categories }: any) => {
  const allApps = [...(categories.apps || []), ...(categories.browsers || [])]
  const activeApps = allApps.filter((a: any) => a.isActive)
  const topByMem = [...allApps].sort((a: any, b: any) => (b.memoryMb || 0) - (a.memoryMb || 0)).slice(0, 6)

  return (
    <div>
      {/* RAM Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="focus-score-bar">
          <div className="focus-score-label">RAM Usage</div>
          {ramStats ? (
            <>
              <div className="focus-score-row" style={{ marginTop: 10 }}>
                <div className="focus-score-track" style={{ flex: 1 }}>
                  <div className="focus-score-fill" style={{ width: `${ramStats.percent ?? 0}%` }} />
                </div>
                <div className="focus-score-grade" style={{ fontSize: 24, marginLeft: 12 }}>
                  {(ramStats.used_gb ?? 0).toFixed(1)}
                  <span style={{ fontSize: 12, fontWeight: 300, color: 'var(--ink-3)' }}>
                    /{(ramStats.total_gb ?? 0).toFixed(0)} GB
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 100 }}>{ramStats.percent ?? 0}%</div>
                  <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>Used</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 100, color: 'var(--accent)' }}>
                    +{(ramStats.saved_gb ?? 0).toFixed(1)} GB
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>Recovered</div>
                </div>
                {ramStats.cpu_percent !== undefined && (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 100 }}>{ramStats.cpu_percent}%</div>
                    <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>CPU</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--ink-4)', fontSize: 13, marginTop: 12 }}>Backend offline</div>
          )}
        </div>

        <div className="focus-score-bar">
          <div className="focus-score-label">App Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
            {[
              { label: 'Active', value: activeApps.length, color: 'var(--accent)' },
              { label: 'Total', value: allApps.length, color: 'var(--ink)' },
              { label: 'Browsers', value: categories.browsers?.length || 0, color: 'var(--ink-2)' },
              { label: 'Processes', value: categories.processes?.length || 0, color: 'var(--ink-3)' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 100, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top apps by memory */}
      <div className="analytics-app-table">
        <div className="analytics-table-header">
          <div className="analytics-table-header-cell">Application</div>
          <div className="analytics-table-header-cell">Memory</div>
          <div className="analytics-table-header-cell">Status</div>
          <div className="analytics-table-header-cell">Type</div>
        </div>
        {topByMem.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
            No application data yet. Organize workspace first.
          </div>
        ) : (
          topByMem.map((item: any) => (
            <div key={item.id} className="analytics-table-row">
              <div className="analytics-table-cell" style={{ fontWeight: 500 }}>{item.title}</div>
              <div className="analytics-table-cell">{item.memoryMb ?? '—'} MB</div>
              <div className="analytics-table-cell">
                <span className={`analytics-status-dot ${item.isActive ? 'active' : 'idle'}`} />
                {item.isActive ? 'Active' : 'Idle'}
              </div>
              <div className="analytics-table-cell" style={{ color: 'var(--ink-3)' }}>{item.categoryType}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


// ───────────────────────────────────────
// Tab: Activity
// ───────────────────────────────────────
const ActivityTab = ({ focusScore, score, grade, session }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {/* Focus Score */}
    <div className="focus-score-bar">
      <div className="focus-score-label">Cognitive Focus Score</div>
      <div className="focus-score-row" style={{ marginTop: 12 }}>
        <div className="focus-score-track" style={{ flex: 1 }}>
          <div className="focus-score-fill" style={{ width: `${score}%` }} />
        </div>
        <div className="focus-score-grade" style={{ marginLeft: 12 }}>{grade}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        {[
          { label: 'Focus Score', value: score },
          { label: 'Context Switches', value: focusScore?.context_switches ?? 0 },
          { label: 'Focus Minutes', value: focusScore?.focus_minutes ?? 0 },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 28, fontWeight: 100 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {focusScore?.trend && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-3)' }}>
          Trend: {focusScore.trend}
        </div>
      )}
    </div>

    {/* Session focus */}
    {session && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px 20px' }}>
        {[
          { label: 'Session Duration', value: `${session.duration_minutes ?? 0}m` },
          { label: 'Focus Grade', value: session.focus_grade ?? grade },
          { label: 'Apps Open', value: session.app_count ?? 0 },
          { label: 'Interruptions', value: session.interruptions ?? 0 },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 24, fontWeight: 100 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    )}
  </div>
)


// ───────────────────────────────────────
// Tab: Timeline
// ───────────────────────────────────────
const TimelineTab = ({ timeline }: any) => (
  <div>
    {timeline.length === 0 ? (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>—</div>
        <div style={{ fontSize: 12 }}>No activity recorded yet.</div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>Activity will appear as you use your system.</div>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {timeline.map((event: any, i: number) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', flexShrink: 0, width: 45 }}>
              {formatTime(event.timestamp)}
            </div>
            <div style={{
              width: 20,
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--ink-3)',
              flexShrink: 0,
            }}>
              {EVENT_SYMBOLS[event.event_type] || EVENT_SYMBOLS.default}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 400 }}>{event.title}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {event.event_type.replace(/_/g, ' ')}
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
              {formatDate(event.timestamp)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)


// ───────────────────────────────────────
// Tab: Export / Charts
// ───────────────────────────────────────
const ExportTab = ({ categories, ramStats, focusScore, workspaces }: any) => {
  const handleExport = async () => {
    const data = JSON.stringify({ categories, ramStats, focusScore, workspaces, exportedAt: new Date().toISOString() }, null, 2)
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

    if (isTauri) {
      try {
        const filePath = await save({
          filters: [{ name: 'JSON', extensions: ['json'] }],
          defaultPath: `knemos-export-${Date.now()}.json`,
        })
        if (filePath) {
          await writeTextFile(filePath, data)
          toast.success('Export saved successfully!')
        }
      } catch (err) {
        console.error('Tauri save failed, falling back to clipboard:', err)
        navigator.clipboard.writeText(data)
          .then(() => toast.success('Export data copied to clipboard!'))
          .catch(() => toast.error('Failed to copy to clipboard.'))
      }
    } else {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `knemos-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Simple SVG bar chart of category counts
  const chartData = [
    { label: 'Apps',      value: categories.apps?.length || 0 },
    { label: 'Browsers',  value: categories.browsers?.length || 0 },
    { label: 'Tabs',      value: categories.tabs?.length || 0 },
    { label: 'Files',     value: categories.files?.length || 0 },
    { label: 'Processes', value: categories.processes?.length || 0 },
    { label: 'Workspaces',value: workspaces?.length || 0 },
  ]
  const maxVal = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div>
      {/* Bar chart */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px', marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>
          Category Distribution
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 100 }}>
          {chartData.map((d) => (
            <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)' }}>{d.value}</div>
              <div style={{
                width: '100%',
                background: 'var(--ink)',
                height: `${Math.max(4, (d.value / maxVal) * 80)}px`,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.3s',
              }} />
              <div style={{ fontSize: 8, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>
                {d.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="organize-btn" onClick={handleExport}>
          Export JSON
        </button>
      </div>
    </div>
  )
}
