import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../../store/chat.store'

type ChatMode = 'query' | 'rag'

const QUERY_SUGGESTIONS = [
  'What was I working on this morning?',
  'Which tabs are currently open?',
  'How is my focus score today?',
  'What apps are using the most memory?',
]

const RAG_SUGGESTIONS = [
  'What docker commands did I use last week?',
  'Show me what I was working on yesterday',
  'Find any notes about API endpoints I copied',
  'What was the most active app last session?',
]

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const ChatPanel = () => {
  const { messages, isLoadingQuery, isLoadingRag, sendMessage } = useChatStore()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ChatMode>('query')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    const isLoading = mode === 'rag' ? isLoadingRag : isLoadingQuery
    if (!text || isLoading) return
    setInput('')
    sendMessage(text, mode)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = mode === 'rag' ? RAG_SUGGESTIONS : QUERY_SUGGESTIONS
  const filteredMessages = messages.filter((m: any) => m.mode === mode || !m.mode)
  const currentIsLoading = mode === 'rag' ? isLoadingRag : isLoadingQuery

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            ○ — AI Assistant
          </span>
        </div>

        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: 0, marginTop: 12, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
          {(['query', 'rag'] as ChatMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '7px 0',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
                background: mode === m ? 'var(--ink)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--ink-3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'var(--font)',
              }}
            >
              {m === 'query' ? 'Query' : 'Memory'}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
          {mode === 'query'
            ? 'Ask about current workspace, tabs, files, and system state.'
            : 'Ask questions about historical activity and stored memory.'}
        </div>
      </div>



      {/* Messages */}
      <div className="chat-messages">
        {filteredMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 36, fontWeight: 100, color: 'var(--ink-4)', marginBottom: 16 }}>○</div>
            <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink-2)', marginBottom: 6 }}>
              KNEMOS AI — {mode === 'query' ? 'Live Query' : 'Memory Search'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.7 }}>
              {mode === 'query'
                ? 'Powered by local Qwen2.5 with live system context.'
                : 'Search your historical activity, indexed screenshots, and stored sessions.'}
            </div>
          </div>
        )}

        {filteredMessages.map((msg: any) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="chat-message-avatar">
              {msg.role === 'user' ? 'U' : '○'}
            </div>
            <div>
              <div className="chat-bubble">{msg.content}</div>
              <div className="chat-bubble-time">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {currentIsLoading && (
          <div className="chat-message assistant">
            <div className="chat-message-avatar">○</div>
            <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="spinner" />
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Thinking locally...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {filteredMessages.length === 0 && (
        <div className="chat-suggestions">
          {suggestions.map((s) => (
            <button
              key={s}
              className="chat-suggestion-btn"
              onClick={() => { setInput(''); sendMessage(s, mode) }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-context-chips">
          <span className="chat-chip">○ Screenshots</span>
          <span className="chat-chip">+ Tabs</span>
          <span className="chat-chip">— Files</span>
          <span className="chat-chip" style={{ background: mode === 'rag' ? 'var(--accent-light)' : undefined, color: mode === 'rag' ? 'var(--accent)' : undefined }}>
            {mode === 'rag' ? 'Memory RAG' : 'Live State'}
          </span>
        </div>
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder={mode === 'query' ? 'Ask about current workspace...' : 'Search memory and history...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={currentIsLoading} title="Send message">
            ↗
          </button>
        </div>
      </div>
    </div>
  )
}
