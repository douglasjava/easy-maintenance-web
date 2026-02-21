"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatWidget = dynamic(() => import("@/ia/ChatWidget"), { ssr: false });

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [canRenderPrivate, setCanRenderPrivate] = useState(true);
  // Com basePath habilitado, o pathname incluirá o prefixo. Usar endsWith para detectar /login.
  const isAuth = pathname?.endsWith("/login") || 
                 pathname?.endsWith("/auth/change-password") ||
                 pathname?.endsWith("/forgot-password") ||
                 pathname?.endsWith("/reset-password") ||
                 pathname?.endsWith("/select-organization") ||
                 pathname?.includes("/landing"); // não exibir topbar/sidebar na tela de login, troca de senha, recuperação ou seleção de org ou landing page
  const isPrivate = pathname?.startsWith("/private");

  useEffect(() => {
    // Validação de token da área privativa somente no cliente e após montar
    if (isPrivate && pathname !== "/private/login") {
      setCanRenderPrivate(false);
      const token = typeof window !== "undefined" ? window.localStorage.getItem("adminToken") : null;
      if (!token) {
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
    // renderiza a página de login em tela cheia, sem topo/menu/container
    return <>{children}</>;
  }

  // Enquanto valida credenciais da área privada, evita hidratação divergente
  if (isPrivate && pathname !== "/private/login" && !canRenderPrivate) {
    return null;
  }

  return (
    <div>
      <TopBar />
      <Sidebar />
      <main className="container my-3">{children}</main>
      <ChatWidget />
    </div>
  );
}
