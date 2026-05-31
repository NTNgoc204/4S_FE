import { call, put, takeLatest } from "redux-saga/effects";
import {
  loadNotificationsRequest,
  addNotificationRequest,
  markAsReadRequest,
  markAllAsReadRequest,
  clearNotificationsRequest,
  setNotifications,
} from "./notificationSlice";

const getNotificationsFromStorage = () => {
  try {
    const serialized = localStorage.getItem("4s_notifications");
    return serialized ? JSON.parse(serialized) : [];
  } catch (err) {
    return [];
  }
};

const saveNotificationsToStorage = (notifications) => {
  try {
    localStorage.setItem("4s_notifications", JSON.stringify(notifications));
  } catch (err) {
    // Ignore write errors
  }
};

function* loadNotificationsSaga() {
  const notifications = yield call(getNotificationsFromStorage);
  yield put(setNotifications(notifications));
}

function* addNotificationSaga(action) {
  const currentNotifications = yield call(getNotificationsFromStorage);
  const newNoti = {
    id: Math.random().toString(36).substring(2, 9),
    title: action.payload.title,
    message: action.payload.message,
    type: action.payload.type || "info",
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  const updated = [newNoti, ...currentNotifications];
  yield call(saveNotificationsToStorage, updated);
  yield put(setNotifications(updated));
}

function* markAsReadSaga(action) {
  const currentNotifications = yield call(getNotificationsFromStorage);
  const id = action.payload;
  const updated = currentNotifications.map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );
  yield call(saveNotificationsToStorage, updated);
  yield put(setNotifications(updated));
}

function* markAllAsReadSaga() {
  const currentNotifications = yield call(getNotificationsFromStorage);
  const updated = currentNotifications.map((n) => ({ ...n, isRead: true }));
  yield call(saveNotificationsToStorage, updated);
  yield put(setNotifications(updated));
}

function* clearNotificationsSaga() {
  yield call(saveNotificationsToStorage, []);
  yield put(setNotifications([]));
}

export function* notificationSaga() {
  yield takeLatest(loadNotificationsRequest.type, loadNotificationsSaga);
  yield takeLatest(addNotificationRequest.type, addNotificationSaga);
  yield takeLatest(markAsReadRequest.type, markAsReadSaga);
  yield takeLatest(markAllAsReadRequest.type, markAllAsReadSaga);
  yield takeLatest(clearNotificationsRequest.type, clearNotificationsSaga);
}
