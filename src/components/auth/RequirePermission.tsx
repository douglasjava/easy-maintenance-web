"use client";

import React from "react";
import { usePermissionGuard } from "@/hooks/useAccessControl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

interface RequirePermissionProps {
  allowed: boolean | undefined;
  children: React.ReactNode;
  redirectHref?: string;
  showFallback?: boolean;
}

export function RequirePermission({
  allowed,
  children,
  redirectHref = "/",
  showFallback = true
}: RequirePermissionProps) {
  const pathname = usePathname();
  
  // Ignora proteção na área administrativa global
  const isAdminArea = pathname?.startsWith("/private");
  
  const { isGuarding, isForbidden, isLoading } = usePermissionGuard(
    isAdminArea ? true : allowed, 
    redirectHref
  );

  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "300px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando permissões...</span>
        </div>
        <p className="mt-3 text-muted">Verificando permissões...</p>
      </div>
    );
  }

  if (isForbidden) {
    if (!showFallback) return null;

    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-5 text-center">
                <div className="bg-danger-subtle text-danger p-4 rounded-circle d-inline-flex mb-4">
                  <ShieldAlert size={48} />
                </div>
                <h3 className="fw-bold mb-3">Acesso Não Permitido</h3>
                <p className="text-muted mb-4 fs-5">
                  Você não tem permissão para acessar esta funcionalidade no momento.
                  Se você acredita que isso é um erro, entre em contato com o administrador da sua conta.
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <Link href="/" className="btn btn-primary px-4 py-2 rounded-3 shadow-sm">
                    Voltar ao Dashboard
                  </Link>
                  <Link href="/organizations" className="btn btn-outline-secondary px-4 py-2 rounded-3">
                    Minhas Empresas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
