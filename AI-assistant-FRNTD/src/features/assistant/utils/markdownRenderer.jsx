/**
 * markdownRenderer.jsx
 *
 * Lightweight, purpose-built renderer for the subset of markdown
 * the AI assistant produces. Not a general-purpose parser.
 *
 * Supported syntax:
 *   **bold**          — inline bold
 *   **Heading**\n    — standalone bold line treated as a section heading
 *   — item / - item  — unordered list item
 *   ⚠️ text          — warning callout (amber)
 *   ✅ text          — success callout (green)
 *   blank line       — vertical spacing
 */

// Splits a string on **bold** markers and returns mixed text/strong nodes
function renderInline(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: "#f0f4ff", fontWeight: 600 }}>{part}</strong>
      : <span key={i}>{part}</span>
  )
}

export function MarkdownRenderer({ text }) {
  const lines = text.split("\n")

  return (
    <div>
      {lines.map((line, i) => {
        // Blank line → spacer
        if (!line.trim()) {
          return <div key={i} style={{ height: 8 }} />
        }

        // Standalone bold heading  e.g.  **March 2026 — Overview**
        if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
          return (
            <div
              key={i}
              style={{
                fontFamily:   "'Syne', sans-serif",
                fontWeight:   700,
                fontSize:     13,
                color:        "#f0f4ff",
                marginTop:    i > 0 ? 14 : 0,
                marginBottom: 4,
                letterSpacing: "0.01em",
              }}
            >
              {line.replace(/\*\*/g, "")}
            </div>
          )
        }

        // Warning callout  ⚠️ …
        if (line.startsWith("⚠️")) {
          return (
            <div
              key={i}
              style={{
                margin:     "10px 0",
                padding:    "10px 14px",
                background: "rgba(255,171,64,0.1)",
                border:     "1px solid rgba(255,171,64,0.25)",
                borderRadius: 8,
                fontSize:   12.5,
                lineHeight: 1.6,
                color:      "#f0f4ff",
              }}
            >
              {renderInline(line)}
            </div>
          )
        }

        // Success callout  ✅ …
        if (line.startsWith("✅")) {
          return (
            <div
              key={i}
              style={{
                margin:     "10px 0",
                padding:    "10px 14px",
                background: "rgba(0,230,118,0.08)",
                border:     "1px solid rgba(0,230,118,0.2)",
                borderRadius: 8,
                fontSize:   12.5,
                lineHeight: 1.6,
                color:      "#f0f4ff",
              }}
            >
              {line}
            </div>
          )
        }

        // List item  — text  or  - text
        if (line.startsWith("—") || line.startsWith("- ")) {
          return (
            <div
              key={i}
              style={{
                display:    "flex",
                gap:        8,
                marginBottom: 3,
                paddingLeft: 4,
                fontSize:   13,
                lineHeight: 1.6,
                color:      "#c8d8f0",
              }}
            >
              <span style={{ color: "#00e676", flexShrink: 0, marginTop: 1 }}>—</span>
              <span>{renderInline(line.replace(/^[—\-]\s*/, ""))}</span>
            </div>
          )
        }

        // Regular paragraph line
        return (
          <div
            key={i}
            style={{ fontSize: 13, lineHeight: 1.7, color: "#c8d8f0", marginBottom: 1 }}
          >
            {renderInline(line)}
          </div>
        )
      })}
    </div>
  )
}
