"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import StatusPill from "@/components/StatusPill";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
    white: "#FFFFFF",
};

export default function ItemDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading, error } = useQuery({
        queryKey: ["item", id],
        queryFn: async () => (await api.get(`/items/${id}`)).data,
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

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            {/* TOPO */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Detalhe do Item
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Informações, status e periodicidade
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <Link className="btn btn-outline-secondary" href="/items">
                        ← Voltar
                    </Link>
                    <Link
                        className="btn btn-primary"
                        href={`/maintenances/new?itemId=${id}`}
                    >
                        Registrar Manutenção
                    </Link>
                </div>
            </div>

            {/* CARD PRINCIPAL */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    {isLoading && <p className="m-0">Carregando…</p>}
                    {error && (
                        <p className="m-0 text-danger">
                            Erro ao carregar informações do item.
                        </p>
                    )}

                    {!isLoading && !error && data && (
                        <>
                            {/* CABEÇALHO DO ITEM */}
                            <div className="row g-3 align-items-center mb-3">
                                <div className="col">
                                    <div className="text-muted small">Tipo do item</div>
                                    <div className="fw-semibold fs-5">{data.itemType}</div>
                                </div>

                                <div className="col-auto text-end">
                                    <div className="text-muted small">Status</div>
                                    <StatusPill status={data.status} />
                                </div>
                            </div>

                            <hr />

                            {/* DADOS PRINCIPAIS */}
                            <div className="row g-3 mb-3">
                                <div className="col-12 col-md-4">
                                    <div className="text-muted small">Categoria</div>
                                    <div className="fw-medium">{data.itemCategory}</div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="text-muted small">Próximo vencimento</div>
                                    <div
                                        className="fw-medium"
                                        style={{
                                            color:
                                                data.status === "OVERDUE"
                                                    ? COLORS.accent
                                                    : COLORS.primaryDark,
                                        }}
                                    >
                                        {formatDate(data.nextDueAt)}
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="text-muted small">Última manutenção</div>
                                    <div className="fw-medium">
                                        {formatDate(data.lastPerformedAt)}
                                    </div>
                                </div>
                            </div>

                            {/* LOCALIZAÇÃO */}
                            {data.location && (
                                <div className="mb-4">
                                    <div className="text-muted small mb-1">Localização</div>
                                    <pre
                                        className="small p-3 rounded mb-0"
                                        style={{
                                            backgroundColor: COLORS.white,
                                            border: "1px solid rgba(0,0,0,0.05)",
                                        }}
                                    >
                    {JSON.stringify(data.location, null, 2)}
                  </pre>
                                </div>
                            )}

                            {/* PERIODICIDADE */}
                            <div className="row g-3 mb-3">
                                {data.itemCategory === "REGULATORY" ? (
                                    <>
                                        <div className="col-12 col-md-4">
                                            <div className="text-muted small">Norma</div>
                                            <div className="fw-medium">
                                                {data.normId ?? "-"}
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-8 d-flex align-items-end">
                                            <div className="small text-muted">
                                                Periodicidade definida conforme norma regulatória.
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-12 col-md-4">
                                            <div className="text-muted small">
                                                Unidade de periodicidade
                                            </div>
                                            <div className="fw-medium">
                                                {data.customPeriodUnit}
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <div className="text-muted small">
                                                Quantidade
                                            </div>
                                            <div className="fw-medium">
                                                {data.customPeriodQty}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <hr />

                            {/* RODAPÉ TÉCNICO */}
                            <div className="text-muted small">
                                ID: <code>{data.id}</code> • Organização:{" "}
                                <code>{data.organizationId}</code>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}