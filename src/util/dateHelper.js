/**
 * Tiện ích xử lý và định dạng Ngày/Giờ (Date & Time Utility)
 * Đồng bộ hóa định dạng giữa FrontEnd và BackEnd (.NET Core & PostgreSQL)
 */

/**
 * Định dạng ngày để gửi lên Backend.
 * Đảm bảo ngày được chuyển thành chuỗi ISO UTC với đuôi 'Z' (tránh lỗi múi giờ Npgsql PostgreSQL driver).
 * @param {Date|string} date - Ngày cần định dạng
 * @returns {string|null} Chuỗi ISO UTC hoặc null nếu ngày không hợp lệ
 */
export const formatDateForBE = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString(); // Output dạng: "2026-06-02T13:52:40.000Z"
  } catch (e) {
    console.error("formatDateForBE error:", e);
    return null;
  }
};

/**
 * Định dạng ngày để hiển thị trên giao diện Frontend.
 * @param {Date|string} date - Ngày cần hiển thị
 * @param {string} locale - Ngôn ngữ hiển thị ('vi' hoặc 'en')
 * @returns {string} Chuỗi hiển thị đẹp mắt (ví dụ: "02/06/2026")
 */
export const formatDateForFE = (date, locale = 'vi') => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    if (locale === 'vi') {
      return `${day}/${month}/${year}`;
    } else {
      return `${month}/${day}/${year}`; // Định dạng Mỹ cho tiếng Anh
    }
  } catch (e) {
    console.error("formatDateForFE error:", e);
    return "—";
  }
};

/**
 * Định dạng ngày giờ hiển thị trên giao diện Frontend (kèm theo giờ phút).
 * @param {Date|string} date - Ngày giờ cần hiển thị
 * @param {string} locale - Ngôn ngữ hiển thị ('vi' hoặc 'en')
 * @returns {string} Chuỗi hiển thị (ví dụ: "20:52 02/06/2026")
 */
export const formatDateTimeForFE = (date, locale = 'vi') => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    if (locale === 'vi') {
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } else {
      return `${hours}:${minutes} ${month}/${day}/${year}`;
    }
  } catch (e) {
    console.error("formatDateTimeForFE error:", e);
    return "—";
  }
};

/**
 * Định dạng ngày để gắn vào input HTML <input type="date">.
 * Yêu cầu định dạng YYYY-MM-DD.
 * @param {Date|string} date - Ngày cần định dạng
 * @returns {string} Chuỗi YYYY-MM-DD hoặc chuỗi rỗng
 */
export const formatDateForInput = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("formatDateForInput error:", e);
    return "";
  }
};
