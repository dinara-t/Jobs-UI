import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/endpoints";
import type { LoginRequest, Temp } from "../api/types";

type AuthState = {
  isAuthed: boolean;
  isReady: boolean;
  currentUser: Temp | null;
  refreshSession: () => Promise<void>;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Temp | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshSession = async () => {
    try {
      const profile = await api.getProfile();
      setCurrentUser(profile);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  const value = useMemo<AuthState>(() => {
    return {
      isAuthed: !!currentUser,
      isReady,
      currentUser,
      refreshSession,
      login: async (req) => {
        await api.login(req);
        const profile = await api.getProfile();
        setCurrentUser(profile);
        setIsReady(true);
      },
      logout: async () => {
        try {
          await api.logout();
        } finally {
          setCurrentUser(null);
          setIsReady(true);
        }
      },
    };
  }, [currentUser, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
}
