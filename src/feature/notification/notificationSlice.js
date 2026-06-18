import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Actions caught by Saga to run logic
    loadNotificationsRequest: () => { },
    addNotificationRequest: (state, action) => { },
    markAsReadRequest: (state, action) => { },
    markAllAsReadRequest: () => { },
    clearNotificationsRequest: () => { },

    // Action called by Saga to update variables
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
  },
});

export const {
  loadNotificationsRequest,
  addNotificationRequest,
  markAsReadRequest,
  markAllAsReadRequest,
  clearNotificationsRequest,
  setNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
