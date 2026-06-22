import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Directory list (for CMS and lists)
  universities: [],
  universitiesLoading: false,
  universitiesError: null,

  // Selected University Details (for Student profile view)
  universityDetail: null,
  requestedUniversityId: null,
  universityLoading: false,
  universityError: null,

  // University Majors (specific to the selected school)
  universityMajors: [],
  universityMajorsLoading: false,
  universityMajorsError: null,

  // Global Majors List (common catalog)
  globalMajors: [],
  globalMajorsLoading: false,
  globalMajorsError: null,
};

const universitySlice = createSlice({
  name: "university",
  initialState,
  reducers: {
    // ── Fetch Universities ───────────────────────────────────
    fetchUniversitiesRequest: (state) => {
      state.universitiesLoading = true;
      state.universitiesError = null;
    },
    fetchUniversitiesSuccess: (state, action) => {
      state.universitiesLoading = false;
      state.universities = action.payload; // array of universities
    },
    fetchUniversitiesFailure: (state, action) => {
      state.universitiesLoading = false;
      state.universitiesError = action.payload;
    },

    // ── Fetch University Detail (Student portal) ─────────────
    fetchUniversityDetailRequest: (state, action) => {
      state.requestedUniversityId = action.payload;
      state.universityLoading = true;
      state.universityError = null;
      state.universityDetail = null;
    },
    fetchUniversityDetailSuccess: (state, action) => {
      state.universityLoading = false;
      state.universityDetail = action.payload;
    },
    fetchUniversityDetailFailure: (state, action) => {
      state.universityLoading = false;
      state.universityError = action.payload;
    },

    // ── Create University ────────────────────────────────────
    createUniversityRequest: (state, action) => {
      state.universitiesLoading = true;
    },
    createUniversitySuccess: (state, action) => {
      state.universitiesLoading = false;
      state.universities = [...state.universities, action.payload];
    },
    createUniversityFailure: (state) => {
      state.universitiesLoading = false;
    },

    // ── Update University ────────────────────────────────────
    updateUniversityRequest: (state, action) => {
      state.universitiesLoading = true;
    },
    updateUniversitySuccess: (state, action) => {
      state.universitiesLoading = false;
      const updatedUni = action.payload;
      state.universities = state.universities.map((uni) =>
        uni.universityId === updatedUni.universityId ? updatedUni : uni
      );
      if (
        state.universityDetail &&
        state.universityDetail.id === updatedUni.universityId
      ) {
        state.universityDetail = {
          ...state.universityDetail,
          ...updatedUni,
        };
      }
    },
    updateUniversityFailure: (state) => {
      state.universitiesLoading = false;
    },

    // ── Delete University ────────────────────────────────────
    deleteUniversityRequest: (state, action) => {
      state.universitiesLoading = true;
    },
    deleteUniversitySuccess: (state, action) => {
      state.universitiesLoading = false;
      const id = action.payload;
      state.universities = state.universities.filter(
        (uni) => uni.universityId !== id
      );
    },
    deleteUniversityFailure: (state) => {
      state.universitiesLoading = false;
    },

    // ── Fetch University Majors ──────────────────────────────
    fetchUniversityMajorsRequest: (state, action) => {
      state.universityMajorsLoading = true;
      state.universityMajorsError = null;
    },
    fetchUniversityMajorsSuccess: (state, action) => {
      state.universityMajorsLoading = false;
      state.universityMajors = action.payload;
    },
    fetchUniversityMajorsFailure: (state, action) => {
      state.universityMajorsLoading = false;
      state.universityMajorsError = action.payload;
    },

    // ── Create University Major ──────────────────────────────
    createUniversityMajorRequest: (state, action) => {
      state.universityMajorsLoading = true;
    },
    createUniversityMajorSuccess: (state, action) => {
      state.universityMajorsLoading = false;
      state.universityMajors = [...state.universityMajors, action.payload];
    },
    createUniversityMajorFailure: (state) => {
      state.universityMajorsLoading = false;
    },

    // ── Update University Major ──────────────────────────────
    updateUniversityMajorRequest: (state, action) => {
      state.universityMajorsLoading = true;
    },
    updateUniversityMajorSuccess: (state, action) => {
      state.universityMajorsLoading = false;
      const updated = action.payload;
      state.universityMajors = state.universityMajors.map((item) =>
        item.id === updated.id ? updated : item
      );
    },
    updateUniversityMajorFailure: (state) => {
      state.universityMajorsLoading = false;
    },

    // ── Delete University Major ──────────────────────────────
    deleteUniversityMajorRequest: (state, action) => {
      state.universityMajorsLoading = true;
    },
    deleteUniversityMajorSuccess: (state, action) => {
      state.universityMajorsLoading = false;
      const id = action.payload;
      state.universityMajors = state.universityMajors.filter(
        (item) => item.id !== id
      );
    },
    deleteUniversityMajorFailure: (state) => {
      state.universityMajorsLoading = false;
    },

    // ── Fetch Global Majors ──────────────────────────────────
    fetchGlobalMajorsRequest: (state) => {
      state.globalMajorsLoading = true;
      state.globalMajorsError = null;
    },
    fetchGlobalMajorsSuccess: (state, action) => {
      state.globalMajorsLoading = false;
      state.globalMajors = action.payload;
    },
    fetchGlobalMajorsFailure: (state, action) => {
      state.globalMajorsLoading = false;
      state.globalMajorsError = action.payload;
    },
  },
});

export const {
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
} = universitySlice.actions;

export default universitySlice.reducer;

