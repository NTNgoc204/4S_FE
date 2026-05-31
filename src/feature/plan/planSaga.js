import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import i18n from "../../i18n/i18n";
import { planAPI } from "./planAPI";
import { getErrorMessage } from "../../util/errorConstants";
import {
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
} from "./planSlice";

// Fetch all plans from DB
function* getPlansSaga() {
  try {
    const response = yield call(planAPI.getPlans);
    yield put(getPlansSuccess(response.data));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to load pricing plans");
    yield put(getPlansFailure(errorMessage));
  }
}

// Create checkout payment transaction
function* createPaymentSaga(action) {
  try {
    const { planId } = action.payload;
    const response = yield call(planAPI.createPayment, planId);
    yield put(createPaymentSuccess(response.data));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to create payment request");
    yield put(createPaymentFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Confirm payment transaction
function* confirmPaymentSaga(action) {
  try {
    const { code, onSuccess } = action.payload;
    yield call(planAPI.confirmPayment, code);
    yield put(confirmPaymentSuccess());
    yield call(() => toast.success(i18n.t("notifications:payment.confirmedToast", "Payment confirmed successfully!")));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Payment confirmation failed");
    yield put(confirmPaymentFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Cancel payment transaction
function* cancelPaymentSaga(action) {
  try {
    const { code } = action.payload;
    yield call(planAPI.cancelPayment, code);
    yield put(cancelPaymentSuccess());
    yield call(() => toast.info(i18n.t("notifications:payment.cancelledToast", "Payment session has expired and been cancelled.")));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to cancel payment");
    yield put(cancelPaymentFailure(errorMessage));
  }
}

export function* planSaga() {
  yield takeLatest(getPlansRequest.type, getPlansSaga);
  yield takeLatest(createPaymentRequest.type, createPaymentSaga);
  yield takeLatest(confirmPaymentRequest.type, confirmPaymentSaga);
  yield takeLatest(cancelPaymentRequest.type, cancelPaymentSaga);
}
