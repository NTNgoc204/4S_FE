import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chatMessages: [],
  guidedChatLoading: false,
  guidedChatError: null,
  chatSummaryText: "",
  chatRecommendations: [],
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
      state.chatMessages = [
        {
          id: "assistant-greeting",
          role: "assistant",
          content: action.payload.greetingText,
        },
      ];
    },

    // Luôn gửi vào /api/Chat/guided, không phân biệt complete hay không
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
      const { evaluation, message } = action.payload;

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
      if (action.payload.summaryText) {
        state.chatSummaryText = action.payload.summaryText;
      }
      if (action.payload.recommendations?.length > 0) {
        state.chatRecommendations = action.payload.recommendations;
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

    // Clear chat (call delete answers API and reset chat client-side state)
    clearChatRequest: (state) => {
      state.guidedChatLoading = true;
      state.guidedChatError = null;
    },
    clearChatSuccess: (state, action) => {
      state.guidedChatLoading = false;
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
    clearChatFailure: (state, action) => {
      state.guidedChatLoading = false;
      state.guidedChatError = action.payload;
    },
  },
});

export const {
  initGuidedChat,
  sendGuidedChatMessageRequest,
  sendGuidedChatMessageSuccess,
  sendGuidedChatMessageFailure,
  clearChatRequest,
  clearChatSuccess,
  clearChatFailure,
} = chatSlice.actions;

export default chatSlice.reducer;
