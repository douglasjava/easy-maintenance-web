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

const AUTH_FLAG = "isLoggedIn";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // "token" is used as an auth-presence flag by consumers (PrivateRoute, AccessContextProvider).
  // With HttpOnly cookies the real JWT is not accessible in JS; we use "cookie" as a sentinel.
  const [token, setToken] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("UNKNOWN");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isBlocked = subscriptionStatus === "TRIAL_EXPIRED";

  const clearLocalState = useCallback(() => {
    setToken(null);
    setSubscriptionStatus("UNKNOWN");
    if (typeof window !== "undefined") {
      const storages = [window.localStorage, window.sessionStorage];
      storages.forEach(storage => {
        storage.removeItem(AUTH_FLAG);
        storage.removeItem("userId");
        storage.removeItem("userName");
        storage.removeItem("organizationCode");
        storage.removeItem("organizationName");
      });
    }
  }, []);

  const logout = useCallback(() => {
    clearLocalState();
    // Clear the HttpOnly cookie server-side (best-effort)
    api.post("/auth/logout").catch(() => {});
    router.push("/login");
  }, [clearLocalState, router]);

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
      return "UNKNOWN";
    }
  }, []);

  const login = useCallback(async (data: any, remember: boolean) => {
    if (typeof window !== "undefined") {
      // Token is in the HttpOnly cookie set by the server — do NOT store it in JS storage.
      // Only persist non-sensitive identifiers needed for UX.
      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem(AUTH_FLAG, "1");
      if (data?.id) storage.setItem("userId", String(data.id));
      if (data?.name) storage.setItem("userName", String(data.name));

      // Reset trial banner dismiss so it shows again on each new login
      sessionStorage.removeItem("trialBannerDismissed");

      setToken("cookie");
      await checkSubscription();
    }
  }, [checkSubscription]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const hasFlag =
          window.localStorage.getItem(AUTH_FLAG) ||
          window.sessionStorage.getItem(AUTH_FLAG);

        if (hasFlag) {
          // Verify the HttpOnly cookie is still valid via a lightweight API call
          const status = await checkSubscription();
          if (status !== "UNKNOWN") {
            setToken("cookie");
          } else {
            // Cookie likely expired — clean up the stale flag
            clearLocalState();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [checkSubscription, clearLocalState]);

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
