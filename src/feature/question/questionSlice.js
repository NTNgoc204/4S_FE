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

  // Guided Quiz states
  answers: {},
  insights: {},
  activeIndex: 0,
  overallSummary: "",
  aiRecommendations: [],
  progressLoading: false,
  evaluationLoading: false,
  thinkingQuestionId: "",
  overallLoading: false,
  redoLoading: false,
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

    // Fetch User Progress (Guided Quiz load progress on mount)
    fetchUserProgressRequest: (state) => {
      state.progressLoading = true;
      state.error = null;
    },
    fetchUserProgressSuccess: (state, action) => {
      state.progressLoading = false;
      const { answers, insights, activeIndex, overallSummary, aiRecommendations } = action.payload;
      state.answers = answers;
      state.insights = insights;
      state.activeIndex = activeIndex;
      state.overallSummary = overallSummary;
      state.aiRecommendations = aiRecommendations;
    },
    fetchUserProgressFailure: (state, action) => {
      state.progressLoading = false;
      state.error = action.payload;
    },

    // Submit Answer Incrementally
    submitAnswerIncrementRequest: (state) => {
      state.error = null;
    },
    submitAnswerIncrementSuccess: (state, action) => {
      const { questionId, answerId, customText } = action.payload;
      state.answers[questionId] = customText || answerId;
    },
    submitAnswerIncrementFailure: (state, action) => {
      state.error = action.payload;
    },

    // Set Active Index
    setActiveIndex: (state, action) => {
      state.activeIndex = action.payload;
    },

    // Evaluate Category
    evaluateCategoryRequest: (state, action) => {
      state.evaluationLoading = true;
      state.thinkingQuestionId = action.payload.questionId;
      state.error = null;
    },
    evaluateCategorySuccess: (state, action) => {
      state.evaluationLoading = false;
      state.thinkingQuestionId = "";
      const { questionId, evaluationText } = action.payload;
      state.insights[questionId] = evaluationText;
    },
    evaluateCategoryFailure: (state, action) => {
      state.evaluationLoading = false;
      state.thinkingQuestionId = "";
      state.error = action.payload;
    },

    // Evaluate Overall Summary
    evaluateOverallRequest: (state) => {
      state.overallLoading = true;
      state.error = null;
    },
    evaluateOverallSuccess: (state, action) => {
      state.overallLoading = false;
      const { overallSummary, aiRecommendations } = action.payload;
      state.overallSummary = overallSummary;
      state.aiRecommendations = aiRecommendations;
    },
    evaluateOverallFailure: (state, action) => {
      state.overallLoading = false;
      state.error = action.payload;
    },

    // Redo Quiz
    redoQuizRequest: (state) => {
      state.redoLoading = true;
      state.error = null;
    },
    redoQuizSuccess: (state) => {
      state.redoLoading = false;
      state.answers = {};
      state.insights = {};
      state.activeIndex = 0;
      state.overallSummary = "";
      state.aiRecommendations = [];
    },
    redoQuizFailure: (state, action) => {
      state.redoLoading = false;
      state.error = action.payload;
    },

    // Download Template
    downloadTemplateRequest: (state) => {
      state.error = null;
    },
    downloadTemplateSuccess: (state) => {
      state.error = null;
    },
    downloadTemplateFailure: (state, action) => {
      state.error = action.payload;
    },

    // Category CRUD
    createCategoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCategorySuccess: (state) => {
      state.loading = false;
    },
    createCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateCategoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCategorySuccess: (state) => {
      state.loading = false;
    },
    updateCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteCategoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteCategorySuccess: (state) => {
      state.loading = false;
    },
    deleteCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Question CRUD
    createQuestionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createQuestionSuccess: (state) => {
      state.loading = false;
    },
    createQuestionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateQuestionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateQuestionSuccess: (state) => {
      state.loading = false;
    },
    updateQuestionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteQuestionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteQuestionSuccess: (state) => {
      state.loading = false;
    },
    deleteQuestionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Option CRUD
    createQuestionOptionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createQuestionOptionSuccess: (state) => {
      state.loading = false;
    },
    createQuestionOptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteQuestionOptionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteQuestionOptionSuccess: (state) => {
      state.loading = false;
    },
    deleteQuestionOptionFailure: (state, action) => {
      state.loading = false;
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
  fetchUserProgressRequest,
  fetchUserProgressSuccess,
  fetchUserProgressFailure,
  submitAnswerIncrementRequest,
  submitAnswerIncrementSuccess,
  submitAnswerIncrementFailure,
  setActiveIndex,
  evaluateCategoryRequest,
  evaluateCategorySuccess,
  evaluateCategoryFailure,
  evaluateOverallRequest,
  evaluateOverallSuccess,
  evaluateOverallFailure,
  redoQuizRequest,
  redoQuizSuccess,
  redoQuizFailure,
  resetImportState,
  resetSubmitState,
  clearQuestionError,
  downloadTemplateRequest,
  downloadTemplateSuccess,
  downloadTemplateFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryFailure,
  deleteCategoryRequest,
  deleteCategorySuccess,
  deleteCategoryFailure,
  createQuestionRequest,
  createQuestionSuccess,
  createQuestionFailure,
  updateQuestionRequest,
  updateQuestionSuccess,
  updateQuestionFailure,
  deleteQuestionRequest,
  deleteQuestionSuccess,
  deleteQuestionFailure,
  createQuestionOptionRequest,
  createQuestionOptionSuccess,
  createQuestionOptionFailure,
  deleteQuestionOptionRequest,
  deleteQuestionOptionSuccess,
  deleteQuestionOptionFailure,
} = questionSlice.actions;

export default questionSlice.reducer;
