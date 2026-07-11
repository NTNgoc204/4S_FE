import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import i18n from "../../i18n/i18n";
import { authAPI } from "./authAPI";
import { eduAPI } from "../edu/eduAPI";
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
} from "./authSlice";

const AUTH_REDIRECT_MESSAGE_KEY = "auth_redirect_message_key";

// Register Step 1
function* registerStep1Saga(action) {
  try {
    // Extract callback before dispatch (don't pass to Redux)
    const { onSuccess, ...payload } = action.payload;

    const response = yield call(authAPI.registerStep1, payload);
    yield put(registerStep1Success(response.data));
    if (typeof onSuccess === "function") {
      yield call(onSuccess, response.data);
    }
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
    const { onSuccess, ...payload } = action.payload;

    const response = yield call(authAPI.verifyOtp, payload);
    yield put(verifyOtpSuccess({ verifyToken: response.data.verifyToken }));
    if (typeof onSuccess === "function") {
      yield call(onSuccess, response.data);
    }
    yield call(() => toast.success(i18n.t("auth:otpVerifiedSuccess", "OTP verified successfully")));
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

    // Save role and plan to sessionStorage
    yield call(() => {
      const role = response.data.role || "";
      sessionStorage.setItem("role", role);
      if (String(role).toLowerCase() !== "admin") {
        sessionStorage.setItem("plan", response.data.currentPlan || "FREE");
      }
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

    // Save auth data to sessionStorage and localStorage
    yield call(() => {
      sessionStorage.setItem("is_logged_in", "true");
      sessionStorage.setItem("access_token", accessToken);
      localStorage.setItem("was_logged_in", "true");
    });

    // Fetch user info after login
    yield call(getMeSaga);

    // Check for pending school activation key from signup page
    const pendingKey = yield call(() => sessionStorage.getItem("pending_edu_activation_key"));
    if (pendingKey) {
      try {
        yield call(eduAPI.activateKey, pendingKey);
        yield call(() => sessionStorage.removeItem("pending_edu_activation_key"));
        yield call(() => toast.success("Gói học đường của bạn đã được tự động kích hoạt thành công!"));
        // Re-fetch user info to update the active plan in the UI
        yield call(getMeSaga);
      } catch (keyError) {
        const errorMsg = getErrorMessage(keyError, "Không thể kích hoạt tự động gói học đường");
        yield call(() => toast.warn(`Cổng học đường: ${errorMsg}. Vui lòng thử kích hoạt lại trong hồ sơ.`));
        yield call(() => sessionStorage.removeItem("pending_edu_activation_key"));
      }
    }

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
    // Reverted backend logout API call as requested by user to prevent backend errors/hangs
    // Always clear sessionStorage, localStorage, and Redux state on the client
    yield call(() => {
      sessionStorage.clear();
      localStorage.removeItem("was_logged_in");
    });
    yield put(logoutSuccess());
    // Show success toast — ProtectedRoute will navigate to /login via React Router (no reload)
    yield call(() => toast.success(i18n.t("auth:logoutSuccess")));
  } catch (error) {
    console.error("Local logout failed:", error);
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
      sessionStorage.setItem("is_logged_in", "true");
      sessionStorage.setItem("access_token", newToken);
      localStorage.setItem("was_logged_in", "true");
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Session expired");
    yield put(refreshTokenFailure(errorMessage));
    yield call(() => {
      sessionStorage.clear();
      localStorage.removeItem("was_logged_in");
    });
    yield put(logoutSuccess());
  }
}

// Update Profile Saga
function* updateProfileSaga(action) {
  try {
    const { id, data, onSuccess } = action.payload;
    yield call(authAPI.updateProfile, id, data);
    yield put(updateProfileSuccess(data));
    
    // Refresh user profile details from BE
    yield put(getMeRequest());
    
    yield call(() => toast.success(i18n.t("auth:profileUpdateSuccess", "Profile updated successfully")));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to update profile");
    yield put(updateProfileFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Upload Avatar Saga
function* uploadAvatarSaga(action) {
  try {
    const { file, onSuccess } = action.payload;
    const formData = new FormData();
    formData.append("file", file);

    const response = yield call(authAPI.uploadAvatar, formData);
    yield put(uploadAvatarSuccess({ avatarUrl: response.data.avatarUrl }));
    
    // Refresh user profile details from BE to sync up
    yield put(getMeRequest());
    
    yield call(() => toast.success(i18n.t("auth:avatarUploadSuccess", "Avatar uploaded successfully")));
    if (typeof onSuccess === "function") {
      yield call(onSuccess, response.data.avatarUrl);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to upload avatar");
    yield put(uploadAvatarFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Forgot Password Saga
function* forgotPasswordSaga(action) {
  const { email, onSuccess } = action.payload;
  try {
    yield call(authAPI.forgotPassword, email);
    yield put(forgotPasswordSuccess());
    yield call(() => toast.success(i18n.t("auth:forgotPasswordOtpSent", "OTP has been sent to your email.")));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to request password reset");
    yield put(forgotPasswordFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Reset Password Saga
function* resetPasswordSaga(action) {
  const { email, otp, password, onSuccess } = action.payload;
  try {
    yield call(authAPI.resetPassword, { email, otp, newPassword: password });
    yield put(resetPasswordSuccess());
    yield call(() => toast.success(i18n.t("auth:resetSuccess", "Password reset successfully.")));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to reset password");
    yield put(resetPasswordFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Change Password Saga
function* changePasswordSaga(action) {
  const { currentPassword, newPassword, onSuccess } = action.payload;
  try {
    yield call(authAPI.changePassword, { oldPassword: currentPassword, newPassword });
    yield put(changePasswordSuccess());
    yield call(() => toast.success(i18n.t("auth:changePasswordSuccess", "Password changed successfully.")));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to change password");
    yield put(changePasswordFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
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
  yield takeLatest(updateProfileRequest.type, updateProfileSaga);
  yield takeLatest(uploadAvatarRequest.type, uploadAvatarSaga);
  yield takeLatest(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeLatest(resetPasswordRequest.type, resetPasswordSaga);
  yield takeLatest(changePasswordRequest.type, changePasswordSaga);
}
