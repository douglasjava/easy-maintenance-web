"use client";

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/apiClient";
import {DashboardHeader} from "@/components/dashboard/DashboardHeader";
import {KPIGrid} from "@/components/dashboard/KPIGrid";
import {AttentionCard} from "@/components/dashboard/AttentionCard";
import {BreakdownCard} from "@/components/dashboard/BreakdownCard";
import {QuickActions} from "@/components/dashboard/QuickActions";
import {useAuth} from "@/contexts/AuthContext";
import {PrivateRoute} from "@/components/PrivateRoute";

/* =========================
   Tipos
 ========================= */

interface DashboardKpis {
    itemsTotal: number;
    overdueCount: number;
    nearDueCount: number;
    dueSoonCount: number;
    maintenancesThisMonth: number;
    avgDaysToResolve: number;
    complianceScore: number;
}

interface AttentionItem {
    itemId: number;
    itemType: string;
    itemCategory: string;
    status: string;
    nextDueAt: string;
    daysLate: number;
    riskLevel: string;
}

interface BreakdownByItemType {
    itemType: string;
    count: number;
}

interface DashboardResponse {
    kpis: DashboardKpis;
    attentionNow: AttentionItem[];
    calendar: any[];
    breakdowns: {
        byStatus: Record<string, number>;
        byCategory: Record<string, number>;
        byItemType: BreakdownByItemType[];
    };
    quickActions: { type: string; label: string; [k: string]: any }[];
}

/* =========================
   Página
========================= */
export default function DashboardPage() {
    const router = useRouter();
    const { isBlocked, token, loading: authLoading } = useAuth();

    // parâmetros
    const [daysAhead, setDaysAhead] = useState(30);
    const [nearDueThresholdDays, setNearDueThresholdDays] = useState(7);
    const [limitAttention, setLimitAttention] = useState(5);

    // dados
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params = useMemo(
        () => ({daysAhead, nearDueThresholdDays, limitAttention}),
        [daysAhead, nearDueThresholdDays, limitAttention]
    );

    async function fetchDashboard() {
        const orgCode = localStorage.getItem("organizationCode") || sessionStorage.getItem("organizationCode");
        if (!orgCode) {
            setLoading(false);
            return;
        }

        setError(null);
        setLoading(true);
        try {
            const res = await api.get<DashboardResponse>("/dashboard", {params});
            setData(res.data);
        } catch (e: any) {
            setError(
                e?.response?.data?.message ||
                e?.message ||
                "Falha ao carregar dashboard."
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token && !authLoading) {
            fetchDashboard();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, authLoading]);

    if (authLoading) return <p className="p-3">Carregando…</p>;
    if (!token) return <p className="p-3">Redirecionando…</p>;

    function formatDate(dt?: string) {
        if (!dt) return "-";
        try {
            const d = new Date(dt + (dt.includes("T") ? "" : "T00:00:00"));
            return d.toLocaleDateString("pt-BR");
        } catch {
            return dt;
        }
    }

    /* =========================
       Render
    ========================= */
    return (
        <PrivateRoute>
            <section style={{backgroundColor: "#f8f9fa", minHeight: "100vh"}} className="pb-5">
                <div className="container">
                    <DashboardHeader 
                        title="Dashboard" 
                        subtitle="Visão geral de manutenções, prazos e conformidade" 
                    />

                    {isBlocked && (
                        <div className="alert alert-warning border-0 shadow-sm mb-4 rounded-4 p-4 d-flex align-items-center">
                            <div className="me-3 bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </div>
                            <div>
                                <h5 className="fw-bold mb-1">Assinatura Expirada</h5>
                                <p className="mb-0 text-muted">Seu período de avaliação terminou. Finalize o pagamento para continuar.</p>
                                <Link href="/billing" className="btn btn-warning btn-sm mt-2 fw-bold px-3">
                                    Regularizar agora
                                </Link>
                            </div>
                        </div>
                    )}

                    {!data && !loading && !error ? (
                    <div className="alert alert-info border-0 shadow-sm text-center py-5 rounded-4">
                        <h5 className="fw-bold">Bem-vindo ao Easy Maintenance!</h5>
                        <p className="mb-4 text-muted">Você ainda não selecionou ou não possui uma empresa vinculada.</p>
                        <Link href="/organizations/new" className="btn btn-primary px-4 py-2 fw-semibold rounded-pill">
                            Cadastrar minha primeira empresa
                        </Link>
                    </div>
                ) : (
                    <>
                        {data && <KPIGrid kpis={data.kpis} />}

                        <div className="row g-4">
                            <div className="col-12 col-lg-7">
                                {data && <AttentionCard items={data.attentionNow} />}
                            </div>
                            <div className="col-12 col-lg-5">
                                {data && (
                                    <BreakdownCard 
                                        statusBreakdown={data.breakdowns.byStatus}
                                        categoryBreakdown={data.breakdowns.byCategory}
                                        itemTypeBreakdown={data.breakdowns.byItemType}
                                    />
                                )}
                            </div>
                        </div>

                        {data && <QuickActions />}
                    </>
                )}

                {error && (
                    <div className="alert alert-danger border-0 shadow-sm mt-4 rounded-3">
                        {error}
                    </div>
                )}
            </div>
        </section>
        </PrivateRoute>
    );
}
