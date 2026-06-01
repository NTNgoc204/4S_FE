import apiClient from "../../config/apiClient";

export const adminAPI = {
  // ── Users ────────────────────────────────────────────────
  // GET /api/Users
  getUsers: () => apiClient.get("/api/Users"),

  // GET /api/Users/{id}
  getUserById: (id) => apiClient.get(`/api/Users/${id}`),

  // PUT /api/Users/{id}
  updateUser: (id, data) => apiClient.put(`/api/Users/${id}`, data),

  // DELETE /api/Users/{id}
  deleteUser: (id) => apiClient.delete(`/api/Users/${id}`),

  // ── Plans ────────────────────────────────────────────────
  // GET /api/Plans
  getPlans: () => apiClient.get("/api/Plans"),

  // GET /api/Plans/{id}
  getPlanById: (id) => apiClient.get(`/api/Plans/${id}`),

  // PUT /api/Plans/{id}  — only { price } is accepted by UpdatePlanDto
  updatePlan: (id, data) => apiClient.put(`/api/Plans/${id}`, data),

  // ── Roles ────────────────────────────────────────────────
  // GET /api/Roles
  getRoles: () => apiClient.get("/api/Roles"),
};
