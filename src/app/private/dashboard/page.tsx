"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminDashboardService, AdminMetrics } from "@/services/private/admin-dashboard.service";
import PageHeader from "@/components/admin/PageHeader";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

export default function PrivateDashboardPage() {
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const data = await adminDashboardService.getMetrics();
                setMetrics(data);
            } catch (err) {
                console.error("Error fetching metrics", err);
                setMetrics({
                    totalOrganizations: 0,
                    totalUsers: 0,
                    organizationsByPlan: { STARTER: 0, BUSINESS: 0, ENTERPRISE: 0 }
                });
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <PageHeader 
                title="Painel de Administração Global" 
                description="Visão geral e gestão de todo o sistema."
            />

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-lg-4">
                    <div className="card border-0 shadow-sm text-center p-3 h-100">
                        <div className="text-muted small">Total Empresas</div>
                        <div className="h2 mb-0">{loading ? "..." : metrics?.totalOrganizations}</div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4">
                    <div className="card border-0 shadow-sm text-center p-3 h-100">
                        <div className="text-muted small">Total Usuários</div>
                        <div className="h2 mb-0">{loading ? "..." : metrics?.totalUsers}</div>
                    </div>
                </div>
                <div className="col-12 col-sm-12 col-lg-4">
                    <div className="card border-0 shadow-sm text-center p-3 h-100">
                        <div className="text-muted small">Planos ativos</div>
                        <div className="h2 mb-0 text-primary">
                            {loading ? "..." : (
                                (metrics?.organizationsByPlan.STARTER || 0) +
                                (metrics?.organizationsByPlan.BUSINESS || 0) +
                                (metrics?.organizationsByPlan.ENTERPRISE || 0)
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title fw-bold" style={{ color: COLORS.primaryDark }}>Empresas</h5>
                            <p className="card-text text-muted small">Gerenciar todas as organizações cadastradas no sistema.</p>
                            <Link href="/private/organizations" className="btn btn-primary mt-auto">
                                Ver Empresas
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title fw-bold" style={{ color: COLORS.primaryDark }}>Usuários</h5>
                            <p className="card-text text-muted small">Gerenciar todos os usuários e suas permissões.</p>
                            <Link href="/private/users" className="btn btn-primary mt-auto">
                                Ver Usuários
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-12 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title fw-bold" style={{ color: COLORS.primaryDark }}>Faturamento</h5>
                            <p className="card-text text-muted small">Gerenciar assinaturas, faturas e planos globais.</p>
                            <Link href="/private/admin/billing" className="btn btn-primary mt-auto">
                                Ver Faturamento
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
