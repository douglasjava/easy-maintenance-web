"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  function handleNavigate(e: React.MouseEvent, href: string) {
    e.preventDefault();
    // Fecha o offcanvas programaticamente (alguns ambientes ignoram data-bs-dismiss em <Link>)
    try {
      const el = document.getElementById("appSidebar");
      // @ts-ignore - bootstrap é injetado globalmente pelo bundle
      const bs = (window as any).bootstrap;
      if (el && bs?.Offcanvas) {
        const instance = bs.Offcanvas.getInstance(el) || new bs.Offcanvas(el);
        instance?.hide();
      }
    } catch {}
    // Navega pelo Next Router
    router.push(href);
  }

  return (
    <div
      className="offcanvas offcanvas-start"
      tabIndex={-1}
      id="appSidebar"
      aria-labelledby="appSidebarLabel"
    >
      <div className="offcanvas-header">
        <div className="d-flex align-items-center gap-2" id="appSidebarLabel">
          <Logo />
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
      </div>
      <div className="offcanvas-body d-flex flex-column">
        <nav className="nav flex-column mb-3">
          <Link href="/" className="nav-link" onClick={(e) => handleNavigate(e, "/")} data-bs-dismiss="offcanvas">Início</Link>
          <Link href="/items" className="nav-link" onClick={(e) => handleNavigate(e, "/items")} data-bs-dismiss="offcanvas">Itens</Link>
          <Link href="/items/new" className="nav-link" onClick={(e) => handleNavigate(e, "/items/new")} data-bs-dismiss="offcanvas">Novo Item</Link>
          <Link href="/maintenances/new" className="nav-link" onClick={(e) => handleNavigate(e, "/maintenances/new")} data-bs-dismiss="offcanvas">Registrar Manutenção</Link>
          <div className="mt-2 border-top" />
          <Link href="/organizations/new" className="nav-link" onClick={(e) => handleNavigate(e, "/organizations/new")} data-bs-dismiss="offcanvas">Nova Organização</Link>
          <Link href="/users/new" className="nav-link" onClick={(e) => handleNavigate(e, "/users/new")} data-bs-dismiss="offcanvas">Cadastro de Usuário</Link>
        </nav>
        <div className="mt-auto text-muted small">v0 • MVP</div>
      </div>
    </div>
  );
}
