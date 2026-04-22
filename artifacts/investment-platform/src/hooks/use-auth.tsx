import React, { createContext, useContext, ReactNode } from "react";
import { useGetCurrentUser, getGetCurrentUserQueryKey, useLogoutUser, useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import type { User, LoginRequest, RegisterRequest } from "@workspace/api-client-react/src/generated/api.schemas";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export interface ExtendedUser extends User {
  mustSetPin?: boolean;
  hasPin?: boolean;
  pinVerified?: boolean;
  isFrozen?: boolean;
  frozenReason?: string | null;
}

interface AuthContextType {
  user: ExtendedUser | undefined;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserFromData: (user: ExtendedUser) => void;
}

const AUTH_TOKEN_KEY = "vault_auth_token";

export function saveAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

  const { data: user, isLoading, refetch } = useGetCurrentUser({
    query: {
      retry: false,
      queryKey: getGetCurrentUserQueryKey(),
    }
  });

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();
  const logoutMutation = useLogoutUser();

  const setUserFromData = (userData: ExtendedUser) => {
    queryClient.setQueryData(getGetCurrentUserQueryKey(), userData);
  };

  const login = async (data: LoginRequest) => {
    const result = await loginMutation.mutateAsync({ data }) as any;
    if (result?.token) saveAuthToken(result.token);
    if (result?.user) {
      queryClient.setQueryData(getGetCurrentUserQueryKey(), result.user);
    } else {
      await refetch();
    }
  };

  const register = async (data: RegisterRequest) => {
    const result = await registerMutation.mutateAsync({ data }) as any;
    if (result?.token) saveAuthToken(result.token);
    if (result?.user) {
      queryClient.setQueryData(getGetCurrentUserQueryKey(), result.user);
    } else {
      await refetch();
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    clearAuthToken();
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    setLocation("/login");
  };

  const refreshUser = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider value={{ user: user as ExtendedUser | undefined, isLoading, login, register, logout, refreshUser, setUserFromData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
