import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const UI_TEXT = {
  vi: {
    title: "Sự kiện Hướng nghiệp học đường",
    subtitle: "Quản lý các buổi tư vấn hướng nghiệp, chương trình ngày hội tuyển sinh và hội thảo liên kết.",
    searchPlaceholder: "Tìm tên sự kiện, đơn vị tổ chức, địa điểm...",
    filterStatus: "Trạng thái (Tất cả)",
    statusScheduled: "Scheduled (Sắp diễn ra)",
    statusCompleted: "Completed (Đã diễn ra)",
    statusCancelled: "Cancelled (Đã hủy)",
    btnCreate: "+ Tạo Sự kiện",
    colName: "Tên Sự kiện / Đơn vị tổ chức",
    colDate: "Ngày diễn ra",
    colLocation: "Địa điểm",
    colTarget: "Đối tượng tham gia",
    colStatus: "Trạng thái",
    colActions: "Thao tác",
    noEvents: "Không tìm thấy sự kiện nào.",
    actionEdit: "Sửa",
    actionDelete: "Xóa",
    confirmDelete: "Bạn có chắc chắn muốn xóa sự kiện này không?",
    toastDeleted: "Đã xóa sự kiện thành công.",
    toastCreated: "Đã tạo sự kiện mới thành công.",
    toastUpdated: "Đã cập nhật thông tin sự kiện.",
    modalAddTitle: "Tạo Sự kiện Hướng nghiệp Mới",
    modalEditTitle: "Chỉnh sửa Sự kiện Hướng nghiệp",
    labelName: "Tên sự kiện",
    labelDate: "Ngày diễn ra",
    labelHost: "Đơn vị/Diễn giả phối hợp",
    labelLocation: "Địa điểm tổ chức",
    labelTarget: "Đối tượng học sinh",
    labelStatus: "Trạng thái",
    btnCancel: "Hủy bỏ",
    btnSave: "Lưu Sự kiện",
    placeholderName: "Ví dụ: Hội thảo Định hướng Nghề nghiệp tương lai",
    placeholderHost: "Ví dụ: Đại học Quốc gia TP.HCM",
    placeholderLocation: "Ví dụ: Hội trường A hoặc Phòng họp trực tuyến",
    placeholderTarget: "Ví dụ: Học sinh khối 12",
  },
  en: {
    title: "School Orientation Events",
    subtitle: "Manage career counseling workshops, university admission fairs, and partnership events.",
    searchPlaceholder: "Search event name, host, location...",
    filterStatus: "Status (All)",
    statusScheduled: "Scheduled",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    btnCreate: "+ Create Event",
    colName: "Event Name / Organizer",
    colDate: "Event Date",
    colLocation: "Location",
    colTarget: "Target Audience",
    colStatus: "Status",
    colActions: "Actions",
    noEvents: "No events found.",
    actionEdit: "Edit",
    actionDelete: "Delete",
    confirmDelete: "Are you sure you want to delete this event?",
    toastDeleted: "Event deleted successfully.",
    toastCreated: "New event created successfully.",
    toastUpdated: "Event details updated successfully.",
    modalAddTitle: "Create New Career Event",
    modalEditTitle: "Edit Career Event Details",
    labelName: "Event Name",
    labelDate: "Event Date",
    labelHost: "Organizer / Guest Speaker",
    labelLocation: "Event Location",
    labelTarget: "Target Students",
    labelStatus: "Status",
    btnCancel: "Cancel",
    btnSave: "Save Event",
    placeholderName: "e.g., Future Career Path Guidance Workshop",
    placeholderHost: "e.g., VNU-HCM University",
    placeholderLocation: "e.g., Main Hall or Zoom Room",
    placeholderTarget: "e.g., Grade 12 students only",
  }
};

function SchoolEventsPage() {
  const { events, setEvents } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    host: "",
    location: "",
    target: "",
    status: "Scheduled",
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        e.name.toLowerCase().includes(q) ||
        e.host.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || e.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  function openCreateModal() {
    setEditingEvent(null);
    setForm({
      name: "",
      date: new Date().toISOString().split("T")[0],
      host: "",
      location: "",
      target: "",
      status: "Scheduled",
    });
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setEditingEvent(item);
    setForm({
      name: item.name,
      date: item.date,
      host: item.host,
      location: item.location,
      target: item.target,
      status: item.status,
    });
    setIsModalOpen(true);
  }

  function handleSaveEvent(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.host.trim()) {
      toast.error(locale === "vi" ? "Vui lòng nhập đầy đủ các trường thông tin bắt buộc!" : "Please fill in all required fields!");
      return;
    }

    const record = {
      name: form.name.trim(),
      date: form.date,
      host: form.host.trim(),
      location: form.location.trim() || "N/A",
      target: form.target.trim() || "N/A",
      status: form.status,
    };

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((item) => (item.id === editingEvent.id ? { ...item, ...record } : item))
      );
      toast.success(text.toastUpdated);
    } else {
      setEvents((prev) => [...prev, { id: Date.now(), ...record }]);
      toast.success(text.toastCreated);
    }
    setIsModalOpen(false);
  }

  function handleDeleteEvent(id) {
    if (window.confirm(text.confirmDelete)) {
      setEvents((prev) => prev.filter((item) => item.id !== id));
      toast.success(text.toastDeleted);
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 flex-1 max-w-2xl">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              type="text"
              value={searchQuery}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="all">{text.filterStatus}</option>
              <option value="Scheduled">{text.statusScheduled}</option>
              <option value="Completed">{text.statusCompleted}</option>
              <option value="Cancelled">{text.statusCancelled}</option>
            </select>
          </div>

          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm"
            onClick={openCreateModal}
            type="button"
          >
            {text.btnCreate}
          </button>
        </div>
      </article>

      {/* Desktop Table View */}
      <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3">{text.colName}</th>
                <th className="px-4 py-3">{text.colDate}</th>
                <th className="px-4 py-3">{text.colLocation}</th>
                <th className="px-4 py-3">{text.colTarget}</th>
                <th className="px-4 py-3">{text.colStatus}</th>
                <th className="px-4 py-3 text-right">{text.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                    {text.noEvents}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.host}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {item.location}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {item.target}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                          item.status === "Scheduled"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : item.status === "Completed"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 shadow-sm"
                          onClick={() => openEditModal(item)}
                          type="button"
                        >
                          {text.actionEdit}
                        </button>
                        <button
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 shadow-sm"
                          onClick={() => handleDeleteEvent(item.id)}
                          type="button"
                        >
                          {text.actionDelete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Mobile Card List View */}
      <section className="space-y-3 md:hidden">
        {filteredEvents.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-400">{text.noEvents}</p>
        ) : (
          filteredEvents.map((item) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5" key={item.id}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">
                  {new Date(item.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                    item.status === "Scheduled"
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : item.status === "Completed"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{locale === "vi" ? "Đơn vị: " : "Host: "}{item.host}</p>
                <p className="text-xs text-slate-600 mt-1">📍 {item.location}</p>
                <p className="text-xs text-slate-600 mt-0.5">👥 {item.target}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => openEditModal(item)}
                  type="button"
                >
                  {text.actionEdit}
                </button>
                <button
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  onClick={() => handleDeleteEvent(item.id)}
                  type="button"
                >
                  {text.actionDelete}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* EVENT ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <article className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <header className="flex items-center justify-between">
              <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">
                {editingEvent ? text.modalEditTitle : text.modalAddTitle}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold focus:outline-none"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                &times;
              </button>
            </header>

            <form className="space-y-4" onSubmit={handleSaveEvent}>
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelName}</p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={text.placeholderName}
                  required
                  type="text"
                  value={form.name}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelDate}</p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    type="date"
                    value={form.date}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelStatus}</p>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    value={form.status}
                  >
                    <option value="Scheduled">{text.statusScheduled}</option>
                    <option value="Completed">{text.statusCompleted}</option>
                    <option value="Cancelled">{text.statusCancelled}</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelHost}</p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setForm((prev) => ({ ...prev, host: e.target.value }))}
                  placeholder={text.placeholderHost}
                  required
                  type="text"
                  value={form.host}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelLocation}</p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder={text.placeholderLocation}
                    type="text"
                    value={form.location}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelTarget}</p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
                    placeholder={text.placeholderTarget}
                    type="text"
                    value={form.target}
                  />
                </div>
              </div>

              <footer className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  {text.btnCancel}
                </button>
                <button
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm"
                  type="submit"
                >
                  {text.btnSave}
                </button>
              </footer>
            </form>
          </article>
        </div>
      )}
    </div>
  );
}

export default SchoolEventsPage;
