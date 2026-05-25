"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "./BillingAdminLayout";
import { formatMoney } from "@/lib/formatters";
import GenerateInvoicesModal from "@/components/billing/GenerateInvoicesModal";

type OverviewData = {
  counters: {
    totalOrganizations: number;
    totalPayers: number;
    estimatedMonthlyRevenueCents: number;
  };
  payers: {
    content: Array<{
      userId: number;
      name: string;
      email: string;
      totalPrice: number;
      orgCount: number;
      userSubscription: {
        planCode: string;
        planName: string;
        priceCents: number;
        status: string;
        currentPeriodEnd: string;
      };
      organizations: Array<{
        organizationId: number;
        organizationCode: string;
        organizationName: string;
        planCode: string;
        planName: string;
        priceCents: number;
        status: string;
        currentPeriodEnd: string;
      }>;
      revenue: {
        userCents: number;
        orgsCents: number;
        totalCents: number;
      };
    }>;
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  };
};

const C = {
  navy: "#0f172a", blue: "#1d4ed8", blueSoft: "#eff6ff",
  border: "#e2e8f0", muted: "#64748b", surface: "#ffffff",
  success: "#15803d", successBg: "#f0fdf4",
};

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  ACTIVE:    { label: "Ativo",     bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  INACTIVE:  { label: "Inativo",   bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  PAST_DUE:  { label: "Atrasado",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  OVERDUE:   { label: "Vencido",   bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  CANCELED:  { label: "Cancelado", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  TRIALING:  { label: "Trial",     bg: C.blueSoft, color: C.blue,    dot: "#3b82f6" },
  SUSPENDED: { label: "Suspenso",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  BLOCKED:   { label: "Bloqueado", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
};

function DotBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, backgroundColor:c.bg, color:c.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor:c.dot, flexShrink:0 }} />
      {c.label}
    </span>
  );
}

function MetricCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? C.successBg : C.surface,
      border: `1px solid ${accent ? "#bbf7d0" : C.border}`,
      borderRadius:12, padding:"20px 24px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
      </div>
      <div style={{ fontSize:28, fontWeight:800, color: accent ? C.success : C.navy }}>{value}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="bov-skel">
      {[35,28,15,14,10].map((w,i) => (
        <td key={i} style={{ padding:"14px 16px", borderBottom:"1px solid #e2e8f0" }}>
          <div style={{ height:13, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0" }} />
        </td>
      ))}
    </tr>
  );
}

function CardSkeleton() {
  return (
    <div className="bov-skel" style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
      {[50,35,25,20].map((w,i) => (
        <div key={i} style={{ height:12, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0", marginBottom:8 }} />
      ))}
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
        <div style={{ height:28, width:90, borderRadius:8, backgroundColor:"#e2e8f0" }} />
      </div>
    </div>
  );
}

const TH: React.CSSProperties = { padding:"11px 16px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:C.muted, backgroundColor:"#f8fafc", borderBottom:`1px solid ${C.border}` };
const TD: React.CSSProperties = { padding:"14px 16px", fontSize:13, color:C.navy, borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" };

export default function BillingOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    async function fetchOverview() {
      try {
        setLoading(true);
        const res = await api.get(`/private/admin/billing/overview?page=${page}&size=${size}`);
        setData(res.data);
      } catch {
        toast.error("Erro ao carregar visão geral do faturamento");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [page, size, isMounted]);

  if (!isMounted) return null;

  const payers = data?.payers;

  return (
    <BillingAdminLayout>
      <style>{`
        @keyframes bov-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .bov-skel { animation: bov-pulse 1.5s ease-in-out infinite; }
        .bov-tbl { display: block; }
        .bov-cards { display: none; }
        @media (max-width: 639px) {
          .bov-tbl { display: none !important; }
          .bov-cards { display: flex !important; flex-direction: column; gap: 12px; padding: 4px 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <h6 style={{ fontWeight:700, margin:0, color:C.navy }}>Visão Geral de Faturamento</h6>
        <button
          data-bs-toggle="modal"
          data-bs-target="#generateInvoicesModal"
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, backgroundColor:C.blue, color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer" }}
        >
          Gerar Faturas
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16, marginBottom:32 }}>
        <MetricCard label="Total Organizações" value={data?.counters.totalOrganizations ?? 0} icon="🏢" />
        <MetricCard label="Total Pagadores"    value={data?.counters.totalPayers ?? 0}         icon="👥" />
        <MetricCard label="Receita Mensal Est." value={formatMoney(data?.counters.estimatedMonthlyRevenueCents ?? 0)} icon="💰" accent />
      </div>

      {/* Payers table */}
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}` }}>
          <h6 style={{ fontWeight:700, margin:0, fontSize:14, color:C.navy }}>Pagadores e Assinaturas</h6>
        </div>

        {/* Desktop */}
        <div className="bov-tbl" style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Pagador / E-mail</th>
                <th style={{ ...TH, textAlign:"center" }}>Assinatura</th>
                <th style={{ ...TH, textAlign:"center" }}>Orgs</th>
                <th style={{ ...TH, textAlign:"center" }}>Receita Total</th>
                <th style={{ ...TH, textAlign:"right" }} />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_,i) => <SkeletonRow key={i} />)
                : !payers?.content?.length
                  ? <tr><td colSpan={5} style={{ ...TD, textAlign:"center", color:C.muted, padding:48 }}>Nenhum pagador encontrado</td></tr>
                  : payers.content.map(p => (
                    <tr key={p.userId}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      style={{ transition:"background 0.15s" }}>
                      <td style={TD}>
                        <div style={{ fontWeight:700 }}>{p.name}</div>
                        <div style={{ fontSize:12, color:C.muted }}>{p.email}</div>
                      </td>
                      <td style={{ ...TD, textAlign:"center" }}>
                        {p.userSubscription ? (
                          <>
                            <DotBadge status={p.userSubscription.status} />
                            <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>{p.userSubscription.planName}</div>
                            <div style={{ fontSize:11, color:C.muted }}>{formatMoney(p.userSubscription.priceCents)}</div>
                          </>
                        ) : <span style={{ fontSize:12, color:C.muted }}>Sem plano</span>}
                      </td>
                      <td style={{ ...TD, textAlign:"center" }}>
                        <div style={{ fontWeight:700 }}>{p.orgCount}</div>
                        <div style={{ fontSize:11, color:C.muted }}>{p.organizations.map(o => o.planName).join(", ")}</div>
                      </td>
                      <td style={{ ...TD, textAlign:"center" }}>
                        <div style={{ fontWeight:700, color:C.blue }}>{formatMoney(p.revenue.totalCents)}</div>
                        <div style={{ fontSize:11, color:C.muted }}>User: {formatMoney(p.revenue.userCents)} | Orgs: {formatMoney(p.revenue.orgsCents)}</div>
                      </td>
                      <td style={{ ...TD, textAlign:"right" }}>
                        <Link href={`/private/users/${p.userId}`}
                          style={{ display:"inline-flex", alignItems:"center", padding:"6px 14px", borderRadius:8, border:`1px solid ${C.blue}`, color:C.blue, fontSize:12, fontWeight:600, textDecoration:"none" }}>
                          Ver Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="bov-cards">
          {loading
            ? Array.from({ length: 3 }).map((_,i) => <CardSkeleton key={i} />)
            : payers?.content?.map(p => (
              <div key={p.userId} style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:C.navy }}>{p.name}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{p.email}</div>
                  </div>
                  {p.userSubscription && <DotBadge status={p.userSubscription.status} />}
                </div>
                {p.userSubscription && (
                  <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Plano: <strong>{p.userSubscription.planName}</strong></div>
                )}
                <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>{p.orgCount} org(s) — Receita: <strong style={{ color:C.blue }}>{formatMoney(p.revenue.totalCents)}</strong></div>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <Link href={`/private/users/${p.userId}`}
                    style={{ display:"inline-flex", alignItems:"center", padding:"6px 14px", borderRadius:8, border:`1px solid ${C.blue}`, color:C.blue, fontSize:12, fontWeight:600, textDecoration:"none" }}>
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))
          }
        </div>

        {/* Pagination */}
        {payers && payers.totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderTop:`1px solid ${C.border}` }}>
            <span style={{ fontSize:13, color:C.muted }}>Página {payers.page + 1} de {payers.totalPages} ({payers.totalElements} registros)</span>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { label:"← Anterior", disabled: payers.page === 0,                   fn: () => setPage(p => p - 1) },
                { label:"Próxima →",  disabled: payers.page >= payers.totalPages - 1, fn: () => setPage(p => p + 1) },
              ].map(btn => (
                <button key={btn.label} disabled={btn.disabled || loading} onClick={btn.fn}
                  style={{ padding:"6px 14px", borderRadius:8, fontSize:13, fontWeight:600, border:`1px solid ${C.border}`, background:C.surface, color:C.navy, cursor:btn.disabled ? "not-allowed" : "pointer", opacity:btn.disabled ? 0.5 : 1 }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <GenerateInvoicesModal />
    </BillingAdminLayout>
  );
}
