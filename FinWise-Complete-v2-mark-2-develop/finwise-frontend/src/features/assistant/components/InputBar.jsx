import { useRef } from "react"
import { Send, Loader2 } from "lucide-react"

/**
 * InputBar
 *
 * The sticky footer input area: a growing textarea and a send button.
 * - Enter sends the message
 * - Shift+Enter inserts a newline
 * - Auto-grows up to 130px then scrolls
 *
 * Props:
 *   value      string
 *   onChange   (value: string) => void
 *   onSend     () => void
 *   disabled   boolean — true while the assistant is thinking
 */
export function InputBar({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null)

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  function handleInput(e) {
    // Auto-grow textarea height
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px"
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div>
      <div
        className="fw-inputbox"
        // Focus ring is handled by the .fw-inputbox:focus-within CSS rule
      >
        <textarea
          ref={textareaRef}
          className="fw-textarea"
          placeholder="Ask about your finances…"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          aria-label="Message input"
        />

        <button
          className="fw-sendbtn"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send message"
          style={{
            background: canSend ? "#00e676"  : "#1a2540",
            color:      canSend ? "#0a0f1a"  : "#2e3e55",
            boxShadow:  canSend ? "0 0 20px rgba(0,230,118,0.28)" : "none",
          }}
        >
          {disabled
            ? <Loader2 size={15} style={{ animation: "spinCW 0.9s linear infinite" }} />
            : <Send size={14} />
          }
        </button>
      </div>

      {/* Keyboard hint row */}
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        8,
          marginTop:  9,
          paddingLeft: 2,
        }}
      >
        <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
          <kbd style={kbdStyle}>Enter</kbd> to send
        </span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)", display: "inline-block" }} />
        <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
          <kbd style={kbdStyle}>Shift+Enter</kbd> for new line
        </span>
      </div>
    </div>
  )
}

const kbdStyle = {
  background:   "var(--bg-card)",
  border:       "1px solid var(--border)",
  borderRadius: 4,
  padding:      "1px 6px",
  fontSize:     10,
  color:        "var(--text-secondary)",
  fontFamily:   "monospace",
}
