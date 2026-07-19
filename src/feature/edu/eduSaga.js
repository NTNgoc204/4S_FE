import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { eduAPI } from "./eduAPI";
import { planAPI } from "../plan/planAPI";
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

// Helper: map BE response → FE shape using real plan prices from BE
function mapRegistration(r, plans = []) {
  const keys = r.activationKeys || [];

  // Tìm gói cước trong DB để lấy giá cho 1 học sinh
  const plan = plans.find((p) => p.id === r.planId);
  const pricePerStudent = plan ? plan.price : 10000; // Mặc định 10,000 VND nếu không tìm thấy

  // Tính tổng giá dựa trên giá của gói cước nhân với số lượng học sinh đăng ký
  const calculatedPrice = (r.price || r.totalAmount)
    ? (r.price || r.totalAmount)
    : (r.studentCount * pricePerStudent);

  // Đọc mã kích hoạt dự phòng từ localStorage nếu Backend không trả về trong API list
  let localKey = "";
  try {
    const storedKeys = localStorage.getItem("4s_school_activation_keys");
    if (storedKeys) {
      const keysMap = JSON.parse(storedKeys);
      localKey = keysMap[r.id] || "";
    }
  } catch (e) {
    console.error("Error reading localStorage:", e);
  }

  const finalKey = keys.length > 0 ? keys[0].activationKey : localKey;

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
    price: calculatedPrice,
    createdAt: r.createdAt
      ? new Date(r.createdAt).toLocaleString("sv-SE").substring(0, 16)
      : "",
    status: r.status,
    transactionCode: r.transactionCode,
    notes: r.notes,
    activationKey: finalKey,
    studentEmails: finalKey ? [{ email: r.email, activationKey: finalKey }] : [],
  };
}

// Helper to fetch both plans and registrations and map them
function* fetchAndMapRegistrations() {
  const plansResponse = yield call(planAPI.getPlans);
  const plans = plansResponse.data || [];

  const response = yield call(eduAPI.getRegistrations);
  return (response.data || []).map((r) => mapRegistration(r, plans));
}

// ── Fetch registrations ────────────────────────────────────────────────────
function* fetchRegistrationsSaga() {
  try {
    const mapped = yield call(fetchAndMapRegistrations);
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
  const { id, emailContent, isResend, onSuccess } = action.payload;
  try {
    if (!isResend) {
      // 1. Tạo payment link (QR + payOS) - Chỉ chạy lần đầu tiên
      yield call(eduAPI.createPayment, id);
    }

    // 2. Gửi email báo giá kèm QR cho trường
    yield call(eduAPI.sendPaymentEmail, id, { emailContent });

    if (!isResend) {
      // 3. Update status → Quoted - Chỉ chạy lần đầu
      yield call(eduAPI.updateStatus, id, "Quoted");
    }

    yield put(sendQuoteSuccess());

    // Refresh list
    const mapped = yield call(fetchAndMapRegistrations);
    yield put(fetchRegistrationsSuccess(mapped));

    yield call(() =>
      toast.success(
        isResend
          ? "Đã gửi lại email báo giá cho trường thành công!"
          : "Đã tạo QR thanh toán và gửi email báo giá cho trường thành công!"
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
    const mapped = yield call(fetchAndMapRegistrations);
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

    // Lưu khoá kích hoạt nhận được vào localStorage để hiển thị lâu dài sau khi F5
    const sharedKey = keysList[0]?.activationKey || "";
    if (sharedKey) {
      try {
        const storedKeys = localStorage.getItem("4s_school_activation_keys");
        const keysMap = storedKeys ? JSON.parse(storedKeys) : {};
        keysMap[id] = sharedKey;
        localStorage.setItem("4s_school_activation_keys", JSON.stringify(keysMap));
      } catch (e) {
        console.error("Failed to save key to localStorage:", e);
      }
    }

    yield put(completeRegistrationSuccess());

    // 2. Tải lại danh sách từ BE
    const mapped = yield call(fetchAndMapRegistrations);

    // 3. Cập nhật cục bộ các keys nhận được từ BE cho đơn đăng ký này
    const mergedMapped = mapped.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "Completed",
            activationKey: sharedKey,
            studentEmails: keysList,
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
