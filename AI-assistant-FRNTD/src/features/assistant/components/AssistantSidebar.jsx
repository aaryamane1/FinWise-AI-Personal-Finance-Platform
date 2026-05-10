import { Plus } from "lucide-react"
import { SessionRow } from "./SessionRow"

/**
 * AssistantSidebar
 *
 * Left panel containing the New Chat button and the list of past sessions.
 * Animates in/out via CSS width transition controlled by `open` prop.
 *
 * Props:
 *   open         boolean
 *   sessions     Array<{ id, title, date, messages }>
 *   activeId     string | null
 *   onNewChat    () => void
 *   onSelect     (session) => void
 *   onDelete     (id: string) => void
 */
export function AssistantSidebar({ open, sessions, activeId, onNewChat, onSelect, onDelete }) {
  return (
    <aside
      className="fw-sidebar"
      style={{
        width:    open ? 218 : 0,
        minWidth: open ? 218 : 0,
        padding:  open ? "22px 13px" : "0",
      }}
    >
      {open && (
        <>
          <button className="fw-newchat" onClick={onNewChat}>
            <Plus size={13} /> New Chat
          </button>

          <div
            style={{
              fontSize:      10,
              fontWeight:    600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color:         "#2e3e55",
              marginBottom:  9,
              paddingLeft:   4,
            }}
          >
            Sessions
          </div>

          {sessions.length === 0 && (
            <div style={{ fontSize: 12, color: "#2e3e55", paddingLeft: 4, marginTop: 6, lineHeight: 1.6 }}>
              No sessions yet.
            </div>
          )}

          {sessions.map(s => (
            <SessionRow
              key={s.id}
              session={s}
              active={s.id === activeId}
              onSelect={() => onSelect(s)}
              onDelete={onDelete}
            />
          ))}

          {sessions.length >= 10 && (
            <div style={{ fontSize: 10.5, color: "#2e3e55", paddingLeft: 4, marginTop: 10, lineHeight: 1.6 }}>
              Max 10 sessions. Oldest removed automatically.
            </div>
          )}
        </>
      )}
    </aside>
  )
}
