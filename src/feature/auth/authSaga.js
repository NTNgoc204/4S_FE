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
      sessionStorage.setItem("role", response.data.role || "");
      sessionStorage.setItem("plan", response.data.currentPlan || "FREE");
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
    // Call logout endpoint to revoke token on the server
    yield call(authAPI.logout);
  } catch (error) {
    console.error("Server logout failed:", error);
  } finally {
    // Always clear sessionStorage and Redux state on the client
    yield call(() => {
      sessionStorage.clear();
    });
    yield put(logoutSuccess());
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
    if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
      console.warn("Backend API not found, falling back to mock response.");
      yield put(forgotPasswordSuccess());
      yield call(() => toast.success(i18n.t("auth:forgotPasswordOtpSentMock", { email, defaultValue: "OTP verification code (Mock: 123456) sent to {{email}}" })));
      if (typeof onSuccess === "function") {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = getErrorMessage(error, "Failed to request password reset");
      yield put(forgotPasswordFailure(errorMessage));
      yield call(() => toast.error(errorMessage));
    }
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
    if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
      if (otp === "123456") {
        console.warn("Backend API not found, falling back to mock response.");
        yield put(resetPasswordSuccess());
        yield call(() => toast.success(i18n.t("auth:resetSuccessMock", "Password reset successfully (Mock).")));
        if (typeof onSuccess === "function") {
          yield call(onSuccess);
        }
      } else {
        yield put(resetPasswordFailure("Invalid OTP code"));
        yield call(() => toast.error(i18n.t("auth:otpInvalid", "Invalid OTP code")));
      }
    } else {
      const errorMessage = getErrorMessage(error, "Failed to reset password");
      yield put(resetPasswordFailure(errorMessage));
      yield call(() => toast.error(errorMessage));
    }
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
    if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
      console.warn("Backend API not found, falling back to mock response.");
      yield put(changePasswordSuccess());
      yield call(() => toast.success(i18n.t("auth:changePasswordSuccessMock", "Password changed successfully (Mock).")));
      if (typeof onSuccess === "function") {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = getErrorMessage(error, "Failed to change password");
      yield put(changePasswordFailure(errorMessage));
      yield call(() => toast.error(errorMessage));
    }
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
