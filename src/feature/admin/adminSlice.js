import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ── Users ────────────────────────────────────────────────
  users: [],
  usersLoading: false,
  usersError: null,

  roles: [],
  rolesLoading: false,
  createRoleLoading: false,
  updateRoleLoading: false,

  updateUserLoading: false,
  updateUserError: null,

  toggleStatusLoading: null, // stores the userId being toggled

  // ── Plans (admin) ─────────────────────────────────────────
  adminPlans: [],
  adminPlansLoading: false,
  adminPlansError: null,

  updatePlanLoading: false,
  updatePlanError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // ── Fetch Users ──────────────────────────────────────────
    fetchUsersRequest: (state) => {
      state.usersLoading = true;
      state.usersError = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.usersLoading = false;
      state.users = action.payload;
    },
    fetchUsersFailure: (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload;
    },

    // ── Fetch Roles ──────────────────────────────────────────
    fetchRolesRequest: (state) => {
      state.rolesLoading = true;
    },
    fetchRolesSuccess: (state, action) => {
      state.rolesLoading = false;
      state.roles = action.payload;
    },
    fetchRolesFailure: (state) => {
      state.rolesLoading = false;
    },

    // ── Create Role ────────────────────────────────────────
    createRoleRequest: (state) => {
      state.createRoleLoading = true;
    },
    createRoleSuccess: (state, action) => {
      state.createRoleLoading = false;
      state.roles = [action.payload, ...state.roles];
    },
    createRoleFailure: (state) => {
      state.createRoleLoading = false;
    },

    // ── Update Role ────────────────────────────────────────
    updateRoleRequest: (state) => {
      state.updateRoleLoading = true;
    },
    updateRoleSuccess: (state, action) => {
      state.updateRoleLoading = false;
      const { id, patch } = action.payload;
      state.roles = state.roles.map((role) =>
        role.id === id ? { ...role, ...patch } : role,
      );
    },
    updateRoleFailure: (state) => {
      state.updateRoleLoading = false;
    },

    // ── Update User (edit form) ──────────────────────────────
    updateUserRequest: (state) => {
      state.updateUserLoading = true;
      state.updateUserError = null;
    },
    updateUserSuccess: (state, action) => {
      state.updateUserLoading = false;
      // Optimistically patch the user in state so UI updates immediately
      const { userId, patch } = action.payload;
      state.users = state.users.map((u) =>
        u.userId === userId ? { ...u, ...patch } : u,
      );
    },
    updateUserFailure: (state, action) => {
      state.updateUserLoading = false;
      state.updateUserError = action.payload;
    },

    // ── Toggle User Active Status ────────────────────────────
    toggleUserStatusRequest: (state, action) => {
      state.toggleStatusLoading = action.payload.userId;
    },
    toggleUserStatusSuccess: (state, action) => {
      state.toggleStatusLoading = null;
      const { userId, isActive } = action.payload;
      state.users = state.users.map((u) =>
        u.userId === userId ? { ...u, isActive } : u,
      );
    },
    toggleUserStatusFailure: (state) => {
      state.toggleStatusLoading = null;
    },

    // ── Fetch Admin Plans ────────────────────────────────────
    fetchAdminPlansRequest: (state) => {
      state.adminPlansLoading = true;
      state.adminPlansError = null;
    },
    fetchAdminPlansSuccess: (state, action) => {
      state.adminPlansLoading = false;
      state.adminPlans = action.payload;
    },
    fetchAdminPlansFailure: (state, action) => {
      state.adminPlansLoading = false;
      state.adminPlansError = action.payload;
    },

    // ── Update Plan ──────────────────────────────────────────
    updateAdminPlanRequest: (state) => {
      state.updatePlanLoading = true;
      state.updatePlanError = null;
    },
    updateAdminPlanSuccess: (state, action) => {
      state.updatePlanLoading = false;
      const { id, patch } = action.payload;
      state.adminPlans = state.adminPlans.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      );
    },
    updateAdminPlanFailure: (state, action) => {
      state.updatePlanLoading = false;
      state.updatePlanError = action.payload;
    },
  },
});

export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchRolesRequest,
  fetchRolesSuccess,
  fetchRolesFailure,
  createRoleRequest,
  createRoleSuccess,
  createRoleFailure,
  updateRoleRequest,
  updateRoleSuccess,
  updateRoleFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  toggleUserStatusRequest,
  toggleUserStatusSuccess,
  toggleUserStatusFailure,
  fetchAdminPlansRequest,
  fetchAdminPlansSuccess,
  fetchAdminPlansFailure,
  updateAdminPlanRequest,
  updateAdminPlanSuccess,
  updateAdminPlanFailure,
} = adminSlice.actions;

export default adminSlice.reducer;
