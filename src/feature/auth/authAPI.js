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

  // Update user profile (PUT /api/Users/{id})
  updateProfile: (id, data) => apiClient.put(`/api/Users/${id}`, data),

  // Upload avatar (POST /api/avatar/upload)
  uploadAvatar: (formData) =>
    apiClient.post("/api/avatar/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Forgot password (POST /api/Auth/forgot-password)
  forgotPassword: (email) =>
    apiClient.post("/api/Auth/forgot-password", { email }),

  // Reset password (POST /api/Auth/reset-password)
  resetPassword: (data) => apiClient.post("/api/Auth/reset-password", data),

  // Change password (PUT /api/Auth/change-password)
  changePassword: (data) => apiClient.put("/api/Auth/change-password", data),
};
