import React from "react";
import Link from "next/link";

export function DashboardBlockedBanner() {
  return (
    <div className="alert alert-warning border-0 shadow-sm mb-4 rounded-4 p-4 d-flex align-items-center">
      <div className="me-3 bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div>
        <h5 className="fw-bold mb-1">Assinatura Expirada</h5>
        <p className="mb-0 text-muted">
          Seu período de avaliação terminou. Finalize o pagamento para continuar.
        </p>
        <Link href="/billing" className="btn btn-warning btn-sm mt-2 fw-bold px-3">
          Regularizar agora
        </Link>
      </div>
    </div>
  );
}
