"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import { useAccessContext } from "@/providers/AccessContextProvider";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardLoadingState } from "@/components/dashboard/states/DashboardLoadingState";
import { DashboardNoOrganizationState } from "@/components/dashboard/states/DashboardNoOrganizationState";
import { DashboardAccessDeniedState } from "@/components/dashboard/states/DashboardAccessDeniedState";
import { DashboardErrorState } from "@/components/dashboard/states/DashboardErrorState";
import { DashboardBlockedBanner } from "@/components/dashboard/states/DashboardBlockedBanner";
import { DashboardContent } from "@/components/dashboard/states/DashboardContent";
import { TrialBanner } from "@/components/dashboard/TrialBanner";

export default function DashboardPage() {
  const { isBlocked, token, loading: authLoading } = useAuth();
  const { isLoading: accessLoading } = useCurrentOrganizationAccess();
  const { accessContext } = useAccessContext();
  const accountAccess = accessContext?.accountAccess;
  const isTrial = accountAccess?.subscriptionStatus === "TRIAL";

  // parâmetros
  const [daysAhead] = useState(30);
  const [nearDueThresholdDays] = useState(7);
  const [limitAttention] = useState(5);

  const {
    data,
    isLoading: dataLoading,
    error,
    hasNoOrganization,
    isAccessDenied,
  } = useDashboardData({
    daysAhead,
    nearDueThresholdDays,
    limitAttention,
  });

  // 1. Carregando autenticação ou acesso básico
  if (authLoading || accessLoading) {
    return <DashboardLoadingState />;
  }

  // 2. Sem token
  if (!token) {
    return <p className="p-3">Redirecionando…</p>;
  }

  // 3. Sem organização selecionada
  if (hasNoOrganization) {
    return (
      <PrivateRoute>
        <section
          style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
          className="pb-5"
        >
          <div className="container">
            <DashboardHeader
              title="Dashboard"
              subtitle="Visão geral de manutenções, prazos e conformidade"
            />
            <DashboardNoOrganizationState />
          </div>
        </section>
      </PrivateRoute>
    );
  }

  // 4. Sem permissão para dashboard
  if (isAccessDenied) {
    return <DashboardAccessDeniedState />;
  }

  // 5. Renderização Principal (Com permissão)
  return (
    <PrivateRoute>
      <section
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
        className="pb-5"
      >
        <div className="container">
          <DashboardHeader
            title="Dashboard"
            subtitle="Visão geral de manutenções, prazos e conformidade"
          />

          {isBlocked && <DashboardBlockedBanner />}

          {!isBlocked && isTrial && (
            <TrialBanner trialExpiresAt={accountAccess?.trialExpiresAt} />
          )}

          {dataLoading && !data && <DashboardLoadingState />}

          {error && <DashboardErrorState message={error} />}

          {data && <DashboardContent data={data} />}
        </div>
      </section>
    </PrivateRoute>
  );
}
