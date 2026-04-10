import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AssistantWidget } from "./components/AssistantWidget";
import { LoginPage } from "./pages/LoginPage";
import { JobsPage } from "./pages/Jobs/JobsPage";
import { JobDetailPage } from "./pages/Jobs/JobDetailPage";
import { TempsPage } from "./pages/Temps/TempsPage";
import { TempDetailPage } from "./pages/Temps/TempDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RequireAuth } from "./state/RequireAuth";
import { useAuth } from "./state/AuthContext";

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <>
        {children}
        <AssistantWidget />
      </>
    </RequireAuth>
  );
}

export function App() {
  const { isAuthed, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={<Navigate to={isAuthed ? "/jobs" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/jobs" replace /> : <LoginPage />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedPage>
              <ProfilePage />
            </ProtectedPage>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedPage>
              <JobsPage />
            </ProtectedPage>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <ProtectedPage>
              <JobDetailPage />
            </ProtectedPage>
          }
        />

        <Route
          path="/temps"
          element={
            <ProtectedPage>
              <TempsPage />
            </ProtectedPage>
          }
        />

        <Route
          path="/temps/:id"
          element={
            <ProtectedPage>
              <TempDetailPage />
            </ProtectedPage>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}