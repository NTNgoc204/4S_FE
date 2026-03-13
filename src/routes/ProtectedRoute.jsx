import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({
  children,
  isAuthenticated = false,
  currentPlan = "",
  requirePro = false,
  currentRole = "user",
  allowedRoles = [],
  redirectTo = "/login",
  unauthorizedTo = "/",
}) {
  const location = useLocation();
  const normalizedPlan = String(currentPlan).toLowerCase();
  const normalizedRole = String(currentRole).toLowerCase();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={redirectTo} />;
  }

  if (requirePro && normalizedPlan !== "pro") {
    return <Navigate replace to={unauthorizedTo} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    return <Navigate replace to={unauthorizedTo} />;
  }

  return children;
}

export default ProtectedRoute;
