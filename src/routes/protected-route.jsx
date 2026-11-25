import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/hooks/use-auth";

// Protected route: halaman hanya bisa diakses kalau sudah login.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
