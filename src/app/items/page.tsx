"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api } from "@/lib/apiClient";
import StatusPill from "@/components/StatusPill";
import Pagination from "@/components/Pagination";
import {categoryLabelMap} from "@/lib/enums/labels";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
    white: "#FFFFFF",
};

type Item = {
    id: string;
    itemType: string;
    itemCategory: "REGULATORY" | "OPERATIONAL";
    status: "OK" | "NEAR_DUE" | "OVERDUE";
    nextDueAt: string;
};

type PageResp<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
};

function ItemsContent() {
    const searchParams = useSearchParams();
    const origin = searchParams.get("origin");
    const backHref = origin === "dashboard" ? "/" : "/"; // Por enquanto listagem sempre volta pro dashboard ou root

    const [status, setStatus] = useState<string>("");
    const [categoria, setCategoria] = useState<string>("");
    const [itemType, setItemType] = useState<string>("");
    const [page, setPage] = useState(0);
    const size = 10;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["items", { status, itemType, categoria, page, size }],
        queryFn: async () => {
            const params: Record<string, any> = { page, size };
            if (status) params.status = status;
            if (categoria) params.categoria = categoria;
            if (itemType) params.itemType = itemType;
            const res = await api.get("/items", { params });

            if (Array.isArray(res.data)) {
                return {
                    content: res.data as Item[],
                    totalPages: 1,
                    totalElements: res.data.length,
                    number: 0,
                    size: res.data.length,
                } as PageResp<Item>;
            }
            return res.data as PageResp<Item>;
        },
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
            <div className="row align-items-center mb-4">
                <div className="col-4">
                    <Link className="btn btn-outline-secondary btn-sm" href={backHref}>
                        ← Voltar
                    </Link>
                </div>

                <div className="col-4 text-center">
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Itens
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Controle de itens operacionais e regulatórios
                    </p>
                </div>

                <div className="col-4 text-end">
                    <Link className="btn btn-primary" href="/items/new?origin=items">
                        + Novo Item
                    </Link>
                </div>
            </div>

            {/* FILTROS */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setPage(0);
                            refetch();
                        }}
                    >
                        <div className="row g-3 align-items-end">

                            <div className="col-12 col-md-2">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="OK">Em dia</option>
                                    <option value="NEAR_DUE">Vencendo</option>
                                    <option value="OVERDUE">Atrasado</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-2">
                                <label className="form-label">Categoria</label>
                                <select
                                    className="form-select"
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="REGULATORY">Regulatório</option>
                                    <option value="OPERATIONAL">Operacional</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label">Nome do item</label>
                                <input
                                    className="form-control"
                                    placeholder="EXTINTOR / SPDA / CAIXA_DAGUA..."
                                    value={itemType}
                                    onChange={(e) => setItemType(e.target.value.toUpperCase())}
                                />
                            </div>

                            <div className="col-12 col-md-2">
                                <button
                                    className="btn btn-outline-primary w-100"
                                    type="submit"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* TABELA */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {isLoading && <p className="p-3 m-0">Carregando…</p>}
                    {error && (
                        <p className="p-3 m-0 text-danger">
                            Erro ao carregar itens.
                        </p>
                    )}

                    {!isLoading && !error && (
                        <>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead style={{ backgroundColor: "#F9FAFB" }}>
                                    <tr>
                                        <th>Item</th>
                                        <th>Categoria</th>
                                        <th>Próximo vencimento</th>
                                        <th>Status</th>
                                        <th />
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(data?.content ?? []).map((it) => (
                                        <tr key={it.id}>
                                            <td className="fw-semibold">{it.itemType}</td>
                                            <td className="text-muted">{categoryLabelMap[it.itemCategory]}</td>
                                            <td>{formatDate(it.nextDueAt)}</td>
                                            <td>
                                                <StatusPill status={it.status} />
                                            </td>
                                            <td className="text-end">
                                                <Link
                                                    className="btn btn-sm btn-outline-secondary"
                                                    href={`/items/${it.id}?origin=items`}
                                                >
                                                    Abrir
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {data?.content?.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-muted text-center py-4"
                                            >
                                                Nenhum item encontrado.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINAÇÃO */}
                            <div className="px-3 py-3 border-top">
                                <Pagination
                                    page={data?.number ?? 0}
                                    size={data?.size ?? 10}
                                    totalPages={data?.totalPages ?? 1}
                                    onChange={setPage}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function ItemsPage() {
    return (
        <Suspense fallback={<p className="p-3 m-0">Carregando listagem...</p>}>
            <ItemsContent />
        </Suspense>
    );
}