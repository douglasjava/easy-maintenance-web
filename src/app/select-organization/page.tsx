"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import Image from "next/image";
import toast from "react-hot-toast";

type OrganizationItem = {
    organization: {
        id: string;
        name: string;
        code: string;
    };
};

function SelectOrganizationContent() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrganizations() {
            try {
                const userId = typeof window !== "undefined" ? window.sessionStorage.getItem("userId") || window.localStorage.getItem("userId") : null;
                
                if (!userId) {
                    router.replace("/login");
                    return;
                }

                const { data } = await api.get(`/auth/me/organizations/${userId}`);
                const orgsList = Array.isArray(data) ? data : [];
                setOrganizations(orgsList);

                // Se houver apenas uma, seleciona automaticamente
                if (orgsList.length === 1) {
                    handleSelect(orgsList[0]);
                } else if (orgsList.length === 0) {
                    // Se não houver nenhuma, redireciona para criação (já tem o botão na tela, mas reforça)
                    router.replace("/organizations/new");
                }
            } catch (err) {
                console.error("Erro ao buscar organizações:", err);
                toast.error("Erro ao carregar suas empresas.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrganizations();
    }, [router]);

    function handleSelect(item: OrganizationItem) {
        if (typeof window !== "undefined") {
            const remember = !!window.localStorage.getItem("accessToken");
            const storage = remember ? window.localStorage : window.sessionStorage;
            
            storage.setItem("organizationCode", item.organization.code);
            storage.setItem("organizationName", item.organization.name);
            
            toast.success(`Empresa ${item.organization.name} selecionada.`);
            router.replace("/");
        }
    }

    if (loading) {
        return <div className="text-center p-5">Carregando empresas...</div>;
    }

    return (
        <div className="login-form mt-4">
            <p className="login-sub mb-4">Selecione a empresa que deseja acessar:</p>
            <div className="list-group shadow-sm">
                {organizations.map((item) => (
                    <button
                        key={item.organization.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                        onClick={() => handleSelect(item)}
                    >
                        <span className="fw-semibold text-dark">{item.organization.name}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                ))}
            </div>

            {organizations.length === 0 && (
                <div className="text-center mt-3">
                    <p className="text-muted">Nenhuma empresa encontrada para o seu usuário.</p>
                    <button 
                        className="btn btn-primary w-100 mt-2"
                        onClick={() => router.push("/organizations/new")}
                    >
                        Cadastrar Nova Empresa
                    </button>
                </div>
            )}

            <div className="login-foot mt-4">
                <button 
                    className="btn btn-link text-decoration-none" 
                    onClick={() => {
                        if (typeof window !== "undefined") {
                            window.localStorage.removeItem("organizationCode");
                            window.localStorage.removeItem("organizationName");
                            window.localStorage.removeItem("accessToken");
                            window.localStorage.removeItem("tokenType");
                            window.localStorage.removeItem("userId");
                            window.localStorage.removeItem("userName");

                            window.sessionStorage.removeItem("organizationCode");
                            window.sessionStorage.removeItem("organizationName");
                            window.sessionStorage.removeItem("accessToken");
                            window.sessionStorage.removeItem("tokenType");
                            window.sessionStorage.removeItem("userId");
                            window.sessionStorage.removeItem("userName");
                        }
                        router.replace("/login");
                    }}
                >
                    Sair e entrar com outra conta
                </button>
            </div>
        </div>
    );
}

export default function SelectOrganizationPage() {
    return (
        <section className="login-screen">
            <div className="login-hero" aria-hidden />

            <div className="login-card">
                <div className="login-brand">
                    <Image
                        src="/logo.png"
                        alt="Easy Maintenance"
                        width={180}
                        height={48}
                        priority
                    />
                </div>

                <h1 className="login-title">Acessar Empresa</h1>
                
                <Suspense fallback={<div className="text-center p-5">Carregando...</div>}>
                    <SelectOrganizationContent />
                </Suspense>
            </div>
        </section>
    );
}
