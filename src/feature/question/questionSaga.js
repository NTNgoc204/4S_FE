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
} from "./questionSlice";

// Fetch Questions
function* fetchQuestionsSaga() {
  try {
    const [questionsRes, optionsRes] = yield all([
      call(questionAPI.getAllQuestions),
      call(questionAPI.getAllOptions),
    ]);

    const questions = questionsRes.data || [];
    const options = optionsRes.data || [];

    // Stitch options into their parent questions
    const combinedQuestions = questions.map((q) => {
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
      };
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

// Update Option ScoreTag
function* updateQuestionOptionSaga(action) {
  try {
    const { optionId, data, onSuccess } = action.payload;
    yield call(questionAPI.updateQuestionOption, optionId, data);
    yield put(updateQuestionOptionSuccess({ optionId, data }));
    yield call(() => toast.success("Cập nhật nhãn điểm thành công!"));

    if (typeof onSuccess === "function") {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Cập nhật thất bại");
    yield put(updateQuestionOptionFailure(errorMessage));
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

export function* questionSaga() {
  yield takeEvery(fetchQuestionsRequest.type, fetchQuestionsSaga);
  yield takeEvery(fetchCategoriesRequest.type, fetchCategoriesSaga);
  yield takeEvery(importQuestionsRequest.type, importQuestionsSaga);
  yield takeEvery(updateQuestionOptionRequest.type, updateQuestionOptionSaga);
  yield takeEvery(submitAnswersRequest.type, submitAnswersSaga);
}
