import { useFinance } from "../context/FinanceContext"

const STATIC_SUBS = [
  { id:"s1", icon:"📺", name:"Netflix",      last:"2 days ago",   amount:12.99, active:true  },
  { id:"s2", icon:"🎵", name:"Spotify",      last:"Today",        amount:10.00, active:true  },
  { id:"s3", icon:"💪", name:"Gym",          last:"3 weeks ago",  amount:35.00, active:false },
  { id:"s4", icon:"☁️", name:"Apple iCloud", last:"1 week ago",   amount:2.99,  active:true  },
  { id:"s5", icon:"🎨", name:"Adobe CC",     last:"Yesterday",    amount:54.99, active:true  },
  { id:"s6", icon:"📝", name:"Notion",       last:"4 months ago", amount:8.00,  active:false },
]

const COLORS = ["var(--amber-dim)","var(--blue-dim)","var(--red-dim)","var(--green-dim)"]
const DOTS   = ["#ffab40","#448aff","#ff5252","#00e676"]

const METRICS = [
  { name:"Savings Rate",    color:"#00e676" },
  { name:"Debt Ratio",      color:"#ffab40" },
  { name:"Emergency Fund",  color:"#ffab40" },
  { name:"Spending Control",color:"#00e676" },
  { name:"Net Worth Growth",color:"#00e676" },
]

export default function Insights() {
  const { insights, subscriptions, updateSubscription, loading, formatCurrency } = useFinance()

  const score   = insights?.score           ?? 7.8
  const recs    = insights?.recommendations ?? []
  const metrics = insights?.metrics         ?? {}

  const scoreDisplay = Math.round(score * 10)

  const isDemo       = subscriptions.length === 0
  const subs         = isDemo ? STATIC_SUBS : subscriptions
  const totalMonthly = subs.reduce((s, x) => s + (x.amount ?? 0), 0)
  const unusedTotal  = subs.filter(x => x.active === false).reduce((s, x) => s + (x.amount ?? 0), 0)

  const metricScores = [
    metrics.savingsRate ? Math.min(100, Math.round(metrics.savingsRate * 4)) : 85,
    metrics.debtToIncome !== undefined ? Math.max(0, 100 - Math.round(metrics.debtToIncome * 100)) : 62,
    metrics.emergencyFundRatio !== undefined ? Math.min(100, Math.round(metrics.emergencyFundRatio * 15)) : 70,
    80, 90,
  ]
  const metricSubs = [
    metrics.savingsRate !== undefined ? `${metrics.savingsRate.toFixed(1)}% — ${metrics.savingsRate >= 20 ? "Excellent" : "Moderate"}` : "33% — Excellent",
    metrics.debtToIncome !== undefined ? `DTI ${(metrics.debtToIncome * 100).toFixed(1)}% — ${metrics.debtToIncome < 0.4 ? "Good" : "High"}` : "DTI 38% — Moderate",
    metrics.emergencyFundRatio !== undefined ? `${metrics.emergencyFundRatio.toFixed(1)} months covered` : "3.2 months covered",
    "Under budget most cats",
    `+${formatCurrency(metrics.netWorth || 0, true)} current`,
  ]

  function toggleSub(sub) {
    if (isDemo) return
    updateSubscription(sub.id, { active: !sub.active })
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="eyebrow">AI-powered analysis</div>
          <h1>Financial Insights</h1>
        </div>
      </div>

      <div className="grid-2">
        {/* Health Score */}
        <div className="chart-card">
          <div className="chart-title">◎ Financial Health Score</div>
          <div style={{ position:"relative", textAlign:"center", margin:"10px 0 24px" }}>
            <svg width="200" height="120" viewBox="0 0 200 120" style={{ overflow:"visible" }}>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round"/>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#00e676" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${(scoreDisplay/100)*251} 251`}
                style={{ filter:"drop-shadow(0 0 8px rgba(0,230,118,0.5))" }}/>
            </svg>
            <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)" }}>
              <div className="score-number">{scoreDisplay}</div>
              <div className="score-label">out of 100</div>
              <div className="score-sublabel">
                {scoreDisplay >= 80 ? "Excellent shape!" : scoreDisplay >= 60 ? "Good progress!" : "Needs attention"}
              </div>
            </div>
          </div>

          {METRICS.map((m, i) => (
            <div key={m.name} className="metric-row">
              <div className="metric-top">
                <span className="metric-name">{m.name}</span>
                <span className="metric-score">{metricScores[i]}/100</span>
              </div>
              <div className="progress-wrap">
                <div className="progress-bar" style={{ width: metricScores[i]+"%", background: m.color }}/>
              </div>
              <div className="metric-sub">{metricSubs[i]}</div>
            </div>
          ))}

          {recs.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.06em" }}>AI Recommendations</div>
              {recs.map((r, i) => (
                <div key={i} style={{ background:"var(--bg-input)", borderRadius:8, padding:"10px 12px", marginBottom:8, fontSize:12, color:"var(--text-secondary)", borderLeft:"2px solid var(--green)" }}>
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Subscriptions */}
          <div className="chart-card">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div className="chart-title" style={{ marginBottom:0 }}>🔄 Recurring Expenses</div>
              <div style={{ fontSize:12 }}>
                <span style={{ fontFamily:"var(--font-display)", fontWeight:700 }}>{formatCurrency(totalMonthly)}/mo</span>
                <span style={{ color:"var(--red)", marginLeft:6 }}>{formatCurrency(totalMonthly*12)}/yr</span>
              </div>
            </div>

            {subs.map((s, i) => (
              <div key={s.id ?? i} className="sub-item">
                <div className="tx-icon" style={{ background:"rgba(255,255,255,0.05)" }}>{s.icon || "📦"}</div>
                <div className="sub-info">
                  <div className="sub-name" style={{ textDecoration: s.active === false ? "line-through" : "none", opacity: s.active === false ? 0.5 : 1 }}>
                    {s.name}
                  </div>
                  <div className="sub-last">Last used: {s.last_used || s.last || "Recently"}</div>
                </div>
                <div style={{ textAlign:"right", marginRight:10 }}>
                  <div className="sub-price">{formatCurrency(s.amount ?? 0)}/mo</div>
                </div>
                <span className={`badge ${s.active !== false ? "badge-green" : "badge-red"}`} style={{ marginRight: 6 }}>
                  {s.active !== false ? "Active" : "Unused"}
                </span>
                {!isDemo && (
                  <button
                    className={`btn btn-outline`}
                    style={{ fontSize: 11, padding: "4px 8px" }}
                    onClick={() => toggleSub(s)}
                  >
                    {s.active !== false ? "Cancel" : "Reactivate"}
                  </button>
                )}
              </div>
            ))}

            {unusedTotal > 0 && (
              <div className="alert-bar danger" style={{ marginTop:12, fontSize:12 }}>
                ⚡ Cancel unused subscriptions to save <strong style={{ margin:"0 3px" }}>{formatCurrency(unusedTotal)}/month</strong> ({formatCurrency(unusedTotal*12)}/year)
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          <div className="chart-card">
            <div className="chart-title">💡 Smart Suggestions</div>
            {recs.length > 0 ? recs.map((r, i) => (
              <div key={i} className="suggestion-card">
                <div className="suggestion-icon" style={{ background:COLORS[i%COLORS.length] }}>{["🔔","📈","🏦","✅"][i%4]}</div>
                <div>
                  <div className="suggestion-title">Insight {i+1}<span className="dot" style={{ background:DOTS[i%DOTS.length] }}/></div>
                  <div className="suggestion-body">{r}</div>
                </div>
              </div>
            )) : (
              <>
                {[
                  { icon:"🔔", title:"Subscription Overload", body:`You're spending ${formatCurrency(totalMonthly)}/month on subscriptions.`, color:"var(--amber-dim)", dot:"#ffab40" },
                  { icon:"📈", title:"Invest Your Surplus",   body:"Consider moving surplus savings to a diversified index fund.",       color:"var(--blue-dim)",  dot:"#448aff" },
                  { icon:"✅", title:"Keep Tracking",         body:"Add more transactions to unlock personalized AI recommendations.",    color:"var(--green-dim)", dot:"#00e676" },
                ].map(s => (
                  <div key={s.title} className="suggestion-card">
                    <div className="suggestion-icon" style={{ background:s.color }}>{s.icon}</div>
                    <div>
                      <div className="suggestion-title">{s.title}<span className="dot" style={{ background:s.dot }}/></div>
                      <div className="suggestion-body">{s.body}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
