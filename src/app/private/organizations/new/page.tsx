"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminOrganizationsService } from "@/services/private/admin-organizations.service";
import { adminUsersService } from "@/services/private/admin-users.service";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import AsyncSelect from "react-select/async";
import PageHeader from "@/components/admin/PageHeader";

type Plan = "STARTER" | "BUSINESS" | "ENTERPRISE";

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
    planCode: "STARTER" as Plan,
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
            const data = await adminUsersService.list({ page: 0, size: 20 });
            // O ideal seria um endpoint de busca por nome, mas o service list aceita params.
            // Se o backend suportar filtro por nome no list, adminUsersService.list({ name: inputValue })

            return (data.content || [])
                .filter(u => u.name.toLowerCase().includes(inputValue.toLowerCase()) || u.email.toLowerCase().includes(inputValue.toLowerCase()))
                .map((user: any) => ({
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
            plan: "STARTER", // Plano padrão na criação, será ajustado no step 2 via assinatura
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
            await adminOrganizationsService.create(payload);

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
            await adminBillingService.updateUserSubscription(createdOrgCode, payload);

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
            <PageHeader 
                title="Criar Nova Empresa"
                description={`Passo ${step} de 2: ${step === 1 ? "Dados da Empresa" : "Configuração da Assinatura"}`}
                backUrl="/private/organizations"
            />

            <div className="card border-0 shadow-sm mx-auto overflow-hidden" style={{ maxWidth: "1000px" }}>
                <div className="card-body p-4 p-md-5">
                    {/* PROGRESS BAR */}
                    <div className="d-flex align-items-center mb-5 position-relative justify-content-between px-md-5">
                        <div className="position-absolute top-50 start-0 end-0 border-top d-none d-sm-block" style={{ zIndex: 0, marginTop: "-1px" }}></div>
                        
                        <div className="text-center position-relative bg-white px-2 px-md-3" style={{ zIndex: 1 }}>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step >= 1 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: "40px", height: "40px" }}>
                                1
                            </div>
                            <div className={`small fw-bold ${step >= 1 ? "text-primary" : "text-muted"}`}>Dados</div>
                            <div className="d-none d-md-block extra-small text-muted">Informações básicas</div>
                        </div>

                        <div className="text-center position-relative bg-white px-2 px-md-3" style={{ zIndex: 1 }}>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step >= 2 ? "bg-primary text-white" : "bg-white border text-muted"}`} style={{ width: "40px", height: "40px" }}>
                                2
                            </div>
                            <div className={`small fw-bold ${step >= 2 ? "text-primary" : "text-muted"}`}>Assinatura</div>
                            <div className="d-none d-md-block extra-small text-muted">Configuração de plano</div>
                        </div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={onSubmitStep1}>
                            <h5 className="mb-4 fw-bold">Informações Básicas</h5>
                            <div className="row g-3">
                                <div className="col-12 col-md-8">
                                    <label className="form-label fw-semibold">Nome da Empresa *</label>
                                    <input
                                        className="form-control form-control-lg"
                                        placeholder="Ex: Minha Empresa LTDA"
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">CNPJ/CPF</label>
                                    <input
                                        className="form-control form-control-lg"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.doc}
                                        onChange={(e) => {
                                            const onlyNumbers = e.target.value.replace(/\D/g, "");
                                            setFormData(p => ({ ...p, doc: onlyNumbers }));
                                        }}
                                    />
                                </div>

                                <h5 className="mt-5 mb-3 fw-bold">Endereço</h5>
                                <div className="col-12 col-md-3">
                                    <label className="form-label">CEP</label>
                                    <input
                                        className="form-control"
                                        placeholder="00000-000"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData(p => ({ ...p, zipCode: e.target.value }))}
                                        onBlur={handleZipCodeBlur}
                                    />
                                </div>
                                <div className="col-12 col-md-7">
                                    <label className="form-label">Logradouro</label>
                                    <input
                                        className="form-control"
                                        placeholder="Rua, Avenida, etc."
                                        value={formData.street}
                                        onChange={(e) => setFormData(p => ({ ...p, street: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-2">
                                    <label className="form-label">Número</label>
                                    <input
                                        className="form-control"
                                        placeholder="123"
                                        value={formData.number}
                                        onChange={(e) => setFormData(p => ({ ...p, number: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Bairro</label>
                                    <input
                                        className="form-control"
                                        placeholder="Bairro"
                                        value={formData.neighborhood}
                                        onChange={(e) => setFormData(p => ({ ...p, neighborhood: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Cidade</label>
                                    <input
                                        className="form-control"
                                        placeholder="Cidade"
                                        value={formData.city}
                                        onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-2">
                                    <label className="form-label">Estado</label>
                                    <input
                                        className="form-control"
                                        placeholder="UF"
                                        maxLength={2}
                                        value={formData.state}
                                        onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                                    />
                                </div>
                                <div className="col-12 col-md-2">
                                    <label className="form-label">País</label>
                                    <input
                                        className="form-control"
                                        value={formData.country}
                                        onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-top d-flex justify-content-end">
                                <button className="btn btn-primary px-5 py-2 fw-bold" type="submit" disabled={loading}>
                                    {loading ? "Criando..." : "Próximo Passo"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={onSubmitStep2}>
                            <h5 className="mb-4 fw-bold">Configurar Plano e Responsável</h5>
                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="form-label fw-semibold">Usuário Responsável (Pagador) *</label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={loadPayerOptions}
                                        defaultOptions
                                        placeholder="Digite o nome ou e-mail do usuário..."
                                        noOptionsMessage={() => "Nenhum usuário encontrado"}
                                        loadingMessage={() => "Buscando..."}
                                        onChange={(option: any) => {
                                            setSubscriptionData(p => ({ 
                                                ...p, 
                                                payerUserId: option ? option.value : "" 
                                            }));
                                        }}
                                        isClearable
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: "5px",
                                                borderRadius: "8px"
                                            })
                                        }}
                                    />
                                    <div className="form-text mt-2">Este usuário será o responsável financeiro pela empresa.</div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Plano *</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={subscriptionData.planCode}
                                        onChange={(e) => setSubscriptionData(p => ({ ...p, planCode: e.target.value as Plan }))}
                                        required
                                    >
                                        <option value="STARTER">STARTER - 1 Empresa</option>
                                        <option value="BUSINESS">BUSINESS - 5 Empresas</option>
                                        <option value="ENTERPRISE">ENTERPRISE - 15 Empresas</option>
                                    </select>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Status *</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={subscriptionData.status}
                                        onChange={(e) => setSubscriptionData(p => ({ ...p, status: e.target.value }))}
                                        required
                                    >
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="PAST_DUE">Em atraso</option>
                                        <option value="CANCELED">Cancelado</option>
                                        <option value="TRIALING">Degustação (Trial)</option>
                                    </select>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Início do Período</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={subscriptionData.currentPeriodStart}
                                        onChange={(e) => setSubscriptionData(p => ({ ...p, currentPeriodStart: e.target.value }))}
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Fim do Período</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={subscriptionData.currentPeriodEnd}
                                        onChange={(e) => setSubscriptionData(p => ({ ...p, currentPeriodEnd: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-top d-flex justify-content-between">
                                <button className="btn btn-outline-secondary px-4 py-2" type="button" onClick={() => setStep(1)} disabled={loading}>
                                    Voltar
                                </button>
                                <button className="btn btn-success px-5 py-2 fw-bold" type="submit" disabled={loading}>
                                    {loading ? "Finalizando..." : "Concluir e Criar Empresa"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
