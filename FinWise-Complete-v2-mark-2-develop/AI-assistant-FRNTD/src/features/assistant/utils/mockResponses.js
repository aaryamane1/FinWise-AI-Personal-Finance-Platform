/**
 * mockResponses.js
 *
 * All mock data lives here.
 * When backend is ready:
 *   1. Delete MOCK_RESPONSES and getMockResponse()
 *   2. Delete MOCK_CONTEXT (replace with live useFinance() values in useAssistant.js)
 *   3. Uncomment the real fetch block in useAssistant.js
 */

// ---------------------------------------------------------------------------
// Context object — shape must match what the backend /assistant/chat expects
// ---------------------------------------------------------------------------
export const MOCK_CONTEXT = {
  monthlyIncome:    4500,
  monthlyExpenses:  2630,
  savingsRate:      41.6,
  netWorth:         42000,
  topCategory:      "Housing",
}

// ---------------------------------------------------------------------------
// Canned responses per trigger type
// ---------------------------------------------------------------------------
const MOCK_RESPONSES = {
  monthly_summary: `**March 2026 — Financial Overview**

Your finances are in strong shape this month. Here's the full picture:

**Income**
Total received: $4,500 (Salary + Freelance)

**Expenses**
Total spent: $2,630 — that's 58.4% of your income

**Top categories by spend:**
— Housing: $1,200 (45.6% of expenses)
— Food: $420 — $20 over your $400 budget
— Transport: $180 — $20 under budget
— Subscriptions: $87

**Savings**
Saved this month: $1,870 — a 41.6% savings rate. The recommended benchmark is 20%, so you're well ahead.

**Net Worth**
Standing at $42,000, up approximately $1,870 from last month.

One thing to watch: your food spending crept $20 over budget. Everything else came in under. Overall, a strong month.`,

  budget_suggestions: `**Suggested Budget — April 2026**

Based on your last 3 months of spending data, here's a rebalanced zero-based allocation:

**Housing — $1,200** (unchanged, consistent)
**Food — $380** (trim $20 from current, achievable based on pattern)
**Transport — $160** (consistently under $200, right-size it)
**Health — $100** (under-utilized at $150)
**Subscriptions — $90** (slight reduction, review unused)
**Entertainment — $120** (under-utilized at $200)
**Savings — $2,450**

That pushes your savings rate to 54.4% — up from 41.6%.

**Why these numbers?**
Your transport and entertainment budgets are 10–40% under-utilized every month. Reallocating that $190 surplus directly into savings makes your budget reflect reality. Food is the only category trending upward — keeping a tighter limit there creates accountability.`,

  spending_anomalies: `**Anomaly Report — Last 30 Days**

I found 2 transactions worth your attention:

⚠️ **Restaurant — $148 on March 14**
Your average per restaurant visit is $48. This charge is 3× your typical spend. Likely a special occasion — but worth confirming it's expected.

⚠️ **Uber — 3 consecutive days (March 4–6)**
$14 + $14 + $12. Your usual pattern is 1–2 rides per week. If this commute pattern continues, a monthly pass could save you $20–30/month.

✅ No suspicious merchant activity detected. All other transactions fall within your normal ranges.

Everything else looks clean. The two flagged items are likely intentional, but I'd recommend reviewing them.`,

  default: `I'm your FinWise AI — I have full context of your transactions, budgets, net worth, loans, and subscriptions.

You can ask me things like:

— "How much did I spend on food this month?"
— "Am I on track to save $10,000 by December?"
— "Which subscription is the least worth it?"
— "What's my debt-to-income ratio?"
— "Compare March vs February spending"

Or tap one of the quick-analysis cards above to run a full report instantly.`,
}

// ---------------------------------------------------------------------------
// Route prompt to the correct canned response
// ---------------------------------------------------------------------------
export function getMockResponse(prompt) {
  const p = prompt.toLowerCase()
  if (p.includes("summary") || p.includes("overview") || p.includes("month"))
    return MOCK_RESPONSES.monthly_summary
  if (p.includes("budget") || p.includes("suggest") || p.includes("allocat"))
    return MOCK_RESPONSES.budget_suggestions
  if (p.includes("anomal") || p.includes("unusual") || p.includes("weird") || p.includes("flag"))
    return MOCK_RESPONSES.spending_anomalies
  return `I understand you're asking: "${prompt}"\n\nIn the live version, I'll query your real transaction history and financial data to give you a precise, personalised answer. Connect the backend to unlock full responses.\n\nFor now, try one of the quick-analysis cards to preview the response format.`
}
