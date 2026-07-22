import apiClient from "../../config/apiClient";

export const financeAPI = {
  // Fetch financial summary (Gross revenue, net profit, successful transaction counts)
  getSummary: (month, year) => apiClient.get("/api/finance/summary", { params: { month, year } }),

  // Fetch expenses breakdown and list
  getExpenses: (month, year) => apiClient.get("/api/finance/expenses", { params: { month, year } }),

  // Create an operational expense
  createExpense: (data) => apiClient.post("/api/finance/expenses", data),

  // Update an operational expense
  updateExpense: (id, data) => apiClient.put(`/api/finance/expenses/${id}`, data),
};
