"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { categoryLabelMap } from "@/lib/enums/labels";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import { GuardedButton } from "@/components/access/GuardedButton";
import { FeatureGuard } from "@/components/access/FeatureGuard";
import UsageMeter from "@/components/UsageMeter";

type Item = {
  id: string;
  itemType: string;
  itemCategory: "REGULATORY" | "OPERATIONAL";
  status: "OK" | "NEAR_DUE" | "OVERDUE";
  nextDueAt: string;
  canUpdate?: boolean;
  reason?: string;
};

type CursorPageResp<T> = {
  content: T[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasMore: boolean;
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
};

const STATUS_CONFIG = {
  OK:       { label: "Em dia",   bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  NEAR_DUE: { label: "Vencendo", bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  OVERDUE:  { label: "Atrasado", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
} as const;

const CATEGORY_CONFIG = {
  REGULATORY:  { label: "Regulatório",  bg: "#eff6ff", color: "#1d4ed8" },
  OPERATIONAL: { label: "Operacional",  bg: "#f0f9ff", color: "#0369a1" },
} as const;

function StatusBadge({ status }: { status: Item["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.OK;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: Item["itemCategory"] }) {
  const cfg = CATEGORY_CONFIG[category] ?? { label: category, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: "0.7rem",
        fontWeight: 500,
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
  const d = new Date(dt + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function ItemsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const backHref = origin === "dashboard" ? "/" : "/";

  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [itemType, setItemType] = useState("");
  const [cursorStack, setCursorStack] = useState<(number | null)[]>([null]);
  const [stackIndex, setStackIndex] = useState(0);
  const [size, setSize] = useState(10);

  function resetCursor() {
    setCursorStack([null]);
    setStackIndex(0);
  }

  function clearFilters() {
    setStatus("");
    setCategoria("");
    setItemType("");
    resetCursor();
  }

  const hasActiveFilters = !!(status || categoria || itemType);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { permissions, features, organization, message: orgMessage } = useCurrentOrganizationAccess();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["items", { status, itemType, categoria, cursor: cursorStack[stackIndex], size }],
    queryFn: async () => {
      const params: Record<string, any> = { size };
      const currentCursor = cursorStack[stackIndex];
      if (currentCursor != null) params.cursor = currentCursor;
      if (status) params.status = status;
      if (categoria) params.categoria = categoria;
      if (itemType) params.itemType = itemType;

      const res = await api.get("/items", { params });

      if (Array.isArray(res.data)) {
        return {
          content: res.data as Item[],
          nextCursor: null,
          prevCursor: null,
          hasMore: false,
          size: (res.data as Item[]).length,
          totalPages: 1,
          totalElements: (res.data as Item[]).length,
          number: 0,
        } as CursorPageResp<Item>;
      }

      return res.data as CursorPageResp<Item>;
    },
  });

  function openDeleteModal(item: Item) {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deleting) return;
    setShowDeleteModal(false);
    setItemToDelete(null);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/items/${itemToDelete.id}`);
      toast.success("Item removido com sucesso.");
      closeDeleteModal();
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover item.");
    } finally {
      setDeleting(false);
    }
  }

  const items = data?.content ?? [];

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
                Itens
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
                Controle de itens operacionais e regulatórios
              </p>
            </div>

            <div className="d-flex flex-column align-items-end gap-2">
              <GuardedButton
                className="btn btn-primary"
                allowed={!!permissions?.canCreateItem}
                mode="hide"
                blockedMessage={orgMessage}
                onClick={() => (window.location.href = "/items/new?origin=items")}
                style={{ whiteSpace: "nowrap" }}
              >
                + Novo Item
              </GuardedButton>
              {features && organization?.currentUsage != null && (
                <UsageMeter
                  label="Itens"
                  current={organization.currentUsage.currentItems}
                  max={features.maxItems}
                  upgradeHref="/billing"
                />
              )}
            </div>
          </div>
        </div>

        {/* ── FILTROS ── */}
        <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 10 }}>
          <div className="card-body py-3 px-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetCursor();
              }}
            >
              <div className="row g-2 align-items-end">
                <div className="col-6 col-md-2">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Status
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      resetCursor();
                    }}
                  >
                    <option value="">Todos</option>
                    <option value="OK">Em dia</option>
                    <option value="NEAR_DUE">Vencendo</option>
                    <option value="OVERDUE">Atrasado</option>
                  </select>
                </div>

                <div className="col-6 col-md-2">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Categoria
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(e.target.value);
                      resetCursor();
                    }}
                  >
                    <option value="">Todas</option>
                    <option value="REGULATORY">Regulatório</option>
                    <option value="OPERATIONAL">Operacional</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label
                    className="form-label mb-1"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Nome do item
                  </label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Ex: EXTINTOR, SPDA, CAIXA_DAGUA…"
                    value={itemType}
                    onChange={(e) => {
                      setItemType(e.target.value.toUpperCase());
                      resetCursor();
                    }}
                  />
                </div>

                <div className="col-12 col-md-2">
                  <div className="d-flex gap-1">
                    <button className="btn btn-primary btn-sm flex-fill" type="submit">
                      Aplicar
                    </button>
                    {hasActiveFilters && (
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        onClick={clearFilters}
                        title="Limpar filtros"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ── CONTEÚDO ── */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: 10 }}>
          <div className="card-body p-0">

            {/* Loading skeleton */}
            {isLoading && (
              <div className="placeholder-glow px-3 py-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="d-flex gap-3 align-items-center mb-3">
                    <span className="placeholder rounded" style={{ height: 14, width: "35%" }} />
                    <span className="placeholder rounded-pill" style={{ height: 20, width: 72 }} />
                    <span className="placeholder rounded" style={{ height: 14, width: "15%" }} />
                    <span className="placeholder rounded-pill" style={{ height: 22, width: 68 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center px-3">
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</div>
                <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                  Erro ao carregar itens
                </div>
                <div className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
                  Verifique sua conexão e tente novamente.
                </div>
                <button className="btn btn-outline-primary btn-sm" onClick={() => refetch()}>
                  Tentar novamente
                </button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {/* ── Desktop table (md+) ── */}
                <div className="d-none d-md-block table-responsive">
                  <table className="table align-middle mb-0" style={{ fontSize: "0.875rem" }}>
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        {["Item", "Categoria", "Próx. vencimento", "Status", ""].map((h, i) => (
                          <th
                            key={i}
                            className={i === 4 ? "" : ""}
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
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr
                          key={it.id}
                          style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                        >
                          <td style={{ padding: "12px 16px", maxWidth: 260 }}>
                            <span
                              className="fw-semibold text-dark d-block"
                              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              title={it.itemType}
                            >
                              {it.itemType}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <CategoryBadge category={it.itemCategory} />
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>
                            {formatDate(it.nextDueAt)}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <StatusBadge status={it.status} />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div className="d-flex align-items-center justify-content-end gap-1">
                              <Link
                                className="btn btn-sm"
                                style={{
                                  padding: "3px 10px",
                                  fontSize: "0.78rem",
                                  border: "1px solid #e5e7eb",
                                  color: "#374151",
                                  borderRadius: 6,
                                  whiteSpace: "nowrap",
                                }}
                                href={`/items/${it.id}?origin=items`}
                              >
                                Abrir
                              </Link>
                              <GuardedButton
                                className="btn btn-sm"
                                style={{
                                  padding: "3px 10px",
                                  fontSize: "0.78rem",
                                  border: "1px solid #bfdbfe",
                                  color: "#1d4ed8",
                                  borderRadius: 6,
                                  whiteSpace: "nowrap",
                                }}
                                allowed={!!it.canUpdate && !!permissions?.canEditItem}
                                blockedMessage={
                                  !permissions?.canEditItem
                                    ? orgMessage || "Seu plano não permite editar itens."
                                    : it.reason || "Edição indisponível."
                                }
                                onClick={() => (window.location.href = `/items/new?id=${it.id}&origin=items`)}
                              >
                                Editar
                              </GuardedButton>
                              <GuardedButton
                                className="btn btn-sm"
                                style={{
                                  padding: "3px 10px",
                                  fontSize: "0.78rem",
                                  border: "1px solid #fecaca",
                                  color: "#dc2626",
                                  borderRadius: 6,
                                  whiteSpace: "nowrap",
                                }}
                                allowed={!!permissions?.canDeleteItem}
                                blockedMessage={orgMessage}
                                onClick={() => openDeleteModal(it)}
                              >
                                Remover
                              </GuardedButton>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {items.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: "56px 16px" }}>
                            <div className="text-center">
                              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
                              <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                                Nenhum item encontrado
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                Tente ajustar os filtros ou cadastre um novo item.
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
                  {items.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center px-3">
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
                      <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                        Nenhum item encontrado
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                        Tente ajustar os filtros ou cadastre um novo item.
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 d-flex flex-column gap-2">
                      {items.map((it) => {
                        const statusCfg = STATUS_CONFIG[it.status] ?? STATUS_CONFIG.OK;
                        return (
                          <div
                            key={it.id}
                            className="rounded-3"
                            style={{
                              border: "1px solid #e5e7eb",
                              borderLeft: `3px solid ${statusCfg.dot}`,
                              backgroundColor: "#fff",
                              overflow: "hidden",
                            }}
                          >
                            {/* Name + status */}
                            <div className="d-flex align-items-start justify-content-between gap-2 px-3 pt-3 pb-1">
                              <span
                                className="fw-semibold text-dark"
                                style={{ fontSize: "0.9rem", lineHeight: 1.3, wordBreak: "break-word" }}
                              >
                                {it.itemType}
                              </span>
                              <StatusBadge status={it.status} />
                            </div>

                            {/* Category + due date */}
                            <div className="d-flex align-items-center justify-content-between px-3 pb-2 gap-2">
                              <CategoryBadge category={it.itemCategory} />
                              <span style={{ fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                                Vence:{" "}
                                <strong style={{ color: "#374151" }}>{formatDate(it.nextDueAt)}</strong>
                              </span>
                            </div>

                            {/* Actions */}
                            <div
                              className="d-flex gap-2 px-3 py-2"
                              style={{ borderTop: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}
                            >
                              <Link
                                className="btn btn-sm flex-fill"
                                style={{
                                  fontSize: "0.78rem",
                                  border: "1px solid #e5e7eb",
                                  color: "#374151",
                                  padding: "5px 4px",
                                }}
                                href={`/items/${it.id}?origin=items`}
                              >
                                Abrir
                              </Link>
                              <GuardedButton
                                className="btn btn-sm flex-fill"
                                style={{
                                  fontSize: "0.78rem",
                                  border: "1px solid #bfdbfe",
                                  color: "#1d4ed8",
                                  padding: "5px 4px",
                                }}
                                allowed={!!it.canUpdate && !!permissions?.canEditItem}
                                blockedMessage={
                                  !permissions?.canEditItem
                                    ? orgMessage || "Seu plano não permite editar itens."
                                    : it.reason || "Edição indisponível."
                                }
                                onClick={() => (window.location.href = `/items/new?id=${it.id}&origin=items`)}
                              >
                                Editar
                              </GuardedButton>
                              <GuardedButton
                                className="btn btn-sm flex-fill"
                                style={{
                                  fontSize: "0.78rem",
                                  border: "1px solid #fecaca",
                                  color: "#dc2626",
                                  padding: "5px 4px",
                                }}
                                allowed={!!permissions?.canDeleteItem}
                                blockedMessage={orgMessage}
                                onClick={() => openDeleteModal(it)}
                              >
                                Remover
                              </GuardedButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Pagination ── */}
                {(data?.totalElements ?? 0) > 0 && (
                  <div
                    className="px-3 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                        Por página:
                      </span>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "auto", fontSize: "0.78rem" }}
                        value={size}
                        onChange={(e) => {
                          setSize(Number(e.target.value));
                          resetCursor();
                        }}
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
                        onClick={() => setStackIndex((i) => Math.max(0, i - 1))}
                        disabled={stackIndex === 0}
                      >
                        ← Anterior
                      </button>
                      <span style={{ fontSize: "0.78rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                        Página {stackIndex + 1}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const nc = data?.nextCursor;
                          if (!nc) return;
                          setCursorStack((prev) => [...prev.slice(0, stackIndex + 1), nc]);
                          setStackIndex((i) => i + 1);
                        }}
                        disabled={!data?.hasMore}
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

      <ConfirmModal
        show={showDeleteModal}
        title="Confirmar exclusão"
        message={
          <p className="mb-0">
            Deseja realmente remover o item{" "}
            <strong>{itemToDelete?.itemType}</strong>?<br />
            Esta ação não pode ser desfeita.
          </p>
        }
        confirmLabel="Remover"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </section>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<p className="p-3">Carregando listagem...</p>}>
      <ItemsContent />
    </Suspense>
  );
}
