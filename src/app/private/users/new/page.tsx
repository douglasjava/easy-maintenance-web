"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { roleLabelMap } from "@/lib/enums/labels";

type Role = "ADMIN" | "SYNDIC" | "TECH" | "READER";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

const EMPTY_FORM = {
    name: "",
    email: "",
    password: "",
    role: "READER" as Role,
};

export default function CreateUserPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            status: "ACTIVE",
        };

        if (!payload.name || !payload.email || !payload.password || !payload.role) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        try {
            setLoading(true);
            const adminToken = window.localStorage.getItem("adminToken");
            if (!adminToken) {
                toast.error("Token de administrador não encontrado.");
                return;
            }

            // Global user creation (no org required)
            await api.post("/private/admin/users", payload, {
                headers: { "X-Admin-Token": adminToken },
            });

            toast.success("Usuário criado com sucesso.");
            router.push("/private/users");
        } catch (err) {
            console.error("Error creating user", err);
            toast.error("Erro ao criar usuário.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }} className="p-3">
            <div className="container-fluid" style={{ maxWidth: "1200px" }}>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                            Criar Usuário
                        </h1>
                        <p className="text-muted mt-1 mb-0">
                            Criar um usuário sem uma organização inicial.
                        </p>
                    </div>

                    <Link className="btn btn-outline-secondary" href="/private/users">
                        ← Voltar para a lista
                    </Link>
                </div>

                <div className="card border-0 shadow-sm mx-auto">
                    <div className="card-body">
                        <form onSubmit={onSubmit}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Nome</label>
                                    <input
                                        className="form-control"
                                        placeholder="Ex: João Silva"
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="joao@exemplo.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label">Senha</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label">Perfil</label>
                                    <select
                                        className="form-select"
                                        value={formData.role}
                                        onChange={(e) => setFormData(p => ({ ...p, role: e.target.value as Role }))}
                                        required
                                    >
                                        {Object.entries(roleLabelMap).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button className="btn btn-primary px-5" type="submit" disabled={loading}>
                                    {loading ? "Criando..." : "Criar Usuário"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
