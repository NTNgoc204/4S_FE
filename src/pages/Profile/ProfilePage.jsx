import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import fourSLogo from "../../assets/logo-4s.png";
import globeIcon from "../../assets/Globe.svg";
import { updateProfileRequest, uploadAvatarRequest, changePasswordRequest, getMeRequest } from "../../feature/auth/authSlice";
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



const SKILL_KEYS = [
  { id: "creativity", value: 75 },
  { id: "logic", value: 90 },
  { id: "communication", value: 80 },
  { id: "leadership", value: 70 },
  { id: "problemSolving", value: 95 },
  { id: "teamwork", value: 85 },
];

const INTEREST_KEYS = [
  "software",
  "dataScience",
  "ai",
  "businessAnalytics",
  "finance",
  "marketing",
  "medicine",
  "law",
  "education",
  "engineering",
  "design",
  "arts",
];

function ProfilePage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  const { user, avatarUploading, loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthYear: "",
    currentGrade: "grade12",
    gpa: "8.5",
    mathScore: "85",
    englishScore: "80",
    scienceScore: "90",
    preferredLocation: "",
    maxTuition: "50",
    studyMode: "fullTime",
    language: "vietnamese",
  });
  const [phoneError, setPhoneError] = useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAcademic, setShowAcademic] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
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

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.username || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        birthYear: user.dob ? new Date(user.dob).getFullYear().toString() : "",
        preferredLocation: user.address || "",
      }));
      setPhoneError("");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      dispatch(getMyTransactionsRequest());
    }
  }, [user, dispatch]);


  const [selectedInterests, setSelectedInterests] = useState(["software", "ai"]);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredSkillId, setHoveredSkillId] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatarUrl]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const [skillScores, setSkillScores] = useState(
    () =>
      SKILL_KEYS.reduce((acc, item) => {
        acc[item.id] = item.value;
        return acc;
      }, {}),
  );

  const skillRows = useMemo(
    () =>
      SKILL_KEYS.map((item) => ({
        id: item.id,
        value: skillScores[item.id] ?? 0,
        label: t(`profile:edit.skills.${item.id}`),
      })),
    [skillScores, t],
  );

  const currentGradeOptions = useMemo(
    () =>
      locale === "vi"
        ? [
            { value: "grade10", label: "Lớp 10" },
            { value: "grade11", label: "Lớp 11" },
            { value: "grade12", label: "Lớp 12" },
            { value: "gapYear", label: "Gap year" },
          ]
        : [
            { value: "grade10", label: "Grade 10" },
            { value: "grade11", label: "Grade 11" },
            { value: "grade12", label: "Grade 12" },
            { value: "gapYear", label: "Gap year" },
          ],
    [locale],
  );

  const studyModeOptions = useMemo(
    () =>
      locale === "vi"
        ? [
            { value: "fullTime", label: "Toàn thời gian" },
            { value: "partTime", label: "Bán thời gian" },
            { value: "online", label: "Trực tuyến" },
            { value: "hybrid", label: "Kết hợp" },
          ]
        : [
            { value: "fullTime", label: "Full-time" },
            { value: "partTime", label: "Part-time" },
            { value: "online", label: "Online" },
            { value: "hybrid", label: "Hybrid" },
          ],
    [locale],
  );

  const instructionLanguageOptions = useMemo(
    () =>
      locale === "vi"
        ? [
            { value: "vietnamese", label: "Tiếng Việt" },
            { value: "english", label: "Tiếng Anh" },
            { value: "bilingual", label: "Song ngữ" },
            { value: "japanese", label: "Tiếng Nhật" },
          ]
        : [
            { value: "vietnamese", label: "Vietnamese" },
            { value: "english", label: "English" },
            { value: "bilingual", label: "Bilingual" },
            { value: "japanese", label: "Japanese" },
          ],
    [locale],
  );

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(id) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function updateSkillScore(id, value) {
    setSkillScores((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  }

  function handleSave() {
    if (!user) return;

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
      address: form.preferredLocation,
    };

    dispatch(
      updateProfileRequest({
        id: user.userId,
        data: updatePayload,
        onSuccess: () => {
          setHoveredSkillId("");
          setIsEditing(false);
        },
      })
    );
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
    setHoveredSkillId("");
    setPhoneError("");
    setIsEditing(false);
  }

  function handleLanguageChange(language) {
    i18n.changeLanguage(language);
  }

  function handleStartEdit() {
    setHoveredSkillId("");
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
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
              onClick={() => navigate(-1)}
              type="button"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M15 5 8 12l7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <img alt="4S logo" className="h-18 w-18 object-contain" src={fourSLogo} />
            <div>
              <h1 className="font-['Sora'] text-xl font-semibold">{t("profile:edit.title")}</h1>
              <p className="text-sm text-slate-300">{t("profile:edit.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
              <img alt="" aria-hidden="true" className="ml-2 mr-1 h-4 w-4 opacity-70" src={globeIcon} />
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${locale === "en" ? "bg-white/15 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                onClick={() => handleLanguageChange("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${locale === "vi" ? "bg-white/15 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                onClick={() => handleLanguageChange("vi")}
                type="button"
              >
                VI
              </button>
            </div>
            <button
              className="rounded-xl border border-[#0ed8ab]/35 bg-[#0ed8ab]/15 px-4 py-2 text-sm font-semibold text-[#0ed8ab] transition hover:bg-[#0ed8ab]/25"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              {t("profile:edit.openDashboard")}
            </button>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                  onClick={handleCancel}
                  type="button"
                >
                  {t("profile:edit.cancel")}
                </button>
                <button
                  className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2 text-sm font-bold text-[#082339] transition hover:brightness-110"
                  onClick={handleSave}
                  type="button"
                >
                  {t("profile:edit.saveChanges")}
                </button>
              </div>
            ) : (
              <button
                className="rounded-xl border border-[#ecc741]/45 bg-[#ecc741]/14 px-4 py-2 text-sm font-semibold text-[#f3d459] transition hover:bg-[#ecc741]/24"
                onClick={handleStartEdit}
                type="button"
              >
                {t("profile:edit.editProfile")}
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto w-[min(1120px,94vw)] py-7">
        <div className="space-y-5">
          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group flex flex-col items-center gap-2">
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
              <h2 className="mb-4 font-['Sora'] text-xl font-semibold">{t("profile:edit.sections.personal")}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldInput isLoading={isProfileLoading} disabled={!isEditing} label={t("profile:edit.fields.fullName")} onChange={(value) => updateField("fullName", value)} value={form.fullName} />
                <FieldInput isLoading={isProfileLoading} disabled={!isEditing} label={t("profile:edit.fields.email")} onChange={(value) => updateField("email", value)} type="email" value={form.email} />
                {isProfileLoading ? (
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">{t("profile:edit.fields.phone")}</label>
                    <Skeleton height="38px" borderRadius="12px" className="w-full" />
                  </div>
                ) : (
                  <PhoneInput
                    disabled={!isEditing}
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
                <FieldInput isLoading={isProfileLoading} disabled={!isEditing} label={t("profile:edit.fields.birthYear")} onChange={(value) => updateField("birthYear", value)} value={form.birthYear} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left focus:outline-none"
              onClick={() => setShowAcademic(!showAcademic)}
            >
              <h2 className="font-['Sora'] text-xl font-semibold text-[#eaf2ff] flex items-center gap-2">
                <svg className="h-5 w-5 text-[#8b99ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" />
                </svg>
                {t("profile:edit.sections.academic")}
              </h2>
              <svg
                className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${
                  showAcademic ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAcademic && (
              <div className="grid gap-4 md:grid-cols-2 mt-5 border-t border-white/10 pt-5">
                <FieldSelect
                  disabled={!isEditing}
                  label={t("profile:edit.fields.currentGrade")}
                  onChange={(value) => updateField("currentGrade", value)}
                  options={currentGradeOptions}
                  value={form.currentGrade}
                />
                <FieldInput disabled={!isEditing} label={t("profile:edit.fields.gpa")} onChange={(value) => updateField("gpa", value)} value={form.gpa} />
                <FieldInput disabled={!isEditing} label={t("profile:edit.fields.mathScore")} onChange={(value) => updateField("mathScore", value)} value={form.mathScore} />
                <FieldInput disabled={!isEditing} label={t("profile:edit.fields.englishScore")} onChange={(value) => updateField("englishScore", value)} value={form.englishScore} />
                <div className="md:col-span-1">
                  <FieldInput disabled={!isEditing} label={t("profile:edit.fields.scienceScore")} onChange={(value) => updateField("scienceScore", value)} value={form.scienceScore} />
                </div>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left focus:outline-none"
              onClick={() => setShowSkills(!showSkills)}
            >
              <h2 className="font-['Sora'] text-xl font-semibold text-[#eaf2ff] flex items-center gap-2">
                <svg className="h-5 w-5 text-[#0ed8ab]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t("profile:edit.sections.skills")}
              </h2>
              <svg
                className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${
                  showSkills ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSkills && (
              <div className="space-y-4 mt-5 border-t border-white/10 pt-5">
                {skillRows.map((item) => (
                  <div key={item.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold text-[#0ed8ab]">{item.value}/100</span>
                    </div>
                    {isEditing ? (
                      <input
                        className={`mt-2 h-2 w-full cursor-pointer appearance-none rounded-full 
                        [&::-webkit-slider-runnable-track]:h-2
                        [&::-webkit-slider-runnable-track]:rounded-full
                        [&::-webkit-slider-runnable-track]:bg-transparent
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:duration-150
                        [&::-moz-range-track]:h-2
                        [&::-moz-range-track]:rounded-full
                        [&::-moz-range-track]:bg-transparent
                        [&::-moz-range-thumb]:transition-all
                        [&::-moz-range-thumb]:duration-150
                        ${
                          hoveredSkillId === item.id
                            ? "[&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#15d4b0] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#0f9e87] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(21,212,176,0.18)] [&::-webkit-slider-thumb]:opacity-100 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#15d4b0] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:opacity-100"
                            : "[&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-none [&::-webkit-slider-thumb]:opacity-0 [&::-moz-range-thumb]:h-0 [&::-moz-range-thumb]:w-0 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:opacity-0"
                        }`}
                        onMouseEnter={() => setHoveredSkillId(item.id)}
                        onMouseLeave={() => setHoveredSkillId("")}
                        onFocus={() => setHoveredSkillId(item.id)}
                        onBlur={() => setHoveredSkillId("")}
                        max={100}
                        min={0}
                        onChange={(event) => updateSkillScore(item.id, event.target.value)}
                        step={1}
                        style={{
                          background: `linear-gradient(to right, #15d4b0 0%, #15d4b0 ${item.value}%, rgba(255,255,255,0.12) ${item.value}%, rgba(255,255,255,0.12) 100%)`,
                        }}
                        type="range"
                        value={item.value}
                      />
                    ) : (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/12">
                        <span
                          className="block h-full rounded-full bg-[#15d4b0]"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left focus:outline-none"
              onClick={() => setShowInterests(!showInterests)}
            >
              <h2 className="font-['Sora'] text-xl font-semibold text-[#eaf2ff] flex items-center gap-2">
                <svg className="h-5 w-5 text-[#ffe16d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {t("profile:edit.sections.interests")}
              </h2>
              <svg
                className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${
                  showInterests ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showInterests && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-sm text-slate-300">{t("profile:edit.interestHint")}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {INTEREST_KEYS.map((id) => {
                    const active = selectedInterests.includes(id);
                    return (
                      <button
                        disabled={!isEditing}
                        key={id}
                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          active
                            ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/16 text-[#0ed8ab]"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        } ${!isEditing ? "cursor-not-allowed opacity-70" : ""}`}
                        onClick={() => toggleInterest(id)}
                        type="button"
                      >
                        {t(`profile:edit.interests.${id}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left focus:outline-none"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              <h2 className="font-['Sora'] text-xl font-semibold text-[#eaf2ff] flex items-center gap-2">
                <svg className="h-5 w-5 text-[#7f8cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {t("profile:edit.sections.preferences")}
              </h2>
              <svg
                className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${
                  showPreferences ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPreferences && (
              <div className="grid gap-4 md:grid-cols-2 mt-5 border-t border-white/10 pt-5">
                <FieldInput
                  disabled={!isEditing}
                  label={t("profile:edit.fields.preferredLocation")}
                  onChange={(value) => updateField("preferredLocation", value)}
                  value={form.preferredLocation}
                />
                <FieldInput disabled={!isEditing} label={t("profile:edit.fields.maxTuition")} onChange={(value) => updateField("maxTuition", value)} value={form.maxTuition} />
                <FieldSelect
                  disabled={!isEditing}
                  label={t("profile:edit.fields.studyMode")}
                  onChange={(value) => updateField("studyMode", value)}
                  options={studyModeOptions}
                  value={form.studyMode}
                />
                <FieldSelect
                  disabled={!isEditing}
                  label={t("profile:edit.fields.language")}
                  onChange={(value) => updateField("language", value)}
                  options={instructionLanguageOptions}
                  value={form.language}
                />
              </div>
            )}
          </article>

          {/* Kích hoạt gói học đường B2B */}
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
                {locale === "vi" ? "Kích hoạt tài khoản học đường (B2B)" : "School Plan Activation (B2B)"}
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
