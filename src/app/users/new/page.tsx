"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { ENV } from "@/lib/env";

type Status = "ACTIVE" | "INACTIVE";

export default function NewUserPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("ACTIVE");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = new FormData(e.currentTarget);

    const payload = {
      email: String(form.get("email")).trim(),
      name: String(form.get("name")).trim(),
      role: String(form.get("role")).trim(),
      status: String(form.get("status")) as Status,
      passwordHash: String(form.get("passwordHash")),
    };

    if (!payload.email || !payload.name || !payload.role || !payload.status || !payload.passwordHash) {
      setMsg("❌ Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const path = `/api/v1/organizations/${ENV.ORG_ID}/users`;
      await api.post(path, payload);
      setMsg("✔️ Usuário cadastrado com sucesso.");
      e.currentTarget.reset();
      setStatus("ACTIVE");
    } catch (err: any) {
      setMsg("❌ Erro ao cadastrar usuário. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Cadastro de Usuário</h1>
        <Link className="btn btn-outline-secondary" href="/">← Voltar</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">E-mail</label>
                <input name="email" type="email" className="form-control" placeholder="email@empresa.com" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Nome</label>
                <input name="name" className="form-control" placeholder="Nome do usuário" required />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12 col-md-4">
                <label className="form-label">Role</label>
                <input
                  name="role"
                  className="form-control"
                  placeholder="ex.: ADMIN"
                  required
                />
                <div className="form-text">Valor depende dos perfis suportados no backend (ex.: ADMIN, USER).</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value as Status)} required>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Senha</label>
                <input name="passwordHash" type="password" className="form-control" placeholder="Defina uma senha" required />
                <div className="form-text">Este campo envia <code>passwordHash</code> conforme contrato.</div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-3">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Enviando..." : "Cadastrar usuário"}
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
