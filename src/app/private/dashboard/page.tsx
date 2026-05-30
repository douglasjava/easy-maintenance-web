"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminDashboardService, AdminMetrics } from "@/services/private/admin-dashboard.service";

const C = {
  navy: "#0f172a",
  blue: "#1d4ed8",
  blueSoft: "#eff6ff",
  border: "#e2e8f0",
  muted: "#64748b",
  surface: "#ffffff",
  bg: "#f8fafc",
};

const PLAN_CFG = {
  STARTER:    { label: "Starter",    bar: "#94a3b8", badge: "#f1f5f9", badgeText: "#64748b" },
  BUSINESS:   { label: "Business",   bar: "#3b82f6", badge: "#eff6ff", badgeText: "#1d4ed8" },
  ENTERPRISE: { label: "Enterprise", bar: "#8b5cf6", badge: "#f5f3ff", badgeText: "#7c3aed" },
};

function MetricSkeleton() {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="dash-skel" style={{ height: 12, width: "45%", borderRadius: 6, background: "#e2e8f0" }} />
        <div className="dash-skel" style={{ height: 20, width: 20, borderRadius: 6, background: "#e2e8f0" }} />
      </div>
      <div className="dash-skel" style={{ height: 38, width: "55%", borderRadius: 8, background: "#e2e8f0", marginBottom: 8 }} />
      <div className="dash-skel" style={{ height: 10, width: "35%", borderRadius: 6, background: "#e2e8f0" }} />
    </div>
  );
}

function PlanBar({
  planKey,
  count,
  total,
  animated,
}: {
  planKey: keyof typeof PLAN_CFG;
  count: number;
  total: number;
  animated: boolean;
}) {
  const cfg = PLAN_CFG[planKey];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{cfg.label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: C.muted }}>{count} org.</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: cfg.badge, color: cfg.badgeText }}>
            {pct}%
          </span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: "#e2e8f0", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: animated ? `${pct}%` : "0%",
            background: cfg.bar,
            borderRadius: 6,
            transition: "width 0.9s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
        />
      </div>
    </div>
  );
}

export default function PrivateDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    const d = new Date();
    setDateLabel(
      d.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    );
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await adminDashboardService.getMetrics();
        setMetrics(data);
      } catch {
        setMetrics({ totalOrganizations: 0, totalUsers: 0, organizationsByPlan: { STARTER: 0, BUSINESS: 0, ENTERPRISE: 0 } });
      } finally {
        setLoading(false);
        setTimeout(() => setAnimated(true), 80);
      }
    }
    fetchMetrics();
  }, []);

  const totalPlans = metrics
    ? (metrics.organizationsByPlan.STARTER || 0) +
      (metrics.organizationsByPlan.BUSINESS || 0) +
      (metrics.organizationsByPlan.ENTERPRISE || 0)
    : 0;

  const kpis = [
    { label: "Total de Empresas", value: metrics?.totalOrganizations ?? 0, icon: "🏢", accent: C.blue,    sub: "empresas cadastradas" },
    { label: "Total de Usuários", value: metrics?.totalUsers ?? 0,          icon: "👥", accent: "#0891b2", sub: "usuários no sistema"       },
    { label: "Planos Ativos",     value: totalPlans,                         icon: "📊", accent: "#7c3aed", sub: "assinaturas vigentes"      },
  ];

  const actions = [
    { icon: "🏢", title: "Empresas",    desc: "Visualize e gerencie todas as organizações cadastradas, perfis e status de cada conta.",              href: "/private/organizations",   label: "Ver Empresas",    accent: C.blue    },
    { icon: "👥", title: "Usuários",    desc: "Administre usuários, perfis de acesso, permissões e vínculos com as organizações do sistema.",        href: "/private/users",           label: "Ver Usuários",    accent: "#0891b2" },
    { icon: "💳", title: "Faturamento", desc: "Gerencie assinaturas, faturas, planos e dados financeiros de todas as organizações ativas.",          href: "/private/admin/billing",   label: "Ver Faturamento", accent: "#7c3aed" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 24px 52px" }}>
      <style>{`
        @keyframes dash-pulse  { 0%,100%{opacity:1} 50%{opacity:.42} }
        @keyframes dash-reveal { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .dash-skel { animation: dash-pulse 1.5s ease-in-out infinite; }
        .dash-s0 { animation: dash-reveal 0.45s 0.00s ease both; }
        .dash-s1 { animation: dash-reveal 0.45s 0.08s ease both; }
        .dash-s2 { animation: dash-reveal 0.45s 0.16s ease both; }
        .dash-s3 { animation: dash-reveal 0.45s 0.24s ease both; }
        .dash-kcard { transition: box-shadow 0.18s, transform 0.18s; }
        .dash-kcard:hover { box-shadow: 0 6px 24px rgba(15,23,42,0.09) !important; transform: translateY(-1px); }
        .dash-acard { transition: box-shadow 0.18s, transform 0.18s; }
        .dash-acard:hover { box-shadow: 0 10px 36px rgba(15,23,42,0.11) !important; transform: translateY(-2px); }
        .dash-abtn:hover { filter: brightness(0.90); }
        @media (max-width: 639px) {
          .dash-hrow   { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; }
          .dash-kgrid  { grid-template-columns: 1fr !important; }
          .dash-agrid  { grid-template-columns: 1fr !important; }
          .dash-date   { display: none !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .dash-kgrid { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-agrid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="dash-hrow dash-s0" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.2 }}>
            Painel de Administração
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: "5px 0 0", fontWeight: 400 }}>
            Visão geral e gestão global do sistema Easy Maintenance
          </p>
        </div>
        {dateLabel && (
          <div className="dash-date" style={{ fontSize: 12, color: C.muted, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", whiteSpace: "nowrap", fontWeight: 500 }}>
            {dateLabel}
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="dash-kgrid dash-s1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
        {loading
          ? [0, 1, 2].map(i => <MetricSkeleton key={i} />)
          : kpis.map((kpi, i) => (
            <div key={i} className="dash-kcard" style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px", position: "relative", overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: kpi.accent }} />
              <div style={{ paddingLeft: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {kpi.label}
                  </span>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{kpi.icon}</span>
                </div>
                <div style={{ fontSize: 38, fontWeight: 800, color: C.navy, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 6 }}>
                  {kpi.value.toLocaleString("pt-BR")}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{kpi.sub}</div>
              </div>
            </div>
          ))
        }
      </div>

      {/* ── Plan Distribution ── */}
      <div className="dash-s2" style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 22px 6px", marginBottom: 16, boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 3 }}>Distribuição por Plano</div>
            <div style={{ fontSize: 12, color: C.muted }}>Empresas ativas por categoria de assinatura</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", whiteSpace: "nowrap" }}>
            {loading ? "—" : `${totalPlans} total`}
          </span>
        </div>
        {loading ? (
          <div style={{ paddingBottom: 14 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div className="dash-skel" style={{ height: 11, width: "45%", borderRadius: 6, background: "#e2e8f0", marginBottom: 8 }} />
                <div className="dash-skel" style={{ height: 6, borderRadius: 6, background: "#e2e8f0" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ paddingBottom: 8 }}>
            <PlanBar planKey="STARTER"    count={metrics?.organizationsByPlan.STARTER    || 0} total={totalPlans} animated={animated} />
            <PlanBar planKey="BUSINESS"   count={metrics?.organizationsByPlan.BUSINESS   || 0} total={totalPlans} animated={animated} />
            <PlanBar planKey="ENTERPRISE" count={metrics?.organizationsByPlan.ENTERPRISE || 0} total={totalPlans} animated={animated} />
          </div>
        )}
      </div>

      {/* ── Management Actions ── */}
      <div className="dash-s3">
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Gerenciamento
        </div>
        <div className="dash-agrid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {actions.map((action, i) => (
            <div key={i} className="dash-acard" style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${action.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14, flexShrink: 0 }}>
                {action.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{action.title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{action.desc}</div>
              <Link
                href={action.href}
                className="dash-abtn"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "9px 18px", borderRadius: 8, background: action.accent, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "filter 0.15s" }}
              >
                {action.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
