"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/ia/ChatWidget"), { ssr: false });

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Com basePath habilitado, o pathname incluirá o prefixo. Usar endsWith para detectar /login.
  const isAuth = pathname?.endsWith("/login"); // não exibir topbar/sidebar na tela de login

  if (isAuth) {
    // renderiza a página de login em tela cheia, sem topo/menu/container
    return <>{children}</>;
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
