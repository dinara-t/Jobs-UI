import React, { createContext, useCallback, useContext, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/endpoints";
import type { LoginRequest, Temp } from "../api/types";
import { queryKeys } from "../query/queryKeys";

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
  const queryClient = useQueryClient();

  useEffect(() => {
    void api.initCsrf().catch(() => {
    });
  }, []);

  const profileQuery = useQuery<Temp>({
    queryKey: queryKeys.profile,
    queryFn: () => api.getProfile(),
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: (req: LoginRequest) => api.login(req),
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
  });

  const refreshSession = useCallback(async () => {
    await api.initCsrf().catch(() => {
    });
    await profileQuery.refetch();
  }, [profileQuery]);

  const login = useCallback(
    async (req: LoginRequest) => {
      await loginMutation.mutateAsync(req);
      await api.initCsrf();

      await queryClient.fetchQuery({
        queryKey: queryKeys.profile,
        queryFn: () => api.getProfile(),
        retry: false,
        staleTime: 0,
      });
    },
    [loginMutation, queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.setQueryData(queryKeys.profile, null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    }
  }, [logoutMutation, queryClient]);

  const currentUser = profileQuery.data ?? null;
  const isReady = !profileQuery.isPending;
  const isAuthed = !!currentUser;

  const value: AuthState = {
    isAuthed,
    isReady,
    currentUser,
    refreshSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}