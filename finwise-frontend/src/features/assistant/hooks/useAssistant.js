import { useState, useCallback } from "react"
import { FEATURE_CARDS } from "../constants/featureCards"
import { assistantAPI } from "../../../services/api"

/**
 * useAssistant
 *
 * Owns all state and side-effects for the AI assistant feature:
 *   - Session list (max 10, persisted in component state)
 *   - Active session tracking
 *   - Message list for the current conversation
 *   - Send logic via assistantAPI (backend LLM call)
 *   - Sidebar open/close toggle
 */
export function useAssistant() {
  const [sessions, setSessions] = useState([])

  const [activeId,     setActiveId]     = useState(null)
  const [messages,     setMessages]     = useState([])
  const [thinking,     setThinking]     = useState(false)
  const [latestAIIdx,  setLatestAIIdx]  = useState(-1)
  const [sidebarOpen,  setSidebarOpen]  = useState(true)

  // ── Derived ─────────────────────────────────────────────────────────────
  const isEmpty = messages.length === 0

  // ── Actions ─────────────────────────────────────────────────────────────
  function newChat() {
    setMessages([])
    setActiveId(null)
    setLatestAIIdx(-1)
  }

  function loadSession(session) {
    setMessages(session.messages)
    setActiveId(session.id)
    setLatestAIIdx(-1)
  }

  function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeId === id) newChat()
  }

  function toggleSidebar() {
    setSidebarOpen(prev => !prev)
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  const send = useCallback(async (content, triggeredBy = null) => {
    if (!content.trim() || thinking) return

    const userMsg = { role: "user", content: content.trim(), id: Date.now() }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setThinking(true)

    let aiContent
    try {
      const { data } = await assistantAPI.chat(content)
      aiContent = data.reply
    } catch (err) {
      console.error("Assistant API error:", err)
      aiContent = "I'm having trouble connecting right now. Please try again shortly."
    }

    const aiMsg = {
      role:        "assistant",
      content:     aiContent,
      id:          Date.now() + 1,
      triggeredBy,
    }
    const final = [...withUser, aiMsg]
    setMessages(final)
    setLatestAIIdx(final.length - 1)
    setThinking(false)

    // Auto-persist to session list ─────────────────────────────────────────
    const sessionTitle = triggeredBy
      ? (FEATURE_CARDS.find(c => c.id === triggeredBy)?.label ?? "Analysis")
        + " · "
        + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : content.slice(0, 32) + (content.length > 32 ? "…" : "")

    const sessionDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })

    if (!activeId) {
      const newId = "s" + Date.now()
      setActiveId(newId)
      setSessions(prev => [
        { id: newId, title: sessionTitle, date: sessionDate, messages: final },
        ...prev.slice(0, 9),             // enforce 10-session cap
      ])
    } else {
      setSessions(prev =>
        prev.map(s => s.id === activeId ? { ...s, messages: final } : s)
      )
    }
  }, [messages, thinking, activeId])

  return {
    // state
    sessions,
    activeId,
    messages,
    thinking,
    latestAIIdx,
    sidebarOpen,
    isEmpty,
    // actions
    send,
    newChat,
    loadSession,
    deleteSession,
    toggleSidebar,
  }
}
