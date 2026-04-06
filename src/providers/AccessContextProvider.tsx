"use client";

import React, { createContext, useContext, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { accessContextService } from "@/services/client/access-context-service";
import { AccessContextResponse, OrganizationAccess } from "@/types/access-context";
import { useAuth } from "@/contexts/AuthContext";

interface AccessContextType {
  accessContext: AccessContextResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  refreshAccessContext: () => void;
  currentOrganizationCode: string | null;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export function AccessContextProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Helper para obter o código da organização atual
  const getStoredOrganizationCode = useCallback(() => {
    if (typeof window === "undefined") return null;
    return (
      window.localStorage.getItem("organizationCode") ||
      window.sessionStorage.getItem("organizationCode")
    );
  }, []);

  const [currentOrganizationCode, setCurrentOrganizationCode] = React.useState<string | null>(getStoredOrganizationCode);

  // Sincroniza o código da organização ao mudar de rota ou quando houver interação
  useEffect(() => {
    setCurrentOrganizationCode(getStoredOrganizationCode());
  }, [pathname, getStoredOrganizationCode]);

  // Ignorar área administrativa global
  const isAdminArea = pathname?.startsWith("/private");

  const { data: accessContext, isLoading, isError, refetch } = useQuery({
    queryKey: ["access-context", currentOrganizationCode],
    queryFn: () => accessContextService.getAccessContext(currentOrganizationCode || undefined),
    enabled: !!token && !isAdminArea,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const refreshAccessContext = useCallback(() => {
    // Ressincroniza o código da organização antes de invalidar
    setCurrentOrganizationCode(getStoredOrganizationCode());
    queryClient.invalidateQueries({ queryKey: ["access-context"] });
  }, [queryClient, getStoredOrganizationCode]);

  const value = useMemo(() => ({
    accessContext,
    isLoading,
    isError,
    refreshAccessContext,
    currentOrganizationCode
  }), [accessContext, isLoading, isError, refreshAccessContext, currentOrganizationCode]);

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccessContext() {
  const context = useContext(AccessContext);
  if (context === undefined) {
    // Se usado fora do provider (ex: na área admin), retorna valores seguros/vazios
    return {
      accessContext: undefined,
      isLoading: false,
      isError: false,
      refreshAccessContext: () => {},
      currentOrganizationCode: null
    };
  }
  return context;
}
