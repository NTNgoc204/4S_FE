import apiClient from "../../config/apiClient";

export const universityAPI = {
  getUniversityById: (id) => apiClient.get(`/api/university/${id}`),
};
