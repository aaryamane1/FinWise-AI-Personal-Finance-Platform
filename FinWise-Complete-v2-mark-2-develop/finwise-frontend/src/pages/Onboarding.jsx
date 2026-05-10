import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useFinance } from "../context/FinanceContext"
import { 
  Target, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2,
  CheckCircle2
} from "lucide-react"

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const { user, completeOnboarding, loading, error } = useAuth()
  const { formatCurrency, currencySymbol } = useFinance()
  const navigate = useNavigate()

  const [onboardingData, setOnboardingData] = useState({
    goal: "Build Wealth",
    assets: [],
    liabilities: [],
    income: []
  })

  // Temporary state for current inputs
  const [tempAsset, setTempAsset] = useState({ name: "", value: "", type: "Cash" })
  const [tempLiability, setTempLiability] = useState({ name: "", amount: "", interest_rate: "", type: "Loan" })
  const [tempIncome, setTempIncome] = useState({ source: "", amount: "", description: "" })

  const addItem = (listKey, item, setter) => {
    if (!item.name && !item.source) return
    setOnboardingData(prev => ({
      ...prev,
      [listKey]: [...prev[listKey], item]
    }))
    setter(listKey === 'income' ? { source: "", amount: "", description: "" } : 
           listKey === 'assets' ? { name: "", value: "", type: "Cash" } :
           { name: "", amount: "", interest_rate: "", type: "Loan" })
  }

  const removeItem = (listKey, index) => {
    setOnboardingData(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index)
    }))
  }

  const handleComplete = async () => {
    const success = await completeOnboarding(onboardingData)
    if (success) {
      navigate("/")
    }
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const goals = [
    { id: "Build Wealth", label: "Build Wealth", icon: <TrendingUp size={20} />, sub: "Long-term investment and growth" },
    { id: "Pay Debt", label: "Pay Down Debt", icon: <CreditCard size={20} />, sub: "Focusing on financial freedom" },
    { id: "Saving", label: "Major Purchase", icon: <Target size={20} />, sub: "Saving for a house, car, or dream" },
  ]

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 600,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-lg)",
        padding: "40px",
        position: "relative",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
      }}>
        {/* Progress Bar */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 4,
          background: "rgba(255,255,255,0.05)",
          borderRadius: "4px 4px 0 0",
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            background: "var(--green)",
            width: `${(step / 5) * 100}%`,
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }} />
        </div>

        {/* Step 1: Goals */}
        {step === 1 && (
          <div className="animate-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Welcome, {user?.name.split(' ')[0]}!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              Let's personalize your FinWise experience. What's your primary financial goal?
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {goals.map(g => (
                <button
                  key={g.id}
                  onClick={() => setOnboardingData(p => ({ ...p, goal: g.id }))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px",
                    borderRadius: "var(--radius)",
                    border: onboardingData.goal === g.id ? "2px solid var(--green)" : "1px solid var(--border)",
                    background: onboardingData.goal === g.id ? "rgba(0,230,118,0.05)" : "var(--bg-card)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ 
                    width: 44, height: 44, 
                    borderRadius: 12, 
                    background: onboardingData.goal === g.id ? "var(--green)" : "rgba(255,255,255,0.05)",
                    color: onboardingData.goal === g.id ? "#0a0f1a" : "var(--text-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {g.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{g.label}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{g.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Assets */}
        {step === 2 && (
          <div className="animate-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Check your Assets
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              What do you currently own? (Savings, Property, Stocks, etc.)
            </p>

            <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {onboardingData.assets.map((a, i) => (
                <div key={i} className="badge badge-green" style={{ padding: "8px 12px", gap: 8 }}>
                  {a.name}: {formatCurrency(a.value)}
                  <Trash2 size={14} style={{ cursor: "pointer" }} onClick={() => removeItem("assets", i)} />
                </div>
              ))}
            </div>

            <div className="form-grid">
              <div className="input-group span-2">
                <label>Asset Name</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Main Savings" 
                  value={tempAsset.name}
                  onChange={e => setTempAsset(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Value ({currencySymbol})</label>
                <input 
                  className="input-field" 
                  type="number" 
                  placeholder="0.00" 
                  value={tempAsset.value}
                  onChange={e => setTempAsset(p => ({ ...p, value: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select 
                   className="input-field"
                   value={tempAsset.type}
                   onChange={e => setTempAsset(p => ({ ...p, type: e.target.value }))}
                >
                  <option>Cash</option>
                  <option>Investment</option>
                  <option>Property</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => addItem("assets", tempAsset, setTempAsset)}
            >
              <Plus size={16} /> Add Asset
            </button>
          </div>
        )}

        {/* Step 3: Liabilities */}
        {step === 3 && (
          <div className="animate-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Debts & Liabilities
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              Enter any current loans or credit card balances.
            </p>

            <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {onboardingData.liabilities.map((l, i) => (
                <div key={i} className="badge badge-red" style={{ padding: "8px 12px", gap: 8 }}>
                  {l.name}: {formatCurrency(l.amount)} ({l.interest_rate}%)
                  <Trash2 size={14} style={{ cursor: "pointer" }} onClick={() => removeItem("liabilities", i)} />
                </div>
              ))}
            </div>

            <div className="form-grid">
              <div className="input-group span-2">
                <label>Debt Name</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Student Loan" 
                  value={tempLiability.name}
                  onChange={e => setTempLiability(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Amount Due ({currencySymbol})</label>
                <input 
                  className="input-field" 
                  type="number" 
                  placeholder="0.00" 
                  value={tempLiability.amount}
                  onChange={e => setTempLiability(p => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>APR (%)</label>
                <input 
                  className="input-field" 
                  type="number" 
                  placeholder="5.5" 
                  value={tempLiability.interest_rate}
                  onChange={e => setTempLiability(p => ({ ...p, interest_rate: e.target.value }))}
                />
              </div>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => addItem("liabilities", tempLiability, setTempLiability)}
            >
              <Plus size={16} /> Add Liability
            </button>
          </div>
        )}

        {/* Step 4: Income */}
        {step === 4 && (
          <div className="animate-in">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Regular Income
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              What is your primary source of income?
            </p>

            <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {onboardingData.income.map((inc, i) => (
                <div key={i} className="badge badge-blue" style={{ padding: "8px 12px", gap: 8 }}>
                  {inc.source}: {formatCurrency(inc.amount)}
                  <Trash2 size={14} style={{ cursor: "pointer" }} onClick={() => removeItem("income", i)} />
                </div>
              ))}
            </div>

            <div className="form-grid">
              <div className="input-group span-2">
                <label>Source</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Salary" 
                  value={tempIncome.source}
                  onChange={e => setTempIncome(p => ({ ...p, source: e.target.value }))}
                />
              </div>
              <div className="input-group span-2">
                <label>Amount ({currencySymbol})</label>
                <input 
                  className="input-field" 
                  type="number" 
                  placeholder="0.00" 
                  value={tempIncome.amount}
                  onChange={e => setTempIncome(p => ({ ...p, amount: e.target.value }))}
                />
              </div>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => addItem("income", tempIncome, setTempIncome)}
            >
              <Plus size={16} /> Add Income
            </button>
          </div>
        )}

        {/* Step 5: Finished */}
        {step === 5 && (
          <div className="animate-in" style={{ textAlign: "center" }}>
            <div style={{ 
              width: 80, height: 80, 
              background: "var(--green-dim)", 
              color: "var(--green)", 
              borderRadius: "50%", 
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
              All Set!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              Your financial foundation is ready. You can always edit these details later in the dashboard.
            </p>

            <div style={{ 
              background: "rgba(255,255,255,0.03)", 
              borderRadius: "var(--radius)", 
              padding: "20px",
              textAlign: "left",
              marginBottom: 32,
              border: "1px solid var(--border)"
            }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, fontWeight: 600 }}>SUMMARY</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Assets:</span>
                <span style={{ color: "var(--green)", fontWeight: 700 }}>{onboardingData.assets.length} items</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Liabilities:</span>
                <span style={{ color: "var(--red)", fontWeight: 700 }}>{onboardingData.liabilities.length} items</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Monthly Income:</span>
                <span style={{ color: "var(--green)", fontWeight: 700 }}>
                  {formatCurrency(onboardingData.income.reduce((acc, curr) => acc + Number(curr.amount), 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
            <div style={{
              marginTop: 20,
              padding: "12px",
              background: "var(--red-dim)",
              color: "var(--red)",
              borderRadius: 8,
              fontSize: 13,
              border: "1px solid rgba(255,82,82,0.2)"
            }}>
              {error}
            </div>
        )}

        {/* Navigation Actions */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginTop: 40,
          paddingTop: 32,
          borderTop: "1px solid var(--border)"
        }}>
          {step > 1 ? (
            <button className="btn btn-ghost" onClick={prevStep}>
              <ChevronLeft size={18} /> Back
            </button>
          ) : <div />}
          
          {step < 5 ? (
            <button className="btn btn-primary" onClick={nextStep} style={{ padding: "10px 24px" }}>
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleComplete} disabled={loading} style={{ padding: "10px 32px" }}>
              {loading ? "Finalizing..." : "Start Journey"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
