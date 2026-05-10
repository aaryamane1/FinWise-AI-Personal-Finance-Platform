import { useState } from "react"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"
import { Plus } from "lucide-react"
import TransactionItem from "../components/TransactionItem"
import Modal from "../components/Modal"
import { useFinance } from "../context/FinanceContext"

import iconFood from "../assets/icons/category-icons/cat-food.svg"
import iconSubscriptions from "../assets/icons/category-icons/cat-subscriptions.svg"
import iconIncome from "../assets/icons/category-icons/cat-income.svg"
import iconTransport from "../assets/icons/category-icons/cat-transport.svg"
import iconHealth from "../assets/icons/category-icons/cat-health.svg"
import iconHousing from "../assets/icons/category-icons/cat-housing.svg"
import iconEntertainment from "../assets/icons/category-icons/cat-entertainment.svg"
import iconOther from "../assets/icons/category-icons/cat-property.svg"

const CATS = ["All", "Food", "Subscriptions", "Income", "Transport", "Health", "Entertainment", "Housing", "Shopping", "Utilities", "Investments"]
const CATEGORY_ICONS = {
  Food: iconFood,
  Subscriptions: iconSubscriptions,
  Income: iconIncome,
  Transport: iconTransport,
  Health: iconHealth,
  Housing: iconHousing,
  Entertainment: iconEntertainment,
  Other: iconOther,
  income: iconIncome,
  expense: iconOther
}

export default function Expenses() {
  const { transactions, addTransaction, deleteTransaction, monthlyTrends, spendingByCategory, formatCurrency, currencySymbol } = useFinance()
  const [activeFilter, setActiveFilter] = useState("All")
  const [showModal, setShowModal]       = useState(false)
  const [saving, setSaving]             = useState(false)
  const [form, setForm] = useState({ name: "", category: "Food", type: "expense", amount: "", date: new Date().toISOString().split("T")[0] })

  const filtered = activeFilter === "All"
    ? transactions
    : transactions.filter(t => t.category === activeFilter)

  async function handleSave() {
    if (!form.name || !form.amount) return
    setSaving(true)
    try {
      await addTransaction({ ...form, amount: parseFloat(form.amount), icon: CATEGORY_ICONS[form.category] || iconOther })
      setShowModal(false)
      setForm({ name: "", category: "Food", type: "expense", amount: "", date: new Date().toISOString().split("T")[0] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="eyebrow">Track daily spending</div>
          <h1>Expenses</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      </div>

      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Monthly Trend — real data */}
        <div className="chart-card">
          <div className="chart-title">⚡ Monthly Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyTrends} barGap={4} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="m" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, true)} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="income"  fill="#00e676" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#ff5252" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {monthlyTrends.length === 0 && (
            <div style={{textAlign:"center",fontSize:12,color:"var(--text-secondary)",marginTop:8}}>Add transactions to see monthly trends</div>
          )}
        </div>

        {/* By Category — real data */}
        <div className="chart-card">
          <div className="chart-title">◈ By Category</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={spendingByCategory} cx="50%" cy="50%" outerRadius={72} dataKey="value" paddingAngle={2}>
                {spendingByCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          {spendingByCategory.length === 0 && (
            <div style={{textAlign:"center",fontSize:12,color:"var(--text-secondary)",marginTop:8}}>No expenses yet</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", marginTop: 8 }}>
            {spendingByCategory.map(s => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span className="dot" style={{ background: s.color }} />
                  <span style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="chart-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>🧾 Transactions</div>
          <div className="filter-tabs">
            {CATS.map(c => (
              <button key={c} className={`filter-tab ${activeFilter === c ? "active" : ""}`}
                onClick={() => setActiveFilter(c)}>{c}</button>
            ))}
          </div>
        </div>
        {filtered.length === 0 && <div className="empty">No transactions found</div>}
        {filtered.map(tx => (
          <TransactionItem key={tx.id} tx={{
            ...tx,
            name: tx.description || tx.category,
            date: tx.date?.split("T")[0] || tx.date,
            icon: CATEGORY_ICONS[tx.category] || (tx.type === "income" ? iconIncome : iconOther),
          }} onDelete={deleteTransaction} />
        ))}
      </div>

      {showModal && (
        <Modal title="Add Transaction" onClose={() => setShowModal(false)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Description</label>
              <input className="input-field" placeholder="e.g. Grocery Store" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Amount ({currencySymbol})</label>
              <input className="input-field" type="number" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Type</label>
              <select className="input-field" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="input-group">
              <label>Category</label>
              <select className="input-field" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {["Food","Transport","Housing","Health","Entertainment","Subscriptions","Income","Other"].map(c =>
                  <option key={c}>{c}</option>
                )}
              </select>
            </div>
            <div className="input-group">
              <label>Date</label>
              <input className="input-field" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.amount}>
              {saving ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
