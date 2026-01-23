"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

type Status = "ACTIVE" | "INACTIVE";

type Organization = {
    id: string;
    code: string;
    name: string;
};

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
};

const EMPTY_FORM = {
    orgCode: "",
    email: "",
    name: "",
    role: "",
    status: "ACTIVE" as Status,
    password: "",
};

export default function PrivateUsersPage() {
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        async function fetchOrganizations() {
            try {
                const adminToken = window.localStorage.getItem("adminToken");
                if (!adminToken) {
                    console.warn("Admin token não encontrado");
                    return;
                }

                const { data } = await api.get("/private/admin/organizations", {
                    headers: { "X-Admin-Token": adminToken },
                });

                setOrganizations(Array.isArray(data?.content) ? data.content : []);
            } catch (err) {
                console.error("Erro ao buscar organizações", err);
                setOrganizations([]);
            }
        }

        fetchOrganizations();
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        const adminToken = window.localStorage.getItem("adminToken");
        if (!adminToken) {
            toast.error("Token de administrador não encontrado. Faça login na área admin.");
            return;
        }

        const payload = {
            email: formData.email.trim(),
            name: formData.name.trim(),
            role: formData.role.trim().toUpperCase(),
            status: formData.status,
            password: formData.password,
        };

        const orgCode = formData.orgCode.trim();

        if (!payload.email || !payload.name || !payload.role || !payload.password || !orgCode) {
            toast.error("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post(`/private/admin/users/${orgCode}`, payload, {
                headers: { "X-Admin-Token": adminToken },
            });

            console.log("POST OK:", res.status, res.data);

            toast.success("Usuário processado com sucesso via Área Privativa.");
            setFormData(EMPTY_FORM); // ✅ limpa tudo
        } catch (err: any) {
            console.error("Erro ao processar usuário:", err?.response ?? err);
            toast.error("Erro ao processar usuário na Área Privativa.");
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
                        Usuários (Admin)
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Gerenciamento global de usuários via canal administrativo
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
                                Organização
                            </div>

                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Selecionar Organização</label>
                                    <select
                                        name="orgCode"
                                        className="form-select"
                                        value={formData.orgCode}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, orgCode: e.target.value }))
                                        }
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Selecione uma organização...</option>
                                        {organizations.map((org) => (
                                            <option key={org.code} value={org.code}>
                                                {org.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

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
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, email: e.target.value }))
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label">Nome</label>
                                    <input
                                        name="name"
                                        className="form-control"
                                        placeholder="Nome completo"
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
                                Acesso e permissões
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Perfil (Role)</label>
                                    <input
                                        name="role"
                                        className="form-control"
                                        placeholder="ADMIN / USER"
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, role: e.target.value }))
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        className="form-select"
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, status: e.target.value as Status }))
                                        }
                                        required
                                        disabled={loading}
                                    >
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="INACTIVE">Inativo</option>
                                    </select>
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label">Senha</label>
                                    <input
                                        name="password"
                                        type="password"
                                        className="form-control"
                                        placeholder="Defina a senha"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, password: e.target.value }))
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? "Processando..." : "Salvar Usuário"}
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
                    </form>
                </div>
            </div>
        </section>
    );
}