"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { roleLabelMap } from "@/lib/enums/labels";
import PageHeader from "@/components/admin/PageHeader";

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
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    async function onSubmitStep1(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            status: "ACTIVE",
        };

        if (!payload.name || !payload.email || !payload.role) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/private/admin/users", payload);

            toast.success("Usuário criado com sucesso.");
            router.push("/private/users");

        } catch (err: any) {
            console.error("Error creating user", err);
            const message = err?.response?.data?.detail || "Erro ao criar usuário. Tente novamente.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }


    return (
        <section style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }} className="p-3">
            <PageHeader 
                title="Criar Novo Usuário"
                description="Cadastre um novo usuário administrador ou técnico no sistema."
                backUrl="/private/users"
            />

            <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: "800px" }}>
                <div className="card-body p-4 p-md-5">
                    <form onSubmit={onSubmitStep1}>
                        <div className="row g-4">
                            <div className="col-12 col-md-12">
                                <label className="form-label fw-semibold">Nome Completo *</label>
                                <input
                                    className="form-control"
                                    placeholder="Ex: João Silva"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-12">
                                <label className="form-label fw-semibold">E-mail *</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="joao@exemplo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-12">
                                <label className="form-label fw-semibold">Perfil de Acesso *</label>
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

                        <div className="mt-5 pt-3 border-top d-flex justify-content-end">
                            <button className="btn btn-primary px-5 py-2 fw-bold" type="submit" disabled={loading}>
                                {loading ? "Criando..." : "Criar Usuário"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
