import React, { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/endpoints";
import { clearToken, getToken, setToken } from "./tokenStore";
import type { LoginRequest } from "../api/types";

type AuthState = {
  token: string | null;
  isAuthed: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());

  const value = useMemo<AuthState>(() => {
    return {
      token,
      isAuthed: !!token,
      login: async (req) => {
        const res = await api.login(req);
        setToken(res.token);
        setTokenState(res.token);
      },
      logout: async () => {
        try {
          await api.logout();
        } finally {
          clearToken();
          setTokenState(null);
        }
      },
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
}
