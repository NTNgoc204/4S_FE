import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  plans: [],
  loading: false,
  error: null,
  paymentInfo: null,
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
    },
    createPaymentSuccess: (state, action) => {
      state.createPaymentLoading = false;
      state.paymentInfo = action.payload;
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
