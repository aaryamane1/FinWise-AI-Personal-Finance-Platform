import { ChevronRight } from "lucide-react"
import { FEATURE_CARDS } from "../constants/featureCards"

/**
 * FeatureCardGrid
 *
 * Three large clickable cards shown in the empty / welcome state.
 * Each card runs a pre-defined analysis prompt when clicked.
 *
 * Props:
 *   onSelect  (cardId: string, prompt: string) => void
 *   disabled  boolean — true while the assistant is thinking
 */
export function FeatureCardGrid({ onSelect, disabled }) {
  return (
    <div>
      <div
        style={{
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color:         "#2e3e55",
          marginBottom:  13,
        }}
      >
        Quick Analysis
      </div>

      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap:                 14,
        }}
      >
        {FEATURE_CARDS.map((card, i) => (
          <FeatureCard
            key={card.id}
            card={card}
            animDelay={i * 0.08}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ card, animDelay, disabled, onSelect }) {
  const { Icon } = card

  function handleMouseEnter(e) {
    if (disabled) return
    e.currentTarget.style.borderColor = card.borderCol
    e.currentTarget.style.boxShadow   = `0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px ${card.borderCol}`
    e.currentTarget.style.background  = "#192235"
    e.currentTarget.style.transform   = "translateY(-3px)"
  }

  function handleMouseLeave(e) {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"
    e.currentTarget.style.boxShadow   = ""
    e.currentTarget.style.background  = "#141d2e"
    e.currentTarget.style.transform   = ""
  }

  return (
    <button
      className="fw-card"
      disabled={disabled}
      onClick={() => onSelect(card.id, card.prompt)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        animation: `cardReveal 0.32s ease ${animDelay}s both`,
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width:        36,
          height:       36,
          borderRadius: 9,
          marginBottom: 14,
          background:   card.dimBg,
          border:       `1px solid ${card.borderCol}`,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color={card.accent} />
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily:    "'Syne', sans-serif",
          fontSize:      13.5,
          fontWeight:    700,
          color:         "#f0f4ff",
          marginBottom:  6,
          letterSpacing: "-0.01em",
        }}
      >
        {card.label}
      </div>

      {/* Description */}
      <div style={{ fontSize: 11.5, color: "#4a5e74", lineHeight: 1.55 }}>
        {card.sub}
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop:  13,
          display:    "flex",
          alignItems: "center",
          gap:        5,
          fontSize:   11.5,
          color:      card.accent,
          fontWeight: 500,
        }}
      >
        Run analysis <ChevronRight size={10} />
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------

/**
 * FeaturePillRow
 *
 * Compact pill version of the feature cards — rendered above the message list
 * once a conversation is active so the user can still trigger analyses.
 *
 * Props:
 *   onSelect  (cardId: string, prompt: string) => void
 *   disabled  boolean
 */
export function FeaturePillRow({ onSelect, disabled }) {
  return (
    <div
      style={{
        display:      "flex",
        flexWrap:     "wrap",
        gap:          7,
        marginBottom: 22,
        paddingBottom: 18,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {FEATURE_CARDS.map(card => (
        <button
          key={card.id}
          className="fw-pill"
          disabled={disabled}
          onClick={() => onSelect(card.id, card.prompt)}
          onMouseEnter={e => {
            if (!disabled) {
              e.currentTarget.style.color       = card.accent
              e.currentTarget.style.borderColor = card.borderCol
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color       = "#8899b4"
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"
          }}
        >
          <card.Icon size={11} color={card.accent} />
          {card.label}
        </button>
      ))}
    </div>
  )
}
