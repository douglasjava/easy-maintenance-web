"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { useAccessContext } from "@/providers/AccessContextProvider";
import { PagePermissionGuard } from "@/components/access/PagePermissionGuard";
import {COMPANY_TYPE_MAP, CompanyType} from "@/types/ai-onboarding";

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
    doc: "",
    companyType: ""
};

export default function NewOrganizationPage() {
    const { accessContext } = useAccessContext();
    const canCreate = accessContext?.accountAccess.permissions.canCreateOrganization;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [payerUserId, setPayerUserId] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userId = window.localStorage.getItem("userId") || window.sessionStorage.getItem("userId") || "";
            setPayerUserId(userId);
        }
    }, []);

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

    // EPIC-014/TASK-118: plano único por conta — a organização não escolhe um plano próprio.
    // Um único passo: cria a empresa, vincula o usuário logado e provisiona o vínculo de
    // faturamento da organização automaticamente (o backend herda o plano já contratado pela
    // conta; ver OrganizationsService.addOrganizationSubscription).
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        const orgCode = crypto.randomUUID();

        const payload = {
            code: orgCode,
            name: formData.name.trim(),
            plan: "STARTER",
            city: formData.city?.trim() || undefined,
            street: formData.street?.trim() || undefined,
            number: formData.number?.trim() || undefined,
            zipCode: formData.zipCode?.replace(/\D/g, "") || undefined,
            state: formData.state?.trim() || undefined,
            complement: formData.complement?.trim() || undefined,
            neighborhood: formData.neighborhood?.trim() || undefined,
            companyType: formData.companyType?.trim() || undefined,
            doc: formData.doc?.replace(/\D/g, "") || undefined,
        };

        if (!payload.name) {
            toast.error("Por favor, preencha o nome da empresa.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/organizations", payload);

            // Vincula o usuário logado à organização criada — o backend provisiona
            // automaticamente o vínculo de faturamento da organização nesse momento,
            // herdando o plano já contratado pela conta (UsersService.addOrganization).
            if (payerUserId) {
                await api.post(`/organizations/${orgCode}/users/${payerUserId}`);
            }

            toast.success("Empresa criada com sucesso.");

            // Se o usuário não tinha organização selecionada, seleciona a recém criada
            if (typeof window !== "undefined") {
                const storage = window.localStorage.getItem("isLoggedIn") ? window.localStorage : window.sessionStorage;
                if (!storage.getItem("organizationCode")) {
                    storage.setItem("organizationCode", orgCode);
                    storage.setItem("organizationName", formData.name);
                }
                // Full reload garante que o TopBar re-busca a lista atualizada de empresas
                window.location.href = "/";
            }
        } catch (err) {
            console.error("Error creating organization", err);
            toast.error("Erro ao criar empresa. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <PagePermissionGuard allowed={canCreate} redirectHref="/organizations">
            <section style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }} className="p-3">
            <div className="container-fluid" style={{ maxWidth: "1200px" }}>
                {/* TOPO */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                            Nova Empresa
                        </h1>
                        <p className="text-muted mt-1 mb-0">
                            Cadastre a empresa, condomínio ou cliente que utilizará o sistema
                        </p>
                    </div>

                    <Link className="btn btn-outline-secondary" href="/organizations">
                        ← Voltar
                    </Link>
                </div>

                {/* CARD PRINCIPAL */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <form onSubmit={onSubmit}>
                                {/* BLOCO: DADOS DA ORGANIZAÇÃO */}
                                <div className="mb-4">
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-bold small">Nome da Empresa</label>
                                            <input
                                                className="form-control"
                                                placeholder="Ex: ACME Indústria e Comércio"
                                                value={formData.name}
                                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-bold small">Tipo da Empresa</label>
                                            <select
                                                className="form-select"
                                                value={formData.companyType}
                                                onChange={(e) => setFormData(p => ({ ...p, companyType: e.target.value }))}
                                            >
                                                {Object.entries(COMPANY_TYPE_MAP).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-bold small">Documento (CNPJ/OUTROS)</label>
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

                                        <div className="col-12 col-md-10">
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
                                    </div>
                                </div>

                                {/* AÇÕES */}
                                <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
                                    <button className="btn btn-primary px-5 py-2 fw-bold" disabled={loading}>
                                        {loading ? "Criando..." : "Criar Empresa ✓"}
                                    </button>

                                    <button
                                        className="btn btn-outline-secondary px-4 py-2"
                                        type="button"
                                        onClick={() => setFormData(EMPTY_FORM)}
                                    >
                                        Limpar
                                    </button>
                                </div>
                        </form>
                    </div>
                </div>
                </div>
            </section>
        </PagePermissionGuard>
    );
}