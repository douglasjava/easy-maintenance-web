"use client";

import { useState, useMemo, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { api } from "@/lib/apiClient";
import { formatMoney, formatDate } from "@/lib/formatters";
import { useAccessContext } from "@/providers/AccessContextProvider";
import { GuardedButton } from "@/components/access/GuardedButton";
import toast from "react-hot-toast";
import { Download, FileCheck2 } from "lucide-react";
import PrestacaoContasPdfDocument, {
  type PrestacaoContasData,
  type MaintenanceRow,
  type CancelledRow,
  type PendingItemRow,
} from "./PrestacaoContasPdfDocument";

// TASK-146/149 (EPIC-017): relatório de UMA organização por vez (RN-017-01). Por padrão, a
// organização ativa globalmente — mas quem tem acesso a mais de uma pode trocar num seletor
// próprio desta aba (TASK-149), sem sair da tela nem afetar o contexto global do resto do app. O
// seletor controla explicitamente o header X-Org-Id só nas 3 chamadas deste relatório
// (apiClient.ts foi ajustado pra respeitar esse override em vez de sempre usar a org ativa).

const MAINT_TYPE_LABEL: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  INSPECAO: "Inspeção",
  TESTE: "Teste",
  EMERGENCIAL: "Emergencial",
};

const STATUS_LABEL: Record<string, string> = {
  OK: "Em dia",
  NEAR_DUE: "Próximo do vencimento",
  OVERDUE: "Vencido",
};

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function daysBetween(from: string, to: string) {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

interface ItemApiRow {
  id: number;
  itemType: string;
  itemCategory: string;
  nextDueAt: string | null;
  status: string;
}

export default function PrestacaoContasSection() {
  const { accessContext, currentOrganizationCode, isLoading: loadingAccess } = useAccessContext();
  const organizationsAccess = useMemo(() => accessContext?.organizationsAccess ?? [], [accessContext]);
  const hasMultipleOrgs = organizationsAccess.length > 1;

  const [selectedOrgCode, setSelectedOrgCode] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedOrgCode && currentOrganizationCode) {
      setSelectedOrgCode(currentOrganizationCode);
    }
  }, [selectedOrgCode, currentOrganizationCode]);

  const selectedOrg = useMemo(
    () => organizationsAccess.find((o) => o.organizationCode === selectedOrgCode) ?? null,
    [organizationsAccess, selectedOrgCode]
  );

  const [performedAtFrom, setPerformedAtFrom] = useState(isoDaysAgo(30));
  const [performedAtTo, setPerformedAtTo] = useState(todayIso());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<PrestacaoContasData | null>(null);
  const [error, setError] = useState(false);

  function applyPreset(preset: "month" | "quarter" | "year") {
    const days = preset === "month" ? 30 : preset === "quarter" ? 90 : 365;
    setPerformedAtFrom(isoDaysAgo(days));
    setPerformedAtTo(todayIso());
  }

  async function generatePreview() {
    if (!selectedOrgCode) {
      toast.error("Selecione uma organização.");
      return;
    }
    if (!performedAtFrom || !performedAtTo) {
      toast.error("Informe o período completo.");
      return;
    }
    if (performedAtFrom > performedAtTo) {
      toast.error("A data de início não pode ser posterior à data de fim.");
      return;
    }

    setLoading(true);
    setError(false);
    try {
      // TASK-149: X-Org-Id explícito — gera o relatório da organização escolhida NESTE seletor,
      // não da organização ativa globalmente (apiClient.ts respeita esse override).
      const orgHeaders = { headers: { "X-Org-Id": selectedOrgCode } };
      const [maintenancesRes, cancelledRes, itemsRes] = await Promise.all([
        api.get("/items/maintenances", { params: { performedAtFrom, performedAtTo, size: 1000 }, ...orgHeaders }),
        api.get("/items/maintenances/cancelled", { params: { performedAtFrom, performedAtTo }, ...orgHeaders }),
        api.get("/items", { params: { size: 1000 }, ...orgHeaders }),
      ]);

      const maintenancesRaw = maintenancesRes.data;
      const maintenances: MaintenanceRow[] = (Array.isArray(maintenancesRaw) ? maintenancesRaw : maintenancesRaw.content) ?? [];

      const cancelled: CancelledRow[] = cancelledRes.data ?? [];

      const itemsRaw = itemsRes.data;
      const items: ItemApiRow[] = (Array.isArray(itemsRaw) ? itemsRaw : itemsRaw.content) ?? [];

      const totalCostCents = maintenances.reduce((sum: number, m: MaintenanceRow) => sum + (m.costCents || 0), 0);
      const itemsOk = items.filter((i) => i.status === "OK").length;
      const itemsNearDue = items.filter((i) => i.status === "NEAR_DUE").length;
      const itemsOverdue = items.filter((i) => i.status === "OVERDUE").length;

      const today = todayIso();
      const pendingItems: PendingItemRow[] = items
        .filter((i) => i.status === "OVERDUE" || i.status === "NEAR_DUE")
        .map((i) => ({
          id: i.id,
          itemType: i.itemType,
          itemCategory: i.itemCategory,
          nextDueAt: i.nextDueAt,
          status: i.status,
          daysOverdue: i.status === "OVERDUE" && i.nextDueAt ? daysBetween(i.nextDueAt, today) : 0,
        }));

      setData({
        organizationName: selectedOrg?.organizationName || "—",
        performedAtFrom,
        performedAtTo,
        totalMaintenances: maintenances.length,
        totalCostCents,
        itemsOk,
        itemsNearDue,
        itemsOverdue,
        totalItems: items.length,
        maintenances,
        cancelled,
        pendingItems,
      });
    } catch {
      setError(true);
      toast.error("Erro ao gerar o relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!data) return;
    setGenerating(true);
    try {
      const blob = await pdf(<PrestacaoContasPdfDocument data={data} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prestacao-de-contas_${data.performedAtFrom}_a_${data.performedAtTo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }

  const reportsEnabled = !!selectedOrg?.features?.reportsEnabled;
  const complianceRate = data && data.totalItems > 0
    ? Math.round(((data.totalItems - data.itemsOverdue) / data.totalItems) * 100)
    : 100;

  return (
    <div>
      {/* Filtros */}
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-3 p-md-4">
          {hasMultipleOrgs && (
            <div className="row g-3 mb-1">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-medium text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                  Organização
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedOrgCode ?? ""}
                  onChange={(e) => { setSelectedOrgCode(e.target.value); setData(null); }}
                >
                  {organizationsAccess.map((org) => (
                    <option key={org.organizationCode} value={org.organizationCode}>
                      {org.organizationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="row g-3 align-items-end">
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-medium text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                Data de início
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={performedAtFrom}
                onChange={(e) => setPerformedAtFrom(e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-medium text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                Data de fim
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={performedAtTo}
                onChange={(e) => setPerformedAtTo(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3 d-flex gap-1">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => applyPreset("month")}>Último mês</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => applyPreset("quarter")}>Trimestre</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => applyPreset("year")}>Este ano</button>
            </div>
            <div className="col-12 col-md-3">
              <button
                className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                onClick={generatePreview}
                disabled={loading || loadingAccess}
              >
                <FileCheck2 size={14} />
                {loading ? "Gerando..." : "Visualizar relatório"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">Erro ao carregar dados do relatório.</div>
      )}

      {data && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
              <div>
                <h5 className="mb-0 fw-bold">{data.organizationName}</h5>
                <p className="text-muted small mb-0">
                  Período: {formatDate(data.performedAtFrom)} a {formatDate(data.performedAtTo)}
                </p>
              </div>
              <GuardedButton
                className="btn btn-success d-flex align-items-center gap-2"
                allowed={reportsEnabled}
                blockedMessage="Exportação de relatórios não disponível no plano atual."
                onClick={downloadPdf}
                disabled={generating}
              >
                <Download size={16} />
                {generating ? "Gerando PDF..." : "Baixar PDF"}
              </GuardedButton>
            </div>

            {/* Seção 1 — Resumo */}
            <h6 className="text-uppercase text-muted small fw-bold mb-2">Resumo do período</h6>
            <div className="row g-2 mb-4">
              {[
                { label: "Manutenções realizadas", value: data.totalMaintenances },
                { label: "Custo total", value: formatMoney(data.totalCostCents) },
                { label: "Taxa de conformidade", value: `${complianceRate}%` },
                { label: "Itens em dia", value: data.itemsOk },
                { label: "Próximos do vencimento", value: data.itemsNearDue },
                { label: "Vencidos", value: data.itemsOverdue },
              ].map((kpi) => (
                <div className="col-6 col-md-4 col-lg-2" key={kpi.label}>
                  <div className="border rounded-3 p-2 h-100">
                    <div className="text-muted" style={{ fontSize: "0.68rem", textTransform: "uppercase" }}>{kpi.label}</div>
                    <div className="fw-bold" style={{ fontSize: "1.1rem" }}>{kpi.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Seção 2 — Manutenções realizadas */}
            <h6 className="text-uppercase text-muted small fw-bold mb-2">
              Manutenções realizadas ({data.maintenances.length})
            </h6>
            {data.maintenances.length === 0 ? (
              <p className="text-muted small mb-4">Nenhuma manutenção realizada neste período.</p>
            ) : (
              <div className="table-responsive mb-4">
                <table className="table table-sm">
                  <thead><tr><th>Data</th><th>Item</th><th>Tipo</th><th>Responsável</th><th>Custo</th></tr></thead>
                  <tbody>
                    {data.maintenances.map((m) => (
                      <tr key={m.id}>
                        <td>{formatDate(m.performedAt)}</td>
                        <td>{m.itemType}</td>
                        <td>{MAINT_TYPE_LABEL[m.type] ?? m.type}</td>
                        <td>{m.performedBy || "—"}</td>
                        <td>{m.costCents ? formatMoney(m.costCents) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Seção 3 — Canceladas */}
            <h6 className="text-uppercase text-muted small fw-bold mb-2">
              Manutenções canceladas — auditoria ({data.cancelled.length})
            </h6>
            {data.cancelled.length === 0 ? (
              <p className="text-muted small mb-4">Nenhuma manutenção cancelada neste período.</p>
            ) : (
              <div className="table-responsive mb-4">
                <table className="table table-sm">
                  <thead><tr><th>Data original</th><th>Item</th><th>Motivo</th><th>Cancelado por</th><th>Quando</th></tr></thead>
                  <tbody>
                    {data.cancelled.map((c) => (
                      <tr key={c.id}>
                        <td>{formatDate(c.performedAt)}</td>
                        <td>{c.itemType}</td>
                        <td>{c.cancelReason || "—"}</td>
                        <td>{c.cancelledByName || "—"}</td>
                        <td>{c.cancelledAt ? formatDate(c.cancelledAt) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Seção 4 — Itens pendentes/vencidos */}
            <h6 className="text-uppercase text-muted small fw-bold mb-2">
              Itens pendentes ou vencidos ({data.pendingItems.length})
            </h6>
            {data.pendingItems.length === 0 ? (
              <p className="text-muted small mb-0">Nenhum item pendente ou vencido no momento da geração.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead><tr><th>Item</th><th>Categoria</th><th>Próximo vencimento</th><th>Status</th><th>Dias em atraso</th></tr></thead>
                  <tbody>
                    {data.pendingItems.map((i) => (
                      <tr key={i.id}>
                        <td>{i.itemType}</td>
                        <td>{i.itemCategory}</td>
                        <td>{formatDate(i.nextDueAt)}</td>
                        <td>{STATUS_LABEL[i.status] ?? i.status}</td>
                        <td>{i.daysOverdue > 0 ? i.daysOverdue : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
