"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/ia/ChatWidget"), { ssr: false });

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Com basePath habilitado, o pathname incluirá o prefixo. Usar endsWith para detectar /login.
  const isAuth = pathname?.endsWith("/login") || pathname?.endsWith("/auth/change-password"); // não exibir topbar/sidebar na tela de login ou troca de senha
  const isPrivate = pathname?.startsWith("/private");

  if (isAuth) {
    // renderiza a página de login em tela cheia, sem topo/menu/container
    return <>{children}</>;
  }

  // Se estiver na área privativa mas não tiver token, redireciona para login privativo
  if (isPrivate && pathname !== "/private/login") {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("adminToken");
      if (!token) {
        window.location.href = "/private/login";
        return null;
      }
    }
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
