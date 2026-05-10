import { TrendingUp, PieChart, AlertTriangle } from "lucide-react"

/**
 * FEATURE_CARDS
 * Each entry drives both the EmptyState grid card and the compact pill row
 * that appears once a conversation is active.
 *
 * On backend integration:
 *   - `prompt` is sent as the user message to /api/v1/assistant/chat
 *   - `id`     is sent as the `trigger` field so the backend can use
 *              a specialised system prompt for structured analysis
 */
export const FEATURE_CARDS = [
  {
    id:        "monthly_summary",
    Icon:      TrendingUp,
    label:     "Monthly Summary",
    sub:       "Full breakdown of income, expenses & savings this month",
    accent:    "#00e676",
    dimBg:     "rgba(0,230,118,0.08)",
    borderCol: "rgba(0,230,118,0.22)",
    prompt:    "Give me a detailed summary of my financial activity this month. Include income, expenses, savings rate, and any notable patterns.",
  },
  {
    id:        "budget_suggestions",
    Icon:      PieChart,
    label:     "Smart Budgeting",
    sub:       "AI-optimized budget allocation based on your spending history",
    accent:    "#40c4ff",
    dimBg:     "rgba(64,196,255,0.08)",
    borderCol: "rgba(64,196,255,0.22)",
    prompt:    "Analyze my spending patterns and suggest an optimized zero-based budget for next month with reasoning.",
  },
  {
    id:        "spending_anomalies",
    Icon:      AlertTriangle,
    label:     "Anomaly Report",
    sub:       "Detect unusual transactions that fall outside your norms",
    accent:    "#ffab40",
    dimBg:     "rgba(255,171,64,0.08)",
    borderCol: "rgba(255,171,64,0.22)",
    prompt:    "Review my recent transactions and identify any unusual or unexpected spending patterns compared to my history.",
  },
]

/** Example prompts shown as chips in the empty state */
export const EXAMPLE_PROMPTS = [
  "How much did I spend on food this month?",
  "What's my debt-to-income ratio?",
  "Which subscription should I cancel?",
  "Compare this month vs last month",
  "Am I saving enough?",
]
