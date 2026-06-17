import apiClient from "../../config/apiClient";

export const questionAPI = {
  // Questions CRUD
  getAllQuestions: () => apiClient.get("/api/Questions"),
  
  getQuestionById: (id) => apiClient.get(`/api/Questions/${id}`),
  
  createQuestion: (data) => apiClient.post("/api/Questions", data),
  
  updateQuestion: (id, data) => apiClient.put(`/api/Questions/${id}`, data),
  
  deleteQuestion: (id) => apiClient.delete(`/api/Questions/${id}`),

  getQuestionsByCategoryId: (categoryId) => apiClient.get(`/api/Questions/category/${categoryId}`),

  // Import Docx & Template
  importQuestions: (formData) => apiClient.post("/api/Questions/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),

  downloadTemplate: () => apiClient.get("/api/Questions/template", {
    responseType: "blob",
  }),

  // Question Options CRUD
  getAllOptions: () => apiClient.get("/api/QuestionOptions"),
  
  createQuestionOption: (data) => apiClient.post("/api/QuestionOptions", data),
  
  updateQuestionOption: (id, data) => apiClient.put(`/api/QuestionOptions/${id}`, data),
  
  deleteQuestionOption: (id) => apiClient.delete(`/api/QuestionOptions/${id}`),

  // Question Categories CRUD
  getAllCategories: () => apiClient.get("/api/QuestionCategories"),
  
  createCategory: (data) => apiClient.post("/api/QuestionCategories", data),
  
  updateCategory: (id, data) => apiClient.put(`/api/QuestionCategories/${id}`, data),
  
  deleteCategory: (id) => apiClient.delete(`/api/QuestionCategories/${id}`),

  // User Answers (Student submission)
  getAllUserAnswers: () => apiClient.get("/api/UserAnswers"),

  submitUserAnswer: (data) => apiClient.post("/api/UserAnswers", data),

  deleteUserAnswer: (id) => apiClient.delete(`/api/UserAnswers/${id}`),

  // AI Evaluations
  evaluateCategory: (categoryId) => apiClient.post(`/api/AiEvaluations/evaluate/${categoryId}`, null, { timeout: 180000 }),

  getEvaluation: (categoryId) => apiClient.get(`/api/AiEvaluations/${categoryId}`, { timeout: 180000 }),
};

