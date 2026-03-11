import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { JobsPage } from "./pages/Jobs/JobsPage";
import { JobDetailPage } from "./pages/Jobs/JobDetailPage";
import { TempsPage } from "./pages/Temps/TempsPage";
import { TempDetailPage } from "./pages/Temps/TempDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RequireAuth } from "./state/RequireAuth";
import { useAuth } from "./state/AuthContext";

export function App() {
  const { isAuthed } = useAuth();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={<Navigate to={isAuthed ? "/jobs" : "/login"} replace />}
        />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        <Route
          path="/jobs"
          element={
            <RequireAuth>
              <JobsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <RequireAuth>
              <JobDetailPage />
            </RequireAuth>
          }
        />

        <Route
          path="/temps"
          element={
            <RequireAuth>
              <TempsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/temps/:id"
          element={
            <RequireAuth>
              <TempDetailPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
