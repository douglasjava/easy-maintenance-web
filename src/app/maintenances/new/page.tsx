"use client";

import { useMemo, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
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
    itemCategory: "REGULATORY" | "OPERATIONAL";
    status: "OK" | "NEAR_DUE" | "OVERDUE";
    nextDueAt?: string;
}

interface PageResp<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

interface NearbySupplier {
    placeId: string;
    name: string;
    address?: string;
    rating?: number;
    userRatingsTotal?: number;
    phone?: string;
    website?: string;
    mapsUrl?: string;
}

interface NearbyResponse {
    serviceKey: string;
    radiusKm: number;
    center: { lat: number; lng: number };
    suppliers: NearbySupplier[];
}

function NewMaintenanceContent() {
    const searchParams = useSearchParams();
    const origin = searchParams.get("origin");
    let backHref = "/maintenances";
    if (origin === "dashboard") backHref = "/";
    if (origin === "item-detail") backHref = `/items/${searchParams.get("itemId")}`;

    // seleção do item
    const [itemId, setItemId] = useState(searchParams.get("itemId") || "");

    // filtros do combo de itens (novo)
    const [itemsPage, setItemsPage] = useState(0);
    const itemsSize = 20;

    const {
        data: itemsComboData,
        isLoading: itemsComboLoading,
        refetch: refetchItemsCombo,
        isFetching: itemsComboFetching,
    } = useQuery({
        queryKey: ["items-for-combo", { itemsPage, itemsSize }],
        queryFn: async () => {
            const params: Record<string, any> = { page: itemsPage, size: itemsSize };
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

    const itemsCombo = useMemo(() => itemsComboData?.content ?? [], [itemsComboData]);

    // formulário de manutenção
    const [performedAt, setPerformedAt] = useState("");
    const [issuedBy, setIssuedBy] = useState("");
    const [certificateNumber, setCertificateNumber] = useState("");
    const [certificateValidUntil, setCertificateValidUntil] = useState("");
    const [receiptUrl, setReceiptUrl] = useState("");

    const [saving, setSaving] = useState(false);

    // detalhe do item selecionado (para mostrar contexto + usar itemType nos fornecedores)
    const {
        data: selectedItem,
        isLoading: selectedItemLoading,
    } = useQuery({
        enabled: Boolean(itemId),
        queryKey: ["item", itemId],
        queryFn: async () => (await api.get(`/items/${itemId}`)).data as Item,
    });

    function formatDate(dt?: string) {
        if (!dt) return "-";
        try {
            const d = new Date(dt + "T00:00:00");
            return d.toLocaleDateString("pt-BR");
        } catch {
            return dt;
        }
    }

    // fornecedores
    const [suppliers, setSuppliers] = useState<NearbySupplier[]>([]);
    const [suppliersOpen, setSuppliersOpen] = useState(false);
    const [suppliersLoading, setSuppliersLoading] = useState(false);
    const [suppliersError, setSuppliersError] = useState<string | null>(null);

    async function fetchSuppliersNearby() {
        setSuppliersError(null);
        setSuppliersLoading(true);
        try {
            const serviceKey = String(selectedItem?.itemType ?? "")
                .trim()
                .toUpperCase();

            if (!serviceKey) {
                throw new Error("Selecione um item para buscar prestadores.");
            }

            const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocalização não suportada pelo navegador."));
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (err) => reject(err),
                    { enableHighAccuracy: false, timeout: 8000 }
                );
            }).catch(() => {
                // fallback BH
                return { latitude: -19.9245, longitude: -43.9352 } as any;
            });

            const lat = (coords as any).latitude;
            const lng = (coords as any).longitude;

            const payload = { serviceKey, lat, lng, radiusKm: 20, limit: 5 };
            const res = await api.post<NearbyResponse>("/suppliers/nearby", payload);

            setSuppliers(res.data?.suppliers ?? []);
            setSuppliersOpen(true);
        } catch (e: any) {
            setSuppliersError(e?.message || "Falha ao buscar prestadores próximos.");
            setSuppliers([]);
            setSuppliersOpen(true);
        } finally {
            setSuppliersLoading(false);
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!itemId) {
            toast.error("Selecione um item.");
            return;
        }
        if (!performedAt) {
            toast.error("Informe a data da manutenção.");
            return;
        }

        const body = {
            performedAt,
            issuedBy: issuedBy || null,
            certificateNumber: certificateNumber || null,
            certificateValidUntil: certificateValidUntil || null,
            receiptUrl: receiptUrl || null,
        };

        try {
            setSaving(true);
            const { data } = await api.post(`/items/${itemId}/maintenances`, body);
            toast.success(`Manutenção registrada (ID: ${data?.id}).`);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 400) toast.error("Verifique os campos e tente novamente.");
            else toast.error("Não foi possível registrar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            {/* TOPO */}
            <div className="row align-items-center mb-4">
                <div className="col-4">
                    <Link className="btn btn-outline-secondary" href={backHref}>
                        ← Voltar
                    </Link>
                </div>

                <div className="col-4 text-center">
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Registrar Manutenção
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Selecione o item e registre a execução
                    </p>
                </div>

                <div className="col-4">
                    {/* Espaçador */}
                </div>
            </div>

            {/* PASSO 1: SELEÇÃO DO ITEM */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                        <div className="flex-grow-1">
                            <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                1) Selecionar item
                            </div>

                            <div className="d-flex gap-2 align-items-end">
                                <div className="flex-grow-1">
                                    <select
                                        className="form-select"
                                        value={itemId}
                                        onChange={(e) => setItemId(e.target.value)}
                                    >
                                        <option value="">Selecione um item…</option>
                                        {itemsCombo.map((it) => (
                                            <option key={String(it.id)} value={String(it.id)}>
                                                {it.itemType}
                                            </option>
                                        ))}
                                    </select>

                                    {/* paginação */}
                                    {!!itemsComboData && itemsComboData.totalPages > 1 && (
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-link p-0 text-decoration-none"
                                                onClick={() => setItemsPage((p) => Math.max(0, p - 1))}
                                                disabled={(itemsComboData?.number ?? 0) <= 0}
                                            >
                                                « Anterior
                                            </button>
                                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                            Pág. {(itemsComboData?.number ?? 0) + 1} / {itemsComboData.totalPages}
                        </span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-link p-0 text-decoration-none"
                                                onClick={() => setItemsPage((p) => p + 1)}
                                                disabled={
                                                    (itemsComboData?.number ?? 0) + 1 >= itemsComboData.totalPages
                                                }
                                            >
                                                Próxima »
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-warning"
                                    onClick={fetchSuppliersNearby}
                                    disabled={!itemId || suppliersLoading}
                                    title="Sugestões baseadas na localização e no tipo do item selecionado"
                                    style={{ height: "38px" }} // mesma altura do select (Bootstrap)
                                >
                                    {suppliersLoading ? "Buscando..." : "Ver prestadores"}
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* resumo do item selecionado */}
                    {itemId && (
                        <div
                            className="rounded p-3 mt-3"
                            style={{
                                backgroundColor: COLORS.white,
                                border: "1px solid rgba(0,0,0,0.06)",
                            }}
                        >
                            {selectedItemLoading ? (
                                <div className="text-muted">Carregando dados do item…</div>
                            ) : selectedItem ? (
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div>
                                        <div className="small text-muted">Item selecionado</div>
                                        <div className="fw-semibold">{selectedItem.itemType}</div>
                                        <div className="small text-muted">
                                            Categoria: {selectedItem.itemCategory} • Próximo venc.:{" "}
                                            {formatDate(selectedItem.nextDueAt)}
                                        </div>
                                    </div>
                                    <Link className="btn btn-sm btn-outline-secondary" href={`/items/${itemId}`}>
                                        Ver detalhe
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-muted">
                                    Item não encontrado (verifique o ID).
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* PASSO 2: REGISTRO */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="fw-semibold mb-3" style={{ color: COLORS.primaryDark }}>
                        2) Registrar manutenção
                    </div>

                    <form onSubmit={onSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label">Data da manutenção</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={performedAt}
                                    onChange={(e) => setPerformedAt(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-8">
                                <label className="form-label">Emitido por (opcional)</label>
                                <input
                                    className="form-control"
                                    value={issuedBy}
                                    onChange={(e) => setIssuedBy(e.target.value)}
                                    placeholder="Ex.: Empresa X"
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">Nº do certificado (opcional)</label>
                                <input
                                    className="form-control"
                                    value={certificateNumber}
                                    onChange={(e) => setCertificateNumber(e.target.value)}
                                    placeholder="Ex.: ABC-123"
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">Validade do certificado (opcional)</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={certificateValidUntil}
                                    onChange={(e) => setCertificateValidUntil(e.target.value)}
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">Comprovante URL (opcional)</label>
                                <input
                                    className="form-control"
                                    value={receiptUrl}
                                    onChange={(e) => setReceiptUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <button className="btn btn-primary" disabled={saving}>
                                {saving ? "Registrando..." : "Registrar"}
                            </button>
                            <Link className="btn btn-outline-secondary" href="/maintenances">
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* PRESTADORES (opcional) */}
            {suppliersOpen && (
                <div className="card border-0 shadow-sm mt-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h2 className="h6 m-0" style={{ color: COLORS.primaryDark }}>
                                Prestadores próximos
                            </h2>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setSuppliersOpen(false)}
                            >
                                Fechar
                            </button>
                        </div>

                        <p className="text-muted mb-3 small">
                            Sugestões baseadas na sua localização e no tipo do item selecionado.
                            O Easy Maintenance não se responsabiliza pela contratação, execução
                            e qualidade dos serviços prestados.
                        </p>

                        {suppliersError && (
                            <p className="small mb-3" style={{ color: COLORS.accent }}>
                                {suppliersError}
                            </p>
                        )}

                        {!suppliersError && suppliers.length === 0 && !suppliersLoading && (
                            <p className="text-muted small m-0">
                                Nenhum prestador encontrado para este serviço na região.
                            </p>
                        )}

                        {suppliersLoading && <p className="m-0">Buscando prestadores…</p>}

                        {!suppliersLoading && !suppliersError && suppliers.length > 0 && (
                            <div className="list-group">
                                {suppliers.map((s) => (
                                    <div key={s.placeId} className="list-group-item">
                                        <div className="fw-semibold">{s.name}</div>
                                        {s.address && (
                                            <div className="text-muted small">{s.address}</div>
                                        )}

                                        <div className="small mt-2">
                                            {typeof s.rating === "number" && (
                                                <span className="me-2">
                          Avaliação: {s.rating.toFixed(1)} ⭐
                        </span>
                                            )}
                                            {typeof s.userRatingsTotal === "number" && (
                                                <span className="text-muted">
                          ({s.userRatingsTotal} avaliações)
                        </span>
                                            )}
                                        </div>

                                        <div className="small mt-2">
                                            {s.phone && <span className="me-2">📞 {s.phone}</span>}
                                            {s.website && (
                                                <a
                                                    href={s.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="me-3"
                                                    style={{ color: COLORS.primary }}
                                                >
                                                    Site
                                                </a>
                                            )}
                                            {s.mapsUrl && (
                                                <a
                                                    href={s.mapsUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: COLORS.primary }}
                                                >
                                                    Ver no mapa
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* estilo do outline-warning sem depender do tema do bootstrap */}
            <style jsx global>{`
        .btn-outline-warning {
          border-color: ${COLORS.accent} !important;
          color: ${COLORS.accent} !important;
        }
        .btn-outline-warning:hover {
          background-color: ${COLORS.accent} !important;
          color: #fff !important;
        }
      `}</style>
        </section>
    );
}

export default function NewMaintenancePage() {
    return (
        <Suspense fallback={<p className="p-3 m-0">Carregando formulário...</p>}>
            <NewMaintenanceContent />
        </Suspense>
    );
}