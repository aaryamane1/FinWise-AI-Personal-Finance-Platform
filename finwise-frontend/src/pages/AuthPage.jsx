import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import appLogo from "../assets/icons/app-logo/logo-pulse-hex.svg"

export default function AuthPage() {
  const [mode, setMode]       = useState("login") // "login" | "register"
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" })
  const [validErr, setValidErr] = useState(null)
  const { login, register, loading, error, setError } = useAuth()
  const navigate              = useNavigate()

  async function handleSubmit() {
    setError(null)
    setValidErr(null)

    if (mode === "register") {
      if (!form.name.trim())              { setValidErr("Name is required"); return }
      if (form.password.length < 8)       { setValidErr("Password must be at least 8 characters"); return }
      if (form.password !== form.confirm) { setValidErr("Passwords do not match"); return }
    }

    let ok
    if (mode === "login") {
      ok = await login(form.email, form.password)
    } else {
      ok = await register(form.name, form.email, form.password)
    }
    if (ok) navigate("/")
  }

  function handleKey(e) {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse, rgba(0,230,118,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: 420,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-lg)",
        padding: "36px 32px",
        position: "relative",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48,
            background: "var(--green)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            boxShadow: "0 0 24px rgba(0,230,118,0.3)",
          }}>
            <img src={appLogo} alt="FinWise" style={{ width: 28, height: 28, filter: "brightness(0) invert(0)" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            FinWise
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            AI Finance
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          background: "var(--bg-input)",
          borderRadius: "var(--radius-sm)",
          padding: 3, marginBottom: 24,
        }}>
          {["login", "register"].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setValidErr(null) }}
              style={{
                padding: "8px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 13, fontWeight: 600,
                transition: "all 0.18s",
                background: mode === m ? "var(--bg-card)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div className="input-group">
              <label>Full Name</label>
              <input
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={handleKey}
              />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={handleKey}
            />
          </div>
          <div className="input-group">
            <label>Password {mode === "register" && <span style={{color:"var(--text-secondary)",fontSize:11}}>(min 8 chars)</span>}</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={handleKey}
            />
          </div>
          {mode === "register" && (
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                onKeyDown={handleKey}
              />
            </div>
          )}
        </div>

        {(error || validErr) && (
          <div style={{
            marginTop: 14,
            background: "var(--red-dim)",
            border: "1px solid rgba(255,82,82,0.25)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--red)",
          }}>
            {validErr || error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "12px" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {mode === "login" && (
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-secondary)", marginTop: 16 }}>
            Don't have an account?{" "}
            <button
              onClick={() => { setMode("register"); setError(null) }}
              style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              Sign up free
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
