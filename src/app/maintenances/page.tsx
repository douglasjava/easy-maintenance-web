"use client";

import { useState, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import toast from "react-hot-toast";

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
    const [performedAt, setPerformedAt] = useState<string>("");
    const [performedBy, setPerformedBy] = useState<string>("");

    // detalhe da manutenção
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

    const ATTACHMENT_TYPES: Record<string, string> = {
        PHOTO: "Foto",
        REPORT: "Relatório",
        CERTIFICATE: "Certificado",
        ART: "ART",
        INVOICE: "Nota Fiscal",
        OTHER: "Outro"
    };

    async function handleDownload(attachmentId: number, fileName: string) {
        try {
            const res = await api.get(`/maintenances/attachments/${attachmentId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Erro ao baixar arquivo", err);
            toast.error("Erro ao baixar arquivo");
        }
    }

    // paginação manutenções
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const {
        data: maints,
        isLoading: maintsLoading,
        error: maintsError,
        isFetching: maintsFetching,
    } = useQuery({
        queryKey: ["maintenances", { selectedItemId, performedAt, performedBy, page, size }],
        queryFn: async () => {
            const params: Record<string, any> = { page, size };
            if (selectedItemId) params.itemId = selectedItemId;
            if (performedAt) params.performedAt = performedAt;
            if (performedBy) params.performedBy = performedBy;

            const res = await api.get(`/items/maintenances`, {
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

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            {/* 
                PATTERN: Top navigation only
                WHY: This is a simple list page. According to UX Rule 4, we should not duplicate actions 
                on simple lists/dashboards. Structural navigation (Back) and global actions (Register) 
                belong in the header.
            */}
            <div className="row align-items-center mb-4">
                <div className="col-4">
                    <Link className="btn btn-outline-secondary btn-sm" href={backHref}>
                        ← Voltar para Dashboard
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

            {/* SELEÇÃO DE ITEM E FILTROS */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setPage(0);
                        }}
                    >
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-semibold">Item</label>
                                <select
                                    className="form-select"
                                    value={selectedItemId}
                                    onChange={(e) => {
                                        setSelectedItemId(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    <option value="">Todos os itens…</option>
                                    {items.map((it) => (
                                        <option key={String(it.id)} value={String(it.id)}>
                                            {it.itemType} • #{String(it.id)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label small fw-semibold">Data da manutenção</label>
                                <input
                                    type="date"
                                    className="form-select"
                                    value={performedAt}
                                    max={today}
                                    onChange={(e) => {
                                        setPerformedAt(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label small fw-semibold">Responsável</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ex: João Silva"
                                    value={performedBy}
                                    onChange={(e) => {
                                        setPerformedBy(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>

                            <div className="col-12 col-md-2">
                                <button
                                    className="btn btn-outline-primary w-100"
                                    type="button"
                                    onClick={() => {
                                        setSelectedItemId("");
                                        setPerformedAt("");
                                        setPerformedBy("");
                                        setPage(0);
                                    }}
                                >
                                    Limpar Filtros
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
                    {(maintsLoading || maintsFetching) && (
                        <p className="p-3 m-0">Carregando manutenções…</p>
                    )}

                    {maintsError && (
                        <p className="p-3 m-0" style={{ color: COLORS.accent }}>
                            Erro ao carregar manutenções.
                        </p>
                    )}

                    {!maintsLoading && !maintsError && (
                        <>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead style={{ backgroundColor: "#F9FAFB" }}>
                                    <tr>
                                        <th>ID</th>
                                        <th>Data</th>
                                        <th>Tipo</th>
                                        <th>Responsável</th>
                                        <th className="text-end">Custo</th>
                                        <th className="text-end">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(maints?.content ?? []).map((m) => (
                                        <tr key={String(m.id)}>
                                            <td className="fw-semibold">{String(m.id)}</td>
                                            <td>{formatDate(m.performedAt)}</td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="text-muted">{m.performedBy || "-"}</td>
                                            <td className="text-end">
                                                {m.costCents ? (m.costCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setViewingMaintId(m.id)}
                                                    >
                                                        Visualizar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {maints?.content?.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
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
                                    onSizeChange={(newSize) => {
                                        setSize(newSize);
                                        setPage(0);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal Detalhes Manutenção */}
            {viewingMaintId && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">Detalhes da Manutenção #{viewingMaintId}</h5>
                                <button type="button" className="btn-close" onClick={() => setViewingMaintId(null)}></button>
                            </div>
                            <div className="modal-body">
                                {loadingDetail ? (
                                    <div className="text-center py-4">Carregando detalhes...</div>
                                ) : maintDetail ? (
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="text-muted small d-block">Data Realizada</label>
                                            <span className="fw-semibold">{formatDate(maintDetail.performedAt)}</span>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small d-block">Tipo</label>
                                            <span className="badge bg-light text-dark border">{maintDetail.type}</span>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small d-block">Responsável</label>
                                            <span>{maintDetail.performedBy || "-"}</span>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small d-block">Custo</label>
                                            <span>{maintDetail.costCents ? (maintDetail.costCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}</span>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="col-12">
                                            <h6 className="fw-bold mb-3">Anexos</h6>
                                            {maintDetail.attachments && maintDetail.attachments.length > 0 ? (
                                                <div className="list-group">
                                                    {maintDetail.attachments.map(att => (
                                                        <div key={att.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <div className="fw-semibold">{att.fileName}</div>
                                                                <small className="text-muted">{ATTACHMENT_TYPES[att.attachmentType] || att.attachmentType}</small>
                                                            </div>
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleDownload(att.id, att.fileName)}
                                                            >
                                                                Download
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted small">Nenhum anexo encontrado.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-danger">Erro ao carregar detalhes.</div>
                                )}
                            </div>
                            <div className="modal-footer">
                                {maintDetail && (
                                    <Link
                                        className="btn btn-outline-secondary me-auto"
                                        href={`/items/${maintDetail.itemId}`}
                                        onClick={() => setViewingMaintId(null)}
                                    >
                                        Ver item
                                    </Link>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={() => setViewingMaintId(null)}>Fechar</button>
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