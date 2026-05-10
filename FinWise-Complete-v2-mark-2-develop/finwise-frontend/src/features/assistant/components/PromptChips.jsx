import { EXAMPLE_PROMPTS } from "../constants/featureCards"

/**
 * PromptChips
 *
 * Clickable pill buttons showing example questions in the empty state.
 * Clicking a chip fires it as a user message directly.
 *
 * Props:
 *   onSelect  (prompt: string) => void
 */
export function PromptChips({ onSelect }) {
  return (
    <div>
      <div
        style={{
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color:         "#2e3e55",
          marginBottom:  11,
        }}
      >
        Or ask anything
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {EXAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            className="fw-prompt-chip"
            onClick={() => onSelect(prompt)}
            style={{
              animation: `cardReveal 0.28s ease ${0.22 + i * 0.05}s both`,
              opacity:   0,            // overridden by animation fill
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
