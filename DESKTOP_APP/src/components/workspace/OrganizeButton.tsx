import { useState } from 'react'
import { authenticatedFetch } from '../../store/auth.store'
import { useCategoriesStore } from '../../store/categories.store'

const API = 'http://127.0.0.1:8765'

export const OrganizeButton = () => {
  const { applyCategoriesFromBackend } = useCategoriesStore()
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState('')

  const handleOrganize = async () => {
    setIsPending(true)
    setMessage('')

    try {
      // Trigger AI clustering
      const organizeRes = await authenticatedFetch(`${API}/api/workspace/organize`, { method: 'POST' })

      // Fetch fresh categorized data
      const catRes = await authenticatedFetch(`${API}/api/workspace/categories`)
      if (catRes.ok) {
        const catData = await catRes.json()
        applyCategoriesFromBackend(catData.categories)
      }

      if (organizeRes.ok) {
        const data = await organizeRes.json()
        setMessage(`${data.total_items} items organized`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch {
      setMessage('Backend offline')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {message && (
        <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.5 }}>
          {message}
        </span>
      )}
      <button
        onClick={handleOrganize}
        disabled={isPending}
        className="organize-btn"
        style={{ opacity: isPending ? 0.6 : 1, cursor: isPending ? 'wait' : 'pointer' }}
      >
        {isPending ? 'Organizing...' : 'Auto Organize'}
      </button>
    </div>
  )
}
