import { Trash2 } from "lucide-react"
import { useFinance } from "../context/FinanceContext"

export default function TransactionItem({ tx, onDelete }) {
  const isIncome = tx.type === "income"
  const { formatCurrency } = useFinance()
  return (
    <div className="tx-item">
      <div className="tx-icon" style={{ background: isIncome ? "rgba(0,230,118,0.1)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {typeof tx.icon === 'string' && tx.icon.includes('/') ? (
          <img src={tx.icon} alt="icon" style={{ width: 20, height: 20, filter: "var(--icon-filter, none)" }} />
        ) : (
          tx.icon || "💰"
        )}
      </div>
      <div className="tx-info">
        <div className="tx-name">{tx.name}</div>
        <div className="tx-sub">{tx.category} · {tx.date}</div>
      </div>
      <span className={`tx-amount ${isIncome ? "income" : "expense"}`}>
        {isIncome ? "+" : ""}{formatCurrency(tx.amount)}
      </span>
      {onDelete && (
        <button className="btn-danger" onClick={() => onDelete(tx.id)} style={{ marginLeft: 8 }}>
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}
