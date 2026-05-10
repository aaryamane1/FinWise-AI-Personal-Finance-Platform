import { useState, useMemo } from "react"
import { Plus, Trash2, AlertCircle, Calculator, Edit2, BarChart2 } from "lucide-react"
import Modal from "../components/Modal"
import { useFinance } from "../context/FinanceContext"

const BAR_COLORS = ["#448aff","#00e676","#ffab40","#b388ff","#ff5252","#40c4ff","#ff80ab","#64ffda"]

const FREQ_OPTIONS = ["Weekly", "Monthly", "Yearly"]

// Normalize any budget amount to a monthly equivalent
function toMonthly(amount, freq) {
  const n = parseFloat(amount) || 0
  if (freq === "Weekly")  return n * (52 / 12)   // ≈ 4.333 weeks/month
  if (freq === "Yearly")  return n / 12
  return n                                        // Monthly — no change
}

function freqLabel(freq) {
  if (freq === "Weekly")  return "/wk → /mo"
  if (freq === "Yearly")  return "/yr → /mo"
  return "/mo"
}

const DEMO_BUDGET = [
  { id: 1, category: "Housing",       budget: 1200, spent: 1200, color: "#448aff" },
  { id: 2, category: "Food",          budget: 400,  spent: 320,  color: "#00e676" },
  { id: 3, category: "Transport",     budget: 200,  spent: 180,  color: "#ffab40" },
  { id: 4, category: "Subscriptions", budget: 100,  spent: 87,   color: "#b388ff" },
  { id: 5, category: "Entertainment", budget: 200,  spent: 150,  color: "#ff5252" },
  { id: 6, category: "Health",        budget: 150,  spent: 95,   color: "#40c4ff" },
]

function BudgetCard({ item, isDemo, onDelete, onEdit }) {
  const { formatCurrency } = useFinance()
  const budget = item.budget ?? item.budget_amount ?? 0
  const spent  = item.spent  ?? 0
  const pct    = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0
  const left   = budget - spent
  const over   = spent > budget
  const color  = pct >= 100 ? "#ff5252" : pct >= 80 ? "#ffab40" : item.color || "#00e676"

  return (
    <div className="card" style={{ borderColor: over ? "rgba(255,82,82,0.3)" : "var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600 }}>
          {item.category ?? item.category_name ?? "Category"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`badge ${pct >= 100 ? "badge-red" : pct >= 80 ? "badge-amber" : "badge-green"}`}>
            {pct}%
          </span>
          {!isDemo && (
            <>
              <button className="btn-icon" onClick={() => onEdit(item)}>
                <Edit2 size={12} />
              </button>
              <button className="btn-danger" onClick={() => onDelete(item.id)}>
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="progress-wrap" style={{ marginBottom: 10 }}>
        <div className="progress-bar" style={{ width: pct + "%", background: color }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
        <span>Spent: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(spent)}</strong></span>
        <span>Budget: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(budget)}</strong></span>
        <span style={{ color: over ? "var(--red)" : "var(--green)" }}>
          {over ? `${formatCurrency(Math.abs(left))} over` : `${formatCurrency(left)} left`}
        </span>
      </div>
    </div>
  )
}

export default function BudgetPlanner() {
  const { budgets = [], transactions = [], monthlyIncome, addBudgetCategory, deleteBudgetCategory, updateBudgetCategory, loading, formatCurrency, currencySymbol } = useFinance()

  const [showModal,     setShowModal]     = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [form, setForm] = useState({ category: "", budget: "", frequency: "Monthly" })

  const normalizedBudgets = budgets.map((b, i) => ({
    id:       b.id,
    category: b.category_name || b.category || `Category ${b.id}`,
    budget:   b.budget_amount ?? b.budget ?? 0,
    spent:    b.spent ?? 0,
    color:    BAR_COLORS[i % BAR_COLORS.length],
  }))

  const isDemo        = normalizedBudgets.length === 0
  const displayItems  = isDemo ? DEMO_BUDGET : normalizedBudgets
  const income        = monthlyIncome || 4500
  const totalBudgeted = displayItems.reduce((s, b) => s + (b.budget ?? 0), 0)
  const totalSpent    = displayItems.reduce((s, b) => s + (b.spent  ?? 0), 0)
  const unallocated   = income - totalBudgeted
  const remainingBudget = totalBudgeted - totalSpent
  const overallUtilization = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0

  // Find expenses that don't match any budget category
  const budgetCategoryNames = new Set(displayItems.map(b => b.category.toLowerCase()))
  const uncategorizedTotal = useMemo(() => {
    if (isDemo) return 0
    return transactions
      .filter(tx => tx.type === "expense" && !budgetCategoryNames.has((tx.category || "").toLowerCase()))
      .reduce((s, tx) => s + (tx.amount || 0), 0)
  }, [transactions, budgetCategoryNames, isDemo])

  async function handleAdd() {
    if (!form.category || !form.budget) return
    setSaving(true)
    const monthlyAmount = toMonthly(parseFloat(form.budget), form.frequency)
    await addBudgetCategory({ category: form.category, budget: monthlyAmount })
    setSaving(false)
    setShowModal(false)
    setForm({ category: "", budget: "", frequency: "Monthly" })
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="eyebrow">Zero-based budgeting</div>
          <h1>Budget Planner</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Category
          </button>
        </div>
      </div>

      {isDemo && !loading && (
        <div className="alert-bar" style={{ marginBottom: 16 }}>
          <Calculator size={15} />
          Showing sample data — click <strong style={{ margin: "0 4px" }}>+ Add Category</strong> to create your real budget
        </div>
      )}

      {/* Summary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16 }}>
        {[
          { label: "Monthly Income",  val: formatCurrency(income),                color: "var(--green)" },
          { label: "Total Budgeted",  val: formatCurrency(totalBudgeted),         color: "var(--blue)"  },
          { label: "Total Spent",     val: formatCurrency(totalSpent),            color: "var(--red)"   },
          { label: "Unallocated",     val: formatCurrency(Math.abs(unallocated)), color: "var(--amber)" },
        ].map(({ label, val, color }) => (
          <div key={label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Budget utilization summary bar */}
      {!isDemo && (
        <div className="card" style={{ marginBottom: 16, padding: "14px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={15} color="var(--text-secondary)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Overall Budget Utilization</span>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 12, color: "var(--text-secondary)" }}>
              <span>Spent: <strong style={{ color: "var(--red)" }}>{formatCurrency(totalSpent)}</strong></span>
              <span>Remaining: <strong style={{ color: remainingBudget >= 0 ? "var(--green)" : "var(--red)" }}>
                {formatCurrency(remainingBudget)}
              </strong></span>
              <span>Utilization: <strong style={{ color: overallUtilization >= 100 ? "var(--red)" : overallUtilization >= 80 ? "var(--amber)" : "var(--green)" }}>
                {overallUtilization}%
              </strong></span>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-bar" style={{
              width: Math.min(overallUtilization, 100) + "%",
              background: overallUtilization >= 100 ? "#ff5252" : overallUtilization >= 80 ? "#ffab40" : "#00e676"
            }} />
          </div>
        </div>
      )}

      {unallocated > 0 && (
        <div className="alert-bar" style={{ marginBottom: 12 }}>
          <AlertCircle size={15} />
          You have <strong style={{ margin: "0 4px" }}>{formatCurrency(unallocated)}</strong> left to allocate
          &nbsp;— Income − Budgeted = {formatCurrency(income)} − {formatCurrency(totalBudgeted)} = {formatCurrency(unallocated)}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--text-secondary)", padding: "40px", textAlign: "center" }}>Loading budgets...</div>
      ) : (
        <div className="grid-2" style={{ marginTop: 8 }}>
          {displayItems.map(item => (
            <BudgetCard
              key={item.id} item={item}
              isDemo={isDemo}
              onDelete={deleteBudgetCategory}
              onEdit={setEditingBudget}
            />
          ))}
          {/* Uncategorized bucket */}
          {!isDemo && uncategorizedTotal > 0 && (
            <div className="card" style={{ borderColor: "rgba(158,158,158,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>
                  📦 Uncategorized
                </span>
                <span className="badge badge-amber">No Budget</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(uncategorizedTotal)}</strong> in expenses with no matching budget category.
                Consider adding budget categories for these expenses.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <Modal title="Add Budget Category" onClose={() => setShowModal(false)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Category Name</label>
              <input className="input-field" placeholder="e.g. Dining Out" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Amount ({currencySymbol})</label>
              <input className="input-field" type="number" placeholder="0" value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Frequency</label>
              <select className="input-field" value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            {form.budget && form.frequency !== "Monthly" && (
              <div className="input-group span-2" style={{ background: "rgba(68,138,255,0.07)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Normalized to <strong style={{ color: "var(--blue)" }}>
                    {formatCurrency(toMonthly(form.budget, form.frequency))}/month
                  </strong>{" "}
                  ({form.frequency === "Weekly"
                    ? `${formatCurrency(parseFloat(form.budget))}/wk × 52 ÷ 12`
                    : `${formatCurrency(parseFloat(form.budget))}/yr ÷ 12`})
                </div>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !form.category || !form.budget}>
              {saving ? "Saving..." : "Add Category"}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <Modal title="Edit Budget" onClose={() => setEditingBudget(null)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Category</label>
              <input className="input-field" value={editingBudget.category} disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }} />
            </div>
            <div className="input-group span-2">
              <label>Budget Amount ({currencySymbol}/month)</label>
              <input className="input-field" type="number" value={editingBudget.budget}
                onChange={e => setEditingBudget(b => ({ ...b, budget: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setEditingBudget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => {
              updateBudgetCategory(editingBudget.id, editingBudget)
              setEditingBudget(null)
            }}>Save Changes</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
