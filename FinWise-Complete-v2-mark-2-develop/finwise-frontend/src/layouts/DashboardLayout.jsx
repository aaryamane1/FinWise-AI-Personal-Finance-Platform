import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Toast from "../components/Toast"
import AssistantFAB from "../components/AssistantFAB"
import { useFinance } from "../context/FinanceContext"

export default function DashboardLayout() {
  const { toast, clearToast } = useFinance()
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <Outlet />
        <AssistantFAB />
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
