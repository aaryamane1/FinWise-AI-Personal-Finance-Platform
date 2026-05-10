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

function parseTable(lines, keyPrefix) {
  if (lines.length < 2) return null;
  
  const headers = lines[0].split("|").slice(1, -1).map(s => s.trim());
  const rows = lines.slice(2).map(line => line.split("|").slice(1, -1).map(s => s.trim()));

  return (
    <div key={keyPrefix} style={{ overflowX: "auto", margin: "14px 0", background: "rgba(0,0,0,0.15)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.03)" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", color: "#f0f4ff", fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 14px", color: "#c8d8f0" }}>
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MarkdownRenderer({ text }) {
  const lines = text.split("\n")
  const blocks = []
  let tableLines = []

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("|") && trimmed.indexOf("|", 1) !== -1) {
      tableLines.push(trimmed)
    } else {
      if (tableLines.length > 0) {
        blocks.push({ type: "table", lines: tableLines })
        tableLines = []
      }
      blocks.push({ type: "line", content: line })
    }
  })

  if (tableLines.length > 0) {
    blocks.push({ type: "table", lines: tableLines })
  }

  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === "table") {
          return parseTable(block.lines, `table-${i}`)
        }

        const line = block.content
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
