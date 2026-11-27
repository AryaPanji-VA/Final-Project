import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/hooks/use-auth";

/**
 * ProtectedRoute — workspace pages require a session.
 *
 * The attempted path travels in `state.from`, so signing in returns the keeper
 * to the page they asked for rather than the home page.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
