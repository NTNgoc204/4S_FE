import apiClient from "../../config/apiClient";

export const authAPI = {
  // Register - Step 1: Send personal info and get OTP
  registerStep1: (data) => apiClient.post("/api/auth/register-step1", data),

  // Verify OTP: Verify OTP code
  verifyOtp: (data) => apiClient.post("/api/auth/verify-otp", data),

  // Register - Step 3: Complete registration with password
  registerStep3: (data) => apiClient.post("/api/auth/register-step3", data),

  // Login: Authenticate user
  login: (data) => apiClient.post("/api/Auth/login", data),

  // Refresh Token: Get new access token
  refreshToken: () =>
    apiClient.post("/api/Auth/refresh-token", null, {
      skipAuthRedirect: true,
    }),

  // Get current user info (requires bearer token)
  getMe: () => apiClient.get("/api/Auth/me"),

  // Logout: Revoke refresh token and clear session
  logout: () => apiClient.post("/api/Auth/logout"),

  // Update user profile (PUT /api/Auth/profile)
  updateProfile: (id, data) => apiClient.put("/api/Auth/profile", data),

  // Upload avatar (POST /api/Auth/upload-avatar)
  uploadAvatar: (formData) =>
    apiClient.post("/api/Auth/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Academic Profile APIs (/api/UserProfiles)
  getUserProfiles: () => apiClient.get("/api/UserProfiles"),
  getUserProfileById: (id) => apiClient.get(`/api/UserProfiles/${id}`),
  createUserProfile: (data) => apiClient.post("/api/UserProfiles", data),
  updateUserProfile: (id, data) => apiClient.put(`/api/UserProfiles/${id}`, data),

  // AI Overall Summary & Recommendations API (/api/UserAiSummaries)
  getOverallSummary: () => apiClient.get("/api/UserAiSummaries"),

  // Forgot password (POST /api/Auth/forgot-password)
  forgotPassword: (email) =>
    apiClient.post("/api/Auth/forgot-password", { email }),

  // Reset password (POST /api/Auth/reset-password)
  resetPassword: (data) => apiClient.post("/api/Auth/reset-password", data),

  // Change password (PUT /api/Auth/change-password)
  changePassword: (data) => apiClient.put("/api/Auth/change-password", data),
};
