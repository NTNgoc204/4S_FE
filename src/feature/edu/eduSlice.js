import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  registrations: [],
  loading: false,
  actionLoading: false, // loading riêng cho create-payment / send-email / update-status
  error: null,
};

const eduSlice = createSlice({
  name: "edu",
  initialState,
  reducers: {
    // ── Fetch registrations ────────────────────────────────────────────────
    fetchRegistrationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRegistrationsSuccess: (state, action) => {
      state.loading = false;
      state.registrations = action.payload;
    },
    fetchRegistrationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Send quote (create-payment + send-payment-email + status=Quoted) ──
    sendQuoteRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },
    sendQuoteSuccess: (state) => {
      state.actionLoading = false;
    },
    sendQuoteFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // ── Confirm school payment → status=Paid ──────────────────────────────
    confirmPaymentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },
    confirmPaymentSuccess: (state) => {
      state.actionLoading = false;
    },
    confirmPaymentFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // ── Complete: after import emails → status=Completed ──────────────────
    completeRegistrationRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },
    completeRegistrationSuccess: (state) => {
      state.actionLoading = false;
    },
    completeRegistrationFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    clearEduError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchRegistrationsRequest,
  fetchRegistrationsSuccess,
  fetchRegistrationsFailure,
  sendQuoteRequest,
  sendQuoteSuccess,
  sendQuoteFailure,
  confirmPaymentRequest,
  confirmPaymentSuccess,
  confirmPaymentFailure,
  completeRegistrationRequest,
  completeRegistrationSuccess,
  completeRegistrationFailure,
  clearEduError,
} = eduSlice.actions;

export default eduSlice.reducer;
