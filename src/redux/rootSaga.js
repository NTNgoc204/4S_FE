import { all } from "redux-saga/effects";
import { authSaga } from "../feature/auth/authSaga";
import { planSaga } from "../feature/plan/planSaga";
import { notificationSaga } from "../feature/notification/notificationSaga";
import { adminSaga } from "../feature/admin/adminSaga";

export function* rootSaga() {
  yield all([authSaga(), planSaga(), notificationSaga(), adminSaga()]);
}
