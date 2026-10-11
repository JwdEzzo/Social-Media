import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

// Wrap an element directly, or use as a layout route to guard nested routes via <Outlet />
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children ?? <Outlet />}</>;
};
