"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token, isBlocked, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push("/login");
      } else if (isBlocked && pathname !== "/billing" && pathname !== "/dashboard" && pathname !== "/") {
        // Redireciona para billing se estiver bloqueado e tentando acessar uma rota não permitida
        // Permitimos /dashboard e / (que geralmente é o dashboard) para mostrar o aviso
        router.push("/billing");
      }
    }
  }, [token, isBlocked, loading, router, pathname]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
