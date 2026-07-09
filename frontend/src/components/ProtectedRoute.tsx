import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  /** If set, the user must have this role (ADMIN always passes). */
  role?: string;
}

/**
 * Route guard. Redirects unauthenticated users to /login, and users who lack the
 * required role to their own dashboard. Without this, guests could open /dashboard
 * or /instructor directly and land on a silently-broken page (the API 401/403s but
 * nothing tells the user why).
 */
export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user && user.role !== role && user.role !== "ADMIN") {
    // Logged in but wrong role — send them somewhere they can actually use.
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
