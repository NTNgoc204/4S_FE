import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
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
    yield call(() => toast.success("Payment confirmed successfully!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Payment confirmation failed");
    yield put(confirmPaymentFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

export function* planSaga() {
  yield takeLatest(getPlansRequest.type, getPlansSaga);
  yield takeLatest(createPaymentRequest.type, createPaymentSaga);
  yield takeLatest(confirmPaymentRequest.type, confirmPaymentSaga);
}
