"use client";

import React, { useState } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { fetchViaCep } from "@/lib/viaCep";
import { mapError } from "@/lib/errorMapper";

declare global {
    interface Window {
        Asaas: {
            createCardToken: (data: any, callback: (token: string) => void) => void;
        };
    }
}

// ─── Máscaras ────────────────────────────────────────────────────────────────

const maskCPF = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskCNPJ = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 14);
    return n
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const maskCPFCNPJ = (v: string) => {
    const n = v.replace(/\D/g, "");
    return n.length <= 11 ? maskCPF(n) : maskCNPJ(n);
};

const maskPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10)
        return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const maskCEP = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 8);
    return n.replace(/(\d{5})(\d)/, "$1-$2");
};

// ─── Estados BR ──────────────────────────────────────────────────────────────

const UF_LIST = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
    "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
    "RS","RO","RR","SC","SP","SE","TO",
];

// ─── Componente ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [orgCepLoading, setOrgCepLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [retryableError, setRetryableError] = useState<string | null>(null);

    const [payerUserId, setPayerUserId] = useState("");
    const [organizationCode, setOrganizationCode] = useState("");
    const [organizationName, setOrganizationName] = useState("");

    const [billingData, setBillingData] = useState({
        name: "",
        billingEmail: "",
        paymentMethod: "PIX",
        doc: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        country: "BR",
        status: "ACTIVE",
        phone: "",
        subscriptionStatus: "TRIAL",
        currentPeriodStart: "",
        currentPeriodEnd: "",
        trialEndsAt: "",
    });

    const [orgData, setOrgData] = useState({
        orgName: "",
        orgType: "",
        orgDoc: "",
        orgZipCode: "",
        orgStreet: "",
        orgNumber: "",
        orgNeighborhood: "",
        orgCity: "",
        orgState: "",
        orgComplement: "",
        subscriptionStatus: "TRIAL",
        currentPeriodStart: "",
        currentPeriodEnd: "",
        trialEndsAt: "",
    });

    const onlyNumbers = (val: string) => val.replace(/\D/g, "");

    const toTimestamp = (dateStr: string) => {
        if (!dateStr) return undefined;
        return Math.floor(new Date(dateStr).getTime() / 1000);
    };

    const now = new Date();
    const plus7Days = new Date(now);
    plus7Days.setDate(now.getDate() + 7);
    const nowISO = now.toISOString();
    const plus7DaysISO = plus7Days.toISOString();

    // ─── ViaCEP ───────────────────────────────────────────────────────────────

    const handleBillingCepBlur = async () => {
        const cep = onlyNumbers(billingData.zipCode);
        if (cep.length !== 8) {
            if (billingData.zipCode.trim()) toast.error("CEP inválido. Informe 8 dígitos.");
            return;
        }
        setCepLoading(true);
        const addr = await fetchViaCep(cep);
        setCepLoading(false);
        if (!addr) return;
        setBillingData(prev => ({
            ...prev,
            zipCode: maskCEP(addr.cep),
            street: prev.street || addr.street,
            neighborhood: prev.neighborhood || addr.neighborhood,
            city: prev.city || addr.city,
            state: prev.state || addr.state,
        }));
    };

    const handleOrgCepBlur = async () => {
        const cep = onlyNumbers(orgData.orgZipCode);
        if (cep.length !== 8) {
            if (orgData.orgZipCode.trim()) toast.error("CEP inválido. Informe 8 dígitos.");
            return;
        }
        setOrgCepLoading(true);
        const addr = await fetchViaCep(cep);
        setOrgCepLoading(false);
        if (!addr) return;
        setOrgData(prev => ({
            ...prev,
            orgZipCode: maskCEP(addr.cep),
            orgStreet: prev.orgStreet || addr.street,
            orgNeighborhood: prev.orgNeighborhood || addr.neighborhood,
            orgCity: prev.orgCity || addr.city,
            orgState: prev.orgState || addr.state,
            orgComplement: prev.orgComplement || addr.complement || "",
        }));
    };

    // ─── Submissões ───────────────────────────────────────────────────────────

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setRetryableError(null);
        setLoading(true);
        try {
            const payload = {
                ...billingData,
                doc: onlyNumbers(billingData.doc),
                zipCode: onlyNumbers(billingData.zipCode),
                phone: onlyNumbers(billingData.phone),
                currentPeriodStart: toTimestamp(nowISO),
                currentPeriodEnd: toTimestamp(plus7DaysISO),
                trialEndsAt: toTimestamp(plus7DaysISO),
            };
            const response = await api.post("/me/onboarding/user", payload);
            const returnedPayerUserId = response.data?.billingAccountId;
            if (!returnedPayerUserId) throw new Error("Não foi possível obter o ID do pagador.");
            setPayerUserId(returnedPayerUserId);
            toast.success("Dados salvos!");
            setStep(2);
            setFieldErrors({});
        } catch (error: unknown) {
            const mapped = mapError(error);
            if (Object.keys(mapped.fields).length > 0) {
                setFieldErrors(mapped.fields);
            } else if (mapped.retryable && mapped.global) {
                setRetryableError(mapped.global);
            } else if (mapped.global) {
                toast.error(mapped.global);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setRetryableError(null);
        setLoading(true);
        try {
            const payload = {
                code: crypto.randomUUID(),
                name: orgData.orgName,
                companyType: orgData.orgType,
                city: orgData.orgCity,
                street: orgData.orgStreet,
                number: orgData.orgNumber,
                zipCode: onlyNumbers(orgData.orgZipCode),
                state: orgData.orgState,
                complement: orgData.orgComplement,
                neighborhood: orgData.orgNeighborhood,
                country: "BR",
                doc: onlyNumbers(orgData.orgDoc),
                status: orgData.subscriptionStatus,
                currentPeriodStart: toTimestamp(nowISO),
                currentPeriodEnd: toTimestamp(plus7DaysISO),
                trialEndsAt: toTimestamp(plus7DaysISO),
            };
            const response = await api.post("/me/onboarding/organization", payload);
            const returnedOrgCode = response.data?.codeOrganization;
            const returnedOrgName = response.data?.nameOrganization;
            if (!returnedOrgCode) throw new Error("Erro ao criar organização.");
            setOrganizationCode(returnedOrgCode);
            setOrganizationName(returnedOrgName);
            window.localStorage.setItem("organizationCode", returnedOrgCode);
            window.localStorage.setItem("organizationName", returnedOrgName);
            toast.success("Organização criada! Redirecionando...");
            window.location.replace("/");
        } catch (error: unknown) {
            const mapped = mapError(error);
            if (Object.keys(mapped.fields).length > 0) {
                setFieldErrors(mapped.fields);
            } else if (mapped.retryable && mapped.global) {
                setRetryableError(mapped.global);
            } else if (mapped.global) {
                toast.error(mapped.global);
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Progress ─────────────────────────────────────────────────────────────

    const renderProgress = () => (
        <div className="d-flex justify-content-center align-items-center mb-4 gap-0">
            {[1, 2].map((s, index) => (
                <React.Fragment key={s}>
                    <div className="d-flex flex-column align-items-center" style={{ minWidth: 72 }}>
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                                width: 36,
                                height: 36,
                                fontSize: "0.85rem",
                                transition: "all 0.3s",
                                backgroundColor: step > s ? "#16a34a" : step === s ? "#0B5ED7" : "#e5e7eb",
                                color: step >= s ? "#fff" : "#9ca3af",
                                border: `2px solid ${step > s ? "#16a34a" : step === s ? "#0B5ED7" : "#e5e7eb"}`,
                            }}
                        >
                            {step > s ? "✓" : s}
                        </div>
                        <span
                            className="mt-1 text-center"
                            style={{
                                fontSize: "0.7rem",
                                fontWeight: step === s ? 700 : 400,
                                color: step === s ? "#083B7A" : "#6b7280",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {s === 1 ? "Seus dados" : "Sua empresa"}
                        </span>
                    </div>
                    {index < 1 && (
                        <div
                            style={{
                                height: 2,
                                width: 48,
                                marginBottom: 18,
                                backgroundColor: step > 1 ? "#16a34a" : "#e5e7eb",
                                transition: "background-color 0.3s",
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div
            className="min-vh-100 d-flex align-items-start align-items-md-center justify-content-center py-4 py-md-5"
            style={{ backgroundColor: "#F3F4F6" }}
        >
            <div className="w-100 px-3" style={{ maxWidth: 680 }}>

                {/* Logo / título */}
                <div className="text-center mb-4">
                    <h1 className="fw-bold mb-1" style={{ color: "#083B7A", fontSize: "1.5rem" }}>
                        Easy Maintenance
                    </h1>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                        Configure sua conta em 2 passos rápidos
                    </p>
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

                    {/* Barra de progresso superior */}
                    <div style={{ height: 4, backgroundColor: "#e5e7eb" }}>
                        <div
                            style={{
                                height: "100%",
                                width: step === 1 ? "50%" : "100%",
                                backgroundColor: "#0B5ED7",
                                transition: "width 0.4s ease",
                            }}
                        />
                    </div>

                    <div className="p-4 p-md-5">
                        {renderProgress()}

                        {/* ── STEP 1 ── */}
                        {step === 1 && (
                            <form onSubmit={handleStep1} noValidate>
                                <p className="fw-semibold mb-3" style={{ color: "#083B7A", fontSize: "0.95rem" }}>
                                    Dados de faturamento
                                </p>

                                <div className="row g-3">
                                    {/* Nome */}
                                    <div className="col-12">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Nome completo do responsável
                                        </label>
                                        <input
                                            type="text"
                                            autoComplete="name"
                                            placeholder="Ex: João Silva"
                                            className={`form-control form-control-lg ${fieldErrors.name ? "is-invalid" : ""}`}
                                            required
                                            value={billingData.name}
                                            onChange={e => setBillingData(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                        {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
                                    </div>

                                    {/* Email */}
                                    <div className="col-12">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            E-mail de faturamento
                                        </label>
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            placeholder="Ex: financeiro@empresa.com.br"
                                            inputMode="email"
                                            className={`form-control form-control-lg ${fieldErrors.billingEmail ? "is-invalid" : ""}`}
                                            required
                                            value={billingData.billingEmail}
                                            onChange={e => setBillingData(prev => ({ ...prev, billingEmail: e.target.value }))}
                                        />
                                        {fieldErrors.billingEmail && <div className="invalid-feedback">{fieldErrors.billingEmail}</div>}
                                    </div>

                                    {/* CPF + Telefone */}
                                    <div className="col-sm-6">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            CPF
                                        </label>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            placeholder="000.000.000-00"
                                            inputMode="numeric"
                                            className={`form-control form-control-lg ${fieldErrors.doc ? "is-invalid" : ""}`}
                                            required
                                            value={billingData.doc}
                                            onChange={e =>
                                                setBillingData(prev => ({ ...prev, doc: maskCPF(e.target.value) }))
                                            }
                                        />
                                        {fieldErrors.doc && <div className="invalid-feedback">{fieldErrors.doc}</div>}
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Telefone / WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            autoComplete="tel"
                                            placeholder="(00) 00000-0000"
                                            inputMode="tel"
                                            className="form-control form-control-lg"
                                            required
                                            value={billingData.phone}
                                            onChange={e =>
                                                setBillingData(prev => ({ ...prev, phone: maskPhone(e.target.value) }))
                                            }
                                        />
                                    </div>

                                    {/* Método de pagamento */}
                                    <div className="col-12">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Método de pagamento preferido
                                        </label>
                                        <select
                                            className="form-select form-select-lg"
                                            value={billingData.paymentMethod}
                                            onChange={e => setBillingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                        >
                                            <option value="PIX">PIX</option>
                                            <option value="CARD">Cartão de crédito</option>
                                        </select>
                                    </div>

                                    {/* Endereço — sub-seção */}
                                    <div className="col-12 mt-2">
                                        <p className="fw-semibold mb-0" style={{ color: "#083B7A", fontSize: "0.9rem" }}>
                                            Endereço de cobrança
                                        </p>
                                        <hr className="mt-1 mb-0" />
                                    </div>

                                    {/* CEP */}
                                    <div className="col-sm-4">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            CEP
                                        </label>
                                        <div className="input-group input-group-lg">
                                            <input
                                                type="text"
                                                autoComplete="postal-code"
                                                placeholder="00000-000"
                                                inputMode="numeric"
                                                className={`form-control ${fieldErrors.zipCode ? "is-invalid" : ""}`}
                                                required
                                                value={billingData.zipCode}
                                                onChange={e =>
                                                    setBillingData(prev => ({ ...prev, zipCode: maskCEP(e.target.value) }))
                                                }
                                                onBlur={handleBillingCepBlur}
                                            />
                                            {cepLoading && (
                                                <span className="input-group-text bg-white border-start-0">
                                                    <span className="spinner-border spinner-border-sm text-primary" />
                                                </span>
                                            )}
                                            {fieldErrors.zipCode && <div className="invalid-feedback">{fieldErrors.zipCode}</div>}
                                        </div>
                                    </div>

                                    {/* Rua */}
                                    <div className="col-sm-8">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Logradouro
                                        </label>
                                        <input
                                            type="text"
                                            autoComplete="street-address"
                                            placeholder="Rua, Av, Travessa..."
                                            className="form-control form-control-lg"
                                            required
                                            value={billingData.street}
                                            onChange={e => setBillingData(prev => ({ ...prev, street: e.target.value }))}
                                        />
                                    </div>

                                    {/* Número + Bairro */}
                                    <div className="col-4 col-sm-3">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Número
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Nº"
                                            className="form-control form-control-lg"
                                            required
                                            value={billingData.number}
                                            onChange={e => setBillingData(prev => ({ ...prev, number: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-8 col-sm-5">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Bairro
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Bairro"
                                            className="form-control form-control-lg"
                                            required
                                            value={billingData.neighborhood}
                                            onChange={e => setBillingData(prev => ({ ...prev, neighborhood: e.target.value }))}
                                        />
                                    </div>

                                    {/* Cidade + UF */}
                                    <div className="col-8 col-sm-7">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            autoComplete="address-level2"
                                            placeholder="Cidade"
                                            className="form-control form-control-lg"
                                            required
                                            value={billingData.city}
                                            onChange={e => setBillingData(prev => ({ ...prev, city: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-4 col-sm-5">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Estado (UF)
                                        </label>
                                        <select
                                            className="form-select form-select-lg"
                                            required
                                            value={billingData.state}
                                            onChange={e => setBillingData(prev => ({ ...prev, state: e.target.value }))}
                                        >
                                            <option value="">UF</option>
                                            {UF_LIST.map(uf => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Banner trial */}
                                    <div className="col-12 mt-2">
                                        <div
                                            className="d-flex align-items-start gap-3 rounded-3 p-3"
                                            style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
                                        >
                                            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🎁</span>
                                            <div>
                                                <div className="fw-semibold" style={{ color: "#1E40AF", fontSize: "0.9rem" }}>
                                                    7 dias grátis — plano Business completo
                                                </div>
                                                <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                                                    IA, uploads, múltiplas empresas e muito mais. Sem cobrança agora.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {retryableError && (
                                    <div className="alert alert-danger d-flex align-items-center justify-content-between mt-4" role="alert">
                                        <span style={{ fontSize: "0.875rem" }}>{retryableError}</span>
                                        <button type="submit" className="btn btn-sm btn-outline-danger ms-3 flex-shrink-0">
                                            Tentar novamente
                                        </button>
                                    </div>
                                )}

                                <div className="d-grid mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-bold"
                                        disabled={loading}
                                        style={{ backgroundColor: "#0B5ED7", borderColor: "#0B5ED7" }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                Processando...
                                            </>
                                        ) : (
                                            "Próximo →"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── STEP 2 ── */}
                        {step === 2 && (
                            <form onSubmit={handleStep2} noValidate>
                                <p className="fw-semibold mb-3" style={{ color: "#083B7A", fontSize: "0.95rem" }}>
                                    Dados da sua organização
                                </p>

                                <div className="row g-3">
                                    {/* Nome da org */}
                                    <div className="col-12">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Nome da organização
                                        </label>
                                        <input
                                            type="text"
                                            autoComplete="organization"
                                            placeholder="Ex: Condomínio Solar das Palmeiras"
                                            className={`form-control form-control-lg ${fieldErrors.name ? "is-invalid" : ""}`}
                                            required
                                            value={orgData.orgName}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgName: e.target.value }))}
                                        />
                                        {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
                                    </div>

                                    {/* Tipo + CNPJ */}
                                    <div className="col-sm-6">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Tipo de organização
                                        </label>
                                        <select
                                            className="form-select form-select-lg"
                                            required
                                            value={orgData.orgType}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgType: e.target.value }))}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="CONDOMINIUM">Condomínio</option>
                                            <option value="HOSPITAL">Hospital / Clínica</option>
                                            <option value="SCHOOL">Escola / Faculdade</option>
                                            <option value="INDUSTRY">Indústria</option>
                                            <option value="OFFICE">Escritório</option>
                                            <option value="OTHER">Outro</option>
                                        </select>
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            CNPJ / CPF <span className="text-muted fw-normal">(opcional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="00.000.000/0001-00"
                                            inputMode="numeric"
                                            className="form-control form-control-lg"
                                            value={orgData.orgDoc}
                                            onChange={e =>
                                                setOrgData(prev => ({ ...prev, orgDoc: maskCPFCNPJ(e.target.value) }))
                                            }
                                        />
                                    </div>

                                    {/* Endereço */}
                                    <div className="col-12 mt-2">
                                        <p className="fw-semibold mb-0" style={{ color: "#083B7A", fontSize: "0.9rem" }}>
                                            Endereço da organização
                                        </p>
                                        <hr className="mt-1 mb-0" />
                                    </div>

                                    {/* CEP */}
                                    <div className="col-sm-4">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            CEP
                                        </label>
                                        <div className="input-group input-group-lg">
                                            <input
                                                type="text"
                                                autoComplete="postal-code"
                                                placeholder="00000-000"
                                                inputMode="numeric"
                                                className={`form-control ${fieldErrors.zipCode ? "is-invalid" : ""}`}
                                                required
                                                value={orgData.orgZipCode}
                                                onChange={e =>
                                                    setOrgData(prev => ({ ...prev, orgZipCode: maskCEP(e.target.value) }))
                                                }
                                                onBlur={handleOrgCepBlur}
                                            />
                                            {orgCepLoading && (
                                                <span className="input-group-text bg-white border-start-0">
                                                    <span className="spinner-border spinner-border-sm text-primary" />
                                                </span>
                                            )}
                                            {fieldErrors.zipCode && <div className="invalid-feedback">{fieldErrors.zipCode}</div>}
                                        </div>
                                    </div>

                                    {/* Rua */}
                                    <div className="col-sm-8">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Logradouro
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Rua, Av, Travessa..."
                                            className="form-control form-control-lg"
                                            required
                                            value={orgData.orgStreet}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgStreet: e.target.value }))}
                                        />
                                    </div>

                                    {/* Número + Bairro */}
                                    <div className="col-4 col-sm-3">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Número
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Nº"
                                            className="form-control form-control-lg"
                                            required
                                            value={orgData.orgNumber}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgNumber: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-8 col-sm-9">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Bairro
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Bairro"
                                            className="form-control form-control-lg"
                                            required
                                            value={orgData.orgNeighborhood}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgNeighborhood: e.target.value }))}
                                        />
                                    </div>

                                    {/* Cidade + UF */}
                                    <div className="col-8 col-sm-7">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Cidade"
                                            className="form-control form-control-lg"
                                            required
                                            value={orgData.orgCity}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgCity: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-4 col-sm-5">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Estado (UF)
                                        </label>
                                        <select
                                            className="form-select form-select-lg"
                                            required
                                            value={orgData.orgState}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgState: e.target.value }))}
                                        >
                                            <option value="">UF</option>
                                            {UF_LIST.map(uf => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Complemento */}
                                    <div className="col-12">
                                        <label className="form-label fw-medium" style={{ fontSize: "0.85rem" }}>
                                            Complemento <span className="text-muted fw-normal">(opcional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Bloco, Sala, Andar..."
                                            className="form-control form-control-lg"
                                            value={orgData.orgComplement}
                                            onChange={e => setOrgData(prev => ({ ...prev, orgComplement: e.target.value }))}
                                        />
                                    </div>

                                    {/* Banner trial */}
                                    <div className="col-12 mt-2">
                                        <div
                                            className="d-flex align-items-start gap-3 rounded-3 p-3"
                                            style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
                                        >
                                            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🎁</span>
                                            <div>
                                                <div className="fw-semibold" style={{ color: "#1E40AF", fontSize: "0.9rem" }}>
                                                    Sua empresa entra direto no plano Business por 7 dias
                                                </div>
                                                <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                                                    Após o período, escolha o plano ideal para o seu time.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {retryableError && (
                                    <div className="alert alert-danger d-flex align-items-center justify-content-between mt-4" role="alert">
                                        <span style={{ fontSize: "0.875rem" }}>{retryableError}</span>
                                        <button type="submit" className="btn btn-sm btn-outline-danger ms-3 flex-shrink-0">
                                            Tentar novamente
                                        </button>
                                    </div>
                                )}

                                <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-lg order-2 order-sm-1"
                                        onClick={() => {
                                            setStep(1);
                                            setFieldErrors({});
                                            setRetryableError(null);
                                        }}
                                        disabled={loading}
                                    >
                                        ← Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-bold flex-grow-1 order-1 order-sm-2"
                                        disabled={loading}
                                        style={{ backgroundColor: "#0B5ED7", borderColor: "#0B5ED7" }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                Criando organização...
                                            </>
                                        ) : (
                                            "Criar minha conta →"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <p className="text-center text-muted mt-3" style={{ fontSize: "0.75rem" }}>
                    Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
                </p>
            </div>
        </div>
    );
}
