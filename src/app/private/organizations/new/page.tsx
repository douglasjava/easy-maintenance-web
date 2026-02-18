"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import AsyncSelect from "react-select/async";

type Plan = "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

const EMPTY_FORM = {
    name: "",
    city: "",
    street: "",
    number: "",
    zipCode: "",
    state: "",
    complement: "",
    neighborhood: "",
    country: "BR",
    doc: "",
};

const EMPTY_SUBSCRIPTION = {
    payerUserId: "",
    planCode: "FREE" as Plan,
    status: "ACTIVE",
    currentPeriodStart: "",
    currentPeriodEnd: "",
};

export default function CreateOrganizationPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [subscriptionData, setSubscriptionData] = useState(EMPTY_SUBSCRIPTION);
    const [createdOrgCode, setCreatedOrgCode] = useState("");
    const router = useRouter();

    async function handleZipCodeBlur() {
        const zip = formData.zipCode.replace(/\D/g, "");
        if (zip.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
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

    async function onSubmitStep1(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        const orgCode = crypto.randomUUID();
        const payload = {
            code: orgCode,
            name: formData.name.trim(),
            plan: "FREE", // Plano padrão na criação, será ajustado no step 2 via assinatura
            city: formData.city?.trim() || undefined,
            street: formData.street?.trim() || undefined,
            number: formData.number?.trim() || undefined,
            zipCode: formData.zipCode?.replace(/\D/g, "") || undefined,
            state: formData.state?.trim() || undefined,
            complement: formData.complement?.trim() || undefined,
            neighborhood: formData.neighborhood?.trim() || undefined,
            country: formData.country?.trim() || "BR",
            doc: formData.doc?.replace(/\D/g, "") || undefined,
        };

        if (!payload.name) {
            toast.error("Por favor, preencha o nome da empresa.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/private/admin/organizations", payload);

            toast.success("Empresa criada com sucesso. Agora configure a assinatura.");
            setCreatedOrgCode(orgCode);
            setStep(2);
        } catch (err) {
            console.error("Error creating organization", err);
            toast.error("Falha ao criar organização.");
        } finally {
            setLoading(false);
        }
    }

    async function onSubmitStep2(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        if (!subscriptionData.payerUserId || !subscriptionData.planCode) {
            toast.error("Por favor, preencha os campos obrigatórios da assinatura.");
            return;
        }

        const toTimestamp = (dateStr: string) => {
            if (!dateStr) return undefined;
            return Math.floor(new Date(dateStr).getTime() / 1000);
        };

        const payload = {
            payerUserId: Number(subscriptionData.payerUserId),
            planCode: subscriptionData.planCode,
            status: subscriptionData.status,
            currentPeriodStart: toTimestamp(subscriptionData.currentPeriodStart),
            currentPeriodEnd: toTimestamp(subscriptionData.currentPeriodEnd),
        };

        try {
            setLoading(true);
            await api.put(`/private/admin/billing/organizations/${createdOrgCode}/subscription`, payload);

            toast.success("Assinatura configurada com sucesso.");
            router.push("/private/organizations");
        } catch (err) {
            console.error("Error creating subscription", err);
            toast.error("Falha ao configurar assinatura.");
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
                            Criar Empresa
                        </h1>
                        <p className="text-muted mt-1 mb-0">
                            Cadastre uma nova organização no sistema.
                        </p>
                    </div>

                    <Link className="btn btn-outline-secondary" href="/private/organizations">
                        ← Voltar para a lista
                    </Link>
                </div>

                {/* Progress Indicator */}
                <div className="d-flex justify-content-center mb-4">
                    <div className="d-flex align-items-center">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${step === 1 ? 'bg-primary text-white' : 'bg-success text-white'}`} style={{ width: 32, height: 32 }}>
                            {step > 1 ? '✓' : '1'}
                        </div>
                        <div className="mx-2 fw-medium" style={{ color: step === 1 ? COLORS.primaryDark : '#6c757d' }}>Organização</div>
                        <div className="bg-secondary opacity-25" style={{ width: 50, height: 2 }}></div>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mx-2 ${step === 2 ? 'bg-primary text-white' : 'bg-light text-muted border'}`} style={{ width: 32, height: 32 }}>
                            2
                        </div>
                        <div className="fw-medium" style={{ color: step === 2 ? COLORS.primaryDark : '#6c757d' }}>Assinatura</div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm mx-auto">
                    <div className="card-body p-4">
                        {step === 1 ? (
                            <form onSubmit={onSubmitStep1}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-12">
                                        <label className="form-label fw-bold small">Nome da Empresa</label>
                                        <input
                                            className="form-control"
                                            placeholder="Ex: ACME Corp"
                                            value={formData.name}
                                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Documento (CNPJ/CPF)</label>
                                        <input
                                            inputMode="numeric"
                                            className="form-control"
                                            placeholder="00.000.000/0001-00"
                                            value={formData.doc}
                                            onChange={(e) => {
                                                const onlyNumbers = e.target.value.replace(/\D/g, "");
                                                setFormData(p => ({ ...p, doc: onlyNumbers }));
                                            }}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">CEP</label>
                                        <input
                                            className="form-control"
                                            placeholder="00000-000"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData(p => ({ ...p, zipCode: e.target.value }))}
                                            onBlur={handleZipCodeBlur}
                                        />
                                    </div>

                                    <div className="col-12 col-md-9">
                                        <label className="form-label fw-bold small">Logradouro (Rua/Avenida)</label>
                                        <input
                                            className="form-control"
                                            placeholder="Rua das Flores"
                                            value={formData.street}
                                            onChange={(e) => setFormData(p => ({ ...p, street: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-md-3">
                                        <label className="form-label fw-bold small">Número</label>
                                        <input
                                            className="form-control"
                                            placeholder="123"
                                            value={formData.number}
                                            onChange={(e) => setFormData(p => ({ ...p, number: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Bairro</label>
                                        <input
                                            className="form-control"
                                            placeholder="Centro"
                                            value={formData.neighborhood}
                                            onChange={(e) => setFormData(p => ({ ...p, neighborhood: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Complemento</label>
                                        <input
                                            className="form-control"
                                            placeholder="Apt 101 / Bloco B"
                                            value={formData.complement}
                                            onChange={(e) => setFormData(p => ({ ...p, complement: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Cidade</label>
                                        <input
                                            className="form-control"
                                            placeholder="Ex: São Paulo"
                                            value={formData.city}
                                            onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-md-2">
                                        <label className="form-label fw-bold small">Estado (UF)</label>
                                        <input
                                            className="form-control"
                                            placeholder="SP"
                                            maxLength={2}
                                            value={formData.state}
                                            onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-bold small">País</label>
                                        <input
                                            className="form-control"
                                            placeholder="Brasil"
                                            value={formData.country}
                                            onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 d-flex justify-content-end">
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
                            <form onSubmit={onSubmitStep2}>
                                <div className="alert alert-info border-0 shadow-sm mb-4">
                                    <h6 className="alert-heading fw-bold mb-1">Configuração de Assinatura</h6>
                                    <p className="small mb-0">A empresa foi criada. Agora, defina quem será o pagador e qual o plano inicial.</p>
                                </div>

                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Usuário Pagador (Nome)</label>
                                        <AsyncSelect
                                            cacheOptions
                                            loadOptions={loadPayerOptions}
                                            defaultOptions
                                            placeholder="Digite o nome para buscar..."
                                            noOptionsMessage={() => "Nenhum usuário encontrado"}
                                            loadingMessage={() => "Buscando..."}
                                            onChange={(option: any) => {
                                                setSubscriptionData(p => ({ 
                                                    ...p, 
                                                    payerUserId: option ? option.value : "" 
                                                }));
                                            }}
                                            isClearable
                                            classNamePrefix="react-select"
                                        />
                                        {subscriptionData.payerUserId && (
                                            <div className="small text-success mt-1">
                                                ID do Usuário Selecionado: {subscriptionData.payerUserId}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold small">Plano</label>
                                        <select
                                            className="form-select"
                                            value={subscriptionData.planCode}
                                            onChange={(e) => setSubscriptionData(p => ({ ...p, planCode: e.target.value as Plan }))}
                                            required
                                        >
                                            <option value="FREE">FREE</option>
                                            <option value="STARTER">STARTER</option>
                                            <option value="BUSINESS">BUSINESS</option>
                                            <option value="ENTERPRISE">ENTERPRISE</option>
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
                                            <option value="ACTIVE">ATIVO</option>
                                            <option value="PAST_DUE">EM ATRASO</option>
                                            <option value="CANCELED">CANCELADO</option>
                                            <option value="TRIALING">EM TESTE</option>
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
                                        type="button"
                                        className="btn btn-outline-secondary px-4 py-2"
                                        onClick={() => router.push("/private/organizations")}
                                    >
                                        Pular (Configurar depois)
                                    </button>
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
