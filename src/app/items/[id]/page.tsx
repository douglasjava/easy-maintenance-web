"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import StatusPill from "@/components/StatusPill";
import { categoryLabelMap } from "@/lib/enums/labels";
import toast from "react-hot-toast";
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
    white: "#FFFFFF",
};

export default function ItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();

    const origin = searchParams.get("origin");
    let backHref = "/items";
    if (origin === "dashboard") backHref = "/";
    if (origin === "maintenance-new")
        backHref = `/maintenances/new?itemId=${id}&origin=item-detail`;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["item", id],
        queryFn: async () => {
            const [itemRes, permRes] = await Promise.all([
                api.get(`/items/${id}`),
                api.get(`/items/${id}/can-update`).catch(() => ({ data: { canUpdate: false } }))
            ]);
            return { ...itemRes.data, ...permRes.data };
        },
    });

    function handleDelete() {
        setShowDeleteModal(true);
    }

    async function confirmDelete() {
        try {
            setDeleting(true);
            await api.delete(`/items/${id}`);
            toast.success("Item removido com sucesso.");
            router.push("/items");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover item.");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
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

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <ConfirmModal
                show={showDeleteModal}
                title="Confirmar exclusão"
                message={
                    <p className="mb-0">
                        Deseja realmente remover o item{" "}
                        <strong>{data?.itemType}</strong>?<br />
                        Esta ação não pode ser desfeita.
                    </p>
                }
                confirmLabel="Remover"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
            {/*
                PATTERN: Top navigation only
                WHY: This is a read-only detail page. According to UX Rule 4, we should not duplicate
                actions on read-only pages. Structural navigation (Back) and the main action
                (Register Maintenance, which leads to another flow) belong in the header.
            */}
            <div className="row align-items-center mb-4">
                <div className="col-4">
                    <Link className="btn btn-outline-secondary" href={backHref}>
                        ← Voltar para listagem
                    </Link>
                </div>

                <div className="col-4 text-center">
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Detalhe do Item
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Informações, status e periodicidade
                    </p>
                </div>

                <div className="col-4 text-end">
                    {data?.canUpdate ? (
                        <Link
                            className="btn btn-outline-primary me-2"
                            href={`/items/new?id=${id}&origin=item-detail`}
                        >
                            Editar
                        </Link>
                    ) : (
                        <button
                            className="btn btn-outline-secondary me-2"
                            disabled
                            title="Edição indisponível: este item possui manutenções registradas. Crie um novo item."
                        >
                            Editar
                        </button>
                    )}
                    <button
                        className="btn btn-outline-danger me-2"
                        onClick={handleDelete}
                    >
                        Remover
                    </button>

                    <Link
                        className="btn btn-primary"
                        href={`/maintenances/new?itemId=${id}&origin=item-detail`}
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
                                    <div className="text-muted small">
                                        Tipo do item
                                    </div>
                                    <div className="fw-semibold fs-5">
                                        {data.itemType}
                                    </div>
                                </div>

                                <div className="col-auto text-end">
                                    <div className="text-muted small">
                                        Status
                                    </div>
                                    <StatusPill status={data.status} />
                                </div>
                            </div>

                            <hr />

                            {/* DADOS PRINCIPAIS */}
                            <div className="row g-3 mb-3">
                                <div className="col-12 col-md-4">
                                    <div className="text-muted small">
                                        Categoria
                                    </div>
                                    <div className="fw-medium">
                                        {
                                            categoryLabelMap[
                                                data.itemCategory
                                                ]
                                        }
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="text-muted small">
                                        Próximo vencimento
                                    </div>
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
                                    <div className="text-muted small">
                                        Última manutenção
                                    </div>
                                    <div className="fw-medium">
                                        {formatDate(
                                            data.lastPerformedAt
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* LOCALIZAÇÃO */}
                            {data.location && (
                                <div className="mb-4">
                                    <div className="text-muted small mb-1">
                                        Localização
                                    </div>
                                    <div className="fw-medium">
                                        {data.location.address || "-"}
                                        {data.location.complement
                                            ? ` • ${data.location.complement}`
                                            : ""}
                                    </div>
                                </div>
                            )}

                            {/* PERIODICIDADE */}
                            <div className="row g-3 mb-3">
                                {data.itemCategory === "REGULATORY" ? (
                                    <>
                                        <div className="col-12 col-md-4">
                                            <div className="text-muted small">
                                                Norma
                                            </div>
                                            <div className="fw-medium">
                                                {data.normName ?? "-"}
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-8 d-flex align-items-end">
                                            <div className="small text-muted">
                                                Periodicidade definida conforme
                                                norma regulatória.
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
                        </>
                    )}
                </div>
            </div>

            {/* MODAL DE CONFIRMAÇÃO */}
            {showDeleteModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered" style={{ zIndex: 1060 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger">
                                    Confirmar exclusão
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    disabled={deleting}
                                />
                            </div>

                            <div className="modal-body">
                                <p className="mb-0">
                                    Deseja realmente remover este item?
                                    <br />
                                    <strong>
                                        Esta ação não pode ser desfeita.
                                    </strong>
                                </p>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    disabled={deleting}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting
                                        ? "Removendo..."
                                        : "Remover"}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
                </div>
            )}
        </section>
    );
}