import { call, put, select, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { chatAPI } from "./chatAPI";
import { getErrorMessage } from "../../util/errorConstants";
import { mapUniversityRecommendations } from "../../util/universityMapper";
import {
  sendGuidedChatMessageRequest,
  sendGuidedChatMessageSuccess,
  sendGuidedChatMessageFailure,
  startNewChat,
  fetchSessionsRequest,
  fetchSessionsSuccess,
  fetchSessionsFailure,
  fetchSessionDetailRequest,
  fetchSessionDetailSuccess,
  fetchSessionDetailFailure,
  deleteSessionRequest,
  deleteSessionSuccess,
  deleteSessionFailure,
} from "./chatSlice";

// Gửi tin nhắn chat
function* sendGuidedChatMessageSaga(action) {
  try {
    const { message, locale } = action.payload;
    const sessionId = yield select((state) => state.chat.currentSessionId);
    
    const response = yield call(chatAPI.continueGuidedChat, sessionId, message);
    const data = response.data;

    const newSessionId = data.sessionId || data.SessionId;
    const evaluation = data.evaluation || data.Evaluation || "";
    const nextMessage = data.message || data.Message || "";
    const summaryData = data.summary || data.Summary;

    let summaryText = "";
    let recommendations = null;
    if (summaryData) {
      summaryText = summaryData.summaryText || summaryData.SummaryText || "";
      recommendations = mapUniversityRecommendations(summaryData);
    }

    yield put(
      sendGuidedChatMessageSuccess({
        sessionId: newSessionId,
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

// Lấy danh sách các phiên chat của user
function* fetchSessionsSaga() {
  try {
    const response = yield call(chatAPI.getSessions);
    const sessions = response.data.data || [];
    yield put(fetchSessionsSuccess(sessions));
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to load chat history");
    yield put(fetchSessionsFailure(errorMessage));
  }
}

// Lấy chi tiết phiên chat
function* fetchSessionDetailSaga(action) {
  const sessionId = action.payload;
  try {
    const response = yield call(chatAPI.getSessionDetail, sessionId);
    const detail = response.data.data;
    
    if (!detail) {
      throw new Error("No session data found");
    }

    const chatHistory = detail.chatHistory || [];
    const summary = detail.summary;
    
    let nextQuestion = "";
    let summaryText = "";
    let recommendations = [];

    // Nếu phiên chat chưa hoàn thành (summary = null), gọi tiếp tục với message: null để lấy câu hỏi đang chờ trả lời
    if (!summary) {
      try {
        const continueRes = yield call(chatAPI.continueGuidedChat, sessionId, null);
        nextQuestion = continueRes.data.message || "";
        const contSummary = continueRes.data.summary || continueRes.data.Summary;
        if (contSummary) {
          summaryText = contSummary.summaryText || contSummary.SummaryText || "";
          recommendations = mapUniversityRecommendations(contSummary);
        }
      } catch (e) {
        console.error("Failed to fetch next question for incomplete session", e);
      }
    } else {
      summaryText = summary.summaryText || "";
      recommendations = mapUniversityRecommendations(summary);
    }

    // Tái cấu trúc lịch sử chat thành dạng bong bóng tin nhắn
    const chatMessages = [];
    chatMessages.push({
      id: "assistant-greeting",
      role: "assistant",
      content: "Xin chào! Tôi là Trợ lý Hướng nghiệp AI. Hãy chia sẻ để tôi có thể tìm ngành học và trường đại học phù hợp nhất với bạn nhé! 😊"
    });

    for (let i = 0; i < chatHistory.length; i++) {
      const item = chatHistory[i];
      // Tin nhắn người dùng trả lời
      chatMessages.push({
        id: `user-${item.questionId || i}`,
        role: "user",
        content: item.userAnswer
      });

      // Tin nhắn phản hồi của AI (gộp nhận xét + câu hỏi kế tiếp)
      const parts = [item.evaluation];
      if (i < chatHistory.length - 1) {
        parts.push(chatHistory[i + 1].questionContent);
      } else if (nextQuestion) {
        parts.push(nextQuestion);
      }

      chatMessages.push({
        id: `assistant-${item.questionId || i}`,
        role: "assistant",
        content: parts.filter(Boolean).join("\n\n")
      });
    }

    // Trường hợp đặc biệt: Chưa trả lời câu nào nhưng đã có câu hỏi tiếp theo
    if (chatHistory.length === 0 && nextQuestion) {
      chatMessages[0].content = nextQuestion;
    }

    yield put(
      fetchSessionDetailSuccess({
        sessionId,
        chatMessages,
        summaryText,
        recommendations,
      })
    );
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to load session details");
    yield put(fetchSessionDetailFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Xóa phiên chat
function* deleteSessionSaga(action) {
  const sessionId = action.payload;
  try {
    yield call(chatAPI.deleteSession, sessionId);
    yield put(deleteSessionSuccess());
    toast.success("Đã xóa phiên chat thành công.");
    
    // Tải lại danh sách
    yield put(fetchSessionsRequest());
    
    // Nếu phiên bị xóa đang mở thì reset chat
    const currentSessionId = yield select((state) => state.chat.currentSessionId);
    if (currentSessionId === sessionId) {
      yield put(startNewChat({
        greetingText: "Xin chào! Tôi là Trợ lý Hướng nghiệp AI. Hãy chia sẻ để tôi có thể tìm ngành học và trường đại học phù hợp nhất với bạn nhé! 😊"
      }));
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to delete chat session");
    yield put(deleteSessionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export function* chatSaga() {
  yield takeLatest(sendGuidedChatMessageRequest.type, sendGuidedChatMessageSaga);
  yield takeLatest(fetchSessionsRequest.type, fetchSessionsSaga);
  yield takeLatest(fetchSessionDetailRequest.type, fetchSessionDetailSaga);
  yield takeLatest(deleteSessionRequest.type, deleteSessionSaga);
}
