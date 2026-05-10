import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1"

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append("username", email)
    form.append("password", password)
    return api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  },
  getProfile: () => api.get("/finance/profile"),
  updateProfile: (data) => api.put("/finance/profile", data),
  completeOnboarding: (data) => api.post("/auth/onboarding", data),
}

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardAPI = {
  getMetrics: () => api.get("/finance/dashboard"),
  updateIncome: (income) => api.put("/finance/update-income", { income }),
}

// ── Transactions ──────────────────────────────────────────────────────
export const transactionAPI = {
  list:       (limit = 50) => api.get(`/finance/transactions?limit=${limit}`),
  addIncome:  (data)       => api.post("/finance/income",   data),
  addExpense: (data)       => api.post("/finance/expenses", data),
}

// ── Loans ─────────────────────────────────────────────────────────────
export const loanAPI = {
  list:   ()       => api.get("/finance/loans"),
  create: (data)   => api.post("/finance/loans", data),
  delete: (id)     => api.delete(`/finance/loans/${id}`),
}

export const loanAssessmentAPI = {
  predict: (data) => api.post("/loan-assessment/predict", data),
}

// ── Assets ────────────────────────────────────────────────────────────
export const assetAPI = {
  list:   ()         => api.get("/assets/"),
  create: (data)     => api.post("/assets/", data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id)       => api.delete(`/assets/${id}`),
}

// ── Liabilities ───────────────────────────────────────────────────────
export const liabilityAPI = {
  list:   ()         => api.get("/liabilities/"),
  create: (data)     => api.post("/liabilities/", data),
  update: (id, data) => api.put(`/liabilities/${id}`, data),
  delete: (id)       => api.delete(`/liabilities/${id}`),
}

// ── Budgets ───────────────────────────────────────────────────────────
export const budgetAPI = {
  list:   ()         => api.get("/budgets/"),
  create: (data)     => api.post("/budgets/", data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id)       => api.delete(`/budgets/${id}`),
}

// ── Categories ────────────────────────────────────────────────────────
export const categoryAPI = {
  list:   ()     => api.get("/categories/"),
  create: (data) => api.post("/categories/", data),
  delete: (id)   => api.delete(`/categories/${id}`),
}

// ── Subscriptions ─────────────────────────────────────────────────────
export const subscriptionAPI = {
  list:   ()         => api.get("/subscriptions/"),
  create: (data)     => api.post("/subscriptions/", data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id)       => api.delete(`/subscriptions/${id}`),
}

// ── Insights ──────────────────────────────────────────────────────────
export const insightsAPI = {
  get: () => api.get("/insights/"),
}

// ── Assistant ─────────────────────────────────────────────────────────
export const assistantAPI = {
  chat: (message) => api.post("/assistant/chat", { message }),
}

export default api
