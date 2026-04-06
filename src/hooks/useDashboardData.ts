import { useState, useEffect, useMemo } from "react";
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

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(
    () => ({ daysAhead, nearDueThresholdDays, limitAttention }),
    [daysAhead, nearDueThresholdDays, limitAttention]
  );

  const fetchDashboard = async () => {
    if (!currentOrganizationCode) {
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await api.get<DashboardResponse>("/dashboard", { params });
      setData(res.data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Falha ao carregar dashboard."
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const canFetch =
      !!token &&
      !authLoading &&
      !accessLoading &&
      !!currentOrganizationCode &&
      !!permissions?.canReadDashboard;

    if (canFetch) {
      fetchDashboard();
    } else {
      // Se parou de ter permissão ou trocou de org para uma sem permissão, limpa os dados
      if (!authLoading && !accessLoading && (!currentOrganizationCode || !permissions?.canReadDashboard)) {
          setData(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading, accessLoading, currentOrganizationCode, permissions?.canReadDashboard, params]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboard,
    // Auxiliares de estado para facilitar na Page
    hasNoOrganization: !authLoading && !accessLoading && !currentOrganizationCode,
    isAccessDenied: !authLoading && !accessLoading && !!currentOrganizationCode && permissions && !permissions.canReadDashboard,
  };
}
