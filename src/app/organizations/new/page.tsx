"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";

type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
};

export default function NewOrganizationPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMsg(null);
        const form = new FormData(e.currentTarget);

        const payload = {
            code: String(form.get("code")).trim().toUpperCase(),
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
            await api.post("/organizations", payload);
            setMsg("✔️ Organização criada com sucesso.");
            e.currentTarget.reset();
        } catch (err: any) {
            setMsg("❌ Erro ao criar organização. Verifique os dados e tente novamente.");
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
                        Nova Organização
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Cadastre a empresa, condomínio ou cliente que utilizará o sistema
                    </p>
                </div>

                <Link className="btn btn-outline-secondary" href="/">
                    ← Voltar
                </Link>
            </div>

            {/* CARD PRINCIPAL */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        {/* BLOCO: DADOS BÁSICOS */}
                        <div className="mb-3">
                            <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                Dados da organização
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Código</label>
                                    <input
                                        name="code"
                                        className="form-control"
                                        placeholder="EX.: ACME"
                                        required
                                    />
                                    <div className="form-text">
                                        Identificador único usado internamente no sistema.
                                    </div>
                                </div>

                                <div className="col-12 col-md-8">
                                    <label className="form-label">Nome</label>
                                    <input
                                        name="name"
                                        className="form-control"
                                        placeholder="ACME Indústria e Comércio"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BLOCO: PLANO */}
                        <div className="mb-3">
                            <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                Plano contratado
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Plano</label>
                                    <select
                                        name="plan"
                                        className="form-select"
                                        defaultValue="FREE"
                                        required
                                    >
                                        <option value="FREE">Free</option>
                                        <option value="PRO">Pro</option>
                                        <option value="BUSINESS">Business</option>
                                        <option value="ENTERPRISE">Enterprise</option>
                                    </select>
                                    <div className="form-text">
                                        O plano define limites e funcionalidades disponíveis.
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Cidade (opcional)</label>
                                    <input
                                        name="city"
                                        className="form-control"
                                        placeholder="São Paulo / SP"
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Documento (opcional)</label>
                                    <input
                                        name="doc"
                                        className="form-control"
                                        placeholder="CNPJ / CPF"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* AÇÕES */}
                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? "Criando..." : "Criar organização"}
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                type="reset"
                                onClick={() => setMsg(null)}
                            >
                                Limpar
                            </button>
                        </div>

                        {/* MENSAGEM */}
                        {msg && (
                            <p
                                className="small mt-3 mb-0"
                                style={{
                                    color: msg.startsWith("✔️")
                                        ? COLORS.primaryDark
                                        : COLORS.accent,
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