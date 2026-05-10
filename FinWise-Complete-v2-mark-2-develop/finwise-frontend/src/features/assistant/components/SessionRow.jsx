import { useState } from "react"
import { MessageSquare, Trash2 } from "lucide-react"

/**
 * SessionRow
 *
 * A single entry in the sidebar session history list.
 * Shows a title + date, highlights when active, reveals a delete button on hover.
 *
 * Props:
 *   session   { id, title, date, messages }
 *   active    boolean
 *   onSelect  () => void
 *   onDelete  (id: string) => void
 */
export function SessionRow({ session, active, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => e.key === "Enter" && onSelect()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        9,
        padding:    "9px 10px",
        borderRadius: 9,
        cursor:     "pointer",
        marginBottom: 3,
        background: active  ? "rgba(0,230,118,0.09)"
                  : hovered ? "rgba(255,255,255,0.04)"
                  :           "transparent",
        border:     `1px solid ${active ? "rgba(0,230,118,0.20)" : "transparent"}`,
        transition: "all 0.16s",
        userSelect: "none",
      }}
    >
      <MessageSquare
        size={12}
        color={active ? "#00e676" : "#3a4a60"}
        style={{ flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize:     12,
            fontWeight:   500,
            color:        active ? "#f0f4ff" : "#8899b4",
            whiteSpace:   "nowrap",
            overflow:     "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {session.title}
        </div>
        <div style={{ fontSize: 10, color: "#3a4a60", marginTop: 1 }}>
          {session.date}
        </div>
      </div>

      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(session.id) }}
          style={{
            background:  "none",
            border:      "none",
            cursor:      "pointer",
            color:       "#3a4a60",
            display:     "flex",
            padding:     2,
            borderRadius: 4,
            flexShrink:  0,
            transition:  "color 0.14s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ff5252")}
          onMouseLeave={e => (e.currentTarget.style.color = "#3a4a60")}
          aria-label="Delete session"
        >
          <Trash2 size={11} />
        </button>
      )}
    </div>
  )
}
