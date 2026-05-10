import { Sparkles } from "lucide-react"
import { FeatureCardGrid } from "./FeatureCards"
import { PromptChips }     from "./PromptChips"

/**
 * EmptyState
 *
 * Shown when the current session has no messages.
 * Contains: greeting block, FeatureCardGrid, PromptChips.
 *
 * Props:
 *   onSelect  (triggerId: string | null, prompt: string) => void
 *             — called with (cardId, prompt) for feature cards
 *             — called with (null, prompt) for prompt chips
 *   disabled  boolean — true while thinking
 */
export function EmptyState({ onSelect, disabled }) {
  return (
    <div style={{ animation: "fadeSlide 0.3s ease forwards" }}>

      {/* ── Greeting ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 38 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 15 }}>
          <div
            style={{
              width:        46,
              height:       46,
              borderRadius: 13,
              flexShrink:   0,
              background:   "rgba(0,230,118,0.11)",
              border:       "1px solid rgba(0,230,118,0.26)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              boxShadow:    "0 0 28px rgba(0,230,118,0.13)",
            }}
          >
            <Sparkles size={19} color="#00e676" />
          </div>

          <div>
            <div
              style={{
                fontFamily:    "'Syne', sans-serif",
                fontSize:      17,
                fontWeight:    700,
                color:         "#f0f4ff",
                lineHeight:    1.2,
                letterSpacing: "-0.01em",
              }}
            >
              FinWise AI
            </div>
            <div style={{ fontSize: 11.5, color: "#3a5070", marginTop: 3 }}>
              Full context of your accounts
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize:   13.5,
            color:      "#6a7e98",
            lineHeight: 1.78,
            maxWidth:   530,
          }}
        >
          Ask me anything about your finances — spending patterns, budget gaps,
          net worth trends, or what-if scenarios. Your data is loaded and ready.
        </p>
      </div>

      {/* ── Feature cards ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 30 }}>
        <FeatureCardGrid
          onSelect={(cardId, prompt) => onSelect(cardId, prompt)}
          disabled={disabled}
        />
      </div>

      {/* ── Prompt chips ──────────────────────────────────────────── */}
      <PromptChips onSelect={prompt => onSelect(null, prompt)} />
    </div>
  )
}
