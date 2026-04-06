"use client";

import { useAccessContext } from "@/providers/AccessContextProvider";
import { useMemo, useEffect } from "react";
import { OrganizationAccess } from "@/types/access-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useCurrentOrganizationAccess() {
  const { accessContext, currentOrganizationCode, isLoading } = useAccessContext();

  const currentOrganization = useMemo(() => {
    if (!accessContext || !currentOrganizationCode) return null;
    return accessContext.organizationsAccess.find(
      (org) => org.organizationCode === currentOrganizationCode
    ) || null;
  }, [accessContext, currentOrganizationCode]);

  return {
    organization: currentOrganization,
    permissions: currentOrganization?.permissions || null,
    features: currentOrganization?.features || null,
    accessMode: currentOrganization?.accessMode || "READ_ONLY",
    message: currentOrganization?.message || "",
    isLoading
  };
}

export function usePermissionGuard(allowed: boolean | undefined, redirectHref: string = "/") {
  const router = useRouter();
  const { isLoading } = useAccessContext();

  const isAllowed = allowed === true;
  const isForbidden = !isLoading && allowed === false;

  useEffect(() => {
    if (isForbidden) {
      toast.error("Você não tem permissão para acessar esta página.");
      router.push(redirectHref);
    }
  }, [isForbidden, router, redirectHref]);

  return { 
    isGuarding: isLoading || isForbidden,
    isLoading,
    isForbidden
  };
}

export const accessHelpers = {
  isAccountReadOnly: (accessContext: any) => accessContext?.accountAccess?.accessMode === "READ_ONLY",
  isOrganizationReadOnly: (orgAccess: OrganizationAccess | null) => orgAccess?.accessMode === "READ_ONLY",
  canWriteOrganization: (orgAccess: OrganizationAccess | null) => orgAccess?.accessMode === "FULL_ACCESS" || orgAccess?.accessMode === "READ_WRITE",
  canUseAi: (orgAccess: OrganizationAccess | null) => !!orgAccess?.features?.aiEnabled,
  canCreateItem: (orgAccess: OrganizationAccess | null) => !!orgAccess?.permissions?.canCreateItem,
  canEditItem: (orgAccess: OrganizationAccess | null) => !!orgAccess?.permissions?.canEditItem,
  canDeleteItem: (orgAccess: OrganizationAccess | null) => !!orgAccess?.permissions?.canDeleteItem,
  canRegisterMaintenance: (orgAccess: OrganizationAccess | null) => !!orgAccess?.permissions?.canRegisterMaintenance,
  // Adicionar outros conforme necessário
};
