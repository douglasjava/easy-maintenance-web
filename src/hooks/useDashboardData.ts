import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import { useAccessContext } from "@/providers/AccessContextProvider";

export interface DashboardKpis {
  itemsTotal: number;
  overdueCount: number;
  nearDueCount: number;
  dueSoonCount: number;
  maintenancesThisMonth: number;
  avgDaysToResolve: number;
  complianceScore: number;
}

export interface AttentionItem {
  itemId: number;
  itemType: string;
  itemCategory: string;
  status: string;
  nextDueAt: string;
  daysLate: number;
  riskLevel: string;
}

export interface BreakdownByItemType {
  itemType: string;
  count: number;
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  attentionNow: AttentionItem[];
  calendar: any[];
  breakdowns: {
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byItemType: BreakdownByItemType[];
  };
  quickActions: { type: string; label: string; [k: string]: any }[];
}

interface UseDashboardDataProps {
  daysAhead: number;
  nearDueThresholdDays: number;
  limitAttention: number;
}

export function useDashboardData({
  daysAhead,
  nearDueThresholdDays,
  limitAttention,
}: UseDashboardDataProps) {
  const { token, loading: authLoading } = useAuth();
  const { permissions, isLoading: accessLoading } = useCurrentOrganizationAccess();
  const { currentOrganizationCode } = useAccessContext();

  const params = useMemo(
    () => ({ daysAhead, nearDueThresholdDays, limitAttention }),
    [daysAhead, nearDueThresholdDays, limitAttention]
  );

  // All conditions must be true before a fetch is allowed.
  // queryKey includes currentOrganizationCode so each org gets its own cache entry —
  // switching orgs never serves data from the previous org.
  const canFetch =
    !!token &&
    !authLoading &&
    !accessLoading &&
    !!currentOrganizationCode &&
    !!permissions?.canReadDashboard;

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", currentOrganizationCode, params],
    queryFn: async () => {
      const res = await api.get<DashboardResponse>("/dashboard", { params });
      return res.data;
    },
    enabled: canFetch,
    staleTime: 1000 * 60 * 2,
  });

  // Map the Error object to a string to preserve the existing interface.
  const error: string | null = queryError
    ? (queryError as any)?.response?.data?.message ||
      queryError.message ||
      "Falha ao carregar dashboard."
    : null;

  return {
    data: data ?? null,
    isLoading,
    error,
    refresh: refetch,
    // Auxiliary state helpers for the page component
    hasNoOrganization: !authLoading && !accessLoading && !currentOrganizationCode,
    isAccessDenied:
      !authLoading &&
      !accessLoading &&
      !!currentOrganizationCode &&
      permissions != null &&
      !permissions.canReadDashboard,
  };
}
