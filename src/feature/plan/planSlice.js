import { createSlice } from "@reduxjs/toolkit";

const PAYMENT_INFO_STORAGE_KEY = "4s_payment_info";

const loadPaymentInfo = () => {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const storedPaymentInfo = sessionStorage.getItem(PAYMENT_INFO_STORAGE_KEY);
    return storedPaymentInfo ? JSON.parse(storedPaymentInfo) : null;
  } catch {
    sessionStorage.removeItem(PAYMENT_INFO_STORAGE_KEY);
    return null;
  }
};

const savePaymentInfo = (paymentInfo) => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PAYMENT_INFO_STORAGE_KEY, JSON.stringify(paymentInfo));
};

const clearPaymentInfo = () => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PAYMENT_INFO_STORAGE_KEY);
};

const initialState = {
  plans: [],
  loading: false,
  error: null,
  paymentInfo: loadPaymentInfo(),
  createPaymentLoading: false,
  createPaymentError: null,
  confirmPaymentLoading: false,
  confirmPaymentSuccess: false,
  confirmPaymentError: null,
  cancelPaymentLoading: false,
  cancelPaymentSuccess: false,
  cancelPaymentError: null,
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    // Get all plans
    getPlansRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getPlansSuccess: (state, action) => {
      state.loading = false;
      state.plans = action.payload;
    },
    getPlansFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create payment
    createPaymentRequest: (state) => {
      state.createPaymentLoading = true;
      state.createPaymentError = null;
      state.paymentInfo = null;
      clearPaymentInfo();
    },
    createPaymentSuccess: (state, action) => {
      state.createPaymentLoading = false;
      state.paymentInfo = action.payload;
      savePaymentInfo(action.payload);
    },
    createPaymentFailure: (state, action) => {
      state.createPaymentLoading = false;
      state.createPaymentError = action.payload;
    },

    // Confirm payment (called from simulated portal)
    confirmPaymentRequest: (state) => {
      state.confirmPaymentLoading = true;
      state.confirmPaymentSuccess = false;
      state.confirmPaymentError = null;
    },
    confirmPaymentSuccess: (state) => {
      state.confirmPaymentLoading = false;
      state.confirmPaymentSuccess = true;
    },
    confirmPaymentFailure: (state, action) => {
      state.confirmPaymentLoading = false;
      state.confirmPaymentError = action.payload;
    },

    // Cancel payment (called when timer expires or manually cancelled)
    cancelPaymentRequest: (state) => {
      state.cancelPaymentLoading = true;
      state.cancelPaymentSuccess = false;
      state.cancelPaymentError = null;
    },
    cancelPaymentSuccess: (state) => {
      state.cancelPaymentLoading = false;
      state.cancelPaymentSuccess = true;
    },
    cancelPaymentFailure: (state, action) => {
      state.cancelPaymentLoading = false;
      state.cancelPaymentError = action.payload;
    },

    // Reset payment states (when closed or finished)
    resetPaymentState: (state) => {
      state.paymentInfo = null;
      state.createPaymentLoading = false;
      state.createPaymentError = null;
      state.confirmPaymentLoading = false;
      state.confirmPaymentSuccess = false;
      state.confirmPaymentError = null;
      clearPaymentInfo();
    },
  },
});

export const {
  getPlansRequest,
  getPlansSuccess,
  getPlansFailure,
  createPaymentRequest,
  createPaymentSuccess,
  createPaymentFailure,
  confirmPaymentRequest,
  confirmPaymentSuccess,
  confirmPaymentFailure,
  cancelPaymentRequest,
  cancelPaymentSuccess,
  cancelPaymentFailure,
  resetPaymentState,
} = planSlice.actions;

export default planSlice.reducer;
