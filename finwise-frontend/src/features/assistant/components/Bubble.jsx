import { Bot, User, Sparkles } from "lucide-react"
import { useTypewriter } from "../hooks/useTypewriter"
import { MarkdownRenderer } from "../utils/markdownRenderer"
import { FEATURE_CARDS } from "../constants/featureCards"

/**
 * Bubble
 *
 * Renders a single chat message — either user (right-aligned) or AI (left-aligned).
 * AI messages for the latest response are animated via useTypewriter.
 * Historical messages render instantly.
 *
 * Props:
 *   msg           { role, content, id, triggeredBy? }
 *   animateTyping boolean — true only for the most recently received AI message
 */
export function Bubble({ msg, animateTyping }) {
  const isAI    = msg.role === "assistant"
  const content = useTypewriter(msg.content, isAI && animateTyping)

  return (
    <div className={`bubble-container ${isAI ? "ai" : "user"}`}>
      {/* ── Avatar ──────────────────────────────────────────────────── */}
      <div className={`bubble-avatar ${isAI ? "ai" : "user"}`}>
        {isAI
          ? <Bot  size={15} color="#00e676" />
          : <User size={15} color="#448aff" />
        }
      </div>

      {/* ── Bubble body ──────────────────────────────────────────────── */}
      <div className={`bubble-content ${isAI ? "ai" : "user"}`}>
        {/* Noise texture */}
        <div className="noise-overlay" />

        {/* Top-edge shimmer */}
        <div className="top-shimmer" />

        {/* Content */}
        {isAI
          ? <MarkdownRenderer text={content} />
          : (
            <div className="user-content">
              {msg.content}
            </div>
          )
        }

        {/* Trigger attribution badge */}
        {msg.triggeredBy && (
          <div className="trigger-badge">
            <Sparkles size={10} color="#00e676" />
            {FEATURE_CARDS.find(c => c.id === msg.triggeredBy)?.label ?? msg.triggeredBy}
          </div>
        )}
      </div>
    </div>
  )
}
