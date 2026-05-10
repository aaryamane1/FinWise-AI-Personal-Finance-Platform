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
    <div
      style={{
        display:       "flex",
        gap:           11,
        flexDirection: isAI ? "row" : "row-reverse",
        alignItems:    "flex-start",
        marginBottom:  20,
        animation:     "bubbleIn 0.22s ease forwards",
      }}
    >
      {/* ── Avatar ──────────────────────────────────────────────────── */}
      <div
        style={{
          width:      32,
          height:     32,
          borderRadius: 9,
          flexShrink: 0,
          display:    "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isAI ? "rgba(0,230,118,0.14)" : "rgba(68,138,255,0.14)",
          border:     `1px solid ${isAI ? "rgba(0,230,118,0.32)" : "rgba(68,138,255,0.32)"}`,
          boxShadow:  isAI
            ? "0 0 14px rgba(0,230,118,0.10)"
            : "0 0 14px rgba(68,138,255,0.10)",
        }}
      >
        {isAI
          ? <Bot  size={15} color="#00e676" />
          : <User size={15} color="#448aff" />
        }
      </div>

      {/* ── Bubble body ──────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth:     "76%",
          padding:      "14px 18px",
          borderRadius: isAI ? "3px 14px 14px 14px" : "14px 3px 14px 14px",
          background:   isAI
            ? "linear-gradient(145deg, #1c2840 0%, #141d2e 100%)"
            : "linear-gradient(145deg, #152038 0%, #0f1a30 100%)",
          border:       `1px solid ${isAI ? "rgba(255,255,255,0.10)" : "rgba(68,138,255,0.18)"}`,
          boxShadow:    "0 6px 24px rgba(0,0,0,0.40)",
          position:     "relative",
          overflow:     "hidden",
        }}
      >
        {/* Noise texture */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            opacity:    0.022,
            pointerEvents: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top-edge shimmer */}
        <div
          style={{
            position:   "absolute",
            top:        0,
            left:       0,
            right:      0,
            height:     1,
            background: isAI
              ? "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)"
              : "linear-gradient(90deg,transparent,rgba(68,138,255,0.15),transparent)",
          }}
        />

        {/* Content */}
        {isAI
          ? <MarkdownRenderer text={content} />
          : (
            <div style={{ fontSize: 13, lineHeight: 1.7, color: "#d8e8ff" }}>
              {msg.content}
            </div>
          )
        }

        {/* Trigger attribution badge */}
        {msg.triggeredBy && (
          <div
            style={{
              marginTop:    11,
              paddingTop:   9,
              borderTop:    "1px solid rgba(255,255,255,0.07)",
              display:      "flex",
              alignItems:   "center",
              gap:          5,
              fontSize:     11,
              color:        "#3a5070",
            }}
          >
            <Sparkles size={10} color="#00e676" />
            {FEATURE_CARDS.find(c => c.id === msg.triggeredBy)?.label ?? msg.triggeredBy}
          </div>
        )}
      </div>
    </div>
  )
}
