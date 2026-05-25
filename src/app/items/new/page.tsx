"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import AsyncCreatableSelect from "react-select/async-creatable";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import { PagePermissionGuard } from "@/components/access/PagePermissionGuard";

type Norm = {
  id: string;
  itemType: string;
  periodUnit: string;
  periodQty: number;
  toleranceDays?: number;
  authority?: string;
  docUrl?: string;
  notes?: string;
};

type Category = "REGULATORY" | "OPERATIONAL";

const EMPTY_FORM = {
  itemType: "",
  itemCategory: "REGULATORY" as Category,
  lastPerformedAt: "",
  address: "",
  complement: "",
  normId: "",
  normName: "",
  customPeriodUnit: "MESES",
  customPeriodQty: 6,
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 4,
  display: "block",
};

function NewItemContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const origin = searchParams.get("origin");
  const editId = searchParams.get("id");
  const backHref = origin === "dashboard" ? "/" : "/items";

  const { permissions } = useCurrentOrganizationAccess();
  const isAllowed = editId ? permissions?.canEditItem : permissions?.canCreateItem;

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
      }).catch(() => toast.error("Erro ao carregar dados do item."));
    }
  }, [editId]);

  const loadOptions = useCallback(async (inputValue: string) => {
    if (!inputValue) return [];
    try {
      const res = await api.get(`/item-types?name=${inputValue}`);
      const data = res.data;
      const items = Array.isArray(data) ? data : (data.content || []);
      return items.map((it: any) => ({ label: it.name, value: it.name }));
    } catch {
      return [];
    }
  }, []);

  const handleCreateType = async (inputValue: string) => {
    setIsCreatingType(true);
    try {
      const res = await api.post("/item-types", { name: inputValue.toUpperCase() });
      const newType = res.data.name;
      setFormData((p) => ({ ...p, itemType: newType }));
      toast.success(`Tipo "${newType}" criado com sucesso!`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(`Erro ao criar tipo: ${axiosError.response?.data?.message || "Erro desconhecido"}`);
    } finally {
      setIsCreatingType(false);
    }
  };

  const category = formData.itemCategory;

  const { data: norms, isLoading: normsLoading, error: normsError, refetch: refetchNorms } = useQuery<Norm[]>({
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
        setFormData(EMPTY_FORM);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const backendDetail = err?.response?.data?.detail;
      if (status === 400 && backendDetail) toast.error(backendDetail);
      else if (status === 400) toast.error("Verifique os campos e tente novamente.");
      else toast.error(`Não foi possível ${editId ? "atualizar" : "criar"} o item. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PagePermissionGuard allowed={isAllowed} redirectHref={backHref}>
      <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
        <div className="container px-3 px-md-4">

          {/* ── HEADER ── */}
          <div className="pt-4 pb-3">
            <Link
              href={backHref}
              className="d-inline-flex align-items-center gap-1 text-decoration-none mb-3"
              style={{ color: "#6b7280", fontSize: "0.8rem" }}
            >
              ← {backHref === "/" ? "Dashboard" : "Itens"}
            </Link>

            <h1
              style={{
                fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {editId ? "Editar Item" : "Novo Item"}
            </h1>
            <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
              {editId ? "Atualize as informações do item" : "Cadastre itens regulatórios ou operacionais"}
            </p>
          </div>

          {/* ── FORM CARD ── */}
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: 10, maxWidth: 760 }}
          >
            <div className="card-body p-4">

              {/* Hint */}
              <div
                className="rounded-3 px-3 py-2 mb-4"
                style={{
                  borderLeft: "3px solid #2563eb",
                  backgroundColor: "#eff6ff",
                }}
              >
                <p className="mb-0" style={{ fontSize: "0.82rem", color: "#1e40af" }}>
                  Use <strong>Regulatória</strong> para itens com norma e validade (ex: AVCB, elevador, SPDA).
                  Use <strong>Operacional</strong> para rotinas internas (ex: limpeza, inspeções).
                </p>
              </div>

              <form onSubmit={onSubmit} noValidate>

                {/* Tipo do item */}
                <div className="mb-4">
                  <label style={LABEL_STYLE}>Tipo do item</label>
                  <AsyncCreatableSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadOptions}
                    onCreateOption={handleCreateType}
                    onChange={(opt: any) =>
                      setFormData((p) => ({ ...p, itemType: opt?.value || "" }))
                    }
                    value={formData.itemType ? { label: formData.itemType, value: formData.itemType } : null}
                    placeholder="Selecione ou digite para criar (EXTINTOR, SPDA…)"
                    loadingMessage={() => "Buscando…"}
                    noOptionsMessage={() => "Nenhum tipo encontrado"}
                    formatCreateLabel={(v) => `Criar "${v.toUpperCase()}"`}
                    isDisabled={loading || isCreatingType}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
                        boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13,110,253,.25)" : "none",
                        borderRadius: 6,
                        minHeight: 38,
                        "&:hover": { borderColor: "#86b7fe" },
                      }),
                      placeholder: (base) => ({ ...base, color: "#9ca3af", fontSize: "0.875rem" }),
                      singleValue: (base) => ({ ...base, fontSize: "0.875rem" }),
                      option: (base) => ({ ...base, fontSize: "0.875rem" }),
                    }}
                  />
                  <div className="form-text mt-1" style={{ fontSize: "0.75rem" }}>
                    Escreva de forma padronizada. Ex: EXTINTOR_CO2, CAIXA_DAGUA.
                  </div>
                </div>

                {/* Categoria + Última manutenção */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-sm-6">
                    <label style={LABEL_STYLE}>Categoria</label>
                    <select
                      className="form-select"
                      value={formData.itemCategory}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          itemCategory: e.target.value as Category,
                          normId: e.target.value === "REGULATORY" ? p.normId : "",
                        }))
                      }
                      disabled={loading}
                    >
                      <option value="REGULATORY">Regulatória</option>
                      <option value="OPERATIONAL">Operacional</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label style={LABEL_STYLE}>Última manutenção <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                    <input
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

                {/* ── REGULATORY ── */}
                {category === "REGULATORY" && (
                  <div
                    className="rounded-3 p-3 mb-4"
                    style={{ border: "1px solid #e5e7eb", backgroundColor: "#fafafa" }}
                  >
                    <div
                      style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}
                    >
                      Periodicidade — Regulatória
                    </div>

                    <label style={LABEL_STYLE}>Norma</label>
                    {normsLoading ? (
                      <div className="placeholder-glow">
                        <span className="placeholder rounded w-100" style={{ height: 38 }} />
                      </div>
                    ) : normsError ? (
                      <div style={{ fontSize: "0.82rem", color: "#dc2626" }}>
                        Erro ao carregar normas.{" "}
                        <button
                          type="button"
                          className="btn btn-link p-0 align-baseline"
                          style={{ fontSize: "0.82rem" }}
                          onClick={() => refetchNorms()}
                        >
                          Tentar novamente
                        </button>
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        required
                        value={formData.normId}
                        onChange={(e) => setFormData((p) => ({ ...p, normId: e.target.value }))}
                        disabled={loading}
                      >
                        <option value="" disabled>Selecione uma norma</option>
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
                    )}
                  </div>
                )}

                {/* ── OPERATIONAL ── */}
                {category === "OPERATIONAL" && (
                  <div
                    className="rounded-3 p-3 mb-4"
                    style={{ border: "1px solid #e5e7eb", backgroundColor: "#fafafa" }}
                  >
                    <div
                      style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}
                    >
                      Periodicidade — Operacional
                    </div>

                    <div className="row g-3">
                      <div className="col-6">
                        <label style={LABEL_STYLE}>Unidade</label>
                        <select
                          className="form-select"
                          value={formData.customPeriodUnit}
                          onChange={(e) => setFormData((p) => ({ ...p, customPeriodUnit: e.target.value }))}
                          required
                          disabled={loading}
                        >
                          <option value="MESES">Meses</option>
                          <option value="DIAS">Dias</option>
                        </select>
                      </div>

                      <div className="col-6">
                        <label style={LABEL_STYLE}>Quantidade</label>
                        <input
                          className="form-control"
                          type="number"
                          min={1}
                          value={formData.customPeriodQty}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, customPeriodQty: Number(e.target.value || 0) }))
                          }
                          required
                          disabled={loading}
                        />
                        <div className="form-text" style={{ fontSize: "0.72rem" }}>Ex: 6 meses, 30 dias</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Localização (opcional) */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-sm-8">
                    <label style={LABEL_STYLE}>Endereço <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                    <input
                      className="form-control"
                      placeholder="Rua, número, bairro"
                      value={formData.address}
                      onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 col-sm-4">
                    <label style={LABEL_STYLE}>Complemento <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                    <input
                      className="form-control"
                      placeholder="Sala, andar…"
                      value={formData.complement}
                      onChange={(e) => setFormData((p) => ({ ...p, complement: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ minWidth: 160 }}
                  >
                    {loading ? "Salvando…" : editId ? "Atualizar item" : "Criar item"}
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

        </div>
      </section>
    </PagePermissionGuard>
  );
}

export default function NewItemPage() {
  return (
    <Suspense fallback={<p className="p-3 m-0">Carregando formulário...</p>}>
      <NewItemContent />
    </Suspense>
  );
}
