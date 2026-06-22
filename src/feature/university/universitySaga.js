import { all, call, put, takeLatest, takeEvery } from "redux-saga/effects";
import { toast } from "react-toastify";
import { universityAPI } from "./universityAPI";
import { mapUniversityDetail } from "../../util/universityMapper";
import { getErrorMessage } from "../../util/errorConstants";
import {
  fetchUniversitiesRequest,
  fetchUniversitiesSuccess,
  fetchUniversitiesFailure,
  fetchUniversityDetailRequest,
  fetchUniversityDetailSuccess,
  fetchUniversityDetailFailure,
  createUniversityRequest,
  createUniversitySuccess,
  createUniversityFailure,
  updateUniversityRequest,
  updateUniversitySuccess,
  updateUniversityFailure,
  deleteUniversityRequest,
  deleteUniversitySuccess,
  deleteUniversityFailure,
  fetchUniversityMajorsRequest,
  fetchUniversityMajorsSuccess,
  fetchUniversityMajorsFailure,
  createUniversityMajorRequest,
  createUniversityMajorSuccess,
  createUniversityMajorFailure,
  updateUniversityMajorRequest,
  updateUniversityMajorSuccess,
  updateUniversityMajorFailure,
  deleteUniversityMajorRequest,
  deleteUniversityMajorSuccess,
  deleteUniversityMajorFailure,
  fetchGlobalMajorsRequest,
  fetchGlobalMajorsSuccess,
  fetchGlobalMajorsFailure,
} from "./universitySlice";

// 1. Fetch Universities List
function* fetchUniversitiesSaga(action) {
  try {
    const search = action.payload || "";
    // Fetch a large page size (e.g. 100) to list in CMS
    const response = yield call(universityAPI.getUniversities, search, 1, 100);
    const list = response.data?.data || response.data || [];
    yield put(fetchUniversitiesSuccess(list));
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to fetch universities.");
    yield put(fetchUniversitiesFailure(errorMsg));
  }
}

// 2. Fetch University Detail (with majors, for student page)
function* fetchUniversityDetailSaga(action) {
  try {
    const id = action.payload;

    // Fetch university details and its majors in parallel
    const [uniResponse, majorsResponse] = yield all([
      call(universityAPI.getUniversityById, id),
      call(universityAPI.getUniversityMajors, id),
    ]);

    const university = mapUniversityDetail(uniResponse.data);
    if (!university) {
      throw new Error("The university response is invalid.");
    }

    const rawMajors = majorsResponse.data?.data || [];
    university.majors = rawMajors.map((item) => ({
      id: item.id,
      majorId: item.majorId,
      name: item.major?.name || "",
      majorDescription: item.major?.description || "",
      description: item.description || "",
      score: item.cutoffScore || 0,
      quota: item.quota || 0,
      tuition: item.tuition || 0,
      degreeType: item.degreeType || "Cử nhân",
      language: item.language || "Tiếng Việt",
    }));

    university.scholarships = []; // Not supported by DB

    yield put(fetchUniversityDetailSuccess(university));
  } catch (error) {
    const defaultErr = "Failed to fetch university details.";
    const errorMessage = getErrorMessage(error, defaultErr);
    yield put(fetchUniversityDetailFailure(errorMessage));
  }
}

// 3. Create University
function* createUniversitySaga(action) {
  try {
    const { data, onSuccess } = action.payload;
    const response = yield call(universityAPI.createUniversity, {
      name: data.name,
      shortName: data.shortName,
      location: data.location,
      ranking: Number(data.ranking) || 1,
      avatar: data.avatar || null,
    });
    yield put(createUniversitySuccess(response.data));
    yield put(fetchUniversitiesRequest());
    yield call(() => toast.success("Created university successfully!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess, response.data);
    }
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to create university.");
    yield put(createUniversityFailure(errorMsg));
    yield call(() => toast.error(errorMsg));
  }
}

// 4. Update University
function* updateUniversitySaga(action) {
  try {
    const { data, onSuccess } = action.payload;
    yield call(universityAPI.updateUniversity, {
      universityId: data.id || data.universityId,
      name: data.name,
      shortName: data.shortName,
      location: data.location,
      ranking: Number(data.ranking) || 1,
      avatar: data.avatar || null,
    });
    yield put(
      updateUniversitySuccess({
        universityId: data.id || data.universityId,
        name: data.name,
        shortName: data.shortName,
        location: data.location,
        ranking: Number(data.ranking) || 1,
        avatar: data.avatar || null,
      })
    );
    yield put(fetchUniversitiesRequest());
    yield call(() => toast.success("Updated university successfully!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to update university.");
    yield put(updateUniversityFailure(errorMsg));
    yield call(() => toast.error(errorMsg));
  }
}

// 5. Delete University
function* deleteUniversitySaga(action) {
  try {
    const { id, onSuccess } = action.payload;
    yield call(universityAPI.deleteUniversity, id);
    yield put(deleteUniversitySuccess(id));
    yield call(() => toast.success("Deleted university successfully!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to delete university.");
    yield put(deleteUniversityFailure(errorMsg));
    yield call(() => toast.error(errorMsg));
  }
}

// 6. Fetch University Majors
function* fetchUniversityMajorsSaga(action) {
  try {
    const universityId = action.payload;
    const response = yield call(universityAPI.getUniversityMajors, universityId);
    const rawList = response.data?.data || [];
    const mapped = rawList.map((m) => ({
      id: m.id,
      majorId: m.majorId,
      name: m.major?.name || "",
      majorDescription: m.major?.description || "",
      description: m.description || "",
      score: m.cutoffScore || 0,
      quota: m.quota || 0,
      tuition: m.tuition || 0,
      degreeType: m.degreeType || "Cử nhân",
      language: m.language || "Tiếng Việt",
    }));
    yield put(fetchUniversityMajorsSuccess(mapped));
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to fetch university majors.");
    yield put(fetchUniversityMajorsFailure(errorMsg));
  }
}

// 7. Create University Major (including global major seeding if not found)
function* createUniversityMajorSaga(action) {
  try {
    const {
      universityId,
      name,
      code, // Represents universityMajor.description (e.g. "Kỹ thuật phần mềm DUT")
      score,
      quota,
      tuition,
      degreeType,
      language,
      majorDescription, // Represents major.description
      onSuccess,
    } = action.payload;

    // A. Query global majors to find if we already have it
    const majorsResponse = yield call(universityAPI.getGlobalMajors);
    const globalMajors = majorsResponse.data?.data || [];

    let matchedMajor = globalMajors.find(
      (m) => m.name?.toLowerCase().trim() === name.toLowerCase().trim()
    );

    let majorId;
    if (matchedMajor) {
      majorId = matchedMajor.majorId;
      // If global major exists but has a different description, update it
      if (majorDescription && matchedMajor.description !== majorDescription) {
        yield call(universityAPI.updateGlobalMajor, majorId, {
          name,
          description: majorDescription,
        });
      }
    } else {
      // Create new global major record
      const newMajorRes = yield call(universityAPI.createGlobalMajor, {
        name,
        description: majorDescription || "",
      });
      majorId = newMajorRes.data?.data?.majorId;
    }

    if (!majorId) {
      throw new Error("Could not create/find corresponding global Major record.");
    }

    // B. Create university-major link record
    yield call(universityAPI.createUniversityMajor, {
      universityId,
      majorId,
      cutoffScore: Number(score) || 0,
      quota: Number(quota) || 0,
      tuition: Number(tuition) || 0,
      degreeType: degreeType || "Cử nhân",
      language: language || "Tiếng Việt",
      description: code || "",
      currency: "VND",
      year: new Date().getFullYear(),
    });

    // C. Refresh university majors list in state
    yield put(fetchUniversityMajorsRequest(universityId));
    yield call(() => toast.success("Major added to university catalog!"));

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMsg = getErrorMessage(
      error,
      "Failed to add major to university."
    );
    yield put(createUniversityMajorFailure(errorMsg));
    yield call(() => toast.error(errorMsg));
  }
}

// 8. Update University Major
function* updateUniversityMajorSaga(action) {
  try {
    const {
      id,
      universityId,
      majorId,
      name,
      code, // Represents universityMajor.description
      score,
      quota,
      tuition,
      degreeType,
      language,
      majorDescription, // Represents major.description
      onSuccess,
    } = action.payload;

    // A. Update global major details
    yield call(universityAPI.updateGlobalMajor, majorId, {
      name,
      description: majorDescription,
    });

    // B. Update university-major details
    yield call(universityAPI.updateUniversityMajor, {
      id,
      universityId,
      majorId,
      cutoffScore: Number(score) || 0,
      quota: Number(quota) || 0,
      tuition: Number(tuition) || 0,
      degreeType: degreeType || "Cử nhân",
      language: language || "Tiếng Việt",
      description: code || "",
      currency: "VND",
      year: new Date().getFullYear(),
    });

    // C. Refresh list
    yield put(fetchUniversityMajorsRequest(universityId));
    yield call(() => toast.success("Major updated successfully!"));

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to update major.");
    yield put(updateUniversityMajorFailure(errorMsg));
    yield call(() => toast.error(errorMsg));
  }
}

// 9. Delete University Major
function* deleteUniversityMajorSaga(action) {
  try {
    const { id, universityId, onSuccess } = action.payload;
    yield call(universityAPI.deleteUniversityMajor, id);

    // Refresh list
    yield put(fetchUniversityMajorsRequest(universityId));
    yield call(() => toast.success("Major deleted from university catalog!"));

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to delete major.");
    yield put(deleteUniversityMajorFailure(errorMsg));
    yield call(() => toast.error(errorMsg));
  }
}

// 10. Fetch Global Majors List
function* fetchGlobalMajorsSaga() {
  try {
    const response = yield call(universityAPI.getGlobalMajors);
    const list = response.data?.data || [];
    yield put(fetchGlobalMajorsSuccess(list));
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to fetch global majors.");
    yield put(fetchGlobalMajorsFailure(errorMsg));
  }
}

export function* universitySaga() {
  yield takeLatest(fetchUniversitiesRequest.type, fetchUniversitiesSaga);
  yield takeLatest(fetchUniversityDetailRequest.type, fetchUniversityDetailSaga);
  yield takeEvery(createUniversityRequest.type, createUniversitySaga);
  yield takeEvery(updateUniversityRequest.type, updateUniversitySaga);
  yield takeEvery(deleteUniversityRequest.type, deleteUniversitySaga);
  yield takeLatest(fetchUniversityMajorsRequest.type, fetchUniversityMajorsSaga);
  yield takeEvery(createUniversityMajorRequest.type, createUniversityMajorSaga);
  yield takeEvery(updateUniversityMajorRequest.type, updateUniversityMajorSaga);
  yield takeEvery(deleteUniversityMajorRequest.type, deleteUniversityMajorSaga);
  yield takeLatest(fetchGlobalMajorsRequest.type, fetchGlobalMajorsSaga);
}
