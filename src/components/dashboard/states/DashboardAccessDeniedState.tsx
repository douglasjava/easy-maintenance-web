import React from "react";
import { PrivateRoute } from "@/components/PrivateRoute";

export function DashboardAccessDeniedState() {
  return (
    <PrivateRoute>
      <div className="container py-5">
        <div className="alert alert-info border-0 shadow-sm text-center py-5 rounded-4">
          <h5 className="fw-bold">Acesso Restrito ao Dashboard</h5>
          <p className="mb-0 text-muted">
            Seu plano ou permissão atual não permite visualizar o dashboard desta organização.
          </p>
        </div>
      </div>
    </PrivateRoute>
  );
}
