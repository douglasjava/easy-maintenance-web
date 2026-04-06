import React from "react";
import Link from "next/link";

export function DashboardNoOrganizationState() {
  return (
    <div className="alert alert-info border-0 shadow-sm text-center py-5 rounded-4">
      <h5 className="fw-bold">Bem-vindo ao Easy Maintenance!</h5>
      <p className="mb-4 text-muted">
        Você ainda não selecionou ou não possui uma empresa vinculada.
      </p>
      <Link
        href="/organizations/new"
        className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
      >
        Cadastrar minha primeira empresa
      </Link>
    </div>
  );
}
