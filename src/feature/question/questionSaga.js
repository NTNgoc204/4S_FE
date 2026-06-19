import { call, put, takeEvery, all } from "redux-saga/effects";
import { toast } from "react-toastify";
import { questionAPI } from "./questionAPI";
import { getErrorMessage } from "../../util/errorConstants";
import {
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
} from "./questionSlice";
import { mapBackendRecommendations } from "../../pages/Quiz/util/quizHelpers";

// Fetch Questions
function* fetchQuestionsSaga() {
  try {
    const [questionsRes, optionsRes, categoriesRes] = yield all([
      call(questionAPI.getAllQuestions),
      call(questionAPI.getAllOptions),
      call(questionAPI.getAllCategories),
    ]);

    const questions = questionsRes.data || [];
    const options = optionsRes.data || [];
    const categories = categoriesRes.data || [];

    // Sort categories by displayOrder
    const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Create a map of category ID to category index/name
    const categoryMap = {};
    sortedCategories.forEach((cat, index) => {
      categoryMap[cat.id] = { ...cat, index };
    });

    // Stitch options and sort questions by category display order first, then question display order
    const combinedQuestions = questions
      .map((q) => {
        const questionOptions = options
          .filter((opt) => opt.questionId === q.id)
          .map((opt) => ({
            ...opt,
            code: opt.optionCode || opt.code || "",
          }))
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        return {
          ...q,
          options: questionOptions,
          categoryIndex: categoryMap[q.categoryId]?.index ?? 999,
          categoryName: categoryMap[q.categoryId]?.name || "",
        };
      })
      .sort((a, b) => {
        if (a.categoryIndex !== b.categoryIndex) {
          return a.categoryIndex - b.categoryIndex;
        }
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });

    yield put(fetchQuestionsSuccess(combinedQuestions));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to fetch questions");
    yield put(fetchQuestionsFailure(errorMessage));
  }
}

// Fetch Categories
function* fetchCategoriesSaga() {
  try {
    const response = yield call(questionAPI.getAllCategories);
    yield put(fetchCategoriesSuccess(response.data));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to fetch categories");
    yield put(fetchCategoriesFailure(errorMessage));
  }
}

// Import Questions
function* importQuestionsSaga(action) {
  try {
    const { file, onSuccess } = action.payload;
    const formData = new FormData();
    formData.append("file", file);

    const response = yield call(questionAPI.importQuestions, formData);
    yield put(importQuestionsSuccess(response.data));
    yield call(() => toast.success("Import bộ câu hỏi thành công!"));
    
    // Reload questions and categories
    yield put(fetchQuestionsRequest());
    yield put(fetchCategoriesRequest());

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Import thất bại");
    yield put(importQuestionsFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Update Option
function* updateQuestionOptionSaga(action) {
  try {
    const { optionId, data, onSuccess } = action.payload;
    yield call(questionAPI.updateQuestionOption, optionId, data);
    yield put(updateQuestionOptionSuccess({ optionId, data }));
    yield put(fetchQuestionsRequest());
    yield call(() => toast.success("Cập nhật phương án thành công!"));

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Cập nhật thất bại");
    yield put(updateQuestionOptionFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Download Template Word File
function* downloadTemplateSaga(action) {
  try {
    const response = yield call(questionAPI.downloadTemplate);
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mau_cau_hoi.docx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    yield put(downloadTemplateSuccess());
    yield call(() => toast.success("Tải file mẫu thành công!"));
    if (action.payload?.onSuccess) {
      yield call(action.payload.onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể tải file mẫu. Vui lòng thử lại!");
    yield put(downloadTemplateFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Category CRUD Sagas
function* createCategorySaga(action) {
  try {
    const { data, onSuccess } = action.payload;
    yield call(questionAPI.createCategory, data);
    yield put(createCategorySuccess());
    yield put(fetchCategoriesRequest());
    yield call(() => toast.success("Tạo bộ câu hỏi mới thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể tạo bộ câu hỏi");
    yield put(createCategoryFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

function* updateCategorySaga(action) {
  try {
    const { id, data, onSuccess } = action.payload;
    yield call(questionAPI.updateCategory, id, data);
    yield put(updateCategorySuccess());
    yield put(fetchCategoriesRequest());
    yield call(() => toast.success("Cập nhật bộ câu hỏi thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể chỉnh sửa bộ câu hỏi");
    yield put(updateCategoryFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

function* deleteCategorySaga(action) {
  try {
    const { id, onSuccess } = action.payload;
    yield call(questionAPI.deleteCategory, id);
    yield put(deleteCategorySuccess());
    yield put(fetchCategoriesRequest());
    yield put(fetchQuestionsRequest());
    yield call(() => toast.success("Xóa bộ câu hỏi thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể xóa bộ câu hỏi");
    yield put(deleteCategoryFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Question CRUD Sagas
function* createQuestionSaga(action) {
  try {
    const { data, onSuccess } = action.payload;
    yield call(questionAPI.createQuestion, data);
    yield put(createQuestionSuccess());
    yield put(fetchQuestionsRequest());
    yield call(() => toast.success("Thêm câu hỏi mới thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể lưu câu hỏi");
    yield put(createQuestionFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

function* updateQuestionSaga(action) {
  try {
    const { id, data, onSuccess } = action.payload;
    yield call(questionAPI.updateQuestion, id, data);
    yield put(updateQuestionSuccess());
    yield put(fetchQuestionsRequest());
    yield call(() => toast.success("Cập nhật câu hỏi thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể chỉnh sửa câu hỏi");
    yield put(updateQuestionFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

function* deleteQuestionSaga(action) {
  try {
    const { id, onSuccess } = action.payload;
    yield call(questionAPI.deleteQuestion, id);
    yield put(deleteQuestionSuccess());
    yield put(fetchQuestionsRequest());
    yield call(() => toast.success("Xóa câu hỏi thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể xóa câu hỏi");
    yield put(deleteQuestionFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Option CRUD Sagas
function* createQuestionOptionSaga(action) {
  try {
    const { data, onSuccess } = action.payload;
    yield call(questionAPI.createQuestionOption, data);
    yield put(createQuestionOptionSuccess());
    yield put(fetchQuestionsRequest());
    yield call(() => toast.success("Thêm phương án mới thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể thêm phương án");
    yield put(createQuestionOptionFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

function* deleteQuestionOptionSaga(action) {
  try {
    const { id, onSuccess } = action.payload;
    yield call(questionAPI.deleteQuestionOption, id);
    yield put(deleteQuestionOptionSuccess());
    yield put(fetchQuestionsRequest());
    yield call(() => toast.success("Xóa phương án thành công!"));
    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể xóa phương án");
    yield put(deleteQuestionOptionFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Submit Answers
function* submitAnswersSaga(action) {
  try {
    const { userId, answers, onSuccess } = action.payload;

    // Convert answeredAt time to UTC string format (consistent with dateHelper / Z suffix)
    const answeredAt = new Date().toISOString();

    const uploadEffects = answers.map((ans) =>
      call(questionAPI.submitUserAnswer, {
        userId,
        questionId: ans.questionId,
        answer: ans.answer,
        answeredAt,
      })
    );

    yield all(uploadEffects);
    yield put(submitAnswersSuccess());
    yield call(() => toast.success("Lưu kết quả bài trắc nghiệm thành công!"));

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Không thể lưu kết quả bài làm");
    yield put(submitAnswersFailure(errorMessage));
    yield call(() => toast.error(errorMessage));
  }
}

// Fetch User Progress (Guided Quiz load progress on mount)
function* fetchUserProgressSaga(action) {
  try {
    const { quizQuestions, locale } = action.payload;
    
    // 1. Fetch user answers
    const answersRes = yield call(questionAPI.getAllUserAnswers);
    const dbAnswers = answersRes.data?.data || [];

    // 2. Map backend answers back to option IDs
    const restoredAnswers = {};
    dbAnswers.forEach((ans) => {
      const qId = ans.questionId || ans.QuestionId;
      const ansVal = ans.answer || ans.Answer;
      const q = quizQuestions.find((item) => item.id === qId);
      if (q) {
        const opt = q.options?.find((o) =>
          o.code === ansVal ||
          o.id === ansVal ||
          o.label?.vi === ansVal ||
          o.label?.en === ansVal ||
          o.content === ansVal
        );
        if (opt) {
          const isCustomId = opt.id?.startsWith('custom_other_');
          if (isCustomId) {
            restoredAnswers[q.id] = ansVal;
          } else {
            restoredAnswers[q.id] = opt.id;
          }
        } else {
          restoredAnswers[q.id] = ansVal;
        }
      }
    });

    // 3. Determine activeIndex (first unanswered question)
    let firstUnansweredIndex = quizQuestions.findIndex((q) => !restoredAnswers[q.id]);
    if (firstUnansweredIndex === -1) {
      firstUnansweredIndex = quizQuestions.length - 1;
    }

    // 4. Fetch existing evaluations for completed categories to prevent duplicate generation calls
    const categories = {};
    quizQuestions.forEach((q) => {
      if (q.categoryId) {
        if (!categories[q.categoryId]) {
          categories[q.categoryId] = [];
        }
        categories[q.categoryId].push(q);
      }
    });

    const restoredInsights = {};
    for (const [catId, qList] of Object.entries(categories)) {
      const isCompleted = qList.every((q) => restoredAnswers[q.id]);
      if (isCompleted) {
        try {
          const evalRes = yield call(questionAPI.getEvaluation, catId);
          if (evalRes.data?.success && evalRes.data?.data) {
            const lastQuestion = qList[qList.length - 1];
            const evalData = evalRes.data.data;
            const textVal = typeof evalData === 'string'
              ? evalData
              : (evalData.evaluationText || '');
            restoredInsights[lastQuestion.id] = textVal;
          }
        } catch (err) {
          // If not found in DB, trigger evaluate to create it dynamically
          try {
            const genRes = yield call(questionAPI.evaluateCategory, catId);
            if (genRes.data?.success && genRes.data?.data) {
              const lastQuestion = qList[qList.length - 1];
              restoredInsights[lastQuestion.id] = genRes.data.data;
            }
          } catch (genErr) {
            console.error("Failed to auto-evaluate category on mount in Saga:", genErr);
            const lastQuestion = qList[qList.length - 1];
            restoredInsights[lastQuestion.id] = locale === 'vi'
              ? "Đã có lỗi xảy ra khi gọi AI phân tích chuyên mục này. Vui lòng thử lại sau."
              : "An error occurred while generating AI analysis. Please try again later.";
          }
        }
      }
    }

    // 5. Fetch overall summary if all done
    let overallSummary = "";
    let aiRecommendations = [];
    const isAllDone = quizQuestions.length > 0 && quizQuestions.every((q) => restoredAnswers[q.id]);
    if (isAllDone) {
      try {
        const overallRes = yield call(questionAPI.getOverallSummary);
        if (overallRes.data?.success && overallRes.data?.data) {
          const summaryData = overallRes.data.data;
          overallSummary = summaryData.summaryText || summaryData.SummaryText || '';
          aiRecommendations = yield call(mapBackendRecommendations, summaryData);
        }
      } catch (err) {
        // If overall summary is not found, trigger overall evaluation
        try {
          const genOverallRes = yield call(questionAPI.evaluateOverall);
          if (genOverallRes.data?.success && genOverallRes.data?.data) {
            const summaryData = genOverallRes.data.data;
            overallSummary = summaryData.summaryText || summaryData.SummaryText || '';
            aiRecommendations = yield call(mapBackendRecommendations, summaryData);
          }
        } catch (genErr) {
          console.error("Failed to auto-evaluate overall summary on mount in Saga:", genErr);
        }
      }
    }

    yield put(fetchUserProgressSuccess({
      answers: restoredAnswers,
      insights: restoredInsights,
      activeIndex: firstUnansweredIndex,
      overallSummary,
      aiRecommendations
    }));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to load progress");
    yield put(fetchUserProgressFailure(errorMessage));
  }
}

// Submit Answer Incrementally
function* submitAnswerIncrementSaga(action) {
  const { question, option, customText, locale, isAlreadyAnswered, isEndOfCategory, lastQuestionOfCategory, activeIndex, quizQuestionsLength } = action.payload;
  const answerValue = customText || option.label?.[locale] || option.content;
  
  try {
    if (isAlreadyAnswered) {
      yield call(questionAPI.updateUserAnswer, {
        questionId: question.id,
        answer: answerValue,
      });
    } else {
      yield call(questionAPI.submitUserAnswer, {
        questionId: question.id,
        answer: answerValue,
      });
    }

    // Success -> update local state
    yield put(submitAnswerIncrementSuccess({ questionId: question.id, answerId: option.id, customText }));

    if (isEndOfCategory) {
      // Check if it's the last question of the whole quiz to trigger overall AI eval after category AI eval
      const isLastQuestionOfWholeQuiz = activeIndex === quizQuestionsLength - 1;
      
      yield put(evaluateCategoryRequest({
        categoryId: question.categoryId,
        questionId: lastQuestionOfCategory.id,
        locale,
        isLastQuestionOfWholeQuiz
      }));
    } else {
      // Direct fast transition for non-end-of-category questions
      yield put(setActiveIndex(activeIndex + 1));
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to save answer");
    yield put(submitAnswerIncrementFailure(errorMessage));
    
    // Check if error is "already answered" to treat it as synced
    const errorMsg = error.response?.data?.message || error.message || "";
    if (errorMsg.includes("đã trả lời rồi") || errorMsg.includes("already answered")) {
      yield put(submitAnswerIncrementSuccess({ questionId: question.id, answerId: option.id, customText }));
      if (isEndOfCategory) {
        const isLastQuestionOfWholeQuiz = activeIndex === quizQuestionsLength - 1;
        yield put(evaluateCategoryRequest({
          categoryId: question.categoryId,
          questionId: lastQuestionOfCategory.id,
          locale,
          isLastQuestionOfWholeQuiz
        }));
      } else {
        yield put(setActiveIndex(activeIndex + 1));
      }
    } else {
      yield call(() => toast.error(locale === 'vi' ? 'Không thể lưu câu trả lời. Vui lòng thử lại!' : 'Failed to save answer. Please try again.'));
    }
  }
}

// Evaluate Category with Retries
function* evaluateCategorySaga(action) {
  const { categoryId, questionId, locale, isLastQuestionOfWholeQuiz } = action.payload;
  let evaluationText = "";
  let retries = 3;
  
  // Proactive delay
  yield call(() => new Promise(resolve => setTimeout(resolve, 600)));

  while (retries > 0) {
    try {
      const response = yield call(questionAPI.evaluateCategory, categoryId);
      if (response.data?.success && response.data?.data) {
        evaluationText = response.data.data;
        break;
      } else {
        retries--;
        if (retries > 0) {
          yield call(() => new Promise(resolve => setTimeout(resolve, 1500)));
        }
      }
    } catch (error) {
      retries--;
      if (retries > 0) {
        yield call(() => new Promise(resolve => setTimeout(resolve, 1500)));
      }
    }
  }

  if (!evaluationText) {
    evaluationText = locale === 'vi'
      ? "Đã có lỗi xảy ra khi gọi AI phân tích chuyên mục này. Vui lòng bấm Tiếp tục để đi tiếp hoặc thử lại sau."
      : "An error occurred while generating AI analysis for this category. Please click Continue or try again later.";
  }

  yield put(evaluateCategorySuccess({ questionId, evaluationText }));

  // If this was the last question of the whole quiz, generate overall summary
  if (isLastQuestionOfWholeQuiz) {
    yield put(evaluateOverallRequest({ locale }));
  }
}

// Evaluate Overall with Retries
function* evaluateOverallSaga(action) {
  const { locale } = action.payload;
  let overallSummary = "";
  let aiRecommendations = [];
  let overallRetries = 3;

  // Proactive delay
  yield call(() => new Promise(resolve => setTimeout(resolve, 1200)));

  while (overallRetries > 0) {
    try {
      const overallRes = yield call(questionAPI.evaluateOverall);
      if (overallRes.data?.success && overallRes.data?.data) {
        const summaryData = overallRes.data.data;
        overallSummary = summaryData.summaryText || summaryData.SummaryText || '';
        aiRecommendations = yield call(mapBackendRecommendations, summaryData);
        break;
      } else {
        overallRetries--;
        if (overallRetries > 0) {
          yield call(() => new Promise(resolve => setTimeout(resolve, 1500)));
        }
      }
    } catch (overallErr) {
      overallRetries--;
      if (overallRetries > 0) {
        yield call(() => new Promise(resolve => setTimeout(resolve, 1500)));
      }
    }
  }

  if (overallSummary) {
    yield put(evaluateOverallSuccess({ overallSummary, aiRecommendations }));
  } else {
    yield put(evaluateOverallFailure("Failed to generate overall summary"));
  }
}

// Redo Quiz
function* redoQuizSaga(action) {
  const { locale } = action.payload;
  try {
    yield call(questionAPI.deleteAllUserAnswers);
    yield put(redoQuizSuccess());
    yield call(() => toast.success(locale === 'vi' ? 'Đã reset bài trắc nghiệm thành công!' : 'Quiz reset successfully!'));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to reset quiz");
    yield put(redoQuizFailure(errorMessage));
    yield call(() => toast.error(locale === 'vi' ? 'Không thể làm lại bài trắc nghiệm. Vui lòng thử lại!' : 'Failed to reset quiz. Please try again.'));
  }
}

export function* questionSaga() {
  yield takeEvery(fetchQuestionsRequest.type, fetchQuestionsSaga);
  yield takeEvery(fetchCategoriesRequest.type, fetchCategoriesSaga);
  yield takeEvery(importQuestionsRequest.type, importQuestionsSaga);
  yield takeEvery(updateQuestionOptionRequest.type, updateQuestionOptionSaga);
  yield takeEvery(submitAnswersRequest.type, submitAnswersSaga);
  yield takeEvery(fetchUserProgressRequest.type, fetchUserProgressSaga);
  yield takeEvery(submitAnswerIncrementRequest.type, submitAnswerIncrementSaga);
  yield takeEvery(evaluateCategoryRequest.type, evaluateCategorySaga);
  yield takeEvery(evaluateOverallRequest.type, evaluateOverallSaga);
  yield takeEvery(redoQuizRequest.type, redoQuizSaga);
  yield takeEvery(downloadTemplateRequest.type, downloadTemplateSaga);
  yield takeEvery(createCategoryRequest.type, createCategorySaga);
  yield takeEvery(updateCategoryRequest.type, updateCategorySaga);
  yield takeEvery(deleteCategoryRequest.type, deleteCategorySaga);
  yield takeEvery(createQuestionRequest.type, createQuestionSaga);
  yield takeEvery(updateQuestionRequest.type, updateQuestionSaga);
  yield takeEvery(deleteQuestionRequest.type, deleteQuestionSaga);
  yield takeEvery(createQuestionOptionRequest.type, createQuestionOptionSaga);
  yield takeEvery(deleteQuestionOptionRequest.type, deleteQuestionOptionSaga);
}
