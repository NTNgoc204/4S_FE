import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import RegistrationTable from "./components/RegistrationTable";
import EmailTemplateModal from "./components/EmailTemplateModal";

const MOCK_REGISTRATIONS = [
  {
    id: "REG1001",
    schoolName: "THPT Nguyễn Thượng Hiền",
    representative: "Nguyễn Văn An",
    phoneNumber: "0912345678",
    email: "an.nguyen@thptnth.edu.vn",
    planName: "Edu Premium",
    studentCount: 1200,
    price: 12000000,
    createdAt: "2026-06-20 08:30",
    status: "Pending",
    activationKey: "",
  },
  {
    id: "REG1002",
    schoolName: "THPT Chuyên Lê Hồng Phong",
    representative: "Trần Thị Bình",
    phoneNumber: "0987654321",
    email: "binh.tran@thptlhp.edu.vn",
    planName: "Edu Standard",
    studentCount: 800,
    price: 8000000,
    createdAt: "2026-06-20 10:15",
    status: "Quoted",
    activationKey: "",
  },
  {
    id: "REG1003",
    schoolName: "THPT Gia Định",
    representative: "Lê Hoàng Nam",
    phoneNumber: "0903334445",
    email: "nam.le@thptgiadinh.edu.vn",
    planName: "Edu Premium",
    studentCount: 1500,
    price: 15000000,
    createdAt: "2026-06-21 09:00",
    status: "Paid",
    activationKey: "",
  },
  {
    id: "REG1004",
    schoolName: "THPT Bùi Thị Xuân",
    representative: "Phạm Minh Hùng",
    phoneNumber: "0938889990",
    email: "hung.pham@thptbtx.edu.vn",
    planName: "Edu Standard",
    studentCount: 600,
    price: 6000000,
    createdAt: "2026-06-19 14:20",
    status: "KeyGenerated",
    activationKey: "4S-EDU-BTX-K8H2A",
  },
];

export default function ContactRegistrationsPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  const [registrations, setRegistrations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);

  // Initialize and load registrations from localStorage
  const loadRegistrations = () => {
    let data = localStorage.getItem("4s_school_registrations");
    if (!data) {
      localStorage.setItem("4s_school_registrations", JSON.stringify(MOCK_REGISTRATIONS));
      data = JSON.stringify(MOCK_REGISTRATIONS);

      // Create a mock initial notification for new registration
      const initialNotifs = [
        {
          id: "NOTIF_INIT_1",
          role: "contact",
          title: "Đơn liên hệ mới",
          message: "Trường THPT Nguyễn Thượng Hiền vừa gửi yêu cầu đăng ký tư vấn học đường (gói Edu Premium).",
          createdAt: "2026-06-20 08:31",
          isRead: false,
          type: "new_registration"
        }
      ];
      localStorage.setItem("4s_notifications", JSON.stringify(initialNotifs));
    }
    setRegistrations(JSON.parse(data));
  };

  useEffect(() => {
    loadRegistrations();

    const handleUpdate = () => {
      loadRegistrations();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("4s_registrations_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("4s_registrations_updated", handleUpdate);
    };
  }, []);

  const fmtVND = (val) => {
    return `${Number(val).toLocaleString("vi-VN")} VND`;
  };

  // Filter list
  const filteredRegs = useMemo(() => {
    return registrations.filter((r) => {
      const keyword = searchText.trim().toLowerCase();
      const matchSearch =
        keyword === "" ||
        (r.schoolName || "").toLowerCase().includes(keyword) ||
        (r.representative || "").toLowerCase().includes(keyword) ||
        (r.email || "").toLowerCase().includes(keyword) ||
        (r.id || "").toLowerCase().includes(keyword);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [registrations, searchText, statusFilter]);

  // Open modal to issue quote
  const handleOpenQuoteModal = (reg) => {
    setSelectedReg(reg);
    setIsQuoteModalOpen(true);
  };

  // Submit quote
  const handleSendQuoteSubmit = (id, subject, body) => {
    try {
      const updated = registrations.map((r) => {
        if (r.id === id) {
          return { ...r, status: "Quoted" };
        }
        return r;
      });

      localStorage.setItem("4s_school_registrations", JSON.stringify(updated));
      setRegistrations(updated);
      setIsQuoteModalOpen(false);

      // Create notification for Accountant
      const targetReg = registrations.find(r => r.id === id);
      const notifId = "NOTIF_" + Date.now();
      const newNotif = {
        id: notifId,
        role: "accountant",
        title: isVi ? `Yêu cầu thanh toán học đường: ${targetReg.schoolName}` : `School Payment Approval: ${targetReg.schoolName}`,
        message: isVi 
          ? `Đơn đăng ký ${targetReg.id} trị giá ${fmtVND(targetReg.price)} của trường ${targetReg.schoolName} đang chờ xác nhận thanh toán.`
          : `Proposal ${targetReg.id} (${fmtVND(targetReg.price)}) for ${targetReg.schoolName} is awaiting bank confirmation.`,
        createdAt: new Date().toLocaleString("sv-SE", { hour12: false }).substring(0, 16),
        isRead: false,
        type: "payment_requested",
      };

      const storedNotifs = localStorage.getItem("4s_notifications");
      const currentNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];
      currentNotifs.push(newNotif);
      localStorage.setItem("4s_notifications", JSON.stringify(currentNotifs));

      // Dispatch custom events
      window.dispatchEvent(new Event("4s_registrations_updated"));
      window.dispatchEvent(new Event("4s_notifications_updated"));

      toast.success(isVi ? "Báo giá PDF và email đã được gửi thành công!" : "Proposal email and PDF sent successfully!");
    } catch (e) {
      console.error(e);
      toast.error(isVi ? "Lỗi gửi báo giá" : "Failed to send proposal");
    }
  };

  // Generate Activation Key
  const handleGenerateKey = (reg) => {
    try {
      // Get abbreviation of school name for key
      const words = reg.schoolName.replace("THPT ", "").split(" ");
      let abbr = words.map(w => w.charAt(0)).join("").toUpperCase();
      if (abbr.length < 2) abbr = "SCH";
      
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const generatedKey = `4S-EDU-${abbr}-${randomStr}`;

      const updated = registrations.map((r) => {
        if (r.id === reg.id) {
          return { ...r, status: "KeyGenerated", activationKey: generatedKey };
        }
        return r;
      });

      localStorage.setItem("4s_school_registrations", JSON.stringify(updated));
      setRegistrations(updated);

      // Dispatch events
      window.dispatchEvent(new Event("4s_registrations_updated"));

      toast.success(
        isVi 
          ? `Sinh khóa kích hoạt thành công: ${generatedKey}. Đã gửi email bàn giao cho trường!`
          : `Activation key created: ${generatedKey}. Key has been sent to the school!`
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate key");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-850">
      {/* Title */}
      <div>
        <h2 className="font-['Sora'] text-2xl font-extrabold text-slate-900 tracking-tight">
          {isVi ? "Đơn Đăng Ký Học Đường" : "School Subscription Orders"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isVi
            ? "Xem danh sách liên hệ từ các trường học. Soạn email gửi báo giá PDF và cấp khóa kích hoạt học đường."
            : "Review school inquiry submissions. Issue PDF proposals with QR code and activate school subscription keys."}
        </p>
      </div>

      {/* Filters Area */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full max-w-2xl">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-3xs transition-all"
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={isVi ? "Tìm tên trường, email, người đại diện, mã đơn..." : "Search school name, email, representative..."}
              type="text"
              value={searchText}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-3xs transition-all"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="all">{isVi ? "Trạng thái (Tất cả)" : "Status (All)"}</option>
              <option value="Pending">{isVi ? "Chờ tiếp nhận" : "Pending"}</option>
              <option value="Quoted">{isVi ? "Đã báo giá / Chờ thanh toán" : "Quote Issued / Pending Payment"}</option>
              <option value="Paid">{isVi ? "Đã thanh toán (Chờ sinh Key)" : "Paid (Awaiting Key)"}</option>
              <option value="KeyGenerated">{isVi ? "Đã cấp key" : "Key Created"}</option>
            </select>
          </div>
        </div>
      </article>

      {/* Table / Cards List */}
      <RegistrationTable
        fmtVND={fmtVND}
        isVi={isVi}
        onGenerateKey={handleGenerateKey}
        onOpenQuoteModal={handleOpenQuoteModal}
        registrations={filteredRegs}
      />

      {/* Email Editor / Proposal Modal */}
      <EmailTemplateModal
        fmtVND={fmtVND}
        isOpen={isQuoteModalOpen}
        isVi={isVi}
        onClose={() => setIsQuoteModalOpen(false)}
        onSendQuote={handleSendQuoteSubmit}
        registration={selectedReg}
      />
    </div>
  );
}
