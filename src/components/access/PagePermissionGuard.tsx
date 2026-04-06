"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccessContext } from "@/providers/AccessContextProvider";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface PagePermissionGuardProps {
  allowed: boolean | undefined;
  children: React.ReactNode;
  redirectHref?: string;
  loadingMessage?: string;
  showFallback?: boolean;
}

export function PagePermissionGuard({
  allowed,
  children,
  redirectHref = "/",
  loadingMessage = "Verificando permissões...",
  showFallback = false,
}: PagePermissionGuardProps) {
  const router = useRouter();
  const { isLoading } = useAccessContext();

  const canRender = !isLoading && allowed === true;
  const isForbidden = !isLoading && allowed === false;

  useEffect(() => {
    if (isForbidden && !showFallback) {
      toast.error("Você não tem permissão para acessar esta página.");
      router.replace(redirectHref);
    }
  }, [isForbidden, showFallback, router, redirectHref]);

  // Enquanto carrega, mostra loading e NUNCA renderiza children
  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{loadingMessage}</span>
        </div>
        <p className="mt-3 text-muted">{loadingMessage}</p>
      </div>
    );
  }

  // Se negado e showFallback for true, mostra tela amigável (sem children)
  if (isForbidden && showFallback) {
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
                  <Link href={redirectHref} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm">
                    Voltar para Início
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se negado e SEM fallback, o useEffect acima fará o redirect. 
  // Enquanto isso, retornamos null para não mostrar nada.
  if (isForbidden) {
    return null;
  }

  // Só libera children se canRender for explicitamente true
  if (canRender) {
    return <>{children}</>;
  }

  // Fallback de segurança (ex: allowed é undefined e parou de carregar)
  return null;
}
