"use client";

import { useRouter } from "next/navigation";

export default function TopBar() {
  const router = useRouter();

  function handleLogout() {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("organizationCode");
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("tokenType");
      }
    } catch {}
    // Redireciona para login
    router.replace("/login");
  }

  return (
    <nav className="navbar navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#appSidebar"
          aria-controls="appSidebar"
          aria-label="Abrir menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <span className="navbar-brand ms-2">Painel</span>
        <div className="d-flex align-items-center">
          <button className="btn btn-sm btn-outline-light" onClick={handleLogout} title="Sair">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
