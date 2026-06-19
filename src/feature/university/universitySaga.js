import { call, put, takeLatest } from "redux-saga/effects";
import { universityAPI } from "./universityAPI";
import { mapUniversityDetail } from "../../util/universityMapper";
import { getErrorMessage } from "../../util/errorConstants";
import {
  fetchUniversityDetailRequest,
  fetchUniversityDetailSuccess,
  fetchUniversityDetailFailure,
} from "./universitySlice";

function* fetchUniversityDetailSaga(action) {
  try {
    const id = action.payload;
    const response = yield call(universityAPI.getUniversityById, id);
    const university = mapUniversityDetail(response.data);

    if (!university) {
      throw new Error("The university response is invalid.");
    }

    yield put(fetchUniversityDetailSuccess(university));
  } catch (error) {
    const defaultErr = "Failed to fetch university details.";
    const errorMessage = getErrorMessage(error, defaultErr);
    yield put(fetchUniversityDetailFailure(errorMessage));
  }
}

export function* universitySaga() {
  yield takeLatest(fetchUniversityDetailRequest.type, fetchUniversityDetailSaga);
}
