import apiClient from "../../config/apiClient";

export const chatAPI = {
  continueGuidedChat: (sessionId, message) => apiClient.post("/api/Chat/guided", { sessionId, message }, { timeout: 0 }),
  getSessions: () => apiClient.get("/api/Chat/guided/sessions"),
  getSessionDetail: (sessionId) => apiClient.get(`/api/Chat/guided/sessions/${sessionId}`),
  deleteSession: (sessionId) => apiClient.delete(`/api/Chat/guided/sessions/${sessionId}`),
};
