"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

type Metrics = {
    totalOrganizations: number;
    totalUsers: number;
    organizationsByPlan: {
        FREE: number;
        PRO: number;
        BUSINESS: number;
        ENTERPRISE: number;
    };
};

export default function PrivateDashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const adminToken = window.localStorage.getItem("adminToken");
                if (!adminToken) {
                    toast.error("Admin token not found");
                    return;
                }

                const { data } = await api.get("/private/admin/metrics", {
                    headers: { "X-Admin-Token": adminToken },
                });
                setMetrics(data);
            } catch (err) {
                console.error("Error fetching metrics", err);
                // Mocking data if endpoint doesn't exist yet to show the UI
                setMetrics({
                    totalOrganizations: 0,
                    totalUsers: 0,
                    organizationsByPlan: { FREE: 0, PRO: 0, BUSINESS: 0, ENTERPRISE: 0 }
                });
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <div className="mb-4">
                <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                    Painel de Administração Global
                </h1>
                <p className="text-muted mt-1 mb-0">
                    Visão geral e gestão de todo o sistema.
                </p>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div className="text-muted small">Total Empresas</div>
                        <div className="h2 mb-0">{loading ? "..." : metrics?.totalOrganizations}</div>
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div className="text-muted small">Total Usuários</div>
                        <div className="h2 mb-0">{loading ? "..." : metrics?.totalUsers}</div>
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div className="text-muted small">Planos gratuitos</div>
                        <div className="h2 mb-0 text-secondary">{loading ? "..." : metrics?.organizationsByPlan.FREE}</div>
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div className="text-muted small">Planos pagos</div>
                        <div className="h2 mb-0 text-primary">
                            {loading ? "..." : (
                                (metrics?.organizationsByPlan.PRO || 0) +
                                (metrics?.organizationsByPlan.BUSINESS || 0) +
                                (metrics?.organizationsByPlan.ENTERPRISE || 0)
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title" style={{ color: COLORS.primaryDark }}>Empresas</h5>
                            <p className="card-text text-muted">Gerenciar todas as organizações</p>
                            <Link href="/private/organizations" className="btn btn-primary mt-auto">
                                Ver Empresas
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title" style={{ color: COLORS.primaryDark }}>Usuários</h5>
                            <p className="card-text text-muted">Gerenciar todos os usuários.</p>
                            <Link href="/private/users" className="btn btn-primary mt-auto">
                                Ver Usuários
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
