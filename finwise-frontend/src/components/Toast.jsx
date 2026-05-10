import { useEffect } from "react"
import { X, CheckCircle, AlertCircle } from "lucide-react"

export default function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [message])

  const isSuccess = type === "success"
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      background: isSuccess ? "rgba(0,230,118,0.12)" : "rgba(255,82,82,0.12)",
      border: `1px solid ${isSuccess ? "rgba(0,230,118,0.35)" : "rgba(255,82,82,0.35)"}`,
      borderRadius: 10, padding: "12px 16px", minWidth: 280, maxWidth: 380,
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      animation: "slideIn 0.2s ease",
      // Prevent toast from intercepting clicks on elements underneath
      pointerEvents: "none",
    }}>
      {isSuccess
        ? <CheckCircle size={16} color="#00e676" style={{ flexShrink: 0 }} />
        : <AlertCircle  size={16} color="#ff5252" style={{ flexShrink: 0 }} />
      }
      <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4 }}>
        {message}
      </span>
      {/* Re-enable pointer events on the close button only */}
      <button onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-secondary)", padding: 2, display: "flex",
        pointerEvents: "auto",
      }}>
        <X size={14} />
      </button>
    </div>
  )
}
