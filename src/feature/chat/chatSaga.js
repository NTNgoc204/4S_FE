import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { chatAPI } from "./chatAPI";
import { questionAPI } from "../question/questionAPI";
import { getErrorMessage } from "../../util/errorConstants";
import { mapUniversityRecommendations } from "../../util/universityMapper";
import {
  sendGuidedChatMessageRequest,
  sendGuidedChatMessageSuccess,
  sendGuidedChatMessageFailure,
  clearChatRequest,
  clearChatSuccess,
  clearChatFailure,
} from "./chatSlice";

// Mọi tin nhắn đều gửi vào /api/Chat/guided
function* sendGuidedChatMessageSaga(action) {
  try {
    const { message } = action.payload;
    const response = yield call(chatAPI.continueGuidedChat, message);
    const data = response.data;

    const evaluation = data.evaluation || data.Evaluation || "";
    const nextMessage = data.message || data.Message || "";
    const summaryData = data.summary || data.Summary;

    let summaryText = "";
    let recommendations = [];
    if (summaryData) {
      summaryText = summaryData.summaryText || summaryData.SummaryText || "";
      recommendations = mapUniversityRecommendations(summaryData);
    }

    yield put(
      sendGuidedChatMessageSuccess({
        evaluation,
        message: nextMessage,
        summaryText,
        recommendations,
      })
    );
  } catch (error) {
    const defaultErr =
      action.payload?.locale === "vi"
        ? "Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại."
        : "An error occurred. Please try again.";
    const errorMessage = getErrorMessage(error, defaultErr);
    yield put(sendGuidedChatMessageFailure(errorMessage));
  }
}

// Clear all user answers on new chat
function* clearChatSaga(action) {
  const { greetingText, successMessage } = action.payload;
  try {
    yield call(questionAPI.deleteAllUserAnswers);
    yield put(clearChatSuccess({ greetingText }));
    if (successMessage) {
      yield call(() => toast.success(successMessage));
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to start new conversation");
    yield put(clearChatFailure(errorMessage));
  }
}

export function* chatSaga() {
  yield takeLatest(sendGuidedChatMessageRequest.type, sendGuidedChatMessageSaga);
  yield takeLatest(clearChatRequest.type, clearChatSaga);
}
