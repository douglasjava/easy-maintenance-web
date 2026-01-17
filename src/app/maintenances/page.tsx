"use client";

import { useState, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import Pagination from "@/components/Pagination";
import Link from "next/link";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
    white: "#FFFFFF",
};

interface Item {
    id: string | number;
    itemType: string;
}

interface Maintenance {
    id: string | number;
    itemId: string | number;
    performedAt: string; // YYYY-MM-DD
    issuedBy?: string;
}

interface PageResp<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // 0-based
    size: number;
}

function MaintenancesListContent() {
    const searchParams = useSearchParams();
    const origin = searchParams.get("origin");
    const backHref = origin === "dashboard" ? "/" : "/";

    // filtros do combo de itens
    const [itemsPage, setItemsPage] = useState(0);
    const [itemsItemType, setItemsItemType] = useState("");
    const itemsSize = 20;

    const {
        data: itemsPageData,
        isLoading: itemsLoading,
        error: itemsError,
        refetch: refetchItems,
        isFetching: itemsFetching,
    } = useQuery({
        queryKey: ["items-for-combo", { itemsPage, itemsSize, itemsItemType }],
        queryFn: async () => {
            const params: Record<string, any> = { page: itemsPage, size: itemsSize };
            if (itemsItemType) params.itemType = itemsItemType;

            const res = await api.get("/items", { params });

            if (Array.isArray(res.data)) {
                const arr = res.data as Item[];
                return {
                    content: arr,
                    totalPages: 1,
                    totalElements: arr.length,
                    number: 0,
                    size: arr.length,
                } as PageResp<Item>;
            }
            return res.data as PageResp<Item>;
        },
    });

    const items = useMemo(() => itemsPageData?.content ?? [], [itemsPageData]);

    // item selecionado
    const [selectedItemId, setSelectedItemId] = useState<string>("");

    // paginação manutenções
    const [page, setPage] = useState(0);
    const size = 10;

    const {
        data: maints,
        isLoading: maintsLoading,
        error: maintsError,
        isFetching: maintsFetching,
    } = useQuery({
        enabled: Boolean(selectedItemId),
        queryKey: ["maintenances", { selectedItemId, page, size }],
        queryFn: async () => {
            const params = { page, size };
            const res = await api.get(`/items/${selectedItemId}/maintenances`, {
                params,
            });

            const d = res.data;
            if (Array.isArray(d)) {
                const arr = d as Maintenance[];
                return {
                    content: arr,
                    totalPages: 1,
                    totalElements: arr.length,
                    number: 0,
                    size: arr.length,
                } as PageResp<Maintenance>;
            }
            return d as PageResp<Maintenance>;
        },
    });

    function formatDate(dt?: string) {
        if (!dt) return "-";
        try {
            const parsed = new Date(dt + "T00:00:00");
            return parsed.toLocaleDateString("pt-BR");
        } catch {
            return dt;
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            {/* TOPO */}
            <div className="row align-items-center mb-4">
                <div className="col-4">
                    <Link className="btn btn-outline-secondary btn-sm" href={backHref}>
                        ← Voltar
                    </Link>
                </div>

                <div className="col-4 text-center">
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Manutenções
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Consulte manutenções registradas por item
                    </p>
                </div>

                <div className="col-4 text-end">
                    <Link
                        className="btn btn-primary"
                        href={
                            selectedItemId
                                ? `/maintenances/new?itemId=${selectedItemId}&origin=maintenances`
                                : "/maintenances/new?origin=maintenances"
                        }
                    >
                        + Registrar
                    </Link>
                </div>
            </div>

            {/* SELEÇÃO DE ITEM */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setItemsPage(0);
                            refetchItems();
                        }}
                    >
                        <div className="row g-2 align-items-end">
                            <div className="col-12 col-md-10">
                                <label className="form-label">Item</label>
                                <select
                                    className="form-select"
                                    value={selectedItemId}
                                    onChange={(e) => {
                                        setSelectedItemId(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    <option value="">Selecione um item…</option>
                                    {items.map((it) => (
                                        <option key={String(it.id)} value={String(it.id)}>
                                            {it.itemType} • #{String(it.id)}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            <div className="col-12 col-md-2">
                                <button
                                    className="btn btn-outline-primary w-100"
                                    type="submit"
                                >
                                    {itemsFetching ? "..." : "OK"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* paginação do combo de itens */}
                    {!!itemsPageData && itemsPageData.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setItemsPage((p) => Math.max(0, p - 1))}
                                disabled={(itemsPageData?.number ?? 0) <= 0}
                            >
                                « Anteriores
                            </button>
                            <span className="text-muted small">
                Página {(itemsPageData?.number ?? 0) + 1} de{" "}
                                {itemsPageData?.totalPages ?? 1}
              </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setItemsPage((p) => p + 1)}
                                disabled={
                                    (itemsPageData?.number ?? 0) + 1 >=
                                    (itemsPageData?.totalPages ?? 1)
                                }
                            >
                                Próximos »
                            </button>
                        </div>
                    )}

                    {itemsLoading && <p className="m-0 mt-3">Carregando itens…</p>}
                    {itemsError && (
                        <p className="m-0 mt-3" style={{ color: COLORS.accent }}>
                            Erro ao carregar itens.
                        </p>
                    )}
                </div>
            </div>

            {/* LISTA DE MANUTENÇÕES */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {!selectedItemId && (
                        <div className="p-3">
                            <div
                                className="rounded p-3"
                                style={{
                                    backgroundColor: COLORS.white,
                                    border: "1px dashed rgba(11, 94, 215, 0.35)",
                                }}
                            >
                                <div className="fw-semibold" style={{ color: COLORS.primaryDark }}>
                                    Selecione um item para visualizar as manutenções
                                </div>
                                <div className="text-muted small mt-1">
                                    Depois de selecionar, você verá o histórico e poderá registrar
                                    uma nova manutenção.
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedItemId && (maintsLoading || maintsFetching) && (
                        <p className="p-3 m-0">Carregando manutenções…</p>
                    )}

                    {selectedItemId && maintsError && (
                        <p className="p-3 m-0" style={{ color: COLORS.accent }}>
                            Erro ao carregar manutenções.
                        </p>
                    )}

                    {selectedItemId && !maintsLoading && !maintsError && (
                        <>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead style={{ backgroundColor: "#F9FAFB" }}>
                                    <tr>
                                        <th>ID</th>
                                        <th>Data</th>
                                        <th>Emitido por</th>
                                        <th className="text-end">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(maints?.content ?? []).map((m) => (
                                        <tr key={String(m.id)}>
                                            <td className="fw-semibold">{String(m.id)}</td>
                                            <td>{formatDate(m.performedAt)}</td>
                                            <td className="text-muted">{m.issuedBy || "-"}</td>
                                            <td className="text-end">
                                                <Link
                                                    className="btn btn-sm btn-outline-secondary"
                                                    href={`/items/${selectedItemId}`}
                                                >
                                                    Ver item
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {maints?.content?.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-muted text-center py-4"
                                            >
                                                Nenhuma manutenção encontrada.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-3 py-3 border-top">
                                <Pagination
                                    page={maints?.number ?? 0}
                                    size={maints?.size ?? size}
                                    totalPages={maints?.totalPages ?? 1}
                                    onChange={(p) => setPage(p)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
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