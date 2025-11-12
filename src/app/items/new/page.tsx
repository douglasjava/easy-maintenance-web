"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import Link from "next/link";

export default function NewItemPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [category, setCategory] = useState<"REGULATORIA" | "OPERACIONAL">("REGULATORIA");

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

    if (payload.itemCategory === "REGULATORIA") {
      payload.normId = form.get("normId");
    } else {
      payload.customPeriodUnit = form.get("customPeriodUnit");
      payload.customPeriodQty = Number(form.get("customPeriodQty"));
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/items", payload);
      setMsg(`✔️ Item criado: ${data.id}`);
      e.currentTarget.reset();
      setCategory("REGULATORIA");
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
                  <option value="REGULATORIA">Regulatória</option>
                  <option value="OPERACIONAL">Operacional</option>
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

            {category === "REGULATORIA" && (
              <div className="mt-3">
                <label className="form-label">Norma (normId)</label>
                <input name="normId" className="form-control" placeholder="UUID da norma" required />
                <div className="form-text">
                  Use um ID da tabela <code>norms</code>. Em breve faremos auto-completar por <code>itemType</code>.
                </div>
              </div>
            )}

            {category === "OPERACIONAL" && (
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
