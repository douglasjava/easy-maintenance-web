"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
    white: "#FFFFFF",
};

type Norm = {
    id: string;
    itemType: string;
    periodUnit: string;
    periodQty: number;
    toleranceDays?: number;
    authority?: string;
    docUrl?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
};

export default function NewItemPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [category, setCategory] = useState<"REGULATORY" | "OPERATIONAL">(
        "REGULATORY"
    );

    const {
        data: norms,
        isLoading: normsLoading,
        error: normsError,
        refetch: refetchNorms,
    } = useQuery<Norm[]>({
        queryKey: ["norms"],
        queryFn: async () => {
            const res = await api.get("/norms");
            const d = res.data;
            if (Array.isArray(d)) return d as Norm[];
            if (d && Array.isArray(d.content)) return d.content as Norm[];
            return d ? [d as Norm] : [];
        },
    });

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMsg(null);

        const form = new FormData(e.currentTarget);

        const itemType = String(form.get("itemType") ?? "")
            .toUpperCase()
            .trim();

        const payload: any = {
            itemType,
            itemCategory: String(form.get("itemCategory")),
            location: {
                bloco: form.get("bloco") || undefined,
                andar: form.get("andar") || undefined,
                ponto: form.get("ponto") || undefined,
            },
            lastPerformedAt: form.get("lastPerformedAt") || null,
        };

        if (!payload.itemType) {
            setMsg("❌ Informe o tipo do item.");
            return;
        }

        if (payload.itemCategory === "REGULATORY") {
            payload.normId = form.get("normId");
            if (!payload.normId) {
                setMsg("❌ Selecione uma norma.");
                return;
            }
        } else {
            payload.customPeriodUnit = form.get("customPeriodUnit");
            payload.customPeriodQty = Number(form.get("customPeriodQty"));
            if (!payload.customPeriodQty || payload.customPeriodQty < 1) {
                setMsg("❌ Informe uma quantidade válida.");
                return;
            }
        }

        try {
            setLoading(true);
            const { data } = await api.post("/items", payload);
            setMsg(`✔️ Item criado com sucesso (ID: ${data?.id}).`);
            e.currentTarget.reset();
            setCategory("REGULATORY");
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 400) {
                setMsg("❌ Verifique os campos e tente novamente.");
            } else {
                setMsg("❌ Não foi possível criar o item. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            {/* TOPO */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Novo Item
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Cadastre itens regulatórios ou operacionais
                    </p>
                </div>

                <Link className="btn btn-outline-secondary" href="/items">
                    ← Voltar
                </Link>
            </div>

            {/* CARD */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    {/* Dica rápida (UX) */}
                    <div
                        className="rounded p-3 mb-3"
                        style={{
                            backgroundColor: "rgba(11, 94, 215, 0.08)",
                            border: "1px solid rgba(11, 94, 215, 0.18)",
                        }}
                    >
                        <div className="small" style={{ color: COLORS.primaryDark }}>
                            Dica: use <b>Regulatória</b> para itens com norma e validade (ex:
                            AVCB, elevador, SPDA). Use <b>Operacional</b> para rotinas internas
                            (ex: limpeza, inspeções).
                        </div>
                    </div>

                    <form onSubmit={onSubmit}>
                        {/* Tipo */}
                        <div className="mb-3">
                            <label className="form-label">Tipo do item</label>
                            <input
                                name="itemType"
                                className="form-control"
                                placeholder="EXTINTOR / SPDA / CAIXA_DAGUA ..."
                                required
                            />
                            <div className="form-text">
                                Dica: escreva em poucas palavras e de forma padronizada.
                            </div>
                        </div>

                        {/* Categoria + Última manutenção */}
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label">Categoria</label>
                                <select
                                    name="itemCategory"
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as any)}
                                >
                                    <option value="REGULATORY">Regulatória</option>
                                    <option value="OPERATIONAL">Operacional</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label">Última manutenção (opcional)</label>
                                <input
                                    name="lastPerformedAt"
                                    type="date"
                                    className="form-control"
                                />
                            </div>
                        </div>

                        {/* Localização */}
                        <div className="mt-3">
                            <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                Localização (opcional)
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Bloco</label>
                                    <input name="bloco" className="form-control" />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Andar</label>
                                    <input name="andar" className="form-control" />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Ponto / Referência</label>
                                    <input name="ponto" className="form-control" />
                                </div>
                            </div>
                        </div>

                        {/* REGULATORY */}
                        {category === "REGULATORY" && (
                            <div className="mt-4">
                                <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                    Norma
                                </div>

                                {normsLoading ? (
                                    <p className="form-text m-0">Carregando normas…</p>
                                ) : normsError ? (
                                    <p className="text-danger m-0">
                                        Erro ao carregar normas.{" "}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 align-baseline"
                                            onClick={() => refetchNorms()}
                                        >
                                            Tentar novamente
                                        </button>
                                    </p>
                                ) : (
                                    <>
                                        <select
                                            name="normId"
                                            className="form-select"
                                            required
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Selecione uma norma
                                            </option>
                                            {(norms ?? []).map((n) => (
                                                <option key={n.id} value={n.id}>
                                                    {n.itemType}
                                                    {n.authority ? ` • ${n.authority}` : ""}
                                                    {typeof n.periodQty === "number" && n.periodUnit
                                                        ? ` • ${n.periodQty} ${n.periodUnit.toLowerCase()}`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="form-text">
                                            As normas vêm de <code>/norms</code>. O ID selecionado será
                                            enviado como <code>normId</code>.
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* OPERATIONAL */}
                        {category === "OPERATIONAL" && (
                            <div className="mt-4">
                                <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                    Periodicidade (Operacional)
                                </div>

                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Unidade</label>
                                        <select
                                            name="customPeriodUnit"
                                            className="form-select"
                                            defaultValue="MESES"
                                            required
                                        >
                                            <option value="MESES">Meses</option>
                                            <option value="DIAS">Dias</option>
                                        </select>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Quantidade</label>
                                        <input
                                            name="customPeriodQty"
                                            className="form-control"
                                            type="number"
                                            min={1}
                                            defaultValue={6}
                                            required
                                        />
                                        <div className="form-text">
                                            Ex.: 6 meses, 30 dias, etc.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AÇÕES */}
                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? "Criando..." : "Criar item"}
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                type="reset"
                                onClick={() => setMsg(null)}
                                disabled={loading}
                            >
                                Limpar
                            </button>
                        </div>

                        {/* MENSAGEM */}
                        {msg && (
                            <p
                                className="small mt-3 mb-0"
                                style={{
                                    color: msg.startsWith("✔️") ? COLORS.primaryDark : COLORS.accent,
                                    fontWeight: 600,
                                }}
                                role="status"
                                aria-live="polite"
                            >
                                {msg}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}