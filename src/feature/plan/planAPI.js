import apiClient from "../../config/apiClient";

export const planAPI = {
  // Fetch all plans
  getPlans: () => apiClient.get("/api/Plans"),

  // Fetch single plan details
  getPlanById: (id) => apiClient.get(`/api/Plans/${id}`),

  // Create payment request (returns TransactionCode and QrUrl)
  createPayment: (planId) => apiClient.post("/api/payment/create", { planId }),

  // Confirm payment request (called from fake payment portal)
  confirmPayment: (code) => apiClient.post(`/api/payment/confirm?code=${code}`),

  // Cancel payment request (called when timer expires or manual cancellation)
  cancelPayment: (code) => apiClient.post(`/api/payment/cancel?code=${code}`),
};
