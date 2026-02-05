"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import { roleLabelMap } from "@/lib/enums/labels";
import AsyncSelect from "react-select/async";

type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";

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
    responsibleUser?: {
        id: number;
        email: string;
        name: string;
        role: string;
        status: string;
    };
};

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
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
    const [currentStep, setCurrentStep] = useState(1);
    const [stepOneCompleted, setStepOneCompleted] = useState(false);
    const [payerLabel, setPayerLabel] = useState("");

    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [subscriptionForm, setSubscriptionForm] = useState({
        payerUserId: "",
        status: "ACTIVE",
        currentPeriodEnd: "",
        currentPeriodStart: ""
    });

    // Form states
    const [detailsForm, setDetailsForm] = useState({ 
        name: "", 
        doc: "", 
        city: "",
        street: "",
        number: "",
        neighborhood: "",
        zipCode: "",
        state: "",
        complement: ""
    });
    const [planForm, setPlanForm] = useState<Plan>("FREE");

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
                name: data.name, 
                doc: data.doc || "", 
                city: data.city || "",
                street: data.street || "",
                number: data.number || "",
                neighborhood: data.neighborhood || "",
                zipCode: data.zipCode || "",
                state: data.state || "",
                complement: data.complement || "",
            });
            setPlanForm(data.plan);
            setStepOneCompleted(true);

            // Fetch subscription details
            try {
                const subRes = await api.get(`/private/admin/billing/organizations/${data.code}/subscription`);
                if (subRes.data) {
                    setSubscriptionForm({
                        payerUserId: subRes.data.payerUserId ? String(subRes.data.payerUserId) : "",
                        status: subRes.data.status || "ACTIVE",
                        currentPeriodStart: subRes.data.currentPeriodStart ? subRes.data.currentPeriodStart.split("T")[0] : "",
                        currentPeriodEnd: subRes.data.currentPeriodEnd ? subRes.data.currentPeriodEnd.split("T")[0] : ""
                    });
                    if (subRes.data.payerName) {
                        setPayerLabel(subRes.data.payerName);
                    } else if (subRes.data.payerUserId) {
                        setPayerLabel(String(subRes.data.payerUserId));
                    }
                }
            } catch (subErr) {
                console.warn("Could not fetch subscription details", subErr);
            }
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
            setStepOneCompleted(true);
            setCurrentStep(2);
            fetchOrg();
        } catch (err) {
            toast.error("Erro ao atualizar informações.");
        }
    }

    async function loadPayerOptions(inputValue: string) {
        if (!inputValue || inputValue.length < 2) return [];

        try {
            const adminToken = window.localStorage.getItem("adminToken");
            const { data } = await api.get(`/private/admin/users?name=${encodeURIComponent(inputValue)}`, {
                headers: { "X-Admin-Token": adminToken },
            });

            return (data.content || []).map((user: any) => ({
                value: String(user.id),
                label: `${user.name} (${user.email})`
            }));
        } catch (err) {
            console.error(err);
            return [];
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

            {/* Stepper horizontal */}
            <div className="mb-4">
                <div className="d-flex justify-content-center align-items-center">
                    <button 
                        className={`btn ${currentStep === 1 ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 mx-2`}
                        onClick={() => setCurrentStep(1)}
                    >
                        1. Dados da Organização
                    </button>
                    <div style={{ width: '50px', height: '2px', backgroundColor: '#dee2e6' }}></div>
                    <button 
                        className={`btn ${currentStep === 2 ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 mx-2`}
                        disabled={!stepOneCompleted}
                        onClick={() => setCurrentStep(2)}
                    >
                        2. Dados da Assinatura
                    </button>
                </div>
            </div>

            {currentStep === 1 && (
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
            )}

            {currentStep === 2 && (
                <div className="card border-0 shadow-sm overflow-hidden mb-4">
                    <div className="card-header bg-white border-0 pt-4 px-4">
                        <h5 className="mb-0 fw-bold" style={{ color: COLORS.primaryDark }}>Assinatura e Faturamento</h5>
                        <p className="text-muted small mb-0">Gerencie o plano e o pagador desta organização.</p>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                setLoading(true);
                                const toTimestamp = (dateStr: string) => {
                                    if (!dateStr) return undefined;
                                    return Math.floor(new Date(dateStr).getTime() / 1000);
                                };

                                const payload = {
                                    payerUserId: Number(subscriptionForm.payerUserId),
                                    planCode: planForm,
                                    status: subscriptionForm.status,
                                    currentPeriodStart: toTimestamp(subscriptionForm.currentPeriodStart),
                                    currentPeriodEnd: toTimestamp(subscriptionForm.currentPeriodEnd)
                                };

                                await api.put(`/private/admin/billing/organizations/${org.code}/subscription`, payload);
                                toast.success("Assinatura atualizada com sucesso!");
                            } catch (err) {
                                console.error(err);
                                toast.error("Erro ao atualizar assinatura.");
                            } finally {
                                setLoading(false);
                            }
                        }}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-medium">Usuário Pagador (Nome)</label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={loadPayerOptions}
                                        defaultOptions
                                        placeholder="Digite o nome para buscar..."
                                        noOptionsMessage={() => "Nenhum usuário encontrado"}
                                        loadingMessage={() => "Buscando..."}
                                        value={subscriptionForm.payerUserId ? { value: subscriptionForm.payerUserId, label: payerLabel } : null}
                                        onChange={(option: any) => {
                                            setSubscriptionForm(p => ({ 
                                                ...p, 
                                                payerUserId: option ? option.value : "" 
                                            }));
                                            setPayerLabel(option ? option.label : "");
                                        }}
                                        isClearable
                                        classNamePrefix="react-select"
                                    />
                                    {subscriptionForm.payerUserId && (
                                        <div className="small text-success mt-1">
                                            ID do Usuário Selecionado: {subscriptionForm.payerUserId}
                                        </div>
                                    )}
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-medium">Plano</label>
                                    <select
                                        className="form-select"
                                        value={planForm}
                                        onChange={(e) => setPlanForm(e.target.value as Plan)}
                                        required
                                    >
                                        <option value="FREE">FREE</option>
                                        <option value="STARTER">STARTER</option>
                                        <option value="BUSINESS">BUSINESS</option>
                                        <option value="ENTERPRISE">ENTERPRISE</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-medium">Status</label>
                                    <select
                                        className="form-select"
                                        value={subscriptionForm.status}
                                        onChange={(e) => setSubscriptionForm(p => ({ ...p, status: e.target.value }))}
                                        required
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="PAST_DUE">PAST_DUE</option>
                                        <option value="CANCELED">CANCELED</option>
                                        <option value="TRIALING">TRIALING</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold small">Início do Período</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={subscriptionForm.currentPeriodStart}
                                        onChange={(e) => setSubscriptionForm(p => ({ ...p, currentPeriodStart: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-medium">Fim do Período Atual</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={subscriptionForm.currentPeriodEnd}
                                        onChange={(e) => setSubscriptionForm(p => ({ ...p, currentPeriodEnd: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <button className="btn btn-primary mt-4 px-4" type="submit" disabled={loading}>
                                {loading ? "Salvando..." : "Atualizar Assinatura"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </section>
    );
}
