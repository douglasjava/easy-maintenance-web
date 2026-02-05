"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import Image from "next/image";
import toast from "react-hot-toast";

type Organization = {
    id: string;
    name: string;
    code: string;
};

function SelectOrganizationContent() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
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
                setOrganizations(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Erro ao buscar organizações:", err);
                toast.error("Erro ao carregar suas empresas.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrganizations();
    }, [router]);

    function handleSelect(org: Organization) {
        if (typeof window !== "undefined") {
            const remember = !!window.localStorage.getItem("accessToken");
            const storage = remember ? window.localStorage : window.sessionStorage;
            
            storage.setItem("organizationCode", org.code);
            storage.setItem("organizationName", org.name);
            
            toast.success(`Empresa ${org.name} selecionada.`);
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
                {organizations.map((org) => (
                    <button
                        key={org.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                        onClick={() => handleSelect(org)}
                    >
                        <span className="fw-semibold text-dark">{org.name}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                ))}
            </div>

            {organizations.length === 0 && (
                <p className="text-center text-muted mt-3">Nenhuma empresa encontrada para o seu usuário.</p>
            )}

            <div className="login-foot mt-4">
                <button 
                    className="btn btn-link text-decoration-none" 
                    onClick={() => {
                        window.localStorage.removeItem("accessToken");
                        window.sessionStorage.removeItem("accessToken");
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
