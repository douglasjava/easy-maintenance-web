"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function NewItemPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [category, setCategory] = useState<"REGULATORY" | "OPERATIONAL">("REGULATORY");

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = new FormData(e.currentTarget);

    const payload: any = {
      itemType: String(form.get("itemType")).toUpperCase().trim(),
      itemCategory: String(form.get("itemCategory")),
      location: {
        bloco: form.get("bloco") || undefined,
        andar: form.get("andar") || undefined,
        ponto: form.get("ponto") || undefined,
      },
      lastPerformedAt: form.get("lastPerformedAt") || null,
    };

    if (payload.itemCategory === "REGULATORY") {
      payload.normId = form.get("normId");
    } else {
      payload.customPeriodUnit = form.get("customPeriodUnit");
      payload.customPeriodQty = Number(form.get("customPeriodQty"));
    }

    try {
      setLoading(true);
      const { data } = await api.post("/items", payload);
      setMsg(`✔️ Item criado: ${data.id}`);
      e.currentTarget.reset();
      setCategory("REGULATORY");
    } catch (err: any) {
      setMsg("❌ Erro ao criar item. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Novo Item</h1>
        <Link className="btn btn-outline-secondary" href="/items">← Voltar</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Tipo do item</label>
              <input name="itemType" className="form-control" placeholder="EXTINTOR / SPDA / CAIXA_DAGUA ..." required />
            </div>

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
                <input name="lastPerformedAt" type="date" className="form-control" />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12 col-md-4">
                <label className="form-label">Bloco</label>
                <input name="bloco" className="form-control" />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Andar</label>
                <input name="andar" className="form-control" />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Ponto/Referência</label>
                <input name="ponto" className="form-control" />
              </div>
            </div>

            {category === "REGULATORY" && (
              <div className="mt-3">
                <label className="form-label">Norma (normId)</label>
                {normsLoading ? (
                  <p className="form-text m-0">Carregando normas…</p>
                ) : normsError ? (
                  <p className="text-danger m-0">Erro ao carregar normas. <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => refetchNorms()}>Tentar novamente</button></p>
                ) : (
                  <select name="normId" className="form-select" required defaultValue="">
                    <option value="" disabled>Selecione uma norma</option>
                    {(norms ?? []).map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.itemType} • {n.authority || ""}
                      </option>
                    ))}
                  </select>
                )}
                <div className="form-text">
                  As normas são carregadas de <code>/norms</code> e o ID selecionado será enviado no cadastro.
                </div>
              </div>
            )}

            {category === "OPERATIONAL" && (
              <div className="row g-3 mt-1">
                <div className="col-12 col-md-6">
                  <label className="form-label">Unidade</label>
                  <select name="customPeriodUnit" className="form-select" defaultValue="MESES" required>
                    <option value="MESES">Meses</option>
                    <option value="DIAS">Dias</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Quantidade</label>
                  <input name="customPeriodQty" className="form-control" type="number" min={1} defaultValue={6} required />
                </div>
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 mt-3">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Enviando..." : "Criar item"}
              </button>
              <button className="btn btn-outline-secondary" type="reset" onClick={() => setMsg(null)}>Limpar</button>
            </div>

            {msg && <p className="small mt-2 mb-0">{msg}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
