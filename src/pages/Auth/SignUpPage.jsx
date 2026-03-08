import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import loginIcon from "../../assets/Login.svg";

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("student");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t("signup:errors.required"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("signup:errors.passwordMismatch"));
      return;
    }

    setError("");
    setSubmitted(true);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-74px)] w-[min(1120px,92vw)] items-center justify-center py-10">
      <section className="w-full max-w-[620px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#1e3451]/90 to-[#182c47]/94 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div className="mb-5 flex justify-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#ffe16d] to-[#deb320] shadow-[0_10px_24px_rgba(237,196,46,0.28)]">
            <img alt="Sign up icon" className="h-8 w-8 object-contain" src={loginIcon} />
          </div>
        </div>

        <h1 className="text-center font-['Sora'] text-4xl font-bold">{t("signup:title")}</h1>
        <p className="mt-2 text-center text-lg text-slate-300">{t("signup:subtitle")}</p>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-[#0ed8ab]/35 bg-[#0ed8ab]/10 p-6 text-center">
            <h2 className="font-['Sora'] text-2xl font-semibold text-[#0ed8ab]">{t("signup:successTitle")}</h2>
            <p className="mt-2 text-slate-200">{t("signup:successDesc")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                className="rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-5 py-2.5 font-semibold text-[#112542] transition hover:brightness-105"
                onClick={() => navigate("/login")}
                type="button"
              >
                {t("signup:goLogin")}
              </button>
              <button
                className="rounded-xl border border-white/14 bg-white/5 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-white/10"
                onClick={() => navigate("/")}
                type="button"
              >
                {t("signup:goHome")}
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="fullName">
                {t("signup:fullNameLabel")}
              </label>
              <input
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none"
                id="fullName"
                onChange={(event) => setFullName(event.target.value)}
                placeholder={t("signup:fullNamePlaceholder")}
                type="text"
                value={fullName}
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="signupEmail">
                {t("signup:emailLabel")}
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none"
                id="signupEmail"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("signup:emailPlaceholder")}
                type="email"
                value={email}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="signupPassword">
                  {t("signup:passwordLabel")}
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none"
                  id="signupPassword"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t("signup:passwordPlaceholder")}
                  type="password"
                  value={password}
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="confirmPassword">
                  {t("signup:confirmPasswordLabel")}
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none"
                  id="confirmPassword"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t("signup:confirmPasswordPlaceholder")}
                  type="password"
                  value={confirmPassword}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="accountType">
                {t("signup:accountTypeLabel")}
              </label>
              <select
                className="w-full rounded-xl border border-white/15 bg-[#19324d] px-4 py-3 text-base text-slate-100 focus:border-[#ecc741] focus:outline-none"
                id="accountType"
                onChange={(event) => setAccountType(event.target.value)}
                value={accountType}
              >
                <option value="student">{t("signup:accountTypes.student")}</option>
                <option value="school">{t("signup:accountTypes.school")}</option>
              </select>
            </div>

            {error ? <p className="text-sm font-medium text-rose-300">{error}</p> : null}

            <button
              className="w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 text-xl font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)]"
              type="submit"
            >
              {t("signup:submit")}
            </button>

            <p className="text-center text-base text-slate-300">
              {t("signup:alreadyHaveAccount")}{" "}
              <button
                className="font-semibold text-[#ecc741] transition hover:text-[#ffdf69]"
                onClick={() => navigate("/login")}
                type="button"
              >
                {t("signup:loginNow")}
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

export default SignUpPage;
