import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginRequest } from "../../feature/auth/authSlice";
import { I18N_ERROR_KEYS } from "../../util/i18nErrorKeys";
import loginIcon from "../../assets/Login.svg";

const AUTH_REDIRECT_MESSAGE_KEY = "auth_redirect_message_key";

function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    loading,
    error: reduxError,
    isLoggedIn,
  } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const authMessageShown = useRef(false);

  useEffect(() => {
    if (authMessageShown.current) {
      return;
    }

    const storedMessageKey = localStorage.getItem(AUTH_REDIRECT_MESSAGE_KEY);
    const messageKey = storedMessageKey || location.state?.authMessageKey;

    if (!messageKey) {
      return;
    }

    authMessageShown.current = true;
    localStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY);
    toast.warning(t(messageKey));

    if (location.state?.authMessageKey) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, t]);

  // Navigate to home after successful login
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setError(t(I18N_ERROR_KEYS.REQUIRED_FIELD));
      return;
    }

    dispatch(
      loginRequest({
        email: normalizedEmail,
        password: password,
      }),
    );
  }

  // Use Redux error if available, otherwise use local error
  const displayError = reduxError || error;

  return (
    <>
      <main className="mx-auto flex min-h-[calc(100vh-74px)] w-[min(1120px,92vw)] items-center justify-center py-10">
        <section className="w-full max-w-[540px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#1e3451]/90 to-[#182c47]/94 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <div className="mb-5 flex justify-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#ffe16d] to-[#deb320] shadow-[0_10px_24px_rgba(237,196,46,0.28)]">
              <img
                alt="Login icon"
                className="h-8 w-8 object-contain"
                src={loginIcon}
              />
            </div>
          </div>

          <h1 className="text-center font-['Sora'] text-4xl font-bold">
            {t("auth:welcomeBack")}
          </h1>
          <p className="mt-2 text-center text-lg text-slate-300">
            {t("auth:subtitle")}
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="email"
              >
                {t("auth:emailLabel")}
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("auth:emailPlaceholder")}
                required
                type="email"
                value={email}
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="password"
              >
                {t("auth:passwordLabel")}
              </label>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 pr-12 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t("auth:passwordPlaceholder")}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={loading}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  disabled={loading}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              className="mt-2 w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 text-xl font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : t("auth:signIn")}
            </button>

            {displayError ? (
              <p className="text-sm font-medium text-rose-300">
                {displayError}
              </p>
            ) : null}
          </form>

          <p className="mt-7 text-center text-lg text-slate-300">
            {t("auth:noAccount")}{" "}
            <button
              className="font-semibold text-[#ecc741] transition hover:text-[#ffdf69] disabled:opacity-50"
              onClick={() => navigate("/sign-up")}
              type="button"
              disabled={loading}
            >
              {t("auth:signUp")}
            </button>
          </p>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
