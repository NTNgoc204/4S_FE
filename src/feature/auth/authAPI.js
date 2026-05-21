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
};
