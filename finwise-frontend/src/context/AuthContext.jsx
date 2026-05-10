import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => JSON.parse(localStorage.getItem("user") || "null"))
  const [token,   setToken]   = useState(() => localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const isAuthenticated = !!token

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authAPI.login(email, password)
      localStorage.setItem("token", data.access_token)
      setToken(data.access_token)
      // Fetch profile
      const profile = await authAPI.getProfile()
      localStorage.setItem("user", JSON.stringify(profile.data))
      setUser(profile.data)
      return true
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  async function register(name, email, password) {
    setLoading(true)
    setError(null)
    try {
      await authAPI.register({ name, email, password })
      return await login(email, password)
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("currency")
    setToken(null)
    setUser(null)
  }

  async function completeOnboarding(data) {
    setLoading(true)
    setError(null)
    try {
      const { data: updatedUser } = await authAPI.completeOnboarding(data)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      return true
    } catch (err) {
      setError(err.response?.data?.detail || "Onboarding failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, error, login, register, logout, completeOnboarding, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
