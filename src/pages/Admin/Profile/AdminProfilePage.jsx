import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  updateProfileRequest,
  uploadAvatarRequest,
  changePasswordRequest,
} from "../../../feature/auth/authSlice";
import {
  normalizeVietnamesePhoneNumber,
  validatePassword,
  validateVietnamesePhoneNumber,
} from "../../../validation/authValidation";

export default function AdminProfilePage() {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  const { user, avatarUploading, loading } = useSelector((state) => state.auth);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dirty, setDirty] = useState(false);

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [avatarError, setAvatarError] = useState(false);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFullName(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      setAddress(user.address || "");
      setPhoneError("");
      setDirty(false);
    }
  }, [user]);

  // Handle personal info field change
  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    setDirty(true);
  };

  // Handle Cancel changes
  const handleCancel = () => {
    if (user) {
      setFullName(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      setAddress(user.address || "");
    }
    setPhoneError("");
    setDirty(false);
  };

  // Handle Save changes
  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (!user) return;

    const nextPhoneError = validateVietnamesePhoneNumber(phone, t, {
      required: false,
    });
    setPhoneError(nextPhoneError);

    if (nextPhoneError) {
      toast.warning(nextPhoneError);
      return;
    }

    const updatePayload = {
      username: fullName.trim(),
      email: email.trim(),
      phoneNumber: phone ? normalizeVietnamesePhoneNumber(phone) : "",
      dob: user.dob, // keep existing DOB
      address: address.trim(),
    };

    dispatch(
      updateProfileRequest({
        id: user.userId,
        data: updatePayload,
        onSuccess: () => {
          setDirty(false);
          toast.success(t("auth:profileUpdateSuccess"));
        },
      })
    );
  };

  // Handle Avatar upload
  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(
      uploadAvatarRequest({
        file,
        onSuccess: () => {
          setAvatarError(false);
          toast.success(t("auth:avatarUploadSuccess"));
        },
      })
    );
  };

  // Handle Password change submit
  const handleChangePassword = (e) => {
    e.preventDefault();

    let currentErr = "";
    if (!currentPassword.trim()) {
      currentErr = t("auth:currentPasswordRequired");
    }

    const newErr = validatePassword(newPassword, t);

    let confirmErr = "";
    if (!confirmNewPassword.trim()) {
      confirmErr = t("auth:passwordRequired");
    } else if (newPassword !== confirmNewPassword) {
      confirmErr = t("auth:passwordMismatch");
    }

    if (currentErr || newErr || confirmErr) {
      setPasswordErrors({
        currentPassword: currentErr,
        newPassword: newErr,
        confirmNewPassword: confirmErr,
      });
      return;
    }

    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    dispatch(
      changePasswordRequest({
        currentPassword: currentPassword,
        newPassword: newPassword,
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          toast.success(t("auth:changePasswordSuccess"));
        },
      })
    );
  };

  // Language switch
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <section className="space-y-6 max-w-4xl mx-auto px-2">
      {/* Visual Canvas Info Cards */}
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        
        {/* Left Column: Avatar & Language Quick Settings */}
        <div className="space-y-6">
          {/* Avatar card */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center flex flex-col items-center">
            <div className="relative group">
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-indigo-50 to-slate-50 flex items-center justify-center">
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 z-10 rounded-2xl">
                    <div className="relative h-8 w-8 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-3 border-t-transparent border-indigo-600 animate-spin"></div>
                    </div>
                  </div>
                )}
                {user?.avatarUrl && !avatarError ? (
                  <img
                    src={user.avatarUrl}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="font-['Sora'] text-4xl font-bold text-indigo-600">
                    {getInitials(user?.username)}
                  </span>
                )}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-900/60 opacity-0 transition group-hover:opacity-100 rounded-2xl">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
            
            <h4 className="font-['Sora'] font-bold text-slate-800 mt-3 text-base truncate w-full">
              {user?.username || t("profile:admin.adminAccount", "Admin Account")}
            </h4>
            <span className="inline-block mt-1 text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {user?.roleName || t("profile:admin.administrator", "Administrator")}
            </span>
            <p className="text-[11px] text-slate-400 mt-3">
              {t("profile:admin.clickToChangeAvatar")}
            </p>
          </article>

          {/* Language quick card */}
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {t("profile:admin.systemLanguage")}
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer border ${
                  locale === "vi"
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
                onClick={() => handleLanguageChange("vi")}
                type="button"
              >
                {t("profile:admin.vietnamese")}
              </button>
              <button
                className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer border ${
                  locale === "en"
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
                onClick={() => handleLanguageChange("en")}
                type="button"
              >
                {t("profile:admin.english")}
              </button>
            </div>
          </article>
        </div>

        {/* Right Column: Profile Edit & Change Password Forms */}
        <div className="space-y-6">
          {/* Profile details form */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-['Sora'] text-lg font-bold text-slate-800">
                  {t("profile:admin.personalProfile")}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {t("profile:admin.personalProfileSubtitle")}
                </p>
              </div>
              {dirty && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 shadow-3xs">
                  {t("profile:admin.unsavedChanges")}
                </span>
              )}
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSaveInfo}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="admin-fullname">
                    {t("profile:admin.fullName")}
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
                    id="admin-fullname"
                    onChange={handleFieldChange(setFullName)}
                    required
                    type="text"
                    value={fullName}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="admin-email">
                    {t("profile:admin.email")}
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 focus:outline-none cursor-not-allowed shadow-xs"
                    disabled
                    id="admin-email"
                    type="email"
                    value={email}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="admin-phone">
                    {t("profile:admin.phone")}
                  </label>
                  <input
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all ${
                      phoneError ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-indigo-500"
                    }`}
                    id="admin-phone"
                    onChange={handleFieldChange(setPhone)}
                    placeholder="Ví dụ: 0912345678"
                    type="tel"
                    value={phone}
                  />
                  {phoneError && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{phoneError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="admin-address">
                    {t("profile:admin.address")}
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
                    id="admin-address"
                    onChange={handleFieldChange(setAddress)}
                    placeholder="Ví dụ: Quận 1, TP. HCM"
                    type="text"
                    value={address}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                {dirty && (
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                    onClick={handleCancel}
                    type="button"
                  >
                    {t("profile:admin.cancel")}
                  </button>
                )}
                <button
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 shadow-sm cursor-pointer"
                  disabled={loading || !dirty}
                  type="submit"
                >
                  {loading ? t("profile:admin.saving") : t("profile:admin.saveChanges")}
                </button>
              </div>
            </form>
          </article>

          {/* Change password form */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
            <h3 className="font-['Sora'] text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">
              {t("profile:admin.changePassword")}
            </h3>

            <form className="mt-5 space-y-4" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="current-pw">
                  {t("profile:admin.currentPassword")}
                </label>
                <input
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all ${
                    passwordErrors.currentPassword ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-indigo-500"
                  }`}
                  id="current-pw"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type="password"
                  value={currentPassword}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="new-pw">
                    {t("profile:admin.newPassword")}
                  </label>
                  <input
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all ${
                      passwordErrors.newPassword ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-indigo-500"
                    }`}
                    id="new-pw"
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    value={newPassword}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="confirm-new-pw">
                    {t("profile:admin.confirmNewPassword")}
                  </label>
                  <input
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all ${
                      passwordErrors.confirmNewPassword ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-indigo-500"
                    }`}
                    id="confirm-new-pw"
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    type="password"
                    value={confirmNewPassword}
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{passwordErrors.confirmNewPassword}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end pt-2 border-t border-slate-100">
                <button
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 shadow-sm cursor-pointer"
                  disabled={loading || !currentPassword || !newPassword || !confirmNewPassword}
                  type="submit"
                >
                  {t("profile:admin.updatePassword")}
                </button>
              </div>
            </form>
          </article>
        </div>

      </div>
    </section>
  );
}
