import React, { createContext, useContext, ReactNode } from "react";
import { useGetCurrentUser, getGetCurrentUserQueryKey, useLogoutUser, useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import type { User, LoginRequest, RegisterRequest } from "@workspace/api-client-react/src/generated/api.schemas";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
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

  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync({ data });
    await refetch();
  };

  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync({ data });
    await refetch();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
