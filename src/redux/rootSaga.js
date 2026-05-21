import { all } from "redux-saga/effects";
import { authSaga } from "../feature/auth/authSaga";

export function* rootSaga() {
  yield all([authSaga()]);
}
