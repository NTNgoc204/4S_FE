import apiClient from "../../config/apiClient";

export const adminAPI = {
  // ── Users ────────────────────────────────────────────────
  // GET /api/Users
  getUsers: () => apiClient.get("/api/Users"),

  // GET /api/Users/{id}
  getUserById: (id) => apiClient.get(`/api/Users/${id}`),

  // PUT /api/Users/{id}
  updateUser: (id, data) => apiClient.put(`/api/Users/${id}`, data),

  // PUT /api/Users/{id}/toggle-active
  toggleUserStatus: (id) => apiClient.put(`/api/Users/${id}/toggle-active`),

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

  // GET /api/Roles/{id}
  getRoleById: (id) => apiClient.get(`/api/Roles/${id}`),

  // POST /api/Roles
  createRole: (data) => apiClient.post("/api/Roles", data),

  // PUT /api/Roles/{id}
  updateRole: (id, data) => apiClient.put(`/api/Roles/${id}`, data),

  // ── Web Stats ─────────────────────────────────────────────
  getDailyWebVisits: () => apiClient.get("/api/web-stats/visits"),
  incrementDailyWebVisits: () => apiClient.post("/api/web-stats/visits/increment"),
  getDailyUserVisits: () => apiClient.get("/api/web-stats/user-visits"),
  recordDailyUserVisit: (data) => apiClient.post("/api/web-stats/user-visits/record", data || {}),
};
