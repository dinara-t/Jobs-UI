import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth();
  const loc = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <>{children}</>;
}
