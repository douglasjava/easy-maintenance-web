"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import {
  BarChart2,
  Building2,
  Wrench,
  FileText,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type GlobalKpis = {
  totalItems: number;
  totalOverdue: number;
  totalDueSoon: number;
  totalMaintenancesThisMonth: number;
};

type OrgKpi = {
  orgCode: string;
  orgName: string;
  itemsTotal: number;
  overdueCount: number;
  dueSoonCount: number;
  maintenancesThisMonth: number;
};

type OverviewData = {
  global: GlobalKpis;
  organizations: OrgKpi[];
};

type Tab = "overview" | "maintenances";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/me/reports/overview");
      setOverview(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 56, height: 56 }}
        >
          <BarChart2 size={28} />
        </div>
        <div>
          <h2 className="mb-0 fw-bold">Relatórios</h2>
          <p className="text-muted mb-0 small">
            Visão consolidada de todas as suas empresas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-1 ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Building2 size={16} />
            Visão Geral
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-1 ${activeTab === "maintenances" ? "active" : ""}`}
            onClick={() => setActiveTab("maintenances")}
          >
            <Wrench size={16} />
            Manutenções
          </button>
        </li>
      </ul>

      {activeTab === "overview" && (
        <OverviewSection
          loading={loading}
          error={error}
          data={overview}
          onRetry={fetchOverview}
        />
      )}
      {activeTab === "maintenances" && <MaintenancesPlaceholder />}
    </div>
  );
}

// ── Overview Section ──────────────────────────────────────────────────────────

function OverviewSection({
  loading,
  error,
  data,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  data: OverviewData | null;
  onRetry: () => void;
}) {
  if (loading) return <OverviewSkeleton />;

  if (error) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body text-center py-5">
          <AlertTriangle size={40} className="mb-3 text-warning" />
          <p className="text-muted mb-3">Erro ao carregar dados. Tente novamente.</p>
          <button className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2" onClick={onRetry}>
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* Global KPIs */}
      <div className="row g-3 mb-4">
        <GlobalKpiCard label="Total de Itens" value={data.global.totalItems} color="#2563eb" icon="📦" />
        <GlobalKpiCard
          label="Em Atraso"
          value={data.global.totalOverdue}
          color="#ef4444"
          icon="⚠️"
          highlight={data.global.totalOverdue > 0}
        />
        <GlobalKpiCard label="Vencem em Breve" value={data.global.totalDueSoon} color="#f59e0b" icon="🕐" />
        <GlobalKpiCard label="Manutenções este Mês" value={data.global.totalMaintenancesThisMonth} color="#10b981" icon="✅" />
      </div>

      {/* Por Empresa */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
          <BarChart2 size={18} className="text-primary" />
          <span className="fw-semibold">Por Empresa</span>
          <span className="badge bg-light text-secondary ms-auto" style={{ fontSize: "0.72rem" }}>
            {data.organizations.length} empresa{data.organizations.length !== 1 ? "s" : ""}
          </span>
        </div>

        {data.organizations.length === 0 ? (
          <div className="card-body text-center py-5 text-muted">
            <Building2 size={40} className="mb-3 opacity-25" />
            <p className="mb-0">Nenhuma empresa encontrada</p>
          </div>
        ) : (
          <div className="card-body p-3 p-md-4">
            <div className="row g-3">
              {data.organizations.map((org) => (
                <OrgKpiCard key={org.orgCode} org={org} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Global KPI Card ───────────────────────────────────────────────────────────

function GlobalKpiCard({
  label,
  value,
  color,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card border-0 shadow-sm h-100 overflow-hidden"
        style={{
          borderRadius: 12,
          backgroundColor: highlight ? "#fff5f5" : "#fff",
        }}
      >
        <div style={{ height: 3, backgroundColor: color }} />
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-start justify-content-between gap-2">
            <div className="min-w-0">
              <div
                className="text-muted text-uppercase fw-semibold mb-2"
                style={{ fontSize: "0.68rem", letterSpacing: "0.07em", lineHeight: 1.2 }}
              >
                {label}
              </div>
              <div
                className="fw-bold lh-1"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color }}
              >
                {value.toLocaleString("pt-BR")}
              </div>
            </div>
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, backgroundColor: color + "18", fontSize: "1rem" }}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Org KPI Card ──────────────────────────────────────────────────────────────

function OrgKpiCard({ org }: { org: OrgKpi }) {
  const hasOverdue = org.overdueCount > 0;

  return (
    <div className="col-12 col-sm-6 col-xl-4">
      <div
        className="card border-0 shadow-sm h-100"
        style={{
          borderRadius: 12,
          borderLeft: hasOverdue ? "3px solid #ef4444" : "3px solid #e5e7eb",
        }}
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
              style={{ width: 32, height: 32, fontSize: "0.8rem" }}
            >
              {org.orgName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="fw-semibold text-truncate" style={{ fontSize: "0.9rem" }}>
                {org.orgName}
              </div>
              <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                {org.orgCode}
              </div>
            </div>
          </div>

          <div className="row g-2">
            <OrgStat label="Itens" value={org.itemsTotal} color="#2563eb" />
            <OrgStat label="Atrasados" value={org.overdueCount} color={hasOverdue ? "#ef4444" : "#6b7280"} bold={hasOverdue} />
            <OrgStat label="Vencendo" value={org.dueSoonCount} color={org.dueSoonCount > 0 ? "#f59e0b" : "#6b7280"} />
            <OrgStat label="Este mês" value={org.maintenancesThisMonth} color="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgStat({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
}) {
  return (
    <div className="col-6">
      <div className="p-2 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="text-muted mb-0" style={{ fontSize: "0.65rem", lineHeight: 1.2 }}>
          {label}
        </div>
        <div
          className={bold ? "fw-bold" : "fw-semibold"}
          style={{ fontSize: "1.1rem", color }}
        >
          {value.toLocaleString("pt-BR")}
        </div>
      </div>
    </div>
  );
}

// ── Skeletons & Placeholders ──────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div>
      <div className="row g-3 mb-4 placeholder-glow">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3">
              <span className="placeholder col-8 mb-2 rounded" style={{ height: 12 }} />
              <span className="placeholder col-4 rounded" style={{ height: 32 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="card border-0 shadow-sm rounded-4 placeholder-glow">
        <div className="card-header bg-white border-bottom py-3">
          <span className="placeholder col-3 rounded" style={{ height: 18 }} />
        </div>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-xl-4">
                <div className="card border-0 shadow-sm p-3" style={{ borderRadius: 12 }}>
                  <span className="placeholder col-6 rounded mb-3" style={{ height: 14 }} />
                  <div className="row g-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="col-6">
                        <span className="placeholder col-12 rounded" style={{ height: 44 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenancesPlaceholder() {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
        <FileText size={18} className="text-primary" />
        <span className="fw-semibold">Manutenções Cross-Org</span>
      </div>
      <div className="card-body text-center py-5 text-muted">
        <Wrench size={40} className="mb-3 opacity-25" />
        <p className="mb-0">Filtros e listagem de manutenções em breve</p>
      </div>
    </div>
  );
}
