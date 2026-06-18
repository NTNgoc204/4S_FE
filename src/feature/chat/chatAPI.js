import apiClient from "../../config/apiClient";

export const chatAPI = {
  continueGuidedChat: (message) => apiClient.post("/api/Chat/guided", { message }),
  askAi: (question) => apiClient.post("/api/Chat/ask", { question }),
};
