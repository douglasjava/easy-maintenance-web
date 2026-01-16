"use client";

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/apiClient";
import {categoryLabelMap, riskLevelLabelMap, statusLabelMap} from "@/lib/enums/labels";

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
            const org = ls.getItem("organizationCode") || ss.getItem("organizationCode");

            if (token && org) {
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
        <section style={{backgroundColor: "#F3F4F6"}} className="p-3">
            {/* TOPO */}
            <div className="text-center mb-4">
                <h1 className="h4 m-0" style={{color: "#083B7A"}}>
                    Dashboard
                </h1>
                <p className="text-muted mt-1">
                    Visão geral de manutenções, prazos e conformidade
                </p>
            </div>

            {/* KPIs */}
            <div className="row g-3 mb-4">
                <Kpi label="Itens" value={data?.kpis?.itemsTotal} color="#083B7A"/>
                <Kpi
                    label="Atrasados"
                    value={data?.kpis?.overdueCount}
                    color="#F59E0B"
                />
                <Kpi
                    label="Vencendo"
                    value={data?.kpis?.nearDueCount}
                    color="#0B5ED7"
                />
                <Kpi
                    label="Este mês"
                    value={data?.kpis?.maintenancesThisMonth}
                    color="#6B7280"
                />
            </div>

            <div className="row g-3">
                {/* ATENÇÃO AGORA */}
                <div className="col-12 col-lg-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                            <h2 className="h6 mb-3" style={{color: "#083B7A"}}>
                                Atenção agora
                            </h2>

                            {loading && <p>Carregando…</p>}

                            {!loading && (data?.attentionNow?.length ?? 0) === 0 && (
                                <p className="text-muted m-0">
                                    Nenhuma pendência crítica no momento.
                                </p>
                            )}

                            {!loading && (data?.attentionNow?.length ?? 0) > 0 && (
                                <ul className="list-group list-group-flush">
                                    {data!.attentionNow!.map((it, idx) => (
                                        <li
                                            key={idx}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                            style={{
                                                borderLeft: "4px solid #F59E0B",
                                                backgroundColor: "#FFFFFF",
                                            }}
                                        >
                                            <div>
                                                <div className="fw-semibold">
                                                    {it.itemType}
                                                </div>
                                                <div className="small text-muted">
                                                    Risco: {riskLevelLabelMap[it.riskLevel] || it.riskLevel}
                                                </div>
                                            </div>
                                            <div className="small text-muted text-nowrap">
                                                {formatDate(it.nextDueAt)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* DISTRIBUIÇÕES */}
                <div className="col-12 col-lg-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                            <h2 className="h6 mb-3" style={{color: "#083B7A"}}>
                                Distribuições
                            </h2>

                            <div className="row g-3">
                                <DistributionBlock
                                    title="Por Status"
                                    data={data?.breakdowns?.byStatus}
                                    labels={statusLabelMap}
                                />
                                <DistributionBlock
                                    title="Por Categoria"
                                    data={data?.breakdowns?.byCategory}
                                    labels={categoryLabelMap}
                                />
                                <div className="col-12">
                                    <div className="border rounded p-3 bg-white">
                                        <div className="fw-semibold mb-2">Por Tipo de Item</div>
                                        {data?.breakdowns?.byItemType?.length ? (
                                            <ul className="m-0 ps-3">
                                                {data.breakdowns.byItemType.map((r) => (
                                                    <li key={r.itemType}>
                                                        {r.itemType}: {r.count}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-muted">-</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AÇÕES RÁPIDAS */}
            <div className="card border-0 shadow-sm mt-4">
                <div className="card-body">
                    <h2 className="h6 mb-3" style={{color: "#083B7A"}}>
                        Ações rápidas
                    </h2>

                    <div className="d-flex flex-wrap gap-2">
                        <Link className="btn btn-primary" href="/items/new?origin=dashboard">
                            + Cadastrar Item
                        </Link>
                        <Link className="btn btn-outline-primary" href="/items?origin=dashboard">
                            Ver Itens
                        </Link>
                        <Link className="btn btn-outline-secondary" href="/maintenances?origin=dashboard">
                            Ver Manutenções
                        </Link>
                    </div>
                </div>
            </div>

            {error && <p className="text-danger mt-3">{error}</p>}
        </section>
    );
}

/* =========================
   Componentes auxiliares
========================= */
function Kpi({
                 label,
                 value,
                 color,
             }: {
    label: string;
    value?: number;
    color: string;
}) {
    return (
        <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center">
                <div className="card-body">
                    <div className="small text-muted">{label}</div>
                    <div className="h4 fw-bold m-0" style={{color}}>
                        {value ?? "-"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DistributionBlock({
                               title,
                               data,
                               labels,
                           }: {
    title: string;
    data?: Record<string, number>;
    labels?: Record<string, string>;
}) {
    return (
        <div className="col-12 col-md-6">
            <div className="border rounded p-3 bg-white h-100">
                <div className="fw-semibold mb-2">{title}</div>
                {data ? (
                    <ul className="m-0 ps-3">
                        {Object.entries(data).map(([k, v]) => (
                            <li key={k}>
                                {labels?.[k] || k}: {v}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-muted">-</div>
                )}
            </div>
        </div>
    );
}
