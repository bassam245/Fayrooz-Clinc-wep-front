import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetCurrentUser, useLogin, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCurrentUserQueryKey } from "@workspace/api-client-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetCurrentUser({ query: { retry: false, queryKey: getGetCurrentUserQueryKey() } });
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ data: { email, password } });
    await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user: (user as User) ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
