import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import fourSLogo from "../../assets/logo-4s.png";
import globeIcon from "../../assets/Globe.svg";
import { updateProfileRequest, uploadAvatarRequest, changePasswordRequest, getMeRequest } from "../../feature/auth/authSlice";
import { authAPI } from "../../feature/auth/authAPI";
import { eduAPI } from "../../feature/edu/eduAPI";
import {
  normalizeVietnamesePhoneNumber,
  validatePassword,
  validateVietnamesePhoneNumber,
} from "../../validation/authValidation";
import Skeleton from "../../components/Skeleton";
import PhoneInput from "../../components/PhoneInput";
import { getMyTransactionsRequest } from "../../feature/plan/planSlice";
import { formatDateTimeForFE } from "../../util/dateHelper";
import ThemeSettingsToggle from "../../components/ThemeSettingsToggle";



function ProfilePage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  const { user, avatarUploading, loading, plan } = useSelector((state) => state.auth);
  const isFreeAccount = !plan || String(plan).toLowerCase() === "free";

  const [academicProfileId, setAcademicProfileId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "Other",
    birthYear: "",
    gpa: "8.5",
    strengthSubjects: "",
    interestsText: "",
    personalityText: "",
    careerGoalsText: "",
    preferredLocation: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const genderOptions = useMemo(
    () =>
      locale === "vi"
        ? [
            { value: "Male", label: "Nam" },
            { value: "Female", label: "Nữ" },
            { value: "Other", label: "Khác" },
          ]
        : [
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ],
    [locale]
  );

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAcademic, setShowAcademic] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showEduActivation, setShowEduActivation] = useState(false);
  const [eduKey, setEduKey] = useState("");
  const [activatingKey, setActivatingKey] = useState(false);

  const transactions = useSelector((state) => state.plan.myTransactions);
  const loadingTransactions = useSelector((state) => state.plan.loadingTransactions);

  const handleActivateKey = async (e) => {
    e.preventDefault();
    if (!eduKey || !eduKey.trim()) return;

    setActivatingKey(true);
    try {
      await eduAPI.activateKey(eduKey.trim());
      toast.success(
        locale === "vi"
          ? "Kích hoạt gói học đường thành công! Tài khoản của bạn đã được nâng cấp."
          : "School plan activated successfully! Your account has been upgraded."
      );
      setEduKey("");
      setShowEduActivation(false);
      dispatch(getMeRequest());
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        (locale === "vi" ? "Không thể kích hoạt mã này" : "Failed to activate key");
      toast.error(`${locale === "vi" ? "Lỗi kích hoạt" : "Activation error"}: ${msg}`);
    } finally {
      setActivatingKey(false);
    }
  };

  const [changeForm, setChangeForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [initialForm, setInitialForm] = useState(null);

  useEffect(() => {
    if (user) {
      const baseUserData = {
        fullName: user.username || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        gender: user.gender || "Other",
        birthYear: user.dob ? new Date(user.dob).getFullYear().toString() : "",
        preferredLocation: user.address || "",
      };
      setForm((prev) => ({ ...prev, ...baseUserData }));
      setInitialForm((prev) => ({ ...baseUserData, ...(prev || {}) }));
      setPhoneError("");
    }
  }, [user]);

  useEffect(() => {
    if (user?.userId) {
      dispatch(getMyTransactionsRequest());
      authAPI
        .getUserProfiles()
        .then((res) => {
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : [];
          const myProfile = list.find((p) => p.userId === user.userId);
          const academicData = myProfile
            ? {
                gpa: myProfile.gpa !== undefined && myProfile.gpa !== null ? String(myProfile.gpa) : "8.5",
                strengthSubjects: myProfile.strengthSubjects || "",
                interestsText: myProfile.interests || "",
                personalityText: myProfile.personality || "",
                careerGoalsText: myProfile.careerGoals || "",
              }
            : {
                gpa: "8.5",
                strengthSubjects: "",
                interestsText: "",
                personalityText: "",
                careerGoalsText: "",
              };
          if (myProfile) {
            setAcademicProfileId(myProfile.profileId);
          }
          setForm((prev) => ({ ...prev, ...academicData }));
          setInitialForm((prev) => ({ ...(prev || {}), ...academicData }));
        })
        .catch((err) => {
          console.error("Failed to load user profile:", err);
        });
    }
  }, [user?.userId, dispatch]);

  const isFormChanged = useMemo(() => {
    if (!initialForm) return false;
    return (
      (form.fullName || "").trim() !== (initialForm.fullName || "").trim() ||
      (form.phone || "").trim() !== (initialForm.phone || "").trim() ||
      (form.gender || "Other") !== (initialForm.gender || "Other") ||
      (form.birthYear || "").trim() !== (initialForm.birthYear || "").trim() ||
      (form.preferredLocation || "").trim() !== (initialForm.preferredLocation || "").trim() ||
      (form.gpa || "").trim() !== (initialForm.gpa || "").trim() ||
      (form.strengthSubjects || "").trim() !== (initialForm.strengthSubjects || "").trim() ||
      (form.interestsText || "").trim() !== (initialForm.interestsText || "").trim() ||
      (form.personalityText || "").trim() !== (initialForm.personalityText || "").trim() ||
      (form.careerGoalsText || "").trim() !== (initialForm.careerGoalsText || "").trim()
    );
  }, [form, initialForm]);

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatarUrl]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!user || !isFormChanged) return;

    const nextPhoneError = validateVietnamesePhoneNumber(form.phone, t, {
      required: false,
    });
    setPhoneError(nextPhoneError);

    if (nextPhoneError) {
      return;
    }

    let dob = null;
    if (form.birthYear) {
      const year = parseInt(form.birthYear, 10);
      if (!isNaN(year) && year > 1900 && year < 2100) {
        dob = new Date(Date.UTC(year, 0, 1)).toISOString();
      }
    }

    if (!dob && user.dob) {
      const parsedDate = new Date(user.dob);
      if (!isNaN(parsedDate.getTime())) {
        dob = parsedDate.toISOString();
      }
    }

    const updatePayload = {
      username: form.fullName,
      email: form.email,
      phoneNumber: form.phone
        ? normalizeVietnamesePhoneNumber(form.phone)
        : "",
      dob: dob,
      gender: form.gender || user?.gender || "Other",
      address: form.preferredLocation,
    };

    dispatch(
      updateProfileRequest({
        id: user.userId,
        data: updatePayload,
        onSuccess: () => {
          setInitialForm({ ...form });
        },
      })
    );

    // Save Academic Profile (UserProfiles API)
    const academicPayload = {
      userId: user.userId,
      gpa: parseFloat(form.gpa) || 0,
      strengthSubjects: form.strengthSubjects || "",
      interests: form.interestsText || "",
      personality: form.personalityText || "",
      careerGoals: form.careerGoalsText || "",
    };

    if (academicProfileId) {
      authAPI
        .updateUserProfile(academicProfileId, academicPayload)
        .then(() => setInitialForm({ ...form }))
        .catch(console.error);
    } else {
      authAPI
        .createUserProfile(academicPayload)
        .then((res) => {
          const newId = res.data?.data?.profileId || res.data?.profileId;
          if (newId) {
            setAcademicProfileId(newId);
          }
          setInitialForm({ ...form });
        })
        .catch(console.error);
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(
      uploadAvatarRequest({
        file,
        onSuccess: () => {
          setAvatarError(false);
        },
      })
    );
  };

  function handleCancel() {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.username || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        birthYear: user.dob ? new Date(user.dob).getFullYear().toString() : "",
        preferredLocation: user.address || "",
      }));
    }
    setPhoneError("");
    setIsEditing(false);
  }

  function handleLanguageChange(language) {
    i18n.changeLanguage(language);
  }

  function handleStartEdit() {
    setPhoneError("");
    setIsEditing(true);
  }

  function handleChangePasswordSubmit(e) {
    e.preventDefault();
    
    let currentErr = "";
    if (!changeForm.currentPassword.trim()) {
      currentErr = t("auth:currentPasswordRequired") || "Current password is required";
    }
    
    const newErr = validatePassword(changeForm.newPassword, t);
    
    let confirmErr = "";
    if (!changeForm.confirmNewPassword.trim()) {
      confirmErr = t("auth:passwordRequired") || "Password is required";
    } else if (changeForm.newPassword !== changeForm.confirmNewPassword) {
      confirmErr = t("auth:passwordMismatch") || "Passwords do not match";
    }

    if (currentErr || newErr || confirmErr) {
      setChangePasswordErrors({
        currentPassword: currentErr,
        newPassword: newErr,
        confirmNewPassword: confirmErr,
      });
      return;
    }
    setChangePasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    dispatch(
      changePasswordRequest({
        currentPassword: changeForm.currentPassword,
        newPassword: changeForm.newPassword,
        onSuccess: () => {
          setChangeForm({
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          });
          setShowChangePassword(false);
        },
      })
    );
  }

  const isProfileLoading = loading && !user;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_22%_16%,rgba(255,201,58,0.09),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(15,226,168,0.1),transparent_35%),linear-gradient(160deg,#031124_0%,#071a35_40%,#041224_100%)] text-[#eaf2ff]">
      <header className="border-b border-white/10 bg-[#1d3551]/95">
        <div className="mx-auto flex w-[min(1360px,96vw)] items-center justify-between gap-4 px-1 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="cursor-pointer transition hover:opacity-90 flex items-center">
              <img alt="4S logo" className="h-18 w-18 object-contain" src={fourSLogo} />
            </Link>
            <div>
              <h1 className="font-['Sora'] text-xl font-semibold">{t("profile:edit.title")}</h1>
              <p className="text-sm text-slate-300">{t("profile:edit.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-[10px] select-none shadow-inner">
              <button
                onClick={() => handleLanguageChange("vi")}
                type="button"
                className={`relative z-10 px-3 py-1.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                  locale === "vi" 
                    ? "text-[#0c1e36] bg-[#ecc741] shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                VI
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                type="button"
                className={`relative z-10 px-3 py-1.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                  locale === "en" 
                    ? "text-[#0c1e36] bg-[#ecc741] shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                EN
              </button>
            </div>
            {/* 1. Nút Home */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:scale-105 cursor-pointer shadow-sm"
              onClick={() => navigate("/")}
              type="button"
              title={locale === "vi" ? "Trang chủ" : "Home"}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            {/* 2. Nút Dashboard */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#0ed8ab]/35 bg-[#0ed8ab]/15 text-[#0ed8ab] transition hover:bg-[#0ed8ab]/25 hover:scale-105 cursor-pointer shadow-sm"
              onClick={() => navigate("/dashboard")}
              type="button"
              title={locale === "vi" ? "Bảng điều khiển sinh viên" : "Student Dashboard"}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            {/* 3. Nút Đổi chủ đề */}
            <ThemeSettingsToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto w-[min(1120px,94vw)] py-7">
        <div className="space-y-5">
          {/* Unified Personal & Academic Info Card */}
          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6 space-y-6">
            {/* Personal Info Header & Avatar */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative group flex flex-col items-center gap-2 self-center md:self-start">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-gradient-to-br from-[#ffe06e]/10 to-[#e2bb28]/10 flex items-center justify-center">
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                      <div className="relative h-10 w-10 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#0ed8ab] animate-spin"></div>
                        <svg className="h-4 w-4 text-[#0ed8ab] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {isProfileLoading ? (
                    <Skeleton className="h-full w-full absolute inset-0" borderRadius="16px" />
                  ) : user?.avatarUrl && !avatarError ? (
                    <img
                      src={user.avatarUrl}
                      alt="User avatar"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="font-['Sora'] text-3xl font-bold text-[#f3d459]">
                      {getInitials(user?.username)}
                    </span>
                  )}
                  {!isProfileLoading && (
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {locale === "vi" ? "Click để đổi ảnh" : "Click to change"}
                </span>
              </div>

              <div className="flex-1 w-full">
                <h2 className="mb-4 font-['Sora'] text-xl font-semibold text-[#f3d459] flex items-center gap-2">
                  <span>👤</span> {t("profile:edit.sections.personal")}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldInput isLoading={isProfileLoading} label={t("profile:edit.fields.fullName")} onChange={(value) => updateField("fullName", value)} value={form.fullName} />
                  <FieldInput isLoading={isProfileLoading} disabled={true} label={t("profile:edit.fields.email")} type="email" value={form.email} />
                  {isProfileLoading ? (
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">{t("profile:edit.fields.phone")}</label>
                      <Skeleton height="38px" borderRadius="12px" className="w-full" />
                    </div>
                  ) : (
                    <PhoneInput
                      error={phoneError}
                      id="profilePhoneNumber"
                      label={t("profile:edit.fields.phone")}
                      onBlur={() => setPhoneError(validateVietnamesePhoneNumber(form.phone, t, { required: false }))}
                      onChange={(value) => {
                        updateField("phone", value);
                        if (phoneError) {
                          setPhoneError(validateVietnamesePhoneNumber(value, t, { required: false }));
                        }
                      }}
                      placeholder={t("signup:phoneNumberPlaceholder")}
                      size="sm"
                      value={form.phone}
                    />
                  )}
                  <FieldSelect
                    label={locale === "vi" ? "Giới tính" : "Gender"}
                    onChange={(value) => updateField("gender", value)}
                    options={genderOptions}
                    value={form.gender}
                  />
                  <FieldInput isLoading={isProfileLoading} label={t("profile:edit.fields.birthYear")} onChange={(value) => updateField("birthYear", value)} value={form.birthYear} />
                  <FieldInput isLoading={isProfileLoading} label={t("profile:edit.fields.preferredLocation")} onChange={(value) => updateField("preferredLocation", value)} value={form.preferredLocation} />
                  <FieldInput label={t("profile:edit.fields.gpa")} onChange={(value) => updateField("gpa", value)} value={form.gpa} />
                  <FieldInput label={locale === "vi" ? "Môn học thế mạnh" : "Strength Subjects"} onChange={(value) => updateField("strengthSubjects", value)} placeholder={locale === "vi" ? "Ví dụ: Toán, Lý, Tiếng Anh" : "e.g., Math, Physics, English"} value={form.strengthSubjects} />
                  <FieldInput label={locale === "vi" ? "Sở thích & Đam mê" : "Interests"} onChange={(value) => updateField("interestsText", value)} placeholder={locale === "vi" ? "Ví dụ: Lập trình, Vẽ tranh, Đọc sách" : "e.g., Coding, Painting, Reading"} value={form.interestsText} />
                  <FieldInput label={locale === "vi" ? "Tính cách & Đặc điểm" : "Personality Traits"} onChange={(value) => updateField("personalityText", value)} placeholder={locale === "vi" ? "Ví dụ: Hướng ngoại, Cẩn thận, Thích sáng tạo" : "e.g., Extroverted, Creative, Detail-oriented"} value={form.personalityText} />
                  <div className="md:col-span-2">
                    <FieldInput label={locale === "vi" ? "Mục tiêu nghề nghiệp" : "Career Goals"} onChange={(value) => updateField("careerGoalsText", value)} placeholder={locale === "vi" ? "Ví dụ: Trở thành Lập trình viên AI" : "e.g., AI Engineer"} value={form.careerGoalsText} />
                  </div>
                </div>
              </div>
            </div>

            {/* Single Save Button right below all fields */}
            <div className="border-t border-white/10 pt-5 flex items-center justify-end">
              <button
                className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] hover:from-[#1fe2bb] hover:to-[#12ceaa] px-7 py-3 text-sm font-bold text-[#082339] shadow-lg transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:brightness-90"
                onClick={handleSave}
                type="button"
                disabled={loading || !isFormChanged}
                title={!isFormChanged ? (locale === "vi" ? "Chưa có thay đổi để lưu" : "No changes to save") : ""}
              >
                <span>💾</span> {loading ? (locale === "vi" ? "Đang lưu..." : "Saving...") : (locale === "vi" ? "Lưu thay đổi" : "Save Changes")}
              </button>
            </div>
          </article>

          {/* Kích hoạt gói học đường B2B */}
          {isFreeAccount && (
            <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left focus:outline-none"
                onClick={() => setShowEduActivation(!showEduActivation)}
              >
                <h2 className="font-['Sora'] text-xl font-semibold text-[#eaf2ff] flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#ecc741]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {locale === "vi" ? "Kích hoạt tài khoản học đường" : "School Plan Activation"}
                </h2>
                <svg
                  className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${
                    showEduActivation ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showEduActivation && (
                <form onSubmit={handleActivateKey} className="mt-5 border-t border-white/10 pt-5 space-y-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {locale === "vi"
                      ? "Nếu nhà trường của bạn đã đăng ký dịch vụ hướng nghiệp 4S và bàn giao Mã kích hoạt (Activation Key), hãy nhập mã vào ô dưới đây để tự động nâng cấp tài khoản của bạn lên gói học đường VIP."
                      : "If your school has registered 4S career guidance and handed over an Activation Key, enter it below to upgrade your account to the school VIP plan."}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={eduKey}
                        onChange={(e) => setEduKey(e.target.value.toUpperCase())}
                        placeholder="EDU-XXXXXXXX"
                        maxLength={12}
                        disabled={activatingKey}
                        className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none disabled:opacity-50 tracking-wider"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={activatingKey || !eduKey.trim()}
                      className="rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#e2bb28] hover:from-[#fff09e] hover:to-[#f2cb38] px-6 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {activatingKey && (
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-slate-900 animate-spin" />
                      )}
                      {locale === "vi" ? "Kích hoạt ngay" : "Activate Now"}
                    </button>
                  </div>
                </form>
              )}
            </article>
          )}

          {/* Lịch sử giao dịch */}
          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left focus:outline-none"
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
            >
              <h2 className="font-['Sora'] text-xl font-semibold text-[#eaf2ff] flex items-center gap-2">
                <svg className="h-5 w-5 text-[#0ed8ab]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                {locale === "vi" ? "Lịch sử mua gói & Giao dịch" : "Transaction & Subscription History"}
              </h2>
              <svg
                className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${
                  showTransactionHistory ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTransactionHistory && (
              <div className="mt-5 border-t border-white/10 pt-5">
                {loadingTransactions ? (
                  <div className="space-y-3">
                    <Skeleton height="35px" borderRadius="8px" className="w-full" />
                    <Skeleton height="35px" borderRadius="8px" className="w-full" />
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center py-4 text-sm text-slate-400">
                    {locale === "vi" ? "Bạn chưa thực hiện giao dịch nào." : "No transactions found."}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/5">
                    <table className="min-w-full text-sm">
                      <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-300 bg-white/5 font-semibold">
                        <tr>
                          <th className="px-4 py-3">{locale === "vi" ? "Mã GD" : "TX Code"}</th>
                          <th className="px-4 py-3">{locale === "vi" ? "Gói cước" : "Plan"}</th>
                          <th className="px-4 py-3 text-right">{locale === "vi" ? "Số tiền" : "Amount"}</th>
                          <th className="px-4 py-3">{locale === "vi" ? "Thời gian" : "Date"}</th>
                          <th className="px-4 py-3">{locale === "vi" ? "Trạng thái" : "Status"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {transactions.map((tx) => (
                          <tr className="hover:bg-white/5 transition-colors" key={tx.transactionId}>
                            <td className="px-4 py-3 font-semibold text-[#f3d459] font-mono whitespace-nowrap">
                              {tx.transactionCode}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-200">
                              {tx.planName || "VIP Plan"}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-[#0ed8ab] whitespace-nowrap">
                              {tx.amount ? `${tx.amount.toLocaleString("vi-VN")} VND` : "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                              {formatDateTimeForFE(tx.createdAt, locale)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                                  tx.status === "Success"
                                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                    : tx.status === "Pending"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-white/10 text-slate-400 border border-white/10"
                                }`}
                              >
                                {tx.status === "Success"
                                  ? (locale === "vi" ? "Thành công" : "Success")
                                  : tx.status === "Pending"
                                  ? (locale === "vi" ? "Đang chờ" : "Pending")
                                  : (locale === "vi" ? "Hết hạn" : "Expired")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left focus:outline-none"
              onClick={() => {
                setShowChangePassword(!showChangePassword);
                setChangePasswordErrors({
                  currentPassword: "",
                  newPassword: "",
                  confirmNewPassword: "",
                });
              }}
            >
              <h2 className="font-['Sora'] text-xl font-semibold text-[#eaf2ff] flex items-center gap-2">
                <svg className="h-5 w-5 text-[#f3d459]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t("auth:changePassword")}
              </h2>
              <svg
                className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${
                  showChangePassword ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

             {showChangePassword && (
              <form onSubmit={handleChangePasswordSubmit} className="mt-6 space-y-4 border-t border-white/10 pt-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">{t("auth:currentPasswordLabel")}</label>
                    <input
                      type="password"
                      className={`w-full rounded-xl border bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50 ${
                        changePasswordErrors.currentPassword ? "border-rose-500 focus:border-rose-500" : "border-white/12 focus:border-[#ecc741]"
                      }`}
                      placeholder={t("auth:currentPasswordPlaceholder")}
                      value={changeForm.currentPassword}
                      onChange={(e) => {
                        setChangeForm(prev => ({ ...prev, currentPassword: e.target.value }));
                        setChangePasswordErrors(prev => ({ ...prev, currentPassword: "" }));
                      }}
                      disabled={loading}
                      required
                    />
                    {changePasswordErrors.currentPassword && (
                      <p className="mt-1 text-xs text-rose-400">
                        {changePasswordErrors.currentPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">{t("auth:newPasswordLabel")}</label>
                    <input
                      type="password"
                      className={`w-full rounded-xl border bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50 ${
                        changePasswordErrors.newPassword ? "border-rose-500 focus:border-rose-500" : "border-white/12 focus:border-[#ecc741]"
                      }`}
                      placeholder={t("auth:newPasswordPlaceholder")}
                      value={changeForm.newPassword}
                      onChange={(e) => {
                        setChangeForm(prev => ({ ...prev, newPassword: e.target.value }));
                        setChangePasswordErrors(prev => ({ ...prev, newPassword: "" }));
                      }}
                      disabled={loading}
                      required
                    />
                    {changePasswordErrors.newPassword && (
                      <p className="mt-1 text-xs text-rose-400">
                        {changePasswordErrors.newPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">{t("auth:confirmNewPasswordLabel")}</label>
                    <input
                      type="password"
                      className={`w-full rounded-xl border bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50 ${
                        changePasswordErrors.confirmNewPassword ? "border-rose-500 focus:border-rose-500" : "border-white/12 focus:border-[#ecc741]"
                      }`}
                      placeholder={t("auth:confirmNewPasswordPlaceholder")}
                      value={changeForm.confirmNewPassword}
                      onChange={(e) => {
                        setChangeForm(prev => ({ ...prev, confirmNewPassword: e.target.value }));
                        setChangePasswordErrors(prev => ({ ...prev, confirmNewPassword: "" }));
                      }}
                      disabled={loading}
                      required
                    />
                    {changePasswordErrors.confirmNewPassword && (
                      <p className="mt-1 text-xs text-rose-400">
                        {changePasswordErrors.confirmNewPassword}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-gradient-to-r from-[#ecc741] to-[#e2bb28] px-5 py-2.5 text-sm font-bold text-[#082339] shadow-lg transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? t("auth:updating") : t("auth:updatePassword")}
                  </button>
                </div>
              </form>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

function FieldInput({ label, value, onChange, type = "text", disabled = false, isLoading = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      {isLoading ? (
        <Skeleton height="38px" borderRadius="12px" className="w-full" />
      ) : (
        <input
          className={`w-full rounded-xl border border-white/12 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 ${
            disabled
              ? "cursor-default bg-white/4"
              : "bg-white/6 focus:border-[#ecc741] focus:outline-none"
          }`}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          readOnly={disabled}
          type={type}
          value={value}
        />
      )}
    </div>
  );
}

function FieldSelect({ label, value, onChange, options, disabled = false, isLoading = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      {isLoading ? (
        <Skeleton height="38px" borderRadius="12px" className="w-full" />
      ) : (
        <select
          className={`w-full rounded-xl border border-white/12 px-3 py-2.5 text-sm text-slate-100 ${
            disabled
              ? "cursor-default bg-white/4"
              : "bg-white/6 focus:border-[#ecc741] focus:outline-none"
          }`}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option
              className="bg-[#203a59] text-slate-100"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default ProfilePage;
