import apiClient from "../../config/apiClient";

export const eduAPI = {
  // GET danh sách đăng ký trường
  getRegistrations: () => apiClient.get("/api/edu/registrations"),

  // Tạo payment link (QR + payOS) cho đơn
  createPayment: (id) => apiClient.post(`/api/edu/create-payment/${id}`),

  // Gửi email báo giá kèm QR cho trường
  sendPaymentEmail: (id, payload) =>
    apiClient.post(`/api/edu/send-payment-email/${id}`, payload),

  // Cập nhật status (truyền string: Quoted | Paid | Completed)
  updateStatus: (id, status) =>
    apiClient.put(`/api/edu/update-status/${id}?status=${status}`),

  // Import key từ file word (.docx)
  importKeys: (id, formData) =>
    apiClient.post(`/api/edu/import-keys/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Kích hoạt key học đường cho học sinh
  activateKey: (key) =>
    apiClient.post("/api/edu/activate", {
      activationKey: key,
    }),
};
