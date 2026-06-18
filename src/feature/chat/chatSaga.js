import { call, put, takeLatest } from "redux-saga/effects";
import { chatAPI } from "./chatAPI";
import { getErrorMessage } from "../../util/errorConstants";
import {
  sendGuidedChatMessageRequest,
  sendGuidedChatMessageSuccess,
  sendGuidedChatMessageFailure,
} from "./chatSlice";

// Helper to map backend recommendations
const mapBackendRecommendations = (data) => {
  if (!data) return [];
  const top3 = data.top3Universities || data.Top3Universities || [];
  const next5 = data.next5Universities || data.Next5Universities || [];

  const mapUni = (uni) => {
    if (!uni) return null;
    const uniId = uni.universityId || uni.UniversityId;
    const uniName = uni.name || uni.Name;
    const uniShortName = uni.shortName || uni.ShortName || uniName;
    const uniLocation = uni.location || uni.Location;
    const uniRanking = uni.ranking ?? uni.Ranking ?? null;
    const uniAvatar = uni.avatar || uni.Avatar || null;
    const matchPercent = uni.matchPercentage ?? uni.MatchPercentage ?? 0;
    const suitableMajors = uni.suitableMajors || uni.SuitableMajors || [];

    const majorVi = suitableMajors.map((m) => m.name || m.Name).join(", ") || "";
    const majorEn = suitableMajors.map((m) => m.name || m.Name).join(", ") || "";

    return {
      id: uniId,
      name: { vi: uniName, en: uniShortName },
      major: { vi: majorVi, en: majorEn },
      ranking: uniRanking,
      matchPercent,
      place: { vi: uniLocation, en: uniLocation },
      avatar: uniAvatar,
    };
  };

  const mappedTop3 = top3.map((uni) => mapUni(uni)).filter(Boolean);
  const mappedNext5 = next5.map((uni) => mapUni(uni)).filter(Boolean);

  return [...mappedTop3, ...mappedNext5];
};

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
      recommendations = mapBackendRecommendations(summaryData);
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

export function* chatSaga() {
  yield takeLatest(sendGuidedChatMessageRequest.type, sendGuidedChatMessageSaga);
}
