"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";

type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";

export default function NewOrganizationPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = new FormData(e.currentTarget);

    const payload = {
      code: String(form.get("code")).trim(),
      name: String(form.get("name")).trim(),
      plan: String(form.get("plan")) as Plan,
      city: (form.get("city") as string) || undefined,
      doc: (form.get("doc") as string) || undefined,
    };

    if (!payload.code || !payload.name || !payload.plan) {
      setMsg("❌ Preencha os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/v1/organizations", payload);
      setMsg("✔️ Organização criada com sucesso.");
      e.currentTarget.reset();
    } catch (err: any) {
      setMsg("❌ Erro ao criar organização. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Nova Organização</h1>
        <Link className="btn btn-outline-secondary" href="/">← Voltar</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Código</label>
                <input name="code" className="form-control" placeholder="ex.: ACME" required />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label">Nome</label>
                <input name="name" className="form-control" placeholder="ACME Indústria e Comércio" required />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12 col-md-4">
                <label className="form-label">Plano</label>
                <select name="plan" className="form-select" defaultValue="FREE" required>
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="BUSINESS">Business</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Cidade (opcional)</label>
                <input name="city" className="form-control" placeholder="São Paulo / SP" />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Documento (opcional)</label>
                <input name="doc" className="form-control" placeholder="CNPJ / CPF" />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-3">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Enviando..." : "Criar organização"}
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
