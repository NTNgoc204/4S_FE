import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  universityDetail: null,
  universityLoading: false,
  universityError: null,
};

const universitySlice = createSlice({
  name: "university",
  initialState,
  reducers: {
    fetchUniversityDetailRequest: (state) => {
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
  },
});

export const {
  fetchUniversityDetailRequest,
  fetchUniversityDetailSuccess,
  fetchUniversityDetailFailure,
} = universitySlice.actions;

export default universitySlice.reducer;
