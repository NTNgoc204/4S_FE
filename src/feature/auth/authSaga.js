import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import i18n from "../../i18n/i18n";
import { authAPI } from "./authAPI";
import { getErrorMessage } from "../../util/errorConstants";
import {
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
} from "./authSlice";

// Register Step 1
function* registerStep1Saga(action) {
  try {
    // Extract callback before dispatch (don't pass to Redux)
    const { onSuccess: _onSuccess, ...payload } = action.payload;

    const response = yield call(authAPI.registerStep1, payload);
    yield put(registerStep1Success(response.data));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to register");
    yield put(registerStep1Failure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Verify OTP
function* verifyOtpSaga(action) {
  try {
    // Extract callback before dispatch (don't pass to Redux)
    const { onSuccess: _onSuccess, ...payload } = action.payload;

    const response = yield call(authAPI.verifyOtp, payload);
    yield put(verifyOtpSuccess({ verifyToken: response.data.verifyToken }));
    yield call(() => toast.success("OTP verified successfully"));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Invalid OTP");
    yield put(verifyOtpFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Get User Info
function* getMeSaga() {
  try {
    const response = yield call(authAPI.getMe);
    yield put(getMeSuccess(response.data));

    // Save role to sessionStorage
    yield call(() => {
      sessionStorage.setItem("role", response.data.role || "");
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to fetch user info");
    yield put(getMeFailure(errorMessage));
  }
}

// Register Step 3
function* registerStep3Saga(action) {
  try {
    const { onSuccess, ...payload } = action.payload;

    yield call(authAPI.registerStep3, payload);

    yield put(registerStep3Success());

    yield call(() => toast.success(i18n.t("signup:registerSuccess")));

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Registration failed");
    yield put(registerStep3Failure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Login
function* loginSaga(action) {
  try {
    // Extract callback before dispatch (don't pass to Redux)
    const { onSuccess: _onSuccess, ...payload } = action.payload;

    const response = yield call(authAPI.login, payload);

    // Backend chỉ trả accessToken
    const accessToken = response.data?.accessToken || response.data?.token;

    if (!accessToken) {
      const errorMessage = "No access token received from server";
      yield put(loginFailure(errorMessage));
      yield call(() => toast.error(errorMessage));
      return;
    }

    // Dispatch with only token
    yield put(
      loginSuccess({
        token: accessToken,
      }),
    );

    // Save auth data to sessionStorage
    yield call(() => {
      sessionStorage.setItem("is_logged_in", "true");
      sessionStorage.setItem("access_token", accessToken);
      sessionStorage.setItem("demo_plan", "PRO");
    });

    // Fetch user info after login
    yield call(getMeSaga);

    yield call(() => toast.success(i18n.t("auth:loginSuccess")));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Login failed");
    yield put(loginFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Logout Saga
function* logoutSaga() {
  try {
    // Clear sessionStorage first
    yield call(() => {
      sessionStorage.clear();
    });

    // Then dispatch logout success to clear Redux state
    yield put(logoutSuccess());
  } catch (error) {
    const errorMessage = getErrorMessage(error, i18n.t("auth:logoutError"));
    yield put(logoutFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

function* refreshTokenSaga() {
  try {
    const response = yield call(authAPI.refreshToken);

    const newToken =
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.data?.accessToken;

    if (!newToken) {
      throw new Error("No access token received from server");
    }

    yield put(refreshTokenSuccess({ token: newToken }));

    yield call(() => {
      sessionStorage.setItem("access_token", newToken);
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Session expired");
    yield put(refreshTokenFailure(errorMessage));
  }
}

export function* authSaga() {
  yield takeEvery(registerStep1Request.type, registerStep1Saga);
  yield takeEvery(verifyOtpRequest.type, verifyOtpSaga);
  yield takeEvery(registerStep3Request.type, registerStep3Saga);
  yield takeEvery(loginRequest.type, loginSaga);
  yield takeEvery(getMeRequest.type, getMeSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
  yield takeLatest(refreshTokenRequest.type, refreshTokenSaga);
}
