import { TrendingUp, PieChart, AlertTriangle } from "lucide-react"

/**
 * featureCards.js
 *
 * Shared constants for the AI assistant feature.
 * Defines the quick analysis cards and example prompts.
 */

export const FEATURE_CARDS = [
  {
    id:      "monthly_summary",
    label:   "Monthly Summary",
    sub:     "Income, expenses, and key changes",
    prompt:  "Give me a summary of my finances for this month",
    Icon:    TrendingUp,
    accent:  "#00e676",
    dimBg:   "rgba(0,230,118,0.08)",
    borderCol: "rgba(0,230,118,0.28)",
  },
  {
    id:      "budget_suggestions",
    label:   "Budget Suggestions",
    sub:     "Optimize your spending limits",
    prompt:  "Analyze my spending and suggest budget improvements",
    Icon:    PieChart,
    accent:  "#448aff",
    dimBg:   "rgba(68,138,255,0.08)",
    borderCol: "rgba(68,138,255,0.28)",
  },
  {
    id:      "spending_anomalies",
    label:   "Spending Anomalies",
    sub:     "Detect unusual transactions",
    prompt:  "Find any unusual or anomalous spending in my transactions",
    Icon:    AlertTriangle,
    accent:  "#ffab40",
    dimBg:   "rgba(255,171,64,0.08)",
    borderCol: "rgba(255,171,64,0.28)",
  },
]

export const EXAMPLE_PROMPTS = [
  "How much did I spend on dining this month?",
  "What's my savings rate compared to last month?",
  "Am I on track with my annual financial goals?",
]
