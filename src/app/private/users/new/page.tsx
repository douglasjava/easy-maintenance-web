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

type Plan = "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE";

const EMPTY_FORM = {
    name: "",
    email: "",
    password: "",
    role: "READER" as Role,
};

const EMPTY_SUBSCRIPTION = {
    planCode: "FREE" as Plan,
    status: "ACTIVE",
    currentPeriodStart: "",
    currentPeriodEnd: "",
};

const EMPTY_BILLING_ACCOUNT = {
    billingEmail: "",
    doc: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    country: "BR",
    status: "ACTIVE",
};

export default function CreateUserPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [subscriptionData, setSubscriptionData] = useState(EMPTY_SUBSCRIPTION);
    const [billingData, setBillingData] = useState(EMPTY_BILLING_ACCOUNT);
    const [createdUserId, setCreatedUserId] = useState<string | null>(null);
    const router = useRouter();

    async function handleZipCodeBlur() {
        const zip = billingData.zipCode.replace(/\D/g, "");
        if (zip.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setBillingData(prev => ({
                    ...prev,
                    street: data.logradouro || prev.street,
                    neighborhood: data.bairro || prev.neighborhood,
                    city: data.localidade || prev.city,
                    state: data.uf || prev.state,
                }));
            }
        } catch (error) {
            console.error("Error fetching zip code", error);
        }
    }

    const plans = [
        { code: "FREE", name: "FREE", description: "pode cadastrar 1 Empresa" },
        { code: "STARTER", name: "STARTER", description: "pode cadastrar 3 Empresa" },
        { code: "BUSINESS", name: "BUSINESS", description: "pode cadastrar 5 Empresa" },
        { code: "ENTERPRISE", name: "ENTERPRISE", description: "pode cadastrar 15 Empresa" },
    ];

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
            const res = await api.post("/private/admin/users", payload, {
                headers: { "X-Admin-Token": adminToken },
            });

            const userId = res.data?.id || res.data; // A depender da resposta da API
            setCreatedUserId(String(userId));

            toast.success("Usuário criado com sucesso. Agora configure a assinatura.");
            setStep(2);
        } catch (err) {
            console.error("Error creating user", err);
            toast.error(err.response.data.detail);
        } finally {
            setLoading(false);
        }
    }

    async function onSubmitStep2(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading || !createdUserId) return;

        const toTimestamp = (dateStr: string) => {
            if (!dateStr) return undefined;
            return Math.floor(new Date(dateStr).getTime() / 1000);
        };

        const payload = {
            userId: Number(createdUserId),
            planCode: subscriptionData.planCode,
            status: subscriptionData.status,
            currentPeriodStart: toTimestamp(subscriptionData.currentPeriodStart),
            currentPeriodEnd: toTimestamp(subscriptionData.currentPeriodEnd),
        };

        try {
            setLoading(true);
            const adminToken = window.localStorage.getItem("adminToken");
            await api.put(`/private/admin/billing/user/${createdUserId}/subscription`, payload, {
                headers: { "X-Admin-Token": adminToken },
            });

            toast.success("Assinatura configurada com sucesso.");
            setStep(3);
        } catch (err) {
            console.error("Error creating subscription", err);
            toast.error("Falha ao configurar assinatura.");
        } finally {
            setLoading(false);
        }
    }

    async function onSubmitStep3(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading || !createdUserId) return;

        const payload = {
            ...billingData,
            zipCode: billingData.zipCode.replace(/\D/g, ""),
            doc: billingData.doc.replace(/\D/g, ""),
        };

        try {
            setLoading(true);
            const adminToken = window.localStorage.getItem("adminToken");
            await api.put(`/private/admin/billing/users/${createdUserId}/account`, payload, {
                headers: { "X-Admin-Token": adminToken },
            });

            toast.success("Dados de pagamento configurados com sucesso.");
            router.push("/private/users");
        } catch (err) {
            console.error("Error creating billing account", err);
            toast.error("Falha ao configurar dados de pagamento.");
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
                    </div>

                    <Link className="btn btn-outline-secondary" href="/private/users">
                        ← Voltar para a lista
                    </Link>
                </div>

                {/* Progress Indicator */}
                <div className="d-flex justify-content-center mb-4">
                    <div className="d-flex align-items-center">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${step === 1 ? 'bg-primary text-white' : 'bg-success text-white'}`} style={{ width: 32, height: 32 }}>
                            {step > 1 ? '✓' : '1'}
                        </div>
                        <div className="mx-2 fw-medium" style={{ color: step === 1 ? COLORS.primaryDark : '#6c757d' }}>Usuário</div>
                        <div className="bg-secondary opacity-25" style={{ width: 40, height: 2 }}></div>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mx-2 ${step === 2 ? 'bg-primary text-white' : step > 2 ? 'bg-success text-white' : 'bg-light text-muted border'}`} style={{ width: 32, height: 32 }}>
                            {step > 2 ? '✓' : '2'}
                        </div>
                        <div className="fw-medium" style={{ color: step === 2 ? COLORS.primaryDark : '#6c757d' }}>Assinatura</div>
                        <div className="bg-secondary opacity-25" style={{ width: 40, height: 2 }}></div>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mx-2 ${step === 3 ? 'bg-primary text-white' : 'bg-light text-muted border'}`} style={{ width: 32, height: 32 }}>
                            3
                        </div>
                        <div className="fw-medium" style={{ color: step === 3 ? COLORS.primaryDark : '#6c757d' }}>Pagamento</div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm mx-auto">
                    <div className="card-body p-4">
                        {step === 1 ? (
                            <form onSubmit={onSubmitStep1}>
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

                                <div className="mt-4 d-flex justify-content-end">
                                    <button className="btn btn-primary px-5" type="submit" disabled={loading}>
                                        {loading ? "Criando..." : "Próximo Passo →"}
                                    </button>
                                </div>
                            </form>
                        ) : step === 2 ? (
                            <form onSubmit={onSubmitStep2}>
                                <div className="alert alert-info border-0 shadow-sm mb-4">
                                    <h6 className="alert-heading fw-bold mb-1">Passo 2: Configuração de Assinatura</h6>
                                    <p className="small mb-0">O usuário foi criado. Agora, selecione o plano e o período da assinatura.</p>
                                </div>

                                <div className="row g-3">
                                    <div className="col-12 col-md-12">
                                        <label className="form-label fw-bold small">Plano</label>
                                        <select
                                            className="form-select"
                                            value={subscriptionData.planCode}
                                            onChange={(e) => setSubscriptionData(p => ({ ...p, planCode: e.target.value as Plan }))}
                                            required
                                        >
                                            {plans.map(plan => (
                                                <option key={plan.code} value={plan.code}>
                                                    {plan.name} - {plan.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Status</label>
                                        <select
                                            className="form-select"
                                            value={subscriptionData.status}
                                            onChange={(e) => setSubscriptionData(p => ({ ...p, status: e.target.value }))}
                                            required
                                        >
                                            <option value="ACTIVE">Ativo</option>
                                            <option value="PAST_DUE">Em atraso</option>
                                            <option value="CANCELED">Cancelado</option>
                                            <option value="TRIALING">Degustação</option>
                                        </select>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Início do Período</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={subscriptionData.currentPeriodStart}
                                            onChange={(e) => setSubscriptionData(p => ({ ...p, currentPeriodStart: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Fim do Período</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={subscriptionData.currentPeriodEnd}
                                            onChange={(e) => setSubscriptionData(p => ({ ...p, currentPeriodEnd: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 d-flex justify-content-between">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-5 py-2 fw-bold"
                                        disabled={loading}
                                    >
                                        {loading ? "Salvando..." : "Próximo Passo →"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={onSubmitStep3}>
                                <div className="alert alert-info border-0 shadow-sm mb-4">
                                    <h6 className="alert-heading fw-bold mb-1">Passo 3: Dados de Pagamento</h6>
                                    <p className="small mb-0">Configure os dados para cobrança deste usuário.</p>
                                </div>

                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Email de Pagamento</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="exemplo@email.com"
                                            value={billingData.billingEmail}
                                            onChange={(e) => setBillingData(p => ({ ...p, billingEmail: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Documento (CPF/CNPJ)</label>
                                        <input
                                            className="form-control"
                                            placeholder="000.000.000-00"
                                            value={billingData.doc}
                                            onChange={(e) => setBillingData(p => ({ ...p, doc: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-bold small">CEP</label>
                                        <input
                                            className="form-control"
                                            placeholder="00000-000"
                                            value={billingData.zipCode}
                                            onChange={(e) => setBillingData(p => ({ ...p, zipCode: e.target.value }))}
                                            onBlur={handleZipCodeBlur}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-8">
                                        <label className="form-label fw-bold small">Logradouro</label>
                                        <input
                                            className="form-control"
                                            placeholder="Rua, Avenida, etc"
                                            value={billingData.street}
                                            onChange={(e) => setBillingData(p => ({ ...p, street: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-3">
                                        <label className="form-label fw-bold small">Número</label>
                                        <input
                                            className="form-control"
                                            placeholder="123"
                                            value={billingData.number}
                                            onChange={(e) => setBillingData(p => ({ ...p, number: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-5">
                                        <label className="form-label fw-bold small">Bairro</label>
                                        <input
                                            className="form-control"
                                            placeholder="Bairro"
                                            value={billingData.neighborhood}
                                            onChange={(e) => setBillingData(p => ({ ...p, neighborhood: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-bold small">Cidade</label>
                                        <input
                                            className="form-control"
                                            placeholder="Cidade"
                                            value={billingData.city}
                                            onChange={(e) => setBillingData(p => ({ ...p, city: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-2">
                                        <label className="form-label fw-bold small">Estado (UF)</label>
                                        <input
                                            className="form-control"
                                            placeholder="SP"
                                            maxLength={2}
                                            value={billingData.state}
                                            onChange={(e) => setBillingData(p => ({ ...p, state: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-bold small">País</label>
                                        <input
                                            className="form-control"
                                            placeholder="Brasil"
                                            value={billingData.country}
                                            onChange={(e) => setBillingData(p => ({ ...p, country: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Status da Conta</label>
                                        <select
                                            className="form-select"
                                            value={billingData.status}
                                            onChange={(e) => setBillingData(p => ({ ...p, status: e.target.value }))}
                                            required
                                        >
                                            <option value="ACTIVE">Ativo</option>
                                            <option value="INACTIVE">Inativo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 d-flex justify-content-between">
                                    <button
                                        type="submit"
                                        className="btn btn-success px-5 py-2 fw-bold"
                                        disabled={loading}
                                    >
                                        {loading ? "Salvando..." : "Finalizar Cadastro ✓"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
