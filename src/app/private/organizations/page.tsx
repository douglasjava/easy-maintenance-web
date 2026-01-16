"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
};

const EMPTY_FORM = {
    name: "",
    plan: "FREE" as Plan,
    city: "",
    doc: "",
};

export default function PrivateOrganizationsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const payload = {
            code: crypto.randomUUID(),
            name: formData.name.trim(),
            plan: formData.plan,
            city: formData.city?.trim() ? formData.city.trim() : undefined,
            doc: formData.doc?.trim() ? formData.doc.trim() : undefined,
        };

        if (!payload.name || !payload.plan) {
            toast.error("Preencha os campos obrigatórios.");
            return;
        }

        try {
            setLoading(true);

            const adminToken = window.localStorage.getItem("adminToken");
            if (!adminToken) {
                toast.error("Token de administrador não encontrado. Faça login na área admin.");
                return;
            }

            const res = await api.post("/private/admin/organizations", payload, {
                headers: { "X-Admin-Token": adminToken },
            });

            console.log("POST OK:", res.status, res.data);

            toast.success("Organização criada com sucesso via Área Privativa.");
            setFormData(EMPTY_FORM); // ✅ limpa o formulário
        } catch (err: any) {
            console.error("Erro ao criar organização:", err?.response ?? err);
            toast.error("Erro ao criar organização. Verifique os dados e o token de admin.");
        } finally {
            setLoading(false);
        }
    }

    function onReset() {
        setFormData(EMPTY_FORM);
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Organizações (Admin)
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Cadastro global de organizações via canal administrativo
                    </p>
                </div>

                <Link className="btn btn-outline-secondary" href="/private/dashboard">
                    ← Voltar
                </Link>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        <div className="mb-3">
                            <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                Dados da organização
                            </div>

                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Nome</label>
                                    <input
                                        name="name"
                                        className="form-control"
                                        placeholder="ACME Indústria e Comércio"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, name: e.target.value }))
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

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
                                        value={formData.plan}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, plan: e.target.value as Plan }))
                                        }
                                        required
                                        disabled={loading}
                                    >
                                        <option value="FREE">Free</option>
                                        <option value="PRO">Pro</option>
                                        <option value="BUSINESS">Business</option>
                                        <option value="ENTERPRISE">Enterprise</option>
                                    </select>
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Cidade (opcional)</label>
                                    <input
                                        name="city"
                                        className="form-control"
                                        placeholder="São Paulo / SP"
                                        value={formData.city}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, city: e.target.value }))
                                        }
                                        disabled={loading}
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Documento (opcional)</label>
                                    <input
                                        name="doc"
                                        className="form-control"
                                        placeholder="CNPJ / CPF"
                                        value={formData.doc}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, doc: e.target.value }))
                                        }
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? "Criando..." : "Criar organização"}
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