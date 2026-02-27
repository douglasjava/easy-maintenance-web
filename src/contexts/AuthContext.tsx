"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export type SubscriptionStatus = "ACTIVE" | "TRIAL_EXPIRED" | "UNKNOWN";

interface AuthContextType {
  token: string | null;
  subscriptionStatus: SubscriptionStatus;
  isBlocked: boolean;
  login: (data: any, remember: boolean) => Promise<void>;
  logout: () => void;
  checkSubscription: () => Promise<SubscriptionStatus>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("UNKNOWN");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isBlocked = subscriptionStatus === "TRIAL_EXPIRED";

  const logout = useCallback(() => {
    setToken(null);
    setSubscriptionStatus("UNKNOWN");
    if (typeof window !== "undefined") {
      const storages = [window.localStorage, window.sessionStorage];
      storages.forEach(storage => {
        storage.removeItem("accessToken");
        storage.removeItem("tokenType");
        storage.removeItem("userId");
        storage.removeItem("userName");
        storage.removeItem("organizationCode");
        storage.removeItem("organizationName");
      });
    }
    router.push("/login");
  }, [router]);

  const checkSubscription = useCallback(async (): Promise<SubscriptionStatus> => {
    try {
      await api.get("/user/subscription/guard");
      setSubscriptionStatus("ACTIVE");
      return "ACTIVE";
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setSubscriptionStatus("TRIAL_EXPIRED");
        return "TRIAL_EXPIRED";
      }
      // Outros erros não alteram o status de bloqueio por enquanto, 
      // mas poderíamos tratar 401 aqui se o interceptor não o fizesse.
      return "UNKNOWN";
    }
  }, []);

  const login = useCallback(async (data: any, remember: boolean) => {
    if (typeof window !== "undefined") {
      const storage = remember ? window.localStorage : window.sessionStorage;
      
      if (data?.accessToken) {
        setToken(data.accessToken);
        storage.setItem("accessToken", String(data.accessToken));
      }
      if (data?.tokenType) storage.setItem("tokenType", String(data.tokenType));
      if (data?.id) storage.setItem("userId", String(data.id));
      if (data?.name) storage.setItem("userName", String(data.name));
      
      // Valida subscription IMEDIATAMENTE após login
      await checkSubscription();
    }
  }, [checkSubscription]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const storedToken = window.localStorage.getItem("accessToken") || window.sessionStorage.getItem("accessToken");
        if (storedToken) {
          setToken(storedToken);
          await checkSubscription();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [checkSubscription]);

  return (
    <AuthContext.Provider value={{ 
      token, 
      subscriptionStatus, 
      isBlocked, 
      login, 
      logout, 
      checkSubscription,
      loading 
    }}>
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
