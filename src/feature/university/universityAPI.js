import apiClient from "../../config/apiClient";

export const universityAPI = {
  // Universities
  getUniversities: (search = "", page = 1, pageSize = 50) => 
    apiClient.get(`/api/university?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`),
  
  getUniversityById: (id) => 
    apiClient.get(`/api/university/${id}`),
  
  createUniversity: (data) => 
    apiClient.post(`/api/university`, data),
  
  updateUniversity: (data) => 
    apiClient.put(`/api/university`, data),
  
  deleteUniversity: (id) => 
    apiClient.delete(`/api/university/${id}`),

  // University Majors (Ngành tuyển sinh của từng trường)
  getUniversityMajors: (universityId, page = 1, pageSize = 50) => 
    apiClient.get(`/api/university-major/by-university/${universityId}?page=${page}&pageSize=${pageSize}`),

  createUniversityMajor: (data) => 
    apiClient.post(`/api/university-major`, data),

  updateUniversityMajor: (data) => 
    apiClient.put(`/api/university-major`, data),

  deleteUniversityMajor: (id) => 
    apiClient.delete(`/api/university-major/${id}`),

  // Global Majors List (Danh mục ngành học chung)
  getGlobalMajors: () => 
    apiClient.get(`/api/Majors`),

  createGlobalMajor: (data) => 
    apiClient.post(`/api/Majors`, data),

  updateGlobalMajor: (id, data) => 
    apiClient.put(`/api/Majors/${id}`, data),
};
