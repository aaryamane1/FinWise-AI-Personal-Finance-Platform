import { useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"

/**
 * AssistantFAB
 *
 * Floating action button that provides quick access to the AI Assistant.
 * Appears in the bottom-right corner of the screen on all dashboard pages.
 * Pulses gently to draw attention without being distracting.
 */
export default function AssistantFAB() {
  const navigate = useNavigate()

  return (
    <button
      className="assistant-fab"
      onClick={() => navigate("/assistant")}
      aria-label="Open AI Assistant"
      title="Ask AI Assistant"
    >
      <Sparkles size={18} color="#00e676" />
    </button>
  )
}
