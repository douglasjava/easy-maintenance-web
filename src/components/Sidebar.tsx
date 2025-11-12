"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Sidebar() {
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
          <Link href="/" className="nav-link" data-bs-dismiss="offcanvas">Início</Link>
          <Link href="/items" className="nav-link" data-bs-dismiss="offcanvas">Itens</Link>
          <Link href="/items/new" className="nav-link" data-bs-dismiss="offcanvas">Novo Item</Link>
          <Link href="/maintenances/new" className="nav-link" data-bs-dismiss="offcanvas">Registrar Manutenção</Link>
        </nav>
        <div className="mt-auto text-muted small">v0 • MVP</div>
      </div>
    </div>
  );
}
