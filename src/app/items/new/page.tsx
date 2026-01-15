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

type Category = "REGULATORY" | "OPERATIONAL";

const EMPTY_FORM = {
    itemType: "",
    itemCategory: "REGULATORY" as Category,
    lastPerformedAt: "",

    // location
    bloco: "",
    andar: "",
    ponto: "",

    // regulatory
    normId: "",

    // operational
    customPeriodUnit: "MESES",
    customPeriodQty: 6,
};

export default function NewItemPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const category = formData.itemCategory;

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

    function onReset() {
        setMsg(null);
        setFormData(EMPTY_FORM);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMsg(null);

        const itemType = formData.itemType.toUpperCase().trim();

        const payload: any = {
            itemType,
            itemCategory: formData.itemCategory,
            location: {
                bloco: formData.bloco?.trim() || undefined,
                andar: formData.andar?.trim() || undefined,
                ponto: formData.ponto?.trim() || undefined,
            },
            lastPerformedAt: formData.lastPerformedAt || null,
        };

        if (!payload.itemType) {
            setMsg("❌ Informe o tipo do item.");
            return;
        }

        if (payload.itemCategory === "REGULATORY") {
            payload.normId = formData.normId;
            if (!payload.normId) {
                setMsg("❌ Selecione uma norma.");
                return;
            }
        } else {
            payload.customPeriodUnit = formData.customPeriodUnit;
            payload.customPeriodQty = Number(formData.customPeriodQty);

            if (!payload.customPeriodQty || payload.customPeriodQty < 1) {
                setMsg("❌ Informe uma quantidade válida.");
                return;
            }
        }

        try {
            setLoading(true);
            const { data } = await api.post("/items", payload);
            setMsg(`✔️ Item criado com sucesso (ID: ${data?.id}).`);
            setFormData(EMPTY_FORM); // ✅ limpa de forma correta
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
                                value={formData.itemType}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, itemType: e.target.value }))
                                }
                                required
                                disabled={loading}
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
                                    value={formData.itemCategory}
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            itemCategory: e.target.value as Category,
                                            // ao trocar categoria, opcionalmente limpa campos específicos
                                            normId: e.target.value === "REGULATORY" ? p.normId : "",
                                        }))
                                    }
                                    disabled={loading}
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
                                    value={formData.lastPerformedAt}
                                    onChange={(e) =>
                                        setFormData((p) => ({ ...p, lastPerformedAt: e.target.value }))
                                    }
                                    disabled={loading}
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
                                    <input
                                        name="bloco"
                                        className="form-control"
                                        value={formData.bloco}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, bloco: e.target.value }))
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Andar</label>
                                    <input
                                        name="andar"
                                        className="form-control"
                                        value={formData.andar}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, andar: e.target.value }))
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Ponto / Referência</label>
                                    <input
                                        name="ponto"
                                        className="form-control"
                                        value={formData.ponto}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, ponto: e.target.value }))
                                        }
                                        disabled={loading}
                                    />
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
                                            disabled={loading}
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
                                            value={formData.normId}
                                            onChange={(e) =>
                                                setFormData((p) => ({ ...p, normId: e.target.value }))
                                            }
                                            disabled={loading}
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
                                            value={formData.customPeriodUnit}
                                            onChange={(e) =>
                                                setFormData((p) => ({ ...p, customPeriodUnit: e.target.value }))
                                            }
                                            required
                                            disabled={loading}
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
                                            value={formData.customPeriodQty}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    customPeriodQty: Number(e.target.value || 0),
                                                }))
                                            }
                                            required
                                            disabled={loading}
                                        />
                                        <div className="form-text">Ex.: 6 meses, 30 dias, etc.</div>
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
                                type="button"
                                onClick={onReset}
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