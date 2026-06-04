import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: sessionStorage.getItem("is_logged_in") === "true",
  user: null,
  token: sessionStorage.getItem("access_token") || null,
  plan: sessionStorage.getItem("plan") || "",
  role: sessionStorage.getItem("role") || "",
  loading: false,
  error: null,
  refreshTokenError: null,
  verifyToken: null,
  registerStep1Success: false,
  avatarUploading: false,
  justLoggedOut: false,
};

const resetAuthState = (state) => {
  state.isLoggedIn = false;
  state.user = null;
  state.token = null;
  state.plan = "";
  state.role = "";
  state.error = null;
  state.refreshTokenError = null;
  state.verifyToken = null;
  state.registerStep1Success = false;
  state.loading = false;
  state.avatarUploading = false;
  state.justLoggedOut = false;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Register - Step 1
    registerStep1Request: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerStep1Success: (state) => {
      state.loading = false;
      state.registerStep1Success = true;
    },
    registerStep1Failure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.registerStep1Success = false;
    },

    // Verify OTP
    verifyOtpRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyOtpSuccess: (state, action) => {
      state.loading = false;
      state.verifyToken = action.payload.verifyToken;
    },
    verifyOtpFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Register - Step 3
    registerStep3Request: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerStep3Success: (state) => {
      state.loading = false;
      state.error = null;
      state.verifyToken = null;
      state.registerStep1Success = false;
    },
    registerStep3Failure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Login
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.justLoggedOut = false;
    },
    loginSuccess: (state, action) => {
      // Keep loading = true: loginSaga calls getMeSaga right after this.
      // loading will be cleared by getMeSuccess / getMeFailure.
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.plan = "";
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get User Info
    getMeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getMeSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      const role = action.payload.role || "";
      state.role = role;
      if (String(role).toLowerCase() === "admin") {
        state.plan = "";
      } else {
        state.plan = action.payload.currentPlan || "FREE";
      }
    },
    getMeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Logout
    logoutRequest: (state) => {
      state.loading = true;
    },
    logoutSuccess: (state) => {
      resetAuthState(state);
      state.justLoggedOut = true;
    },
    logoutFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Refresh Token
    refreshTokenRequest: (state) => {
      state.refreshTokenError = null;
    },
    refreshTokenSuccess: (state, action) => {
      state.token = action.payload.token;
      state.refreshTokenError = null;
    },
    refreshTokenFailure: (state, action) => {
      state.refreshTokenError = action.payload;
    },

    // Update Profile
    updateProfileRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Upload Avatar
    uploadAvatarRequest: (state) => {
      state.loading = true;
      state.avatarUploading = true;
      state.error = null;
    },
    uploadAvatarSuccess: (state, action) => {
      state.loading = false;
      state.avatarUploading = false;
      if (state.user) {
        state.user.avatarUrl = action.payload.avatarUrl;
      }
    },
    uploadAvatarFailure: (state, action) => {
      state.loading = false;
      state.avatarUploading = false;
      state.error = action.payload;
    },

    // Forgot Password
    forgotPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Reset Password
    resetPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Change Password
    changePasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess: (state) => {
      state.loading = false;
    },
    changePasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  registerStep1Request,
  registerStep1Success,
  registerStep1Failure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  registerStep3Request,
  registerStep3Success,
  registerStep3Failure,
  loginRequest,
  loginSuccess,
  loginFailure,
  getMeRequest,
  getMeSuccess,
  getMeFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  uploadAvatarRequest,
  uploadAvatarSuccess,
  uploadAvatarFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
