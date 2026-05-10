import { useState } from "react"
import { Link } from "react-router-dom"
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"
import { TrendingUp, DollarSign, ShoppingCart, PiggyBank,
         Activity, Bell, RefreshCw, ChevronRight } from "lucide-react"
import StatCard from "../components/StatCard"
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

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="val" style={{ color: p.color }}>{formatter ? formatter(p.value) : "$" + p.value?.toLocaleString()}</div>
      ))}
    </div>
  )
}

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

export default function Dashboard() {
  const {
    transactions, addTransaction, netWorth, monthlyIncome, monthlyExpenses,
    savingsRate, totalAssets, totalLiabilities, loading, loadDashboard, loadBudgets,
    monthlyTrends, spendingByCategory, netWorthHistory, formatCurrency, currencySymbol
  } = useFinance()

  const [showModal, setShowModal] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [form, setForm] = useState({ name: "", category: "Food", type: "expense", amount: "", date: new Date().toISOString().split("T")[0] })

  const currentMonthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" })

  async function syncAll() {
    await Promise.all([loadDashboard(), loadBudgets()])
  }

  const recent = transactions.slice(0, 6)

  async function handleSave() {
    if (!form.name || !form.amount) return
    setSaving(true)
    await addTransaction({ ...form, amount: parseFloat(form.amount), icon: CATEGORY_ICONS[form.category] || iconOther })
    setSaving(false)
    setShowModal(false)
    setForm({ name: "", category: "Food", type: "expense", amount: "", date: new Date().toISOString().split("T")[0] })
  }

  const displayTx = recent.map(tx => ({
    id:       tx.id,
    name:     tx.description || tx.category,
    category: tx.category,
    type:     tx.type,
    amount:   tx.amount,
    date:     tx.date?.split("T")[0] || tx.date,
    icon:     CATEGORY_ICONS[tx.category] || (tx.type === "income" ? iconIncome : iconOther),
  }))

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="eyebrow">Good morning ☀️ — {currentMonthLabel}</div>
          <h1>Financial Overview</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-outline"><Bell size={14} /> Alerts</button>
          <button className="btn btn-primary" onClick={syncAll} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Sync
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Net Worth"
          value={formatCurrency(netWorth)}
          change={"+" + formatCurrency(2200) + " this month"} changeUp={netWorth >= 0}
          icon={<TrendingUp size={15} color={netWorth >= 0 ? "#00e676" : "#ff5252"}/>}
          iconBg={netWorth >= 0 ? "rgba(0,230,118,0.1)" : "rgba(255,82,82,0.1)"} />
        <StatCard title="Monthly Income"   value={formatCurrency(monthlyIncome)}        sub="This month's income"                    icon={<DollarSign size={15} color="#448aff"/>} iconBg="rgba(68,138,255,0.1)" />
        <StatCard title="Monthly Expenses" value={formatCurrency(monthlyExpenses)}            change={Math.round((monthlyExpenses / (monthlyIncome||1)) * 100) + "% of income"} changeUp={false} icon={<ShoppingCart size={15} color="#ff5252"/>} iconBg="rgba(255,82,82,0.1)" />
        <StatCard title="Savings Rate"     value={savingsRate.toFixed(1) + "%"}                change={formatCurrency(monthlyIncome - monthlyExpenses) + " saved"} changeUp={true} icon={<PiggyBank size={15} color="#ffab40"/>} iconBg="rgba(255,171,64,0.1)" />
      </div>

      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Cash Flow — real data */}
        <div className="chart-card">
          <div className="chart-title"><Activity /> Monthly Cash Flow</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyTrends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e676" stopOpacity={0.25}/><stop offset="95%" stopColor="#00e676" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5252" stopOpacity={0.2}/><stop offset="95%" stopColor="#ff5252" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="m" axisLine={false} tickLine={false}/>
              <YAxis axisLine={false} tickLine={false} tickFormatter={v=>formatCurrency(v, true)}/>
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />}/>
              <Area type="monotone" dataKey="income"  stroke="#00e676" strokeWidth={2} fill="url(#gi)"/>
              <Area type="monotone" dataKey="expense" stroke="#ff5252" strokeWidth={2} fill="url(#ge)"/>
            </AreaChart>
          </ResponsiveContainer>
          {monthlyTrends.length === 0 && (
            <div style={{textAlign:"center",fontSize:12,color:"var(--text-secondary)",marginTop:8}}>Add transactions to see your cash flow</div>
          )}
        </div>

        {/* Spending Split — real data */}
        <div className="chart-card">
          <div className="chart-title"><span style={{color:"#b388ff"}}>◈</span> Spending Split</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={2}>
                {spendingByCategory.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={v=>formatCurrency(v)}/>
            </PieChart>
          </ResponsiveContainer>
          {spendingByCategory.length === 0 && (
            <div style={{textAlign:"center",fontSize:12,color:"var(--text-secondary)",marginTop:8}}>No expenses recorded yet</div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px",marginTop:8}}>
            {spendingByCategory.map(s=>(
              <div key={s.name} style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}>
                <span className="dot" style={{background:s.color}}/><span style={{color:"var(--text-secondary)"}}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Net Worth Growth — real data */}
        <div className="chart-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div className="chart-title" style={{marginBottom:0}}><TrendingUp size={16} color="var(--green)"/> Net Worth Growth</div>
            <Link to="/net-worth" className="view-all">Details <ChevronRight size={13}/></Link>
          </div>
          <div style={{display:"flex",gap:28,marginBottom:16}}>
            <div><div style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)"}}>Assets</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:16,fontWeight:700,color:"var(--green)"}}>{formatCurrency(totalAssets)}</div></div>
            <div><div style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)"}}>Debt</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:16,fontWeight:700,color:"var(--red)"}}>{formatCurrency(totalLiabilities)}</div></div>
            <div><div style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)"}}>Net Worth</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:16,fontWeight:700,color: netWorth < 0 ? "var(--red)" : "var(--text-primary)"}}>
                {formatCurrency(netWorth)}
              </div></div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={netWorthHistory} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="m" axisLine={false} tickLine={false}/>
              <YAxis axisLine={false} tickLine={false} tickFormatter={v=>formatCurrency(v, true)}/>
              <Tooltip formatter={v=>formatCurrency(v)}/>
              <Line type="monotone" dataKey="val" stroke="#00e676" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
          {netWorthHistory.length === 0 && (
            <div style={{textAlign:"center",fontSize:12,color:"var(--text-secondary)",marginTop:8}}>Add assets to see net worth growth</div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="chart-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div className="chart-title" style={{marginBottom:0}}>🧾 Recent Transactions</div>
            <Link to="/expenses" className="view-all">View All <ChevronRight size={13}/></Link>
          </div>
          {loading && <div style={{color:"var(--text-secondary)",fontSize:13,padding:"12px 0"}}>Loading...</div>}
          {!loading && displayTx.length === 0 && (
            <div className="empty" style={{padding:"20px 0"}}>No transactions yet</div>
          )}
          {displayTx.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:12}} onClick={()=>setShowModal(true)}>
            + Add Transaction
          </button>
        </div>
      </div>

      {showModal && (
        <Modal title="Add Transaction" onClose={()=>setShowModal(false)}>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Description</label>
              <input className="input-field" placeholder="e.g. Grocery Store" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div className="input-group">
              <label>Amount ({currencySymbol})</label>
              <input className="input-field" type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/>
            </div>
            <div className="input-group">
              <label>Type</label>
              <select className="input-field" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="input-group">
              <label>Category</label>
              <select className="input-field" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {["Food","Transport","Housing","Health","Entertainment","Subscriptions","Income","Other"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Date</label>
              <input className="input-field" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?"Saving...":"Save Transaction"}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
