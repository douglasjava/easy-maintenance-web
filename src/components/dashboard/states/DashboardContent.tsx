import React from "react";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { AttentionCard } from "@/components/dashboard/AttentionCard";
import { BreakdownCard } from "@/components/dashboard/BreakdownCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardResponse } from "@/hooks/useDashboardData";

interface DashboardContentProps {
  data: DashboardResponse;
}

export function DashboardContent({ data }: DashboardContentProps) {
  return (
    <>
      <KPIGrid kpis={data.kpis} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <AttentionCard items={data.attentionNow} />
        </div>
        <div className="col-12 col-lg-5">
          <BreakdownCard
            statusBreakdown={data.breakdowns.byStatus}
            categoryBreakdown={data.breakdowns.byCategory}
            itemTypeBreakdown={data.breakdowns.byItemType}
          />
        </div>
      </div>

      <QuickActions />
    </>
  );
}
