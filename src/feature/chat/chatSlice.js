import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chatMessages: [],
  guidedChatLoading: false,
  guidedChatError: null,
  chatSummaryText: "",
  chatRecommendations: [],
  currentSessionId: null,
  
  // Sessions list (history)
  sessions: [],
  sessionsLoading: false,
  sessionsError: null,
  
  // Active session loading detail
  activeSessionLoading: false,
  activeSessionError: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Reset state và hiện câu chào cứng ngay — không call API
    initGuidedChat: (state, action) => {
      state.guidedChatLoading = false;
      state.guidedChatError = null;
      state.chatSummaryText = "";
      state.chatRecommendations = [];
      state.currentSessionId = null;
      state.chatMessages = [
        {
          id: "assistant-greeting",
          role: "assistant",
          content: action.payload.greetingText,
        },
      ];
    },

    // Bắt đầu một cuộc trò chuyện mới (phiên mới, sessionId = null)
    startNewChat: (state, action) => {
      state.guidedChatLoading = false;
      state.guidedChatError = null;
      state.currentSessionId = null;
      state.chatSummaryText = "";
      state.chatRecommendations = [];
      state.chatMessages = [
        {
          id: "assistant-greeting",
          role: "assistant",
          content: action.payload.greetingText,
        },
      ];
    },

    // Gửi tin nhắn
    sendGuidedChatMessageRequest: (state, action) => {
      state.guidedChatLoading = true;
      state.guidedChatError = null;
      state.chatMessages.push({
        id: `user-${Date.now()}`,
        role: "user",
        content: action.payload.message,
      });
    },
    sendGuidedChatMessageSuccess: (state, action) => {
      state.guidedChatLoading = false;
      const { sessionId, evaluation, message } = action.payload;

      if (sessionId) {
        state.currentSessionId = sessionId;
      }

      // Gộp evaluation + message thành 1 bubble, xuống hàng giữa 2 đoạn
      const parts = [evaluation, message].filter(Boolean);
      if (parts.length > 0) {
        state.chatMessages.push({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: parts.join("\n\n"),
        });
      }

      // Lưu summary và recommendations khi BE trả về
      if (action.payload.summaryText !== undefined) {
        state.chatSummaryText = action.payload.summaryText;
      }
      if (action.payload.recommendations) {
        state.chatRecommendations = action.payload.recommendations;
      } else if (action.payload.summaryText === "") {
        state.chatRecommendations = [];
      }
    },
    sendGuidedChatMessageFailure: (state, action) => {
      state.guidedChatLoading = false;
      state.guidedChatError = action.payload;
      state.chatMessages.push({
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: action.payload,
      });
    },

    // Lấy danh sách các phiên chat
    fetchSessionsRequest: (state) => {
      state.sessionsLoading = true;
      state.sessionsError = null;
    },
    fetchSessionsSuccess: (state, action) => {
      state.sessionsLoading = false;
      state.sessions = action.payload;
    },
    fetchSessionsFailure: (state, action) => {
      state.sessionsLoading = false;
      state.sessionsError = action.payload;
    },

    // Lấy chi tiết của một phiên chat cũ
    fetchSessionDetailRequest: (state) => {
      state.activeSessionLoading = true;
      state.activeSessionError = null;
    },
    fetchSessionDetailSuccess: (state, action) => {
      state.activeSessionLoading = false;
      const { sessionId, chatMessages, summaryText, recommendations } = action.payload;
      state.currentSessionId = sessionId;
      state.chatMessages = chatMessages;
      state.chatSummaryText = summaryText || "";
      state.chatRecommendations = recommendations || [];
    },
    fetchSessionDetailFailure: (state, action) => {
      state.activeSessionLoading = false;
      state.activeSessionError = action.payload;
    },

    // Xóa một phiên chat
    deleteSessionRequest: (state) => {
      state.sessionsLoading = true;
    },
    deleteSessionSuccess: (state) => {
      state.sessionsLoading = false;
    },
    deleteSessionFailure: (state, action) => {
      state.sessionsLoading = false;
      state.sessionsError = action.payload;
    },
  },
});

export const {
  initGuidedChat,
  startNewChat,
  sendGuidedChatMessageRequest,
  sendGuidedChatMessageSuccess,
  sendGuidedChatMessageFailure,
  fetchSessionsRequest,
  fetchSessionsSuccess,
  fetchSessionsFailure,
  fetchSessionDetailRequest,
  fetchSessionDetailSuccess,
  fetchSessionDetailFailure,
  deleteSessionRequest,
  deleteSessionSuccess,
  deleteSessionFailure,
} = chatSlice.actions;

export default chatSlice.reducer;
