"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import { formatMoney, formatDate } from "@/lib/formatters";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import {
  BarChart2,
  Building2,
  Wrench,
  FileText,
  RefreshCw,
  AlertTriangle,
  Download,
  Filter,
  X,
  Package,
  Clock,
  CheckCircle2,
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

type MaintenanceRow = {
  id: number;
  itemId: number;
  itemType: string;
  orgCode: string;
  orgName: string;
  performedAt: string;
  type: string;
  performedBy: string | null;
  costCents: number | null;
  nextDueAt: string | null;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type MaintenanceFilters = {
  performedAtFrom: string;
  performedAtTo: string;
  type: string;
  itemType: string;
};

type Tab = "overview" | "maintenances";

// ── Maintenance type config ───────────────────────────────────────────────────

const MAINT_TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PREVENTIVA:  { label: "Preventiva",  bg: "#eff6ff", color: "#1d4ed8" },
  CORRETIVA:   { label: "Corretiva",   bg: "#fef2f2", color: "#b91c1c" },
  INSPECAO:    { label: "Inspeção",    bg: "#f0fdf4", color: "#15803d" },
  TESTE:       { label: "Teste",       bg: "#fdf4ff", color: "#7e22ce" },
  EMERGENCIAL: { label: "Emergencial", bg: "#fff7ed", color: "#c2410c" },
};

function TypeBadge({ type }: { type: string }) {
  const cfg = MAINT_TYPE_CONFIG[type] ?? { label: type, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

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

      {/* Tabs — segmented control (sempre horizontal) */}
      <div
        className="d-inline-flex rounded-3 mb-4 p-1"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        {(
          [
            { id: "overview" as Tab, label: "Visão Geral", Icon: Building2 },
            { id: "maintenances" as Tab, label: "Manutenções", Icon: Wrench },
          ]
        ).map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="d-flex align-items-center gap-2"
              style={{
                border: "none",
                borderRadius: 8,
                padding: "7px 20px",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.875rem",
                color: isActive ? "#111827" : "#6b7280",
                backgroundColor: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <OverviewSection
          loading={loading}
          error={error}
          data={overview}
          onRetry={fetchOverview}
        />
      )}
      {activeTab === "maintenances" && <MaintenancesSection />}
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
          <button
            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
            onClick={onRetry}
          >
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
        <GlobalKpiCard label="Total de Itens" value={data.global.totalItems} color="#2563eb" icon={<Package size={18} />} />
        <GlobalKpiCard
          label="Em Atraso"
          value={data.global.totalOverdue}
          color="#ef4444"
          icon={<AlertTriangle size={18} />}
          highlight={data.global.totalOverdue > 0}
        />
        <GlobalKpiCard label="Vencem em Breve" value={data.global.totalDueSoon} color="#f59e0b" icon={<Clock size={18} />} />
        <GlobalKpiCard
          label="Manutenções este Mês"
          value={data.global.totalMaintenancesThisMonth}
          color="#10b981"
          icon={<CheckCircle2 size={18} />}
        />
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
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card border-0 shadow-sm h-100 overflow-hidden"
        style={{ borderRadius: 12, backgroundColor: highlight ? "#fff5f5" : "#fff" }}
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
              <div className="fw-bold lh-1" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color }}>
                {value.toLocaleString("pt-BR")}
              </div>
            </div>
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, backgroundColor: color + "18", color }}
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

function OrgStat({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <div className="col-6">
      <div className="p-2 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="text-muted mb-0" style={{ fontSize: "0.65rem", lineHeight: 1.2 }}>
          {label}
        </div>
        <div className={bold ? "fw-bold" : "fw-semibold"} style={{ fontSize: "1.1rem", color }}>
          {value.toLocaleString("pt-BR")}
        </div>
      </div>
    </div>
  );
}

// ── Maintenances Section ──────────────────────────────────────────────────────

function MaintenancesSection() {
  const EMPTY_FILTERS: MaintenanceFilters = {
    performedAtFrom: "",
    performedAtTo: "",
    type: "",
    itemType: "",
  };

  const [draft, setDraft] = useState<MaintenanceFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<MaintenanceFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchMaintenances = useCallback(async (filters: MaintenanceFilters, pg: number) => {
    setFetching(true);
    setFetchError(false);
    try {
      const params: Record<string, any> = { page: pg, size, sort: "performedAt,desc" };
      if (filters.performedAtFrom) params.performedAtFrom = filters.performedAtFrom;
      if (filters.performedAtTo) params.performedAtTo = filters.performedAtTo;
      if (filters.type) params.type = filters.type;
      if (filters.itemType) params.itemType = filters.itemType;
      const { data } = await api.get("/me/reports/maintenances", { params });
      const page: PageResponse<MaintenanceRow> = data;
      setRows(page.content);
      setTotalPages(page.totalPages);
      setTotalElements(page.totalElements);
    } catch {
      setFetchError(true);
    } finally {
      setFetching(false);
    }
  }, [size]);

  useEffect(() => {
    fetchMaintenances(applied, page);
  }, [applied, page, fetchMaintenances]);

  function applyFilters() {
    setPage(0);
    setApplied({ ...draft });
  }

  function clearFilters() {
    setDraft(EMPTY_FILTERS);
    setPage(0);
    setApplied(EMPTY_FILTERS);
  }

  const hasActiveFilters = Object.values(applied).some(Boolean);

  async function handleExport() {
    setExporting(true);
    try {
      const params: Record<string, any> = {};
      if (applied.performedAtFrom) params.startDate = applied.performedAtFrom;
      if (applied.performedAtTo) params.endDate = applied.performedAtTo;
      const res = await api.get("/me/reports/maintenances/export", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `relatorios_manutencoes_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Relatório exportado com sucesso.");
    } catch {
      toast.error("Erro ao exportar. Verifique se o seu plano permite exportação de relatórios.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-medium text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                Data de início
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={draft.performedAtFrom}
                onChange={(e) => setDraft({ ...draft, performedAtFrom: e.target.value })}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-medium text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                Data de fim
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={draft.performedAtTo}
                onChange={(e) => setDraft({ ...draft, performedAtTo: e.target.value })}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label small fw-medium text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                Tipo
              </label>
              <select
                className="form-select form-select-sm"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="PREVENTIVA">Preventiva</option>
                <option value="CORRETIVA">Corretiva</option>
                <option value="INSPECAO">Inspeção</option>
                <option value="TESTE">Teste</option>
                <option value="EMERGENCIAL">Emergencial</option>
              </select>
            </div>
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label small fw-medium text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                Tipo de Item
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: EXTINTOR"
                value={draft.itemType}
                onChange={(e) => setDraft({ ...draft, itemType: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-2 d-flex gap-2">
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1 flex-fill"
                onClick={applyFilters}
                disabled={fetching}
              >
                <Filter size={14} />
                Filtrar
              </button>
              {hasActiveFilters && (
                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                  onClick={clearFilters}
                  title="Limpar filtros"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2 flex-wrap">
          <FileText size={18} className="text-primary" />
          <span className="fw-semibold">Manutenções Cross-Org</span>
          {!fetching && (
            <span className="badge bg-light text-secondary ms-1" style={{ fontSize: "0.72rem" }}>
              {totalElements.toLocaleString("pt-BR")} registro{totalElements !== 1 ? "s" : ""}
            </span>
          )}
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 ms-auto"
            onClick={handleExport}
            disabled={exporting || fetching}
            title="Exportar CSV (máx. 5.000 registros)"
          >
            <Download size={14} />
            {exporting ? "Exportando…" : "Exportar CSV"}
          </button>
        </div>

        <div className="card-body p-0">
          {/* Error */}
          {fetchError && (
            <div className="text-center py-5">
              <AlertTriangle size={36} className="mb-2 text-warning" />
              <p className="text-muted mb-2">Erro ao carregar manutenções.</p>
              <button
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                onClick={() => fetchMaintenances(applied, page)}
              >
                <RefreshCw size={14} />
                Tentar novamente
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {!fetchError && fetching && (
            <div className="p-3 placeholder-glow">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="d-flex gap-3 mb-3 align-items-center">
                  <span className="placeholder col-1 rounded" style={{ height: 14 }} />
                  <span className="placeholder col-2 rounded" style={{ height: 14 }} />
                  <span className="placeholder col-2 rounded" style={{ height: 14 }} />
                  <span className="placeholder col-1 rounded" style={{ height: 14 }} />
                  <span className="placeholder col-2 rounded" style={{ height: 14 }} />
                  <span className="placeholder col-1 rounded" style={{ height: 14 }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!fetchError && !fetching && rows.length === 0 && (
            <div className="text-center py-5 text-muted">
              <Wrench size={40} className="mb-3 opacity-25" />
              <p className="mb-0">
                {hasActiveFilters
                  ? "Nenhuma manutenção encontrada com os filtros aplicados."
                  : "Nenhuma manutenção encontrada."}
              </p>
              {hasActiveFilters && (
                <button className="btn btn-link btn-sm mt-2" onClick={clearFilters}>
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {!fetchError && !fetching && rows.length > 0 && (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: "0.85rem" }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3 py-2 fw-semibold text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Data</th>
                      <th className="py-2 fw-semibold text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Empresa</th>
                      <th className="py-2 fw-semibold text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Item</th>
                      <th className="py-2 fw-semibold text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Tipo</th>
                      <th className="py-2 fw-semibold text-muted d-none d-md-table-cell" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Responsável</th>
                      <th className="py-2 fw-semibold text-muted d-none d-sm-table-cell" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Custo</th>
                      <th className="py-2 fw-semibold text-muted d-none d-lg-table-cell" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Próxima Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="ps-3 py-2 text-nowrap">{formatDate(row.performedAt)}</td>
                        <td className="py-2">
                          <div className="fw-medium text-truncate" style={{ maxWidth: 160 }}>{row.orgName}</div>
                        </td>
                        <td className="py-2 text-truncate" style={{ maxWidth: 120 }}>{row.itemType || "—"}</td>
                        <td className="py-2"><TypeBadge type={row.type} /></td>
                        <td className="py-2 d-none d-md-table-cell text-truncate" style={{ maxWidth: 140 }}>{row.performedBy || "—"}</td>
                        <td className="py-2 d-none d-sm-table-cell text-nowrap">
                          {row.costCents ? formatMoney(row.costCents) : "—"}
                        </td>
                        <td className="py-2 d-none d-lg-table-cell text-nowrap">{formatDate(row.nextDueAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-3 pb-3">
                <Pagination
                  page={page}
                  size={size}
                  totalPages={totalPages}
                  onChange={(p) => setPage(p)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

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
