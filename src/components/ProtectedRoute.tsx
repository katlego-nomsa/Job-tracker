import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

// Wrap any page that needs a logged-in user.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Remember the page they wanted so login can send them back to it.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}