import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUniversitiesRequest,
  createUniversityRequest,
  updateUniversityRequest,
  deleteUniversityRequest,
  fetchUniversityMajorsRequest,
  createUniversityMajorRequest,
  updateUniversityMajorRequest,
  deleteUniversityMajorRequest,
} from "../../feature/university/universitySlice";

export default function UniversityManagementPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";
  const dispatch = useDispatch();

  // Redux Selectors
  const {
    universities,
    universitiesLoading,
    universitiesError,
    universityMajors,
    universityMajorsLoading,
  } = useSelector((state) => state.university);

  // Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // Selected University for Majors management
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);

  // Modals control state
  const [showUniModal, setShowUniModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [editingUniversityIsNew, setEditingUniversityIsNew] = useState(false);

  const [showMajorModal, setShowMajorModal] = useState(false);
  const [editingMajor, setEditingMajor] = useState({
    id: "",
    majorId: "",
    name: "",
    code: "", // Represents universityMajor.description (e.g. "Kỹ thuật phần mềm DUT")
    score: 20.0,
    quota: 100,
    tuition: 15000000,
    degreeType: "Cử nhân",
    language: "Tiếng Việt",
    majorDescription: "",
  });
  const [majorIsNew, setMajorIsNew] = useState(true);

  // Initial Load
  useEffect(() => {
    dispatch(fetchUniversitiesRequest());
  }, [dispatch]);

  // Auto-select the first university when loaded
  useEffect(() => {
    if (universities.length > 0 && !selectedUniversityId) {
      const firstUni = universities[0];
      const id = firstUni.universityId || firstUni.UniversityId;
      setSelectedUniversityId(id);
      dispatch(fetchUniversityMajorsRequest(id));
    }
  }, [universities, selectedUniversityId, dispatch]);

  // Reset form when selected university changes
  useEffect(() => {
    if (selectedUniversityId) {
      setEditingMajor({
        id: "",
        majorId: "",
        name: "",
        code: "",
        score: 20.0,
        quota: 100,
        tuition: 15000000,
        degreeType: "Cử nhân",
        language: "Tiếng Việt",
        majorDescription: "",
      });
      setMajorIsNew(true);
    }
  }, [selectedUniversityId]);

  // Handle Search Input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    dispatch(fetchUniversitiesRequest(val));
  };

  // University: Select & load majors
  const handleSelectUniversity = (uni) => {
    const id = uni.universityId || uni.UniversityId;
    setSelectedUniversityId(id);
    dispatch(fetchUniversityMajorsRequest(id));
  };

  // University: Delete
  const handleDeleteUniversity = (e, id, name) => {
    e.stopPropagation(); // Avoid selecting university
    const msg = isVi
      ? `Bạn có chắc chắn muốn xóa trường "${name}" khỏi danh sách hệ thống?`
      : `Are you sure you want to delete "${name}" from the system?`;
    if (window.confirm(msg)) {
      dispatch(
        deleteUniversityRequest({
          id,
          onSuccess: () => {
            if (selectedUniversityId === id) {
              setSelectedUniversityId(null);
            }
          },
        })
      );
    }
  };

  // University: Open Create Modal
  const handleOpenCreateUniModal = () => {
    setEditingUniversity({
      name: "",
      shortName: "",
      location: "TP. Hồ Chí Minh",
      ranking: 1,
      avatar: "",
    });
    setEditingUniversityIsNew(true);
    setShowUniModal(true);
  };

  // University: Open Edit Modal
  const handleOpenEditUniModal = (e, uni) => {
    e.stopPropagation(); // Avoid selecting university
    const id = uni.universityId || uni.UniversityId;
    setEditingUniversity({
      id,
      name: uni.name || uni.Name || "",
      shortName: uni.shortName || uni.ShortName || "",
      location: uni.location || uni.Location || "TP. Hồ Chí Minh",
      ranking: uni.ranking || uni.Ranking || 1,
      avatar: uni.avatar || uni.Avatar || "",
    });
    setEditingUniversityIsNew(false);
    setShowUniModal(true);
  };

  // University: Save
  const handleSaveUniversity = (e) => {
    e.preventDefault();
    if (!editingUniversity.name.trim()) {
      toast.warn(isVi ? "Vui lòng nhập tên trường!" : "Please enter the university name!");
      return;
    }

    if (editingUniversityIsNew) {
      dispatch(
        createUniversityRequest({
          data: editingUniversity,
          onSuccess: () => setShowUniModal(false),
        })
      );
    } else {
      dispatch(
        updateUniversityRequest({
          data: editingUniversity,
          onSuccess: () => setShowUniModal(false),
        })
      );
    }
  };

  // Major: Open Add
  const handleOpenAddMajor = () => {
    if (!selectedUniversityId) {
      toast.warn(isVi ? "Vui lòng chọn trường đại học trước!" : "Please select a university first!");
      return;
    }
    setEditingMajor({
      id: "",
      majorId: "",
      name: "",
      code: "",
      score: 20.0,
      quota: 100,
      tuition: 15000000,
      degreeType: "Cử nhân",
      language: "Tiếng Việt",
      majorDescription: "",
    });
    setMajorIsNew(true);
    setShowMajorModal(true);
  };

  // Major: Open Edit
  const handleOpenEditMajor = (major) => {
    setEditingMajor({
      id: major.id,
      majorId: major.majorId,
      name: major.name,
      code: major.description || "", // universityMajor.description
      score: major.score,
      quota: major.quota,
      tuition: major.tuition,
      degreeType: major.degreeType || "Cử nhân",
      language: major.language || "Tiếng Việt",
      majorDescription: major.majorDescription || "",
    });
    setMajorIsNew(false);
    setShowMajorModal(true);
  };

  // Major: Save
  const handleSaveMajor = (e) => {
    if (e) e.preventDefault();
    if (!editingMajor.name.trim()) {
      toast.warn(isVi ? "Vui lòng nhập tên ngành học!" : "Please enter major name!");
      return;
    }

    const payload = {
      id: editingMajor.id,
      majorId: editingMajor.majorId,
      universityId: selectedUniversityId,
      name: editingMajor.name,
      code: editingMajor.code,
      score: editingMajor.score,
      quota: editingMajor.quota,
      tuition: editingMajor.tuition,
      degreeType: editingMajor.degreeType,
      language: editingMajor.language,
      majorDescription: editingMajor.majorDescription,
      onSuccess: () => {
        handleOpenAddMajor();
        setShowMajorModal(false);
      },
    };

    if (majorIsNew) {
      dispatch(createUniversityMajorRequest(payload));
    } else {
      dispatch(updateUniversityMajorRequest(payload));
    }
  };

  // Major: Delete
  const handleDeleteMajor = (majorId) => {
    if (
      window.confirm(
        isVi ? "Bạn có chắc muốn xóa ngành học này?" : "Are you sure you want to delete this major?"
      )
    ) {
      dispatch(
        deleteUniversityMajorRequest({
          id: majorId,
          universityId: selectedUniversityId,
        })
      );
    }
  };

  // Filter local universities list
  const filteredUniversities = universities.filter((u) => {
    const name = u.name || u.Name || "";
    const shortName = u.shortName || u.ShortName || "";
    const location = u.location || u.Location || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedUni = universities.find(
    (u) => (u.universityId || u.UniversityId) === selectedUniversityId
  );

  return (
    <div className="space-y-8 animate-fadeIn font-sans text-slate-800">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-bold text-slate-900 flex items-center gap-2">
            {isVi ? "CMS Quản lý Danh mục Đại học" : "University Directory CMS"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isVi
              ? "Quản lý danh sách các trường đại học và điều chỉnh trực tiếp các ngành đào tạo tuyển sinh ở bên ngoài."
              : "Manage the list of universities and configure their admissions majors directly on the main screen."}
          </p>
        </div>

        <button
          onClick={handleOpenCreateUniModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {isVi ? "Thêm trường Đại học mới" : "Add New University"}
        </button>
      </div>

      {/* Grid Layout: Left is Universities, Right is Majors list */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Column 1: Universities list */}
        <section className="lg:col-span-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={
                  isVi
                    ? "Tìm kiếm trường đại học..."
                    : "Search university..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9.5 pr-4 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {universitiesError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {universitiesError}
            </div>
          )}

          {universitiesLoading && universities.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-650" />
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-3xs text-slate-450 text-xs">
              {isVi ? "Không tìm thấy trường nào" : "No universities found"}
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredUniversities.map((uni) => {
                const id = uni.universityId || uni.UniversityId;
                const name = uni.name || uni.Name || "";
                const shortName = uni.shortName || uni.ShortName || "";
                const location = uni.location || uni.Location || "";
                const ranking = uni.ranking || uni.Ranking || 0;
                const avatar = uni.avatar || uni.Avatar || "";
                const isSelected = selectedUniversityId === id;

                return (
                  <div
                    key={id}
                    onClick={() => handleSelectUniversity(uni)}
                    className={`group p-3 rounded-2xl border transition duration-200 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-teal-550 bg-teal-50/40 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl border border-slate-100 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-3xs">
                        {avatar ? (
                          <img src={avatar} alt={name} className="h-full w-full object-contain" />
                        ) : (
                          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 text-[11px] truncate" title={name}>{name}</h4>
                        <p className="text-[9px] text-slate-455 mt-0.5">
                          {shortName} • {location} • #{ranking}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">
                      <button
                        onClick={(e) => handleOpenEditUniModal(e, uni)}
                        className="p-1 rounded bg-teal-50 text-teal-650 hover:bg-teal-100 transition cursor-pointer"
                        title={isVi ? "Chỉnh sửa" : "Edit"}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteUniversity(e, id, name)}
                        className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title={isVi ? "Xóa" : "Delete"}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Column 2: Selected University Majors list */}
        <section className="lg:col-span-8">
          {selectedUni ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-3xs space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <h3 className="font-['Sora'] font-bold text-xs text-slate-900 truncate" title={selectedUni.name || selectedUni.Name}>
                    {isVi
                      ? `Ngành Tuyển Sinh: ${selectedUni.name || selectedUni.Name}`
                      : `Admissions Majors: ${selectedUni.name || selectedUni.Name}`}
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">
                    {isVi
                      ? `Tổng số ${universityMajors.length} ngành đang tuyển sinh của trường.`
                      : `Manage ${universityMajors.length} majors linked to this school.`}
                  </p>
                </div>

                <button
                  onClick={handleOpenAddMajor}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {isVi ? "Thêm ngành học" : "Add Major"}
                </button>
              </div>

              {universityMajorsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-650" />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-150 font-bold">
                      <tr>
                        <th className="px-3 py-2.5 text-left">{isVi ? "Ngành / Hệ / Ngôn ngữ" : "Major / Degree / Lang"}</th>
                        <th className="px-2 py-2.5 text-left">{isVi ? "Mã tuyển sinh" : "Code"}</th>
                        <th className="px-2 py-2.5 text-right">{isVi ? "Điểm chuẩn" : "Cut-off"}</th>
                        <th className="px-2 py-2.5 text-right">{isVi ? "Học phí / kỳ" : "Tuition / Term"}</th>
                        <th className="px-3 py-2.5 text-center">{isVi ? "Hành động" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white font-medium text-slate-700">
                      {universityMajors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-12 text-center text-slate-400 font-normal">
                            {isVi
                              ? "Trường chưa có thông tin ngành tuyển sinh. Bấm nút Thêm ngành học ở góc trên để bắt đầu."
                              : "No majors linked to this school yet. Click the Add Major button above to start."}
                          </td>
                        </tr>
                      ) : (
                        universityMajors.map((major) => (
                          <tr
                            key={major.id}
                            onClick={() => handleOpenEditMajor(major)}
                            className="hover:bg-slate-50/70 transition cursor-pointer"
                          >
                            <td className="px-3 py-2.5">
                              <p className="font-bold text-slate-900 text-xs">{major.name}</p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="rounded bg-indigo-50 text-indigo-700 border border-indigo-100 px-1 py-0.2 text-[8px] font-bold">
                                  {major.degreeType}
                                </span>
                                <span className="rounded bg-slate-50 text-slate-600 border border-slate-200 px-1 py-0.2 text-[8px]">
                                  {major.language}
                                </span>
                                {major.majorDescription && (
                                  <span
                                    className="text-slate-400 hover:text-slate-700 text-[9px] cursor-help flex items-center gap-0.5"
                                    title={major.majorDescription}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    ℹ️ {isVi ? "Chi tiết" : "Info"}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2.5 font-mono text-slate-600">
                              {major.description || "—"}
                            </td>
                            <td className="px-2 py-2.5 text-right font-extrabold text-teal-750">
                              {major.score}
                            </td>
                            <td className="px-2 py-2.5 text-right font-bold text-slate-800 whitespace-nowrap">
                              {Number(major.tuition).toLocaleString("vi-VN")} VND
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => handleOpenEditMajor(major)}
                                  className="p-1 rounded text-teal-650 hover:bg-teal-50 transition cursor-pointer"
                                  title={isVi ? "Sửa" : "Edit"}
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteMajor(major.id)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title={isVi ? "Xóa" : "Delete"}
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-3xs text-slate-450 min-h-[300px]">
              <svg className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs">
                {isVi
                  ? "Vui lòng chọn một trường đại học ở cột bên trái để hiển thị danh sách ngành nghề."
                  : "Please select a university from the left list to load its majors catalog."}
              </p>
            </div>
          )}
        </section>

      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. UNIVERSITY MODAL (Simple, General profile only) */}
      {showUniModal && editingUniversity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <header className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-['Sora'] font-bold text-base text-slate-900">
                  {editingUniversityIsNew
                    ? isVi
                      ? "Thêm trường Đại học mới"
                      : "Add New University"
                    : isVi
                    ? `Chỉnh sửa trường: ${editingUniversity.name}`
                    : `Edit University: ${editingUniversity.name}`}
                </h3>
              </div>
              <button
                onClick={() => setShowUniModal(false)}
                className="h-8 w-8 rounded-full bg-slate-50 border border-slate-150 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer shadow-3xs"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Modal Body */}
            <form id="uni-general-form" onSubmit={handleSaveUniversity} className="p-6 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block font-bold text-slate-650 uppercase tracking-wide">
                    {isVi ? "Tên trường Đại học *" : "University Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-855 focus:border-teal-500 focus:outline-none shadow-3xs"
                    value={editingUniversity.name}
                    onChange={(e) => setEditingUniversity({ ...editingUniversity, name: e.target.value })}
                    placeholder="Ví dụ: Đại học Bách Khoa TP.HCM"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-bold text-slate-655 uppercase tracking-wide">
                    {isVi ? "Tên viết tắt *" : "Abbreviation *"}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-855 focus:border-teal-500 focus:outline-none shadow-3xs"
                    value={editingUniversity.shortName}
                    onChange={(e) => setEditingUniversity({ ...editingUniversity, shortName: e.target.value })}
                    placeholder="Ví dụ: HCMUT"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-bold text-slate-655 uppercase tracking-wide">
                    {isVi ? "Thành phố / Tỉnh *" : "Location / City *"}
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-855 focus:border-teal-500 focus:outline-none shadow-3xs"
                    value={editingUniversity.location}
                    onChange={(e) => setEditingUniversity({ ...editingUniversity, location: e.target.value })}
                  >
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Nghệ An">Nghệ An</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-bold text-slate-655 uppercase tracking-wide">
                    {isVi ? "Thứ hạng (Ranking)" : "National Ranking"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-855 focus:border-teal-500 focus:outline-none shadow-3xs"
                    value={editingUniversity.ranking}
                    onChange={(e) =>
                      setEditingUniversity({
                        ...editingUniversity,
                        ranking: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-bold text-slate-655 uppercase tracking-wide">
                    {isVi ? "Đường dẫn Logo (Avatar URL)" : "Logo / Avatar URL"}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-855 focus:border-teal-500 focus:outline-none shadow-3xs font-mono"
                    value={editingUniversity.avatar || ""}
                    onChange={(e) => setEditingUniversity({ ...editingUniversity, avatar: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <footer className="px-6 py-4.5 border-t border-slate-150 flex items-center justify-end gap-2.5 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowUniModal(false)}
                className="rounded-xl border border-slate-250 bg-white px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-100 transition cursor-pointer"
              >
                {isVi ? "Hủy" : "Cancel"}
              </button>
              <button
                type="submit"
                form="uni-general-form"
                className="rounded-xl bg-teal-600 hover:bg-teal-700 transition px-5 py-2 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                {isVi ? "Lưu lại" : "Save changes"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. UNIVERSITY MAJOR MODAL (Add/Edit admissions major) */}
      {showMajorModal && editingMajor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <header className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-['Sora'] font-bold text-base text-slate-900">
                  {majorIsNew
                    ? isVi
                      ? "Thêm ngành tuyển sinh mới"
                      : "Add Admissions Major"
                    : isVi
                    ? `Cập nhật ngành: ${editingMajor.name}`
                    : `Edit Major: ${editingMajor.name}`}
                </h3>
              </div>
              <button
                onClick={() => setShowMajorModal(false)}
                className="h-8 w-8 rounded-full bg-slate-50 border border-slate-150 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer shadow-3xs"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Modal Body */}
            <form id="major-form" onSubmit={handleSaveMajor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                  {isVi ? "Tên ngành học *" : "Major Name *"}
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-teal-500 focus:outline-none shadow-3xs"
                  value={editingMajor.name}
                  onChange={(e) => setEditingMajor({ ...editingMajor, name: e.target.value })}
                  placeholder={isVi ? "Ví dụ: Kỹ thuật Phần mềm" : "e.g. Software Engineering"}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                    {isVi ? "Mã tuyển sinh / Ghi chú" : "Admission Code / Note"}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-teal-500 focus:outline-none shadow-3xs font-mono"
                    value={editingMajor.code}
                    onChange={(e) => setEditingMajor({ ...editingMajor, code: e.target.value })}
                    placeholder={isVi ? "Ví dụ: Kỹ thuật phần mềm DUT" : "e.g. Kỹ thuật phần mềm DUT"}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                    {isVi ? "Hệ đào tạo *" : "Degree Type *"}
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-850 focus:border-teal-500 focus:outline-none shadow-3xs"
                    value={editingMajor.degreeType}
                    onChange={(e) => setEditingMajor({ ...editingMajor, degreeType: e.target.value })}
                  >
                    <option value="Cử nhân">Cử nhân (Bachelor)</option>
                    <option value="Kỹ sư">Kỹ sư (Engineer)</option>
                    <option value="Thạc sĩ">Thạc sĩ (Master)</option>
                    <option value="Tiến sĩ">Tiến sĩ (PhD)</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                    {isVi ? "Ngôn ngữ giảng dạy *" : "Instruction Language *"}
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-850 focus:border-teal-500 focus:outline-none shadow-3xs"
                    value={editingMajor.language}
                    onChange={(e) => setEditingMajor({ ...editingMajor, language: e.target.value })}
                  >
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Tiếng Nhật">Tiếng Nhật</option>
                    <option value="Song ngữ">Song ngữ</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                    {isVi ? "Điểm chuẩn *" : "Cut-off Score *"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={30}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-teal-500 focus:outline-none font-semibold text-teal-700 shadow-3xs"
                    value={editingMajor.score}
                    onChange={(e) => setEditingMajor({ ...editingMajor, score: parseFloat(e.target.value) || 0.0 })}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                    {isVi ? "Chỉ tiêu *" : "Quota *"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-teal-500 focus:outline-none shadow-3xs"
                    value={editingMajor.quota}
                    onChange={(e) => setEditingMajor({ ...editingMajor, quota: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                    {isVi ? "Học phí (VND/kỳ) *" : "Tuition (VND/term) *"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-teal-500 focus:outline-none font-mono shadow-3xs"
                    value={editingMajor.tuition}
                    onChange={(e) => setEditingMajor({ ...editingMajor, tuition: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-655 uppercase tracking-wide text-[9px]">
                  {isVi ? "Mô tả chi tiết ngành học" : "Major Description"}
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-teal-500 focus:outline-none shadow-3xs leading-relaxed"
                  value={editingMajor.majorDescription || ""}
                  onChange={(e) => setEditingMajor({ ...editingMajor, majorDescription: e.target.value })}
                  placeholder={isVi ? "Mô tả tóm tắt nội dung đào tạo của ngành..." : "Summary of the major's curriculum..."}
                />
              </div>
            </form>

            {/* Modal Footer */}
            <footer className="px-6 py-4.5 border-t border-slate-150 flex items-center justify-end gap-2.5 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowMajorModal(false)}
                className="rounded-xl border border-slate-250 bg-white px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-100 transition cursor-pointer"
              >
                {isVi ? "Hủy" : "Cancel"}
              </button>
              <button
                type="submit"
                form="major-form"
                className="rounded-xl bg-teal-650 hover:bg-teal-700 transition px-5 py-2 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                {isVi ? "Lưu lại" : "Save changes"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
