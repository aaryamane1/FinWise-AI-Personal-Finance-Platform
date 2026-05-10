import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout  from "./layouts/DashboardLayout"
import Dashboard        from "./pages/Dashboard"
import NetWorth         from "./pages/NetWorth"
import BudgetPlanner    from "./pages/BudgetPlanner"
import Expenses         from "./pages/Expenses"
import Loans            from "./pages/Loans"
import Insights         from "./pages/Insights"
import Settings         from "./pages/Settings"
import Assistant        from "./pages/Assistant"
import AboutUs          from "./pages/AboutUs"
import AuthPage         from "./pages/AuthPage"
import Onboarding       from "./pages/Onboarding"
import ProtectedRoute   from "./components/ProtectedRoute"
import { useAuth }      from "./context/AuthContext"

export default function App() {
  const { user, isAuthenticated } = useAuth()

  // If logged in but not onboarded, they must go to /onboarding
  const needsOnboarding = isAuthenticated && user && !user.onboarded

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      
      {/* Onboarding Route */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            {needsOnboarding ? <Onboarding /> : <Navigate to="/" replace />}
          </ProtectedRoute>
        } 
      />

      <Route element={
        <ProtectedRoute>
          {needsOnboarding ? <Navigate to="/onboarding" replace /> : <DashboardLayout />}
        </ProtectedRoute>
      }>
        <Route path="/"           element={<Dashboard />}     />
        <Route path="/net-worth"  element={<NetWorth />}      />
        <Route path="/budget"     element={<BudgetPlanner />} />
        <Route path="/expenses"   element={<Expenses />}      />
        <Route path="/loans"      element={<Loans />}         />
        <Route path="/insights"   element={<Insights />}      />
        <Route path="/assistant"  element={<Assistant />}     />
        <Route path="/about"      element={<AboutUs />}       />
        <Route path="/settings"   element={<Settings />}      />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
