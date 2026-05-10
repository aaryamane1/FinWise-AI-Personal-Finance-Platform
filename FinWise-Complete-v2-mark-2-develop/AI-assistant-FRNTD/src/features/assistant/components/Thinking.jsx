import { Bot } from "lucide-react"

/**
 * Thinking
 *
 * Displayed in the message list while the assistant is processing a request.
 * Mirrors the AI bubble layout (avatar + bubble) but shows animated dots
 * instead of text content.
 */
export function Thinking() {
  return (
    <div
      style={{
        display:    "flex",
        gap:        11,
        alignItems: "flex-start",
        marginBottom: 20,
      }}
    >
      {/* Avatar — matches Bubble's AI avatar */}
      <div
        style={{
          width:      32,
          height:     32,
          borderRadius: 9,
          flexShrink: 0,
          display:    "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,230,118,0.14)",
          border:     "1px solid rgba(0,230,118,0.32)",
          boxShadow:  "0 0 14px rgba(0,230,118,0.10)",
        }}
      >
        <Bot size={15} color="#00e676" />
      </div>

      {/* Dots bubble */}
      <div
        style={{
          padding:      "14px 18px",
          borderRadius: "3px 14px 14px 14px",
          background:   "linear-gradient(145deg, #1c2840 0%, #141d2e 100%)",
          border:       "1px solid rgba(255,255,255,0.10)",
          boxShadow:    "0 6px 24px rgba(0,0,0,0.40)",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width:      6,
                height:     6,
                borderRadius: "50%",
                background: "#00e676",
                animation:  `dotPulse 1.3s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
