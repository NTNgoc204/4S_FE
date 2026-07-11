import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { eduAPI } from "./eduAPI";
import {
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
} from "./eduSlice";

// Helper: map BE response → FE shape
function mapRegistration(r) {
  return {
    id: r.id,
    schoolName: r.schoolName,
    representative: r.contactName,
    contactName: r.contactName,
    phoneNumber: r.phoneNumber,
    email: r.email,
    planName: r.planName,
    planId: r.planId,
    studentCount: r.studentCount,
    price: r.price ?? r.totalAmount ?? 0,
    createdAt: r.createdAt
      ? new Date(r.createdAt).toLocaleString("sv-SE").substring(0, 16)
      : "",
    status: r.status,
    transactionCode: r.transactionCode,
    notes: r.notes,
    // FE-only fields (chưa có trong BE response)
    activationKey: r.activationKey ?? "",
    studentEmails: r.studentEmails ?? [],
  };
}

// ── Fetch registrations ────────────────────────────────────────────────────
function* fetchRegistrationsSaga() {
  try {
    const response = yield call(eduAPI.getRegistrations);
    const mapped = (response.data || []).map(mapRegistration);
    yield put(fetchRegistrationsSuccess(mapped));
  } catch (error) {
    const msg =
      error?.response?.data?.message || "Không thể tải danh sách đăng ký.";
    yield put(fetchRegistrationsFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Send quote: create-payment → send-payment-email → update-status=Quoted
function* sendQuoteSaga(action) {
  const { id, emailContent, onSuccess } = action.payload;
  try {
    // 1. Tạo payment link (QR + payOS)
    yield call(eduAPI.createPayment, id);

    // 2. Gửi email báo giá kèm QR cho trường
    yield call(eduAPI.sendPaymentEmail, id, { emailContent });

    // 3. Update status → Quoted
    yield call(eduAPI.updateStatus, id, "Quoted");

    yield put(sendQuoteSuccess());

    // Refresh list
    const response = yield call(eduAPI.getRegistrations);
    const mapped = (response.data || []).map(mapRegistration);
    yield put(fetchRegistrationsSuccess(mapped));

    yield call(() =>
      toast.success(
        "Đã tạo QR thanh toán và gửi email báo giá cho trường thành công!"
      )
    );

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const msg =
      error?.response?.data?.message || "Lỗi gửi báo giá. Vui lòng thử lại.";
    yield put(sendQuoteFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Confirm school payment → update-status=Paid ───────────────────────────
function* confirmPaymentSaga(action) {
  const { id, onSuccess } = action.payload;
  try {
    yield call(eduAPI.updateStatus, id, "Paid");
    yield put(confirmPaymentSuccess());

    // Refresh list
    const response = yield call(eduAPI.getRegistrations);
    const mapped = (response.data || []).map(mapRegistration);
    yield put(fetchRegistrationsSuccess(mapped));

    yield call(() =>
      toast.success(
        `Xác nhận thanh toán đơn ${id} thành công. Đã thông báo cho ban tiếp nhận!`
      )
    );

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      "Lỗi xác nhận thanh toán. Vui lòng thử lại.";
    yield put(confirmPaymentFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Complete: after import emails → update-status=Completed ───────────────
function* completeRegistrationSaga(action) {
  const { id, formData, onSuccess } = action.payload;
  try {
    // 1. Gọi API import keys của BE bằng file docx
    const importResponse = yield call(eduAPI.importKeys, id, formData);
    const keysList = importResponse.data || []; // Mảng các đối tượng chứa email & activationKey từ BE

    yield put(completeRegistrationSuccess());

    // 2. Tải lại danh sách từ BE
    const response = yield call(eduAPI.getRegistrations);
    const mapped = (response.data || []).map(mapRegistration);
    
    // 3. Cập nhật cục bộ các keys nhận được từ BE cho đơn đăng ký này
    const mergedMapped = mapped.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "Completed",
            activationKey: keysList[0]?.activationKey || "", // Lưu key đầu làm đại diện
            studentEmails: keysList, // Lưu danh sách các keys chi tiết
          }
        : r
    );
    yield put(fetchRegistrationsSuccess(mergedMapped));

    yield call(() =>
      toast.success(
        `Import file thành công! Đã sinh mã kích hoạt học đường.`
      )
    );

    if (typeof onSuccess === "function") {
      yield call(onSuccess, keysList);
    }
  } catch (error) {
    const msg =
      error?.response?.data?.message || "Lỗi nhập tệp và cấp mã kích hoạt.";
    yield put(completeRegistrationFailure(msg));
    yield call(() => toast.error(msg));
  }
}

// ── Watcher ────────────────────────────────────────────────────────────────
export function* eduSaga() {
  yield takeLatest(fetchRegistrationsRequest.type, fetchRegistrationsSaga);
  yield takeLatest(sendQuoteRequest.type, sendQuoteSaga);
  yield takeLatest(confirmPaymentRequest.type, confirmPaymentSaga);
  yield takeLatest(completeRegistrationRequest.type, completeRegistrationSaga);
}
