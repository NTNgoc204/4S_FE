import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: sessionStorage.getItem("is_logged_in") === "true",
  user: null,
  token: sessionStorage.getItem("access_token") || null,
  plan: "PRO",
  role: sessionStorage.getItem("role") || "",
  loading: false,
  error: null,
  refreshTokenError: null,
  verifyToken: null,
  registerStep1Success: false,
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
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.plan = "PRO";
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
      state.role = action.payload.role || "";
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
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
