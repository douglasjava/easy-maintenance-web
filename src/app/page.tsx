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

    const [checking, setChecking] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);

    // parâmetros
    const [daysAhead, setDaysAhead] = useState(30);
    const [nearDueThresholdDays, setNearDueThresholdDays] = useState(7);
    const [limitAttention, setLimitAttention] = useState(5);

    // dados
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* =========================
       Auth client-side
    ========================= */
    useEffect(() => {
        try {
            const ls = localStorage;
            const ss = sessionStorage;
            const token = ls.getItem("accessToken") || ss.getItem("accessToken");
            // const org = ls.getItem("organizationCode") || ss.getItem("organizationCode");

            if (token) {
                setIsAuthed(true);
            } else {
                router.replace("/login");
            }
        } catch {
            router.replace("/login");
        } finally {
            setChecking(false);
        }
    }, [router]);

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
        if (isAuthed && !checking) {
            fetchDashboard();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthed, checking]);

    if (checking) return <p className="p-3">Carregando…</p>;
    if (!isAuthed) return <p className="p-3">Redirecionando…</p>;

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
        <section style={{backgroundColor: "#f8f9fa", minHeight: "100vh"}} className="pb-5">
            <div className="container">
                <DashboardHeader 
                    title="Dashboard" 
                    subtitle="Visão geral de manutenções, prazos e conformidade" 
                />

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
    );
}
