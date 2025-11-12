"use client";

export default function TopBar() {
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
          {/* espaço para ações futuras */}
        </div>
      </div>
    </nav>
  );
}
