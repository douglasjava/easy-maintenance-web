"use client";

import React from "react";
import Link from "next/link";
import { useAccessContext } from "@/providers/AccessContextProvider";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";

export function ReadOnlyBanner() {
  const { accessContext } = useAccessContext();
  const { organization } = useCurrentOrganizationAccess();

  // Se a conta está em READ_ONLY, mostra o banner da conta
  if (accessContext?.accountAccess?.accessMode === "READ_ONLY") {
    const isTrialExpired = accessContext.accountAccess.subscriptionStatus === "TRIAL_EXPIRED";

    if (isTrialExpired) {
      return (
        <div className="alert alert-warning border-0 rounded-0 mb-3 shadow-sm d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-clock-history me-2"></i>
            <div>
              <strong>Trial encerrado:</strong> {accessContext.accountAccess.message}{" "}
              <Link href="/billing" className="alert-link fw-semibold">
                Assinar plano →
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="alert alert-warning border-0 rounded-0 mb-3 shadow-sm d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
          <strong>Acesso Restrito:</strong> {accessContext.accountAccess.message}
        </div>
      </div>
    );
  }

  // Se apenas a organização está em READ_ONLY, mostra o banner da organização
  if (organization?.accessMode === "READ_ONLY") {
    return (
      <div className="alert alert-info border-0 rounded-0 mb-3 shadow-sm d-flex align-items-center">
        <i className="bi bi-info-circle-fill me-2"></i>
        <div>
          <strong>Modo Leitura ({organization.organizationName}):</strong> {organization.message}
        </div>
      </div>
    );
  }

  return null;
}
