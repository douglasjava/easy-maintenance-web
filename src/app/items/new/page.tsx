"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import AsyncCreatableSelect from "react-select/async-creatable";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

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
    address: "",
    complement: "",

    // regulatory
    normId: "",
    normName: "",

    // operational
    customPeriodUnit: "MESES",
    customPeriodQty: 6,
};

function NewItemContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const origin = searchParams.get("origin");
    const editId = searchParams.get("id");
    const backHref = origin === "dashboard" ? "/" : "/items";

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isCreatingType, setIsCreatingType] = useState(false);

    useEffect(() => {
        if (editId) {
            api.get(`/items/${editId}`).then((res) => {
                const item = res.data;
                setFormData({
                    itemType: item.itemType,
                    itemCategory: item.itemCategory,
                    lastPerformedAt: item.lastPerformedAt || "",
                    address: item.location?.address || "",
                    complement: item.location?.complement || "",
                    normId: item.norm?.id?.toString() || "",
                    normName: item.norm?.itemType || "",
                    customPeriodUnit: item.customPeriodUnit || "MESES",
                    customPeriodQty: item.customPeriodQty || 6,
                });
            }).catch((err) => {
                console.error("Erro ao carregar item para edição", err);
                toast.error("Erro ao carregar dados do item.");
            });
        }
    }, [editId]);

    const loadOptions = useCallback(async (inputValue: string) => {
        if (!inputValue) return [];
        try {
            const res = await api.get(`/item-types?name=${inputValue}`);
            const data = res.data;
            const items = Array.isArray(data) ? data : (data.content || []);
            return items.map((it: any) => ({
                label: it.name,
                value: it.name
            }));
        } catch (error) {
            console.error("Erro ao buscar tipos de itens", error);
            return [];
        }
    }, []);

    const handleCreateType = async (inputValue: string) => {
        setIsCreatingType(true);
        try {
            const res = await api.post("/item-types", { name: inputValue.toUpperCase() });
            const newType = res.data.name;
            setFormData((p) => ({ ...p, itemType: newType }));
            toast.success(`Tipo do item "${newType}" criado com sucesso!`);
        } catch (error) {
            console.error("Erro ao criar tipo de item", error);
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(`Erro ao criar tipo: ${axiosError.response?.data?.message || "Erro desconhecido"}`);
        } finally {
            setIsCreatingType(false);
        }
    };

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
        setFormData(EMPTY_FORM);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        const itemType = formData.itemType.toUpperCase().trim();

        const payload: any = {
            itemType,
            itemCategory: formData.itemCategory,
            location: {
                address: formData.address?.trim() || undefined,
                complement: formData.complement?.trim() || undefined,
            },
            lastPerformedAt: formData.lastPerformedAt || null,
        };

        if (!payload.itemType) {
            toast.error("Informe o tipo do item.");
            return;
        }

        if (payload.itemCategory === "REGULATORY") {
            payload.normId = formData.normId;
            if (!payload.normId) {
                toast.error("Selecione uma norma.");
                return;
            }
        } else {
            payload.customPeriodUnit = formData.customPeriodUnit;
            payload.customPeriodQty = Number(formData.customPeriodQty);

            if (!payload.customPeriodQty || payload.customPeriodQty < 1) {
                toast.error("Informe uma quantidade válida.");
                return;
            }
        }

        try {
            setLoading(true);
            if (editId) {
                await api.put(`/items/${editId}`, payload);
                toast.success("Item atualizado com sucesso");
                router.push(backHref);
            } else {
                await api.post("/items", payload);
                toast.success("Item criado com sucesso");
                setFormData(EMPTY_FORM); // ✅ limpa de forma correta
            }
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 400) {
                toast.error("Verifique os campos e tente novamente.");
            } else {
                toast.error(`Não foi possível ${editId ? 'atualizar' : 'criar'} o item. Tente novamente.`);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            {/* 
                PATTERN: Top + Footer
                WHY: Although it's a single-step form, it involves significant data entry and selection 
                (Long reading/review logic). Following Rule 3, we use Top for structural back 
                and Footer for flow actions (Create/Clear).
            */}
            <div className="row align-items-center mb-4">
                <div className="col-4">
                    <Link className="btn btn-outline-secondary" href={backHref}>
                        ← Voltar para listagem
                    </Link>
                </div>

                <div className="col-4 text-center">
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        {editId ? "Editar Item" : "Novo Item"}
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        {editId ? "Atualize as informações do item" : "Cadastre itens regulatórios ou operacionais"}
                    </p>
                </div>

                <div className="col-4">
                    {/* Espaçador para manter o título centralizado */}
                </div>
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
                            <AsyncCreatableSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadOptions}
                                onCreateOption={handleCreateType}
                                onChange={(opt: any) =>
                                    setFormData((p) => ({ ...p, itemType: opt?.value || "" }))
                                }
                                value={formData.itemType ? { label: formData.itemType, value: formData.itemType } : null}
                                placeholder="Selecione ou digite para criar (EXTINTOR, SPDA...)"
                                loadingMessage={() => "Buscando..."}
                                noOptionsMessage={() => "Nenhum tipo encontrado"}
                                formatCreateLabel={(inputValue) => `Criar "${inputValue.toUpperCase()}"`}
                                isDisabled={loading || isCreatingType}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: "#dee2e6",
                                        "&:hover": { borderColor: COLORS.primary }
                                    })
                                }}
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
                                    max={new Date().toISOString().split("T")[0]}
                                    value={formData.lastPerformedAt}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const today = new Date().toISOString().split("T")[0];

                                        if (value && value > today) return;

                                        setFormData((p) => ({ ...p, lastPerformedAt: value }));
                                    }}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* REGULATORY */}
                        {category === "REGULATORY" && (
                            <div className="mt-4">
                                <label className="form-label">Norma</label>

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

                        {/* 
                            PATTERN: Footer actions
                            WHY: Flow actions (Create/Clear) are placed at the end of the form.
                        */}
                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? "Salvando..." : editId ? "Atualizar item" : "Criar novo item"}
                            </button>

                            {!editId && (
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={onReset}
                                    disabled={loading}
                                >
                                    Limpar formulário
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default function NewItemPage() {
    return (
        <Suspense fallback={<p className="p-3 m-0">Carregando formulário...</p>}>
            <NewItemContent />
        </Suspense>
    );
}