"use client";

import { useState, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import { GuardedButton } from "@/components/access/GuardedButton";

interface Item {
  id: string | number;
  itemType: string;
}

interface Maintenance {
  id: string | number;
  itemId: string | number;
  itemType?: string;
  performedAt: string;
  performedBy?: string;
  type: string;
  costCents: number;
}

interface Attachment {
  id: number;
  fileName: string;
  attachmentType: string;
}

interface MaintenanceDetail extends Maintenance {
  attachments: Attachment[];
}

interface CursorPageResp<T> {
  content: T[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasMore: boolean;
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PREVENTIVE:   { label: "Preventiva",   bg: "#eff6ff", color: "#1d4ed8" },
  CORRECTIVE:   { label: "Corretiva",    bg: "#fef2f2", color: "#b91c1c" },
  INSPECTION:   { label: "Inspeção",     bg: "#f0fdf4", color: "#15803d" },
  CALIBRATION:  { label: "Calibração",   bg: "#fdf4ff", color: "#7e22ce" },
  EMERGENCY:    { label: "Emergência",   bg: "#fff7ed", color: "#c2410c" },
};

const ATTACHMENT_TYPES: Record<string, string> = {
  PHOTO:       "Foto",
  REPORT:      "Relatório",
  CERTIFICATE: "Certificado",
  ART:         "ART",
  INVOICE:     "Nota Fiscal",
  OTHER:       "Outro",
};

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? { label: type, bg: "#f3f4f6", color: "#374151" };
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

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    const d = new Date(dt + "T00:00:00");
    return d.toLocaleDateString("pt-BR");
  } catch {
    return dt;
  }
}

function formatCost(cents?: number) {
  if (!cents) return "-";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function MaintenancesListContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const backHref = origin === "dashboard" ? "/" : "/";

  const { permissions, features, message: orgMessage } = useCurrentOrganizationAccess();
  const [exporting, setExporting] = useState(false);

  async function handleExportCsv() {
    try {
      setExporting(true);
      const params: Record<string, any> = {};
      if (selectedItemId) params.itemId = selectedItemId;
      if (performedAt) {
        params.startDate = performedAt;
        params.endDate = performedAt;
      }
      const res = await api.get("/items/maintenances/export", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `manutencoes_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Relatório exportado com sucesso.");
    } catch {
      toast.error("Erro ao exportar relatório. Verifique seu plano ou tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  // Items combo
  const [itemsCursorStack, setItemsCursorStack] = useState<(number | null)[]>([null]);
  const [itemsStackIndex, setItemsStackIndex] = useState(0);
  const itemsSize = 20;

  const { data: itemsPageData, isLoading: itemsLoading } = useQuery({
    queryKey: ["items-for-combo", { cursor: itemsCursorStack[itemsStackIndex], itemsSize }],
    queryFn: async () => {
      const params: Record<string, any> = { size: itemsSize };
      const c = itemsCursorStack[itemsStackIndex];
      if (c != null) params.cursor = c;
      const res = await api.get("/items", { params });
      if (Array.isArray(res.data)) {
        const arr = res.data as Item[];
        return { content: arr, nextCursor: null, prevCursor: null, hasMore: false, size: arr.length, totalPages: 1, totalElements: arr.length, number: 0 } as CursorPageResp<Item>;
      }
      return res.data as CursorPageResp<Item>;
    },
  });

  const items = useMemo(() => itemsPageData?.content ?? [], [itemsPageData]);

  // Filters
  const [selectedItemId, setSelectedItemId] = useState("");
  const [performedAt, setPerformedAt] = useState("");
  const [performedBy, setPerformedBy] = useState("");

  function clearFilters() {
    setSelectedItemId("");
    setPerformedAt("");
    setPerformedBy("");
    resetMaintsCursor();
  }

  const hasActiveFilters = !!(selectedItemId || performedAt || performedBy);

  // Detail modal
  const [viewingMaintId, setViewingMaintId] = useState<string | number | null>(null);
  const { data: maintDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["maintenance-detail", viewingMaintId],
    queryFn: async () => {
      if (!viewingMaintId) return null;
      const res = await api.get(`/items/maintenances/${viewingMaintId}`);
      return res.data as MaintenanceDetail;
    },
    enabled: !!viewingMaintId,
  });

  async function handleDownload(attachmentId: number, fileName: string) {
    try {
      const res = await api.get(`/maintenances/attachments/${attachmentId}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Erro ao baixar arquivo");
    }
  }

  // Maintenances pagination
  const [maintsCursorStack, setMaintsCursorStack] = useState<(number | null)[]>([null]);
  const [maintsStackIndex, setMaintsStackIndex] = useState(0);
  const [size, setSize] = useState(10);

  function resetMaintsCursor() {
    setMaintsCursorStack([null]);
    setMaintsStackIndex(0);
  }

  const { data: maints, isLoading: maintsLoading, error: maintsError, isFetching: maintsFetching, refetch } = useQuery({
    queryKey: ["maintenances", { selectedItemId, performedAt, performedBy, cursor: maintsCursorStack[maintsStackIndex], size }],
    queryFn: async () => {
      const params: Record<string, any> = { size };
      const c = maintsCursorStack[maintsStackIndex];
      if (c != null) params.cursor = c;
      if (selectedItemId) params.itemId = selectedItemId;
      if (performedAt) params.performedAt = performedAt;
      if (performedBy) params.performedBy = performedBy;
      const res = await api.get("/items/maintenances", { params });
      const d = res.data;
      if (Array.isArray(d)) {
        const arr = d as Maintenance[];
        return { content: arr, nextCursor: null, prevCursor: null, hasMore: false, size: arr.length, totalPages: 1, totalElements: arr.length, number: 0 } as CursorPageResp<Maintenance>;
      }
      return d as CursorPageResp<Maintenance>;
    },
  });

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const maintenances = maints?.content ?? [];
  const isListLoading = maintsLoading || maintsFetching;

  return (
    <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
      <div className="container px-3 px-md-4">

        {/* ── HEADER ── */}
        <div className="pt-4 pb-3">
          <Link
            href={backHref}
            className="d-inline-flex align-items-center gap-1 text-decoration-none mb-3"
            style={{ color: "#6b7280", fontSize: "0.8rem" }}
          >
            ← Dashboard
          </Link>

          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Manutenções
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
                Consulte manutenções registradas por item
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <GuardedButton
                className="btn btn-outline-secondary btn-sm"
                allowed={!!features?.reportsEnabled}
                blockedMessage="Faça upgrade do seu plano para exportar relatórios"
                onClick={handleExportCsv}
                disabled={exporting}
                style={{ whiteSpace: "nowrap" }}
              >
                {exporting ? "Exportando…" : "⬇ Exportar CSV"}
              </GuardedButton>
              <GuardedButton
                className="btn btn-primary"
                allowed={!!permissions?.canRegisterMaintenance}
                mode="hide"
                blockedMessage={orgMessage}
                onClick={() => {
                  const url = selectedItemId
                    ? `/maintenances/new?itemId=${selectedItemId}&origin=maintenances`
                    : "/maintenances/new?origin=maintenances";
                  window.location.href = url;
                }}
                style={{ whiteSpace: "nowrap" }}
              >
                + Registrar
              </GuardedButton>
            </div>
          </div>
        </div>

        {/* ── FILTROS ── */}
        <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 10 }}>
          <div className="card-body py-3 px-3">
            <form onSubmit={(e) => { e.preventDefault(); resetMaintsCursor(); }}>
              <div className="row g-2 align-items-end">

                {/* Item selector — full width on mobile */}
                <div className="col-12 col-md-4">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Item
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedItemId}
                    onChange={(e) => { setSelectedItemId(e.target.value); resetMaintsCursor(); }}
                    disabled={itemsLoading}
                  >
                    <option value="">Todos os itens</option>
                    {items.map((it) => (
                      <option key={String(it.id)} value={String(it.id)}>
                        {it.itemType}
                      </option>
                    ))}
                  </select>

                  {/* Items combo pagination — only shown when needed */}
                  {(itemsStackIndex > 0 || itemsPageData?.hasMore) && (
                    <div className="d-flex justify-content-between align-items-center mt-1 gap-2">
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        style={{ fontSize: "0.72rem", color: "#6b7280" }}
                        onClick={() => setItemsStackIndex((i) => Math.max(0, i - 1))}
                        disabled={itemsStackIndex === 0}
                      >
                        ← Anteriores
                      </button>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        style={{ fontSize: "0.72rem", color: "#6b7280" }}
                        onClick={() => {
                          const nc = itemsPageData?.nextCursor;
                          if (!nc) return;
                          setItemsCursorStack((prev) => [...prev.slice(0, itemsStackIndex + 1), nc]);
                          setItemsStackIndex((i) => i + 1);
                        }}
                        disabled={!itemsPageData?.hasMore}
                      >
                        Próximos →
                      </button>
                    </div>
                  )}
                </div>

                {/* Date — half on mobile */}
                <div className="col-6 col-md-3">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Data
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={performedAt}
                    max={today}
                    onChange={(e) => { setPerformedAt(e.target.value); resetMaintsCursor(); }}
                  />
                </div>

                {/* Responsável — half on mobile */}
                <div className="col-6 col-md-3">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Responsável
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: João Silva"
                    value={performedBy}
                    onChange={(e) => { setPerformedBy(e.target.value); resetMaintsCursor(); }}
                  />
                </div>

                {/* Clear — full on mobile, col-md-2 desktop */}
                <div className="col-12 col-md-2">
                  <button
                    className="btn btn-sm w-100"
                    type="button"
                    style={{
                      border: "1px solid #e5e7eb",
                      color: hasActiveFilters ? "#dc2626" : "#6b7280",
                      fontWeight: hasActiveFilters ? 600 : 400,
                    }}
                    onClick={clearFilters}
                  >
                    {hasActiveFilters ? "✕ Limpar" : "Limpar"}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>

        {/* ── LISTA DE MANUTENÇÕES ── */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: 10 }}>
          <div className="card-body p-0">

            {/* Loading skeleton */}
            {isListLoading && (
              <div className="placeholder-glow px-3 py-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="d-flex gap-3 align-items-center mb-3">
                    <span className="placeholder rounded" style={{ height: 14, width: "12%" }} />
                    <span className="placeholder rounded-pill" style={{ height: 20, width: 88 }} />
                    <span className="placeholder rounded" style={{ height: 14, width: "20%" }} />
                    <span className="placeholder rounded" style={{ height: 14, width: "15%" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {maintsError && (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center px-3">
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</div>
                <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                  Erro ao carregar manutenções
                </div>
                <div className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
                  Verifique sua conexão e tente novamente.
                </div>
                <button className="btn btn-outline-primary btn-sm" onClick={() => refetch()}>
                  Tentar novamente
                </button>
              </div>
            )}

            {!isListLoading && !maintsError && (
              <>
                {/* ── Desktop table (md+) ── */}
                <div className="d-none d-md-block table-responsive">
                  <table className="table align-middle mb-0" style={{ fontSize: "0.875rem" }}>
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        {[
                          { label: "Item" },
                          { label: "Data" },
                          { label: "Tipo" },
                          { label: "Responsável" },
                          { label: "Custo", align: "end" },
                          { label: "" },
                        ].map((col, i) => (
                          <th
                            key={i}
                            className={col.align === "end" ? "text-end" : ""}
                            style={{
                              padding: "10px 16px",
                              color: "#9ca3af",
                              fontWeight: 600,
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              borderBottom: "1px solid #e5e7eb",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {maintenances.map((m) => (
                        <tr
                          key={String(m.id)}
                          style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                        >
                          <td style={{ padding: "12px 16px", maxWidth: 180 }}>
                            <span
                              className="fw-semibold text-dark d-block"
                              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem" }}
                              title={m.itemType}
                            >
                              {m.itemType || "—"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#374151", whiteSpace: "nowrap" }}>
                            {formatDate(m.performedAt)}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <TypeBadge type={m.type} />
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6b7280", maxWidth: 200 }}>
                            <span
                              style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              title={m.performedBy}
                            >
                              {m.performedBy || "—"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }} className="text-end">
                            <span style={{ color: m.costCents ? "#0f172a" : "#9ca3af", fontWeight: m.costCents ? 600 : 400 }}>
                              {formatCost(m.costCents)}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div className="d-flex justify-content-end">
                              <button
                                className="btn btn-sm"
                                style={{
                                  padding: "3px 10px",
                                  fontSize: "0.78rem",
                                  border: "1px solid #bfdbfe",
                                  color: "#1d4ed8",
                                  borderRadius: 6,
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => setViewingMaintId(m.id)}
                              >
                                Ver detalhes
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {maintenances.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: "56px 16px" }}>
                            <div className="text-center">
                              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔧</div>
                              <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                                Nenhuma manutenção encontrada
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {hasActiveFilters
                                  ? "Tente ajustar os filtros."
                                  : "Registre a primeira manutenção para começar."}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile card list (< md) ── */}
                <div className="d-md-none">
                  {maintenances.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center px-3">
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔧</div>
                      <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                        Nenhuma manutenção encontrada
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {hasActiveFilters
                          ? "Tente ajustar os filtros."
                          : "Registre a primeira manutenção para começar."}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 d-flex flex-column gap-2">
                      {maintenances.map((m) => (
                        <div
                          key={String(m.id)}
                          className="rounded-3"
                          style={{
                            border: "1px solid #e5e7eb",
                            borderLeft: "3px solid #2563eb",
                            backgroundColor: "#fff",
                            overflow: "hidden",
                          }}
                        >
                          {/* Item name */}
                          {m.itemType && (
                            <div className="px-3 pt-3 pb-0">
                              <span
                                className="fw-semibold text-dark"
                                style={{ fontSize: "0.85rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                title={m.itemType}
                              >
                                {m.itemType}
                              </span>
                            </div>
                          )}

                          {/* Date + type */}
                          <div className="d-flex align-items-start justify-content-between gap-2 px-3 pt-2 pb-1">
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.82rem" }}
                            >
                              {formatDate(m.performedAt)}
                            </span>
                            <TypeBadge type={m.type} />
                          </div>

                          {/* Meta row: responsável + custo */}
                          <div className="d-flex align-items-center justify-content-between px-3 pb-2 gap-2">
                            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                              {m.performedBy || <span style={{ color: "#d1d5db" }}>Sem responsável</span>}
                            </span>
                            {m.costCents ? (
                              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>
                                {formatCost(m.costCents)}
                              </span>
                            ) : null}
                          </div>

                          {/* Action */}
                          <div
                            className="px-3 py-2"
                            style={{ borderTop: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}
                          >
                            <button
                              className="btn btn-sm w-100"
                              style={{
                                fontSize: "0.78rem",
                                border: "1px solid #bfdbfe",
                                color: "#1d4ed8",
                                padding: "5px 8px",
                              }}
                              onClick={() => setViewingMaintId(m.id)}
                            >
                              Ver detalhes
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Pagination ── */}
                {(maints?.content?.length ?? 0) > 0 && (
                  <div
                    className="px-3 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>Por página:</span>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "auto", fontSize: "0.78rem" }}
                        value={size}
                        onChange={(e) => { setSize(Number(e.target.value)); resetMaintsCursor(); }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setMaintsStackIndex((i) => Math.max(0, i - 1))}
                        disabled={maintsStackIndex === 0}
                      >
                        ← Anterior
                      </button>
                      <span style={{ fontSize: "0.78rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                        Página {maintsStackIndex + 1}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const nc = maints?.nextCursor;
                          if (!nc) return;
                          setMaintsCursorStack((prev) => [...prev.slice(0, maintsStackIndex + 1), nc]);
                          setMaintsStackIndex((i) => i + 1);
                        }}
                        disabled={!maints?.hasMore}
                      >
                        Próximo →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── DETAIL MODAL ── */}
      {viewingMaintId && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          tabIndex={-1}
          onClick={(e) => { if (e.target === e.currentTarget) setViewingMaintId(null); }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 12 }}>

              {/* Modal header */}
              <div className="modal-header px-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: "1rem" }}>
                    Detalhes da Manutenção
                  </h5>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    #{String(viewingMaintId)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingMaintId(null)}
                />
              </div>

              {/* Modal body */}
              <div className="modal-body px-4 py-4">
                {loadingDetail ? (
                  <div className="placeholder-glow">
                    <div className="row g-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="col-6">
                          <span className="placeholder rounded d-block mb-1" style={{ height: 10, width: "50%" }} />
                          <span className="placeholder rounded d-block" style={{ height: 18, width: "80%" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : maintDetail ? (
                  <>
                    {/* Info grid */}
                    <div className="row g-3 mb-4">
                      <div className="col-6 col-md-3">
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                          Data
                        </div>
                        <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>
                          {formatDate(maintDetail.performedAt)}
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                          Tipo
                        </div>
                        <TypeBadge type={maintDetail.type} />
                      </div>
                      <div className="col-6 col-md-3">
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                          Responsável
                        </div>
                        <div className="text-dark" style={{ fontSize: "0.9rem" }}>
                          {maintDetail.performedBy || "—"}
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                          Custo
                        </div>
                        <div className="fw-semibold" style={{ fontSize: "0.9rem", color: maintDetail.costCents ? "#0f172a" : "#9ca3af" }}>
                          {formatCost(maintDetail.costCents)}
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
                      <div
                        style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}
                      >
                        Anexos
                      </div>

                      {maintDetail.attachments && maintDetail.attachments.length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                          {maintDetail.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="d-flex align-items-center justify-content-between gap-3 px-3 py-2 rounded-3"
                              style={{ border: "1px solid #e5e7eb", backgroundColor: "#fafafa" }}
                            >
                              <div className="min-w-0">
                                <div
                                  className="fw-semibold text-dark"
                                  style={{
                                    fontSize: "0.85rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: "240px",
                                  }}
                                  title={att.fileName}
                                >
                                  {att.fileName}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                                  {ATTACHMENT_TYPES[att.attachmentType] ?? att.attachmentType}
                                </div>
                              </div>
                              <button
                                className="btn btn-sm flex-shrink-0"
                                style={{
                                  fontSize: "0.78rem",
                                  border: "1px solid #bfdbfe",
                                  color: "#1d4ed8",
                                  padding: "3px 10px",
                                  borderRadius: 6,
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => handleDownload(att.id, att.fileName)}
                              >
                                ⬇ Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>
                          Nenhum anexo encontrado.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
                    <div className="text-danger" style={{ fontSize: "0.875rem" }}>Erro ao carregar detalhes.</div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="modal-footer px-4" style={{ borderTop: "1px solid #f1f5f9" }}>
                {maintDetail && (
                  <Link
                    className="btn btn-sm me-auto"
                    style={{
                      border: "1px solid #e5e7eb",
                      color: "#374151",
                      fontSize: "0.8rem",
                      padding: "4px 12px",
                    }}
                    href={`/items/${maintDetail.itemId}`}
                    onClick={() => setViewingMaintId(null)}
                  >
                    Ver item →
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ border: "1px solid #e5e7eb", color: "#374151", fontSize: "0.8rem", padding: "4px 12px" }}
                  onClick={() => setViewingMaintId(null)}
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function MaintenancesListPage() {
  return (
    <Suspense fallback={<p className="p-3 m-0">Carregando manutenções...</p>}>
      <MaintenancesListContent />
    </Suspense>
  );
}
