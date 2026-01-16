"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { ENV } from "@/lib/env";
import toast from "react-hot-toast";

type Status = "ACTIVE" | "INACTIVE";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
};

export default function NewUserPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<Status>("ACTIVE");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const payload = {
            email: String(form.get("email")).trim(),
            name: String(form.get("name")).trim(),
            role: String(form.get("role")).trim().toUpperCase(),
            status: String(form.get("status")) as Status,
            passwordHash: String(form.get("passwordHash")),
        };

        if (!payload.email || !payload.name || !payload.role || !payload.passwordHash) {
            toast.error("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            setLoading(true);
            const path = `/organizations/${ENV.ORG_ID}/users`;
            await api.post(path, payload);
            toast.success("Usuário cadastrado com sucesso.");
            e.currentTarget.reset();
            setStatus("ACTIVE");
        } catch {
            toast.error("Erro ao cadastrar usuário. Verifique os dados e tente novamente.");
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
                        Cadastro de Usuário
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Adicione um novo usuário à organização atual
                    </p>
                </div>

                <Link className="btn btn-outline-secondary" href="/">
                    ← Voltar
                </Link>
            </div>

            {/* CARD */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        {/* DADOS BÁSICOS */}
                        <div className="mb-3">
                            <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                Dados do usuário
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        className="form-control"
                                        placeholder="email@empresa.com"
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label">Nome</label>
                                    <input
                                        name="name"
                                        className="form-control"
                                        placeholder="Nome completo"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ACESSO E PERMISSÕES */}
                        <div className="mb-3">
                            <div className="fw-semibold mb-2" style={{ color: COLORS.primaryDark }}>
                                Acesso e permissões
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Perfil (Role)</label>
                                    <input
                                        name="role"
                                        className="form-control"
                                        placeholder="ADMIN / USER"
                                        required
                                    />
                                    <div className="form-text">
                                        Define o nível de acesso do usuário no sistema.
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        className="form-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as Status)}
                                        required
                                    >
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="INACTIVE">Inativo</option>
                                    </select>
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Senha inicial</label>
                                    <input
                                        name="passwordHash"
                                        type="password"
                                        className="form-control"
                                        placeholder="Defina uma senha"
                                        required
                                    />
                                    <div className="form-text">
                                        O usuário poderá alterar a senha no primeiro acesso.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AÇÕES */}
                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? "Cadastrando..." : "Cadastrar usuário"}
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                type="reset"
                            >
                                Limpar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}