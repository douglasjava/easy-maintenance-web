"use client";

import Sidebar from "./Sidebar";
import PrivateTopBar from "./layout/private/PrivateTopBar";
import UserTopBar from "./layout/app/UserTopBar";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AccessContextProvider } from "@/providers/AccessContextProvider";
import { ReadOnlyBanner } from "@/components/access/ReadOnlyBanner";
import { useAuth } from "@/contexts/AuthContext";

const ChatWidget = dynamic(() => import("@/ia/ChatWidget"), { ssr: false });

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { token, loading } = useAuth();
  const [canRenderPrivate, setCanRenderPrivate] = useState(true);
  // Pages that render full-screen without sidebar/topbar and don't require an auth check.
  // These match PUBLIC_PATHS that were previously guarded by middleware.
  const isAuth = pathname?.endsWith("/login") ||
                 pathname?.endsWith("/auth/change-password") ||
                 pathname?.endsWith("/forgot-password") ||
                 pathname?.endsWith("/reset-password") ||
                 pathname?.endsWith("/select-organization") ||
                 pathname?.includes("/landing") ||
                 pathname?.startsWith("/checkout") ||
                 pathname?.startsWith("/onboarding") ||
                 pathname?.startsWith("/indicador");
  const isPrivate = pathname?.startsWith("/private");

  useEffect(() => {
    // Admin area: adminToken lives in localStorage (inaccessible at the Edge).
    // This is the authoritative guard for /private/*.
    if (isPrivate && pathname !== "/private/login") {
      setCanRenderPrivate(false);
      const adminToken = typeof window !== "undefined" ? window.localStorage.getItem("adminToken") : null;
      if (!adminToken) {
        if (typeof window !== "undefined") {
          window.location.href = "/private/login";
        }
      } else {
        setCanRenderPrivate(true);
      }
    } else {
      setCanRenderPrivate(true);
    }
  }, [isPrivate, pathname]);

  if (isAuth) {
    // Full-screen pages (login, onboarding, etc.) — no nav, no auth gate.
    return <>{children}</>;
  }

  // Prevent hydration flash while admin credentials are being verified.
  if (isPrivate && pathname !== "/private/login" && !canRenderPrivate) {
    return null;
  }

  // Client-side auth guard for all regular protected routes.
  // Middleware cannot enforce this because the accessToken HttpOnly cookie lives on
  // the API domain and is never forwarded to the Next.js server.
  if (!isPrivate) {
    if (loading) return null;
    if (!token) {
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
      return null;
    }
  }

  return (
    <AccessContextProvider>
      <div>
        {isPrivate ? <PrivateTopBar /> : <UserTopBar />}
        <Sidebar />
        <ReadOnlyBanner />
        <main className="container my-3">{children}</main>
        <ChatWidget />
      </div>
    </AccessContextProvider>
  );
}
