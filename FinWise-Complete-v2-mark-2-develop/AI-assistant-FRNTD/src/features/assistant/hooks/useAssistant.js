import { useState, useCallback } from "react"
import { FEATURE_CARDS } from "../constants/featureCards"
import { getMockResponse, MOCK_CONTEXT } from "../utils/mockResponses"

/**
 * useAssistant
 *
 * Owns all state and side-effects for the AI assistant feature:
 *   - Session list (max 10, persisted in component state)
 *   - Active session tracking
 *   - Message list for the current conversation
 *   - Send logic (mock now, real API via TODO block)
 *   - Sidebar open/close toggle
 *
 * On backend integration:
 *   1. Import `useAuth` to get the JWT token
 *   2. Import `useFinance` to get live context data
 *   3. Replace the mock delay + getMockResponse() block with the real fetch call
 *   4. Delete MOCK_CONTEXT import once useFinance() is wired
 */
export function useAssistant() {
  const [sessions, setSessions] = useState([
    { id: "s1", title: "Budget Analysis · Mar 21", date: "Mar 21", messages: [] },
    { id: "s2", title: "Food spending deep-dive",  date: "Mar 19", messages: [] },
    { id: "s3", title: "Anomaly Report · Mar 15",  date: "Mar 15", messages: [] },
  ])

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

    // ── TODO: Replace this entire block with the real API call ────────────
    //
    // const { token } = useAuth()           // import at hook level, not here
    // const financeCtx = useFinance()       // import at hook level, not here
    //
    // const res = await fetch("/api/v1/assistant/chat", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({
    //     message:  content,
    //     trigger:  triggeredBy,                   // null | "monthly_summary" | "budget_suggestions" | "spending_anomalies"
    //     history:  messages.slice(-10),           // last 10 messages for context window
    //     context: {
    //       monthlyIncome:   financeCtx.monthlyIncome,
    //       monthlyExpenses: financeCtx.monthlyExpenses,
    //       savingsRate:     financeCtx.savingsRate,
    //       netWorth:        financeCtx.netWorth,
    //       assets:          financeCtx.assets,
    //       liabilities:     financeCtx.liabilities,
    //       budgets:         financeCtx.budgets,
    //       transactions:    financeCtx.transactions.slice(0, 50),
    //       subscriptions:   financeCtx.subscriptions,
    //     },
    //   }),
    // })
    // const { response: aiContent } = await res.json()
    //
    // ─────────────────────────────────────────────────────────────────────

    // Mock: simulated network delay
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 700))
    const aiContent = getMockResponse(content)

    // ─────────────────────────────────────────────────────────────────────

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
