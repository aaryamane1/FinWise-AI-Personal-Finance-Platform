import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Trash2, Plus, Edit2 } from "lucide-react"
import Modal from "../components/Modal"
import { useFinance } from "../context/FinanceContext"

const ASSET_COLORS = ["#b388ff", "#448aff", "#ffab40", "#00e676", "#40c4ff", "#ff80ab"]
const ASSET_TYPES  = ["Savings", "Stocks", "Crypto", "Property", "Other"]
const ASSET_ICONS  = { Savings: "🏦", Stocks: "📈", Crypto: "₿", Property: "🏠", Other: "💼" }

export default function NetWorth() {
  const {
    assets, liabilities, totalAssets, totalLiabilities, netWorth, monthlyIncome, updateMonthlyIncome,
    addAsset, deleteAsset, updateAsset,
    addLiability, deleteLiability, updateLiability, formatCurrency, currencySymbol
  } = useFinance()

  const [showAssetModal,     setShowAssetModal]     = useState(false)
  const [showDebtModal,      setShowDebtModal]       = useState(false)
  const [showIncomeModal,    setShowIncomeModal]     = useState(false)
  const [editingAsset,       setEditingAsset]        = useState(null)
  const [editingLiability,   setEditingLiability]    = useState(null)
  const [assetForm,  setAssetForm]  = useState({ name: "", type: "Savings", value: "" })
  const [debtForm,   setDebtForm]   = useState({ name: "", apr: "", amount: "" })
  const [incomeForm, setIncomeForm] = useState(monthlyIncome || "")

  function handleAddAsset() {
    if (!assetForm.name || !assetForm.value) return
    addAsset({ ...assetForm, value: parseFloat(assetForm.value) })
    setShowAssetModal(false)
    setAssetForm({ name: "", type: "Savings", value: "" })
  }

  function handleAddDebt() {
    if (!debtForm.name || !debtForm.amount) return
    addLiability({
      ...debtForm,
      amount: parseFloat(debtForm.amount),
      interest_rate: parseFloat(String(debtForm.apr).replace("%", "")) || 0,
    })
    setShowDebtModal(false)
    setDebtForm({ name: "", apr: "", amount: "" })
  }

  const pieData = assets.map((a, i) => ({
    name: a.name, value: a.value, color: ASSET_COLORS[i % ASSET_COLORS.length]
  }))

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="eyebrow">Track your wealth</div>
          <h1>Net Worth</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-outline" onClick={() => setShowDebtModal(true)}>
            <Plus size={14} /> Add Debt
          </button>
          <button className="btn btn-primary" onClick={() => setShowAssetModal(true)}>
            <Plus size={14} /> Add Asset
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>What you own</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Total Assets</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--green)" }}>
            {formatCurrency(totalAssets)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>What you owe</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Total Liabilities</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--red)" }}>
            {formatCurrency(totalLiabilities)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Your wealth</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Net Worth</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: netWorth < 0 ? "var(--red)" : "var(--green)" }}>
            {formatCurrency(netWorth)}
          </div>
        </div>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Your Earnings</div>
            <button className="btn-icon" onClick={() => { setIncomeForm(monthlyIncome || ""); setShowIncomeModal(true); }}>
              <Edit2 size={12} />
            </button>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Monthly Income</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--green)" }}>
            {formatCurrency(monthlyIncome)}
          </div>
        </div>
      </div>

      {/* Negative net worth warning */}
      {netWorth < 0 && (
        <div className="alert-bar danger" style={{ marginBottom: 16 }}>
          ⚠️ Your liabilities exceed your assets. Net Worth is{" "}
          <strong>{formatCurrency(netWorth)}</strong>. Focus on
          paying down debt to restore positive net worth.
        </div>
      )}

      <div className="grid-2">
        {/* Asset Allocation Pie */}
        <div className="chart-card">
          <div className="chart-title">◈ Asset Allocation</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" paddingAngle={3}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          {pieData.length === 0 && (
            <div style={{textAlign:"center",fontSize:12,color:"var(--text-secondary)",marginTop:8}}>Add assets to see allocation</div>
          )}
          <div className="legend-list">
            {pieData.map((d, i) => (
              <div key={i} className="legend-item">
                <div className="legend-label">
                  <span className="dot" style={{ background: d.color }} />{d.name}
                </div>
                <div className="legend-val">{formatCurrency(d.value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Assets */}
          <div className="chart-card" style={{ flex: 1 }}>
            <div className="chart-title" style={{ color: "var(--green)" }}>
              <TrendingUp size={15} /> Assets
            </div>
            {assets.length === 0 && <div className="empty">No assets yet — add one above</div>}
            {assets.map((a) => (
              <div key={a.id} className="tx-item">
                <div className="tx-icon" style={{ background: "rgba(0,230,118,0.08)", fontSize: 17 }}>
                  {ASSET_ICONS[a.type] || "💼"}
                </div>
                <div className="tx-info">
                  <div className="tx-name">{a.name}</div>
                  <div className="tx-sub">{a.type}</div>
                </div>
                <span className="tx-amount income">{formatCurrency(a.value)}</span>
                <button className="btn-icon" onClick={() => setEditingAsset({ ...a })} style={{ marginLeft: 6 }}>
                  <Edit2 size={12} />
                </button>
                <button className="btn-danger" onClick={() => deleteAsset(a.id)} style={{ marginLeft: 4 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Liabilities */}
          <div className="chart-card" style={{ flex: 1 }}>
            <div className="chart-title" style={{ color: "var(--red)" }}>
              <TrendingDown size={15} /> Liabilities
            </div>
            {liabilities.length === 0 && <div className="empty">No liabilities yet</div>}
            {liabilities.map((l) => {
              // Monthly interest = Principal × (APR% / 100 / 12)
              const monthlyInterest = l.amount * (parseFloat(l.interest_rate || 0) / 100 / 12)
              return (
              <div key={l.id} className="tx-item">
                <div className="tx-icon" style={{ background: "rgba(255,82,82,0.08)", fontSize: 17 }}>
                  💳
                </div>
                <div className="tx-info">
                  <div className="tx-name">{l.name}</div>
                  <div className="tx-sub">
                    {l.interest_rate}% APR
                    {monthlyInterest > 0 && (
                      <span style={{ marginLeft: 8, color: "var(--red)", fontSize: 10 }}>
                        → {formatCurrency(monthlyInterest)}/mo interest
                      </span>
                    )}
                  </div>
                </div>
                <span className="tx-amount expense">-{formatCurrency(l.amount)}</span>
                <button className="btn-icon" onClick={() => setEditingLiability({ ...l })} style={{ marginLeft: 6 }}>
                  <Edit2 size={12} />
                </button>
                <button className="btn-danger" onClick={() => deleteLiability(l.id)} style={{ marginLeft: 4 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAssetModal && (
        <Modal title="Add Asset" onClose={() => setShowAssetModal(false)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Asset Name</label>
              <input className="input-field" placeholder="e.g. Savings Account" value={assetForm.name}
                onChange={e => setAssetForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Type</label>
              <select className="input-field" value={assetForm.type}
                onChange={e => setAssetForm(f => ({ ...f, type: e.target.value }))}>
                {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Value ({currencySymbol})</label>
              <input className="input-field" type="number" placeholder="0" value={assetForm.value}
                onChange={e => setAssetForm(f => ({ ...f, value: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setShowAssetModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddAsset} disabled={!assetForm.name || !assetForm.value}>Add Asset</button>
          </div>
        </Modal>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <Modal title="Edit Asset" onClose={() => setEditingAsset(null)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Asset Name</label>
              <input className="input-field" value={editingAsset.name}
                onChange={e => setEditingAsset(a => ({ ...a, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Type</label>
              <select className="input-field" value={editingAsset.type}
                onChange={e => setEditingAsset(a => ({ ...a, type: e.target.value }))}>
                {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Value ({currencySymbol})</label>
              <input className="input-field" type="number" value={editingAsset.value}
                onChange={e => setEditingAsset(a => ({ ...a, value: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setEditingAsset(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { updateAsset(editingAsset.id, editingAsset); setEditingAsset(null) }}>
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Add Debt Modal */}
      {showDebtModal && (
        <Modal title="Add Liability" onClose={() => setShowDebtModal(false)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Liability Name</label>
              <input className="input-field" placeholder="e.g. Student Loan" value={debtForm.name}
                onChange={e => setDebtForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Amount ({currencySymbol})</label>
              <input className="input-field" type="number" placeholder="0" value={debtForm.amount}
                onChange={e => setDebtForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>APR (%)</label>
              <input className="input-field" type="text" placeholder="e.g. 4.5" value={debtForm.apr}
                onChange={e => setDebtForm(f => ({ ...f, apr: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setShowDebtModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddDebt} disabled={!debtForm.name || !debtForm.amount}>Add Liability</button>
          </div>
        </Modal>
      )}

      {/* Edit Liability Modal */}
      {editingLiability && (
        <Modal title="Edit Liability" onClose={() => setEditingLiability(null)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Liability Name</label>
              <input className="input-field" value={editingLiability.name}
                onChange={e => setEditingLiability(l => ({ ...l, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Amount ({currencySymbol})</label>
              <input className="input-field" type="number" value={editingLiability.amount}
                onChange={e => setEditingLiability(l => ({ ...l, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>APR (%)</label>
              <input className="input-field" type="text" value={editingLiability.interest_rate}
                onChange={e => setEditingLiability(l => ({ ...l, interest_rate: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setEditingLiability(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { updateLiability(editingLiability.id, editingLiability); setEditingLiability(null) }}>
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Update Income Modal */}
      {showIncomeModal && (
        <Modal title="Update Monthly Income" onClose={() => setShowIncomeModal(false)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Monthly Income ({currencySymbol})</label>
              <input className="input-field" type="number" placeholder="e.g. 5000" value={incomeForm}
                onChange={e => setIncomeForm(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setShowIncomeModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { updateMonthlyIncome(incomeForm); setShowIncomeModal(false); }} disabled={!incomeForm || Number(incomeForm) < 0}>
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
