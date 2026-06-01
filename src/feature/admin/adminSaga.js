import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import { toast } from "react-toastify";
import { adminAPI } from "./adminAPI";
import { getErrorMessage } from "../../util/errorConstants";
import {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchRolesRequest,
  fetchRolesSuccess,
  fetchRolesFailure,
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
} from "./adminSlice";

// ── Fetch all users ───────────────────────────────────────────────────────────
function* fetchUsersSaga() {
  try {
    const response = yield call(adminAPI.getUsers);
    yield put(fetchUsersSuccess(response.data ?? []));
  } catch (error) {
    const msg = getErrorMessage(error, "Failed to load users");
    yield put(fetchUsersFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Fetch all roles ───────────────────────────────────────────────────────────
function* fetchRolesSaga() {
  try {
    const response = yield call(adminAPI.getRoles);
    yield put(fetchRolesSuccess(response.data ?? []));
  } catch (error) {
    yield put(fetchRolesFailure());
  }
}

// ── Update user (edit form) ───────────────────────────────────────────────────
function* updateUserSaga(action) {
  const { userId, patch, onSuccess } = action.payload;
  try {
    yield call(adminAPI.updateUser, userId, patch);
    yield put(updateUserSuccess({ userId, patch }));
    yield call(() => toast.success("User updated successfully."));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const msg = getErrorMessage(error, "Failed to update user");
    yield put(updateUserFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Toggle user active status ─────────────────────────────────────────────────
function* toggleUserStatusSaga(action) {
  const { userId, isActive } = action.payload;
  try {
    yield call(adminAPI.updateUser, userId, { isActive });
    yield put(toggleUserStatusSuccess({ userId, isActive }));
  } catch (error) {
    const msg = getErrorMessage(error, "Failed to update user status");
    yield put(toggleUserStatusFailure());
    yield call(() => toast.error(msg));
  }
}

// ── Fetch admin plans ─────────────────────────────────────────────────────────
function* fetchAdminPlansSaga() {
  try {
    const response = yield call(adminAPI.getPlans);
    yield put(fetchAdminPlansSuccess(response.data ?? []));
  } catch (error) {
    const msg = getErrorMessage(error, "Failed to load plans");
    yield put(fetchAdminPlansFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Update admin plan ─────────────────────────────────────────────────────────
function* updateAdminPlanSaga(action) {
  const { id, patch, onSuccess } = action.payload;
  try {
    yield call(adminAPI.updatePlan, id, patch);
    yield put(updateAdminPlanSuccess({ id, patch }));
    yield call(() => toast.success("Plan saved successfully."));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const msg = getErrorMessage(error, "Failed to save plan");
    yield put(updateAdminPlanFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Root admin saga ───────────────────────────────────────────────────────────
export function* adminSaga() {
  yield takeLatest(fetchUsersRequest.type, fetchUsersSaga);
  yield takeLatest(fetchRolesRequest.type, fetchRolesSaga);
  yield takeEvery(updateUserRequest.type, updateUserSaga);
  yield takeEvery(toggleUserStatusRequest.type, toggleUserStatusSaga);
  yield takeLatest(fetchAdminPlansRequest.type, fetchAdminPlansSaga);
  yield takeEvery(updateAdminPlanRequest.type, updateAdminPlanSaga);
}
