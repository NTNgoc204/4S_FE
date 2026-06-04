import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { refreshTokenRequest } from "../feature/auth/authSlice";

const REFRESH_TOKEN_DELAY = 12 * 60 * 1000;

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

  // Get auth from Redux if useRedux is true
  const reduxAuth = useSelector((state) => state.auth);
  const isAuthLoading = reduxAuth.loading;

  // Use Redux auth or props-based auth
  const auth = useRedux
    ? reduxAuth
    : {
      isLoggedIn: isAuthenticated,
      plan: currentPlan,
      role: currentRole,
    };

  const isAuthValid = useRedux ? auth.isLoggedIn : isAuthenticated;
  const normalizedPlan = String(auth.plan || currentPlan || "").toLowerCase();
  const normalizedRole = String(auth.role || currentRole || "").toLowerCase();
  const normalizedRoles = roles.map((r) => String(r).toLowerCase());
  const hasRoleRequirement = normalizedRoles.length > 0;

  // isWaitingForRole: authenticated but role hasn't loaded yet (async)
  const isWaitingForRole =
    isAuthValid && hasRoleRequirement && !normalizedRole;

  // isLoggedInWithWrongRole: authenticated, role loaded, but doesn't match
  const isLoggedInWithWrongRole =
    isAuthValid &&
    hasRoleRequirement &&
    Boolean(normalizedRole) &&
    !normalizedRoles.includes(normalizedRole);

  const currentToken =
    reduxAuth.token || sessionStorage.getItem("access_token");

  // Schedule periodic token refresh for authenticated sessions
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

  // 1. Not authenticated → redirect to login
  if (!isAuthValid) {
    // Voluntary logout: toast already shown by saga, no warning needed
    if (reduxAuth.justLoggedOut) {
      return <Navigate replace to={redirectTo} />;
    }
    // Session expired or direct access without auth → show warning
    return (
      <Navigate
        replace
        state={{ authMessageKey: "auth:loginRequired", from: location }}
        to={redirectTo}
      />
    );
  }

  // 2. Authenticated but needs Pro plan and doesn't have it → redirect to pricing
  const isPaidPlan = normalizedPlan !== "free" && normalizedPlan !== "";
  if (requirePro && !isPaidPlan) {
    return <Navigate replace to={unauthorizedTo} />;
  }

  // 3. Still loading auth (getMe in-flight) — wait before any role-based decision
  //    This covers both "role not yet loaded" and "isAuthLoading" states.
  if (isAuthLoading) {
    return null;
  }

  // 4. Role still loading after auth resolved (edge case: role field empty)
  if (isWaitingForRole) {
    return null;
  }

  // 5. Wrong role → redirect to home (NOT logout; all route wrappers render
  //    simultaneously so logging out here would affect the correct user too)
  if (isLoggedInWithWrongRole) {
    return (
      <Navigate
        replace
        state={{ authMessageKey: "auth:accessDenied", from: location }}
        to={unauthorizedTo}
      />
    );
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
