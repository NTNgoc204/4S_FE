import apiClient from "../../config/apiClient";

export const chatAPI = {
  continueGuidedChat: (message) => apiClient.post("/api/Chat/guided", { message }, { timeout: 0 }),
  askAi: (question) => apiClient.post("/api/Chat/ask", { question }, { timeout: 0 }),
};
