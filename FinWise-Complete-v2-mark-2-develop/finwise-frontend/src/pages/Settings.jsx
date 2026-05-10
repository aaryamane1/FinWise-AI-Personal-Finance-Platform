import { useState } from "react"
import { User, Lock, Globe, Save } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useFinance } from "../context/FinanceContext"
import { authAPI } from "../services/api"

const CURRENCIES = ["USD ($)", "EUR (€)", "GBP (£)", "INR (₹)", "JPY (¥)", "CAD ($)", "AUD ($)"]

export default function Settings() {
  const { user } = useAuth()
  const { currency, setCurrency } = useFinance()

  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" })
  const [password, setPassword] = useState({ current: "", newPass: "", confirm: "" })
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [profileMsg,     setProfileMsg]     = useState(null)
  const [passwordMsg,    setPasswordMsg]    = useState(null)
  const [profileError,   setProfileError]   = useState(null)
  const [passwordError,  setPasswordError]  = useState(null)

  async function handleSaveProfile() {
    if (!profile.name || !profile.email) { setProfileError("Name and email are required"); return }
    setSavingProfile(true)
    setProfileError(null)
    try {
      await authAPI.updateProfile({ name: profile.name, email: profile.email })
      setProfileMsg("Profile updated successfully!")
      setTimeout(() => setProfileMsg(null), 3000)
    } catch(e) {
      setProfileError(e.response?.data?.detail || "Failed to update profile")
    } finally { setSavingProfile(false) }
  }

  function handleSaveCurrency() {
    setProfileMsg("Preferences saved!")
    setTimeout(() => setProfileMsg(null), 3000)
  }

  function handleChangePassword() {
    setPasswordError(null)
    if (!password.current)            { setPasswordError("Current password is required"); return }
    if (password.newPass.length < 8)  { setPasswordError("New password must be at least 8 characters"); return }
    if (password.newPass !== password.confirm) { setPasswordError("Passwords do not match"); return }
    setPasswordMsg("Password change coming soon — endpoint not yet implemented.")
    setTimeout(() => setPasswordMsg(null), 3000)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="eyebrow">Account management</div>
          <h1>Settings</h1>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>

        {/* Profile */}
        <div className="chart-card">
          <div className="chart-title"><User size={15} /> Profile</div>
          <div className="form-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input className="input-field" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input className="input-field" type="email" value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          {profileError && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 8 }}>{profileError}</div>}
          {profileMsg   && <div style={{ color: "var(--green)", fontSize: 12, marginTop: 8 }}>{profileMsg}</div>}
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
              <Save size={13} /> {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="chart-card">
          <div className="chart-title"><Lock size={15} /> Change Password</div>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Current Password</label>
              <input className="input-field" type="password" value={password.current}
                onChange={e => setPassword(p => ({ ...p, current: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>New Password <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>(min 8 chars)</span></label>
              <input className="input-field" type="password" value={password.newPass}
                onChange={e => setPassword(p => ({ ...p, newPass: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input className="input-field" type="password" value={password.confirm}
                onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          {passwordError && <div style={{ color: "var(--red)",   fontSize: 12, marginTop: 8 }}>{passwordError}</div>}
          {passwordMsg   && <div style={{ color: "var(--amber)", fontSize: 12, marginTop: 8 }}>{passwordMsg}</div>}
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleChangePassword}>
              <Lock size={13} /> Update Password
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="chart-card">
          <div className="chart-title"><Globe size={15} /> Preferences</div>
          <div className="form-grid">
            <div className="input-group span-2">
              <label>Display Currency</label>
              <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSaveCurrency}>
              <Save size={13} /> Save Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
