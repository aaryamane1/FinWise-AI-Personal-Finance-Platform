/**
 * src/pages/Assistant.jsx  —  Page entry point
 *
 * Intentionally thin. Responsibilities:
 *   - Import feature CSS
 *   - Own the input field local state (presentational, not shared)
 *   - Call useAssistant() for all business logic
 *   - Wire state/actions into layout and child components
 *
 * ── Router registration (App.jsx) ────────────────────────────────────────
 *   import Assistant from "./pages/Assistant"
 *   // Inside the <Route element={<DashboardLayout />}> block:
 *   <Route path="/assistant" element={<Assistant />} />
 *
 * ── Sidebar registration (Sidebar.jsx NAV array) ─────────────────────────
 *   import { Sparkles } from "lucide-react"
 *   { to: "/assistant", icon: Sparkles, label: "AI Assistant" }
 */

import { useState, useRef, useEffect } from "react"
import { ChevronRight, RotateCcw }     from "lucide-react"

import "../features/assistant/styles/assistant.css"

import { useAssistant }     from "../features/assistant/hooks/useAssistant"
import { AssistantSidebar } from "../features/assistant/components/AssistantSidebar"
import { EmptyState }       from "../features/assistant/components/EmptyState"
import { Bubble }           from "../features/assistant/components/Bubble"
import { Thinking }         from "../features/assistant/components/Thinking"
import { FeaturePillRow }   from "../features/assistant/components/FeatureCards"
import { InputBar }         from "../features/assistant/components/InputBar"

export default function Assistant() {
  // ── Input value is purely presentational — lives in the page, not the hook
  const [inputValue, setInputValue] = useState("")

  const {
    sessions,
    activeId,
    messages,
    thinking,
    latestAIIdx,
    sidebarOpen,
    isEmpty,
    send,
    newChat,
    loadSession,
    deleteSession,
    toggleSidebar,
  } = useAssistant()

  const bottomRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  // ── Send handlers ──────────────────────────────────────────────────────
  function handleSend() {
    if (!inputValue.trim()) return
    send(inputValue)
    setInputValue("")
  }

  // Called by EmptyState — feature cards pass a triggerId, chips pass null
  function handleEmptySelect(triggerId, prompt) {
    send(prompt, triggerId)
  }

  // Called by FeaturePillRow in active chat
  function handlePillSelect(cardId, prompt) {
    send(prompt, cardId)
  }

  return (
    <div className="fw-assistant">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <AssistantSidebar
        open={sidebarOpen}
        sessions={sessions}
        activeId={activeId}
        onNewChat={newChat}
        onSelect={loadSession}
        onDelete={deleteSession}
      />

      {/* ── Main column ─────────────────────────────────────────────── */}
      <div className="fw-main">
        <div className="fw-noise" />

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="fw-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="fw-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronRight
                size={15}
                style={{
                  transform:  sidebarOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.22s",
                }}
              />
            </button>

            <div>
              <div
                style={{
                  fontSize:      10,
                  fontWeight:    500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color:         "#3a5070",
                  marginBottom:  3,
                }}
              >
                AI-powered analysis
              </div>
              <h1
                style={{
                  fontFamily:    "'Syne', sans-serif",
                  fontSize:      22,
                  fontWeight:    700,
                  letterSpacing: "-0.015em",
                  lineHeight:    1,
                  color:         "#f0f4ff",
                }}
              >
                Assistant
              </h1>
            </div>
          </div>

          {!isEmpty && (
            <button className="fw-newchat-sm" onClick={newChat}>
              <RotateCcw size={12} /> New Chat
            </button>
          )}
        </div>

        {/* ── Message area ────────────────────────────────────────── */}
        <div className="fw-messages">
          {isEmpty ? (
            <EmptyState onSelect={handleEmptySelect} disabled={thinking} />
          ) : (
            <div>
              {/* Compact feature pill row shown above messages */}
              <FeaturePillRow onSelect={handlePillSelect} disabled={thinking} />

              {/* Message list */}
              {messages.map((msg, i) => (
                <Bubble
                  key={msg.id}
                  msg={msg}
                  animateTyping={msg.role === "assistant" && i === latestAIIdx}
                />
              ))}

              {/* Thinking indicator */}
              {thinking && <Thinking />}

              {/* Scroll anchor */}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Scroll anchor for empty state */}
          {isEmpty && <div ref={bottomRef} />}
        </div>

        {/* ── Footer / Input ───────────────────────────────────────── */}
        <div className="fw-footer">
          <InputBar
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={thinking}
          />
        </div>
      </div>
    </div>
  )
}
