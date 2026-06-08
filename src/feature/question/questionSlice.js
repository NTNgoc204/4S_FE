import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  categories: [],
  loading: false,
  importLoading: false,
  submitLoading: false,
  error: null,
  importSuccess: false,
  submitSuccess: false,
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    // Fetch Questions
    fetchQuestionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchQuestionsSuccess: (state, action) => {
      state.loading = false;
      state.questions = action.payload;
    },
    fetchQuestionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch Categories
    fetchCategoriesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess: (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    },
    fetchCategoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Import Questions
    importQuestionsRequest: (state) => {
      state.importLoading = true;
      state.importSuccess = false;
      state.error = null;
    },
    importQuestionsSuccess: (state) => {
      state.importLoading = false;
      state.importSuccess = true;
    },
    importQuestionsFailure: (state, action) => {
      state.importLoading = false;
      state.importSuccess = false;
      state.error = action.payload;
    },

    // Update Option ScoreTag
    updateQuestionOptionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateQuestionOptionSuccess: (state, action) => {
      state.loading = false;
      // Update in local state
      const { optionId, data } = action.payload;
      state.questions = state.questions.map((q) => {
        if (q.options) {
          const updatedOptions = q.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, ...data };
            }
            return opt;
          });
          return { ...q, options: updatedOptions };
        }
        return q;
      });
    },
    updateQuestionOptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Submit Answers (Student)
    submitAnswersRequest: (state) => {
      state.submitLoading = true;
      state.submitSuccess = false;
      state.error = null;
    },
    submitAnswersSuccess: (state) => {
      state.submitLoading = false;
      state.submitSuccess = true;
    },
    submitAnswersFailure: (state, action) => {
      state.submitLoading = false;
      state.submitSuccess = false;
      state.error = action.payload;
    },

    resetImportState: (state) => {
      state.importSuccess = false;
      state.error = null;
    },

    resetSubmitState: (state) => {
      state.submitSuccess = false;
      state.error = null;
    },

    clearQuestionError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchQuestionsRequest,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  importQuestionsRequest,
  importQuestionsSuccess,
  importQuestionsFailure,
  updateQuestionOptionRequest,
  updateQuestionOptionSuccess,
  updateQuestionOptionFailure,
  submitAnswersRequest,
  submitAnswersSuccess,
  submitAnswersFailure,
  resetImportState,
  resetSubmitState,
  clearQuestionError,
} = questionSlice.actions;

export default questionSlice.reducer;
