import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import { logoutRequest, refreshTokenRequest } from "../feature/auth/authSlice";

const REFRESH_TOKEN_DELAY = 12 * 60 * 1000;
const AUTH_REDIRECT_MESSAGE_KEY = "auth_redirect_message_key";

function ProtectedRoute({
  children,
  isAuthenticated = false,
  currentPlan = "",
  requirePro = false,
  currentRole,
  roles = [],
  redirectTo = "/login",
  unauthorizedTo = "/",
  useRedux = false,
}) {
  const location = useLocation();
  const dispatch = useDispatch();
  const logoutDispatched = useRef(false);

  // Get auth from Redux if useRedux is true
  const reduxAuth = useSelector((state) => state.auth);

  // Use Redux auth or props-based auth
  const auth = useRedux
    ? reduxAuth
    : {
        isLoggedIn: isAuthenticated,
        plan: currentPlan,
        role: currentRole,
      };

  const isAuthValid = useRedux ? auth.isLoggedIn : isAuthenticated;
  const normalizedPlan = String(auth.plan || currentPlan).toLowerCase();
  const normalizedRole = String(auth.role || currentRole || "").toLowerCase();
  const normalizedRoles = roles.map((role) => String(role).toLowerCase());
  const hasRoleRequirement = normalizedRoles.length > 0;
  const isWaitingForRole =
    isAuthValid && hasRoleRequirement && !normalizedRole;
  const isLoggedInWithWrongRole =
    isAuthValid &&
    hasRoleRequirement &&
    Boolean(normalizedRole) &&
    !normalizedRoles.includes(normalizedRole);
  const currentToken =
    reduxAuth.token || sessionStorage.getItem("access_token");

  useEffect(() => {
    if (!isAuthValid || !currentToken || requirePro) {
      return undefined;
    }

    let timeoutId;

    const scheduleRefresh = () => {
      timeoutId = window.setTimeout(() => {
        dispatch(refreshTokenRequest());
        scheduleRefresh();
      }, REFRESH_TOKEN_DELAY);
    };

    scheduleRefresh();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentToken, dispatch, isAuthValid, requirePro]);

  // Logged-in users with the wrong role are forced out immediately.
  useEffect(() => {
    if (isLoggedInWithWrongRole && !logoutDispatched.current) {
      logoutDispatched.current = true;
      localStorage.setItem(AUTH_REDIRECT_MESSAGE_KEY, "auth:accessDenied");
      dispatch(logoutRequest());
    }
  }, [dispatch, isLoggedInWithWrongRole]);

  if (!isAuthValid) {
    return (
      <Navigate
        replace
        state={{ authMessageKey: "auth:loginRequired", from: location }}
        to={redirectTo}
      />
    );
  }

  if (requirePro && normalizedPlan !== "pro") {
    return <Navigate replace to={unauthorizedTo} />;
  }

  if (isWaitingForRole) {
    return null;
  }

  if (isLoggedInWithWrongRole) {
    return (
      <Navigate
        replace
        state={{ authMessageKey: "auth:accessDenied", from: location }}
        to={redirectTo}
      />
    );
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
