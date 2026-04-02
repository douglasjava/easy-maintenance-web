"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

type Plan = "STARTER" | "PRO" | "BUSINESS" | "ENTERPRISE";

type Organization = {
    id: string;
    code: string;
    name: string;
    plan: Plan;
    doc?: string;
    city?: string;
    street?: string;
    number?: string;
    zipCode?: string;
    state?: string;
    neighborhood?: string;
    complement?: string;
    companyType?: string;
    billingSubscriptionItem?: string;
};

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState<Organization | null>(null);

    // Form states
    const [detailsForm, setDetailsForm] = useState({ 
        id: "",
        name: "",
        doc: "",
        city: "",
        street: "",
        number: "",
        neighborhood: "",
        zipCode: "",
        state: "",
        complement: "",
        companyType: "",
        billingSubscriptionItem: ""
    });
    const [planForm, setPlanForm] = useState<Plan>("STARTER");

    useEffect(() => {
        fetchOrg();
    }, [id]);

    async function fetchOrg() {
        try {
            setLoading(true);
            const adminToken = window.localStorage.getItem("adminToken");
            const { data } = await api.get(`/private/admin/organizations/${id}`, {
                headers: { "X-Admin-Token": adminToken },
            });
            setOrg(data);
            setDetailsForm({
                id: data.id,
                name: data.name, 
                doc: data.doc || "", 
                city: data.city || "",
                street: data.street || "",
                number: data.number || "",
                neighborhood: data.neighborhood || "",
                zipCode: data.zipCode || "",
                state: data.state || "",
                complement: data.complement || "",
                companyType: data.companyType || "",
                billingSubscriptionItem: data.billingSubscriptionItem || ""
            });
            setPlanForm(data.plan);

        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar detalhes da organização.");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateDetails(e: React.FormEvent) {
        e.preventDefault();
        try {
            const adminToken = window.localStorage.getItem("adminToken");
            await api.put(`/private/admin/organizations/${id}`, { ...detailsForm, plan: planForm }, {
                headers: { "X-Admin-Token": adminToken },
            });
            toast.success("Informações atualizadas.");
            fetchOrg();
        } catch (err) {
            console.log(err)
            toast.error("Erro ao atualizar informações.");
        }
    }

    if (loading) return <div className="p-4 text-center">Carregando...</div>;
    if (!org) return <div className="p-4 text-center text-danger">Organização não encontrada.</div>;

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        {org.name}
                    </h1>
                    <p className="text-muted mt-1 mb-0">Gerenciar detalhes da organização e usuários.</p>
                </div>
                <Link className="btn btn-outline-secondary" href="/private/organizations">
                    ← Voltar para a lista
                </Link>
            </div>


                <div className="card border-0 shadow-sm overflow-hidden mb-4">
                    <div className="card-body p-4">
                        <form onSubmit={handleUpdateDetails}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Nome</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.name}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Documento</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.doc}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, doc: e.target.value }))}
                                    />
                                </div>

                                <div className="col-12 col-md-8">
                                    <label className="form-label">Logradouro</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.street}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, street: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Número</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.number}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, number: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Bairro</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.neighborhood}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, neighborhood: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Complemento</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.complement}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, complement: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">CEP</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.zipCode}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, zipCode: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Cidade</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.city}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, city: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Estado</label>
                                    <input
                                        className="form-control"
                                        value={detailsForm.state}
                                        onChange={(e) => setDetailsForm(p => ({ ...p, state: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <button className="btn btn-primary mt-4 px-4" type="submit">Salvar e Continuar</button>
                        </form>
                    </div>
                </div>

        </section>
    );
}
