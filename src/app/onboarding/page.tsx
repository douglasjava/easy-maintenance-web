"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/apiClient";
import toast from "react-hot-toast";
import {fetchViaCep} from "@/lib/viaCep";

// Declaração do SDK ASAAS no TypeScript
declare global {
    interface Window {
        Asaas: {
            createCardToken: (data: any, callback: (token: string) => void) => void;
        };
    }
}

export default function OnboardingPage() {
    const router = useRouter();

    // Estados do Wizard
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // IDs retornados pelas APIs
    const [payerUserId, setPayerUserId] = useState<string>("");
    const [organizationCode, setOrganizationCode] = useState<string>("");
    const [organizationName, setOrganizationName] = useState<string>("");

    // Dados do Step 1 — Faturamento
    const [billingData, setBillingData] = useState({
        name: "",
        billingEmail: "",
        paymentMethod: "CARD", // default CARD
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
        planCode: "FREE",
        subscriptionStatus: "ACTIVE",
        currentPeriodStart: "",
        currentPeriodEnd: "",
        trialEndsAt: "",
    });

    // Dados do Step 2 — Organização
    const [orgData, setOrgData] = useState({
        orgName: "",
        orgDoc: "",
        orgZipCode: "",
        orgStreet: "",
        orgNumber: "",
        orgNeighborhood: "",
        orgCity: "",
        orgState: "",
        orgComplement: "",
        planCode: "FREE",
        subscriptionStatus: "ACTIVE",
        currentPeriodStart: "",
        currentPeriodEnd: "",
        trialEndsAt: "",
    });

    // Helpers de Formatação
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

    // ViaCEP: handlers para preenchimento automático de endereço
    const handleBillingCepBlur = async () => {
        const cep = onlyNumbers(billingData.zipCode);
        if (cep.length !== 8) {
            if (billingData.zipCode.trim()) toast.error("CEP inválido. Informe 8 dígitos.");
            return;
        }
        const addr = await fetchViaCep(cep);
        if (!addr) {
            //toast.error("CEP não encontrado no ViaCEP.");
            return;
        }
        setBillingData({
            ...billingData,
            zipCode: addr.cep,
            street: billingData.street || addr.street,
            neighborhood: billingData.neighborhood || addr.neighborhood,
            city: billingData.city || addr.city,
            state: billingData.state || addr.state,
        });
    };

    const handleOrgCepBlur = async () => {
        const cep = onlyNumbers(orgData.orgZipCode);
        if (cep.length !== 8) {
            if (orgData.orgZipCode.trim()) toast.error("CEP inválido. Informe 8 dígitos.");
            return;
        }
        const addr = await fetchViaCep(cep);
        if (!addr) {
            //toast.error("CEP não encontrado no ViaCEP.");
            return;
        }
        setOrgData({
            ...orgData,
            orgZipCode: addr.cep,
            orgStreet: orgData.orgStreet || addr.street,
            orgNeighborhood: orgData.orgNeighborhood || addr.neighborhood,
            orgCity: orgData.orgCity || addr.city,
            orgState: orgData.orgState || addr.state,
            orgComplement: orgData.orgComplement || addr.complement || "",
        });
    };

    // Handlers de Submissão
    // Envia Dados de usuário
    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {

            const payload = {
                ...billingData,
                doc: onlyNumbers(billingData.doc),
                zipCode: onlyNumbers(billingData.zipCode),
                phone: onlyNumbers(billingData.phone),
                currentPeriodStart: toTimestamp(nowISO),
                currentPeriodEnd: toTimestamp(plus7DaysISO),
                trialEndsAt: toTimestamp(plus7DaysISO)
            };

            const response = await api.post("/me/onboarding/user", payload);
            const returnedPayerUserId = response.data?.billingAccountId;

            if (!returnedPayerUserId) {
                throw new Error("Não foi possível obter o ID do pagador.");
            }

            setPayerUserId(returnedPayerUserId);
            toast.success("Dados de faturamento salvos!");

            setStep(2);

        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Erro ao salvar dados de faturamento.");
        } finally {
            setLoading(false);
        }
    };

    // Envia dados de organização
    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                code: crypto.randomUUID(),
                name: orgData.orgName,
                plan: billingData.planCode,
                city: orgData.orgCity,
                street: orgData.orgStreet,
                number: orgData.orgNumber,
                zipCode: onlyNumbers(orgData.orgZipCode),
                state: orgData.orgState,
                complement: orgData.orgComplement,
                neighborhood: orgData.orgNeighborhood,
                country: "BR",
                doc: onlyNumbers(orgData.orgDoc),
                planCode: orgData.planCode,
                status: orgData.subscriptionStatus,
                currentPeriodStart: toTimestamp(nowISO),
                currentPeriodEnd: toTimestamp(plus7DaysISO),
                trialEndsAt: toTimestamp(plus7DaysISO)
            };

            const response = await api.post("/me/onboarding/organization", payload);
            const returnedOrgCode = response.data?.codeOrganization;
            const returnedOrgName = response.data?.nameOrganization;

            if (!returnedOrgCode) {
                // Se a API retornar o objeto criado, tentamos pegar o ID
                throw new Error("Erro ao criar organização.");
            }

            setOrganizationCode(returnedOrgCode);
            setOrganizationName(returnedOrgName);

            toast.success("Organização criada!");

            window.localStorage.setItem("organizationCode", organizationCode);
            window.localStorage.setItem("organizationName", organizationName);

            router.push("/");
            // Em alguns casos o reload é necessário se o estado global não reagir ao localStorage
            setTimeout(() => window.location.reload(), 100);

        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Erro ao criar organização.");
        } finally {
            setLoading(false);
        }
    };

    // Renderizador do Indicador de Progresso
    const renderProgress = () => {
        // Se PIX, removemos o step 2 visualmente ou marcamos como pulado
        const visibleSteps = [1, 2];

        return (
            <div className="d-flex justify-content-center mb-5 mt-3">
                {visibleSteps.map((s, index) => (
                    <React.Fragment key={s}>
                        <div className="d-flex flex-column align-items-center" style={{width: "80px"}}>
                            <div
                                className={`rounded-circle d-flex align-items-center justify-content-center border ${step === s ? "bg-primary text-white border-primary" : step > s ? "bg-success text-white border-success" : "bg-white text-muted border-secondary"}`}
                                style={{width: "35px", height: "35px", fontWeight: "bold", transition: "all 0.3s"}}
                            >
                                {step > s ? "✓" : s === 3 && billingData.paymentMethod === "PIX" ? 2 : index + 1}
                            </div>
                            <small className="mt-1 text-center"
                                   style={{fontSize: "0.7rem", fontWeight: step === s ? "bold" : "normal"}}>
                                {s === 1 && "Dados do Usuário"}
                                {s === 2 && "Dados da Empresa"}
                            </small>
                        </div>
                        {index < visibleSteps.length - 1 && (
                            <div className="align-self-center border-top flex-grow-0"
                                 style={{width: "40px", height: "2px", marginBottom: "15px"}}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-5"
             style={{backgroundColor: "#F3F4F6"}}>
            <div className="container" style={{maxWidth: "1260px"}}>
                <div className="position-relative">

                    {/* Card branco principal */}
                    <div className="card border-0 shadow-sm p-4 p-md-5 position-relative" style={{zIndex: 1}}>

                        <div className="text-center mb-4">
                            <h2 className="fw-bold" style={{color: "#083B7A"}}>Configuração da Conta</h2>
                            <p className="text-muted">Complete os passos abaixo para começar</p>
                        </div>

                        {renderProgress()}

                        {/* STEP 1 */}
                        {step === 1 && (
                            <form onSubmit={handleStep1}>
                                <h5 className="mb-4 border-bottom pb-2">Dados de Faturamento</h5>
                                <div className="row g-3">
                                    <div className="col-md-5">
                                        <label className="form-label">Nome do Responsável</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.name}
                                            onChange={e => setBillingData({
                                                ...billingData,
                                                name: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label">E-mail de Faturamento</label>
                                        <input
                                            type="email" className="form-control" required
                                            value={billingData.billingEmail}
                                            onChange={e => setBillingData({
                                                ...billingData,
                                                billingEmail: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Método</label>
                                        <select
                                            className="form-select"
                                            value={billingData.paymentMethod}
                                            onChange={e => setBillingData({
                                                ...billingData,
                                                paymentMethod: e.target.value
                                            })}
                                        >
                                            <option value="CARD">Cartão</option>
                                            <option value="PIX">PIX</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">CPF/CNPJ (Documento)</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.doc}
                                            onChange={e => setBillingData({...billingData, doc: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Telefone</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.phone}
                                            onChange={e => setBillingData({...billingData, phone: e.target.value})}
                                        />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">CEP</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.zipCode}
                                            onChange={e => setBillingData({...billingData, zipCode: e.target.value})}
                                            onBlur={handleBillingCepBlur}
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label">Logradouro (Rua/Av)</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.street}
                                            onChange={e => setBillingData({...billingData, street: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Número</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.number}
                                            onChange={e => setBillingData({...billingData, number: e.target.value})}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Bairro</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.neighborhood}
                                            onChange={e => setBillingData({
                                                ...billingData,
                                                neighborhood: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Cidade</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={billingData.city}
                                            onChange={e => setBillingData({...billingData, city: e.target.value})}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Estado (UF)</label>
                                        <input
                                            type="text" className="form-control" maxLength={2} required
                                            value={billingData.state}
                                            onChange={e => setBillingData({
                                                ...billingData,
                                                state: e.target.value.toUpperCase()
                                            })}
                                        />
                                    </div>

                                    <h5 className="mb-4 border-bottom pb-2">Dados do plano</h5>

                                    <div className="col-md-2">
                                        <label className="form-label">Plano</label>
                                        <select
                                            className="form-select"
                                            value={billingData.planCode}
                                            onChange={e => setBillingData({...billingData, planCode: e.target.value})}
                                            required
                                        >
                                            <option value="FREE">FREE</option>
                                            <option value="STARTER">STARTER</option>
                                            <option value="BUSINESS">BUSINESS</option>
                                            <option value="ENTERPRISE">ENTERPRISE</option>
                                        </select>
                                    </div>

                                    {/* Legenda dos planos */}
                                    <div className="col-md-10">
                                        <label className="form-label d-block">Legenda dos planos</label>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <strong>FREE</strong>
                                                <div className="text-muted small">1 empresa</div>
                                            </div>

                                            <div className="col-md-3">
                                                <strong>STARTER</strong>
                                                <div className="text-muted small">2 empresas</div>
                                            </div>

                                            <div className="col-md-3">
                                                <strong>BUSINESS</strong>
                                                <div className="text-muted small">5 empresas</div>
                                            </div>

                                            <div className="col-md-3">
                                                <strong>ENTERPRISE</strong>
                                                <div className="text-muted small">Ilimitado</div>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                <div className="d-flex justify-content-end mt-5">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-5 py-2 fw-bold"
                                        disabled={loading}
                                        style={{backgroundColor: "#0B5ED7"}}
                                    >
                                        {loading ? "Processando..." : "Próximo →"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <form onSubmit={handleStep2}>
                                <h5 className="mb-4 border-bottom pb-2">Sua Organização</h5>
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label">Nome da Organização</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={orgData.orgName}
                                            onChange={e => setOrgData({...orgData, orgName: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Documento (CNPJ/CPF)</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={orgData.orgDoc}
                                            onChange={e => setOrgData({...orgData, orgDoc: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">CEP</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={orgData.orgZipCode}
                                            onChange={e => setOrgData({...orgData, orgZipCode: e.target.value})}
                                            onBlur={handleOrgCepBlur}
                                        />
                                    </div>
                                    <div className="col-md-9">
                                        <label className="form-label">Rua</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={orgData.orgStreet}
                                            onChange={e => setOrgData({...orgData, orgStreet: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Número</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={orgData.orgNumber}
                                            onChange={e => setOrgData({...orgData, orgNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Bairro</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={orgData.orgNeighborhood}
                                            onChange={e => setOrgData({...orgData, orgNeighborhood: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Cidade</label>
                                        <input
                                            type="text" className="form-control" required
                                            value={orgData.orgCity}
                                            onChange={e => setOrgData({...orgData, orgCity: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">UF</label>
                                        <input
                                            type="text" className="form-control" maxLength={2} required
                                            value={orgData.orgState}
                                            onChange={e => setOrgData({
                                                ...orgData,
                                                orgState: e.target.value.toUpperCase()
                                            })}
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label">Complemento</label>
                                        <input
                                            type="text" className="form-control"
                                            value={orgData.orgComplement}
                                            onChange={e => setOrgData({...orgData, orgComplement: e.target.value})}
                                        />
                                    </div>

                                    <h5 className="mb-4 border-bottom pb-2">Dados do plano</h5>

                                    <div className="col-md-2">
                                        <label className="form-label">Plano</label>
                                        <select
                                            className="form-select"
                                            value={orgData.planCode}
                                            onChange={e => setOrgData({...orgData, planCode: e.target.value})}
                                            required
                                        >
                                            <option value="FREE">FREE</option>
                                            <option value="STARTER">STARTER</option>
                                            <option value="BUSINESS">BUSINESS</option>
                                            <option value="ENTERPRISE">ENTERPRISE</option>
                                        </select>
                                    </div>

                                    {/* Legenda dos planos */}
                                    <div className="col-md-10">
                                        <label className="form-label d-block">Legenda dos planos</label>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <strong>FREE</strong>
                                                <div className="text-muted small">1 empresa</div>
                                            </div>

                                            <div className="col-md-3">
                                                <strong>STARTER</strong>
                                                <div className="text-muted small">2 empresas</div>
                                            </div>

                                            <div className="col-md-3">
                                                <strong>BUSINESS</strong>
                                                <div className="text-muted small">5 empresas</div>
                                            </div>

                                            <div className="col-md-3">
                                                <strong>ENTERPRISE</strong>
                                                <div className="text-muted small">Ilimitado</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="d-flex justify-content-between mt-5">
                                    <button
                                        type="button"
                                        className="btn btn-link text-muted"
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                    >
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-5 py-2 fw-bold"
                                        disabled={loading}
                                        style={{backgroundColor: "#0B5ED7"}}
                                    >
                                        {loading ? "Criando..." : "Próximo →"}
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
