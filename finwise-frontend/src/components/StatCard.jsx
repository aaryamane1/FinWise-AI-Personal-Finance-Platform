export default function StatCard({ title, value, sub, change, changeUp, icon, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{title}</span>
        {icon && (
          <div className="stat-icon" style={{ background: iconBg || "rgba(255,255,255,0.06)" }}>
            {icon}
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {change && (
          <span className={`stat-change ${changeUp ? "up" : "down"}`}>
            {changeUp ? "▲" : "▼"} {change}
          </span>
        )}
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  )
}
