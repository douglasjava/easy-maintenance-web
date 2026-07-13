"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney, formatDateTime } from "@/lib/formatters";
import { sourceTypeLabelMap, subscriptionStatusLabelMap } from "@/lib/enums/labels";
import PlanChangeDialog from "@/components/billing/PlanChangeDialog";
import ConfirmModal from "@/components/ConfirmModal";

type Plan = {
  code: string;
  name: string;
  priceCents: number;
};

type Subscription = {
  itemId: number;
  subscriptionId: number;
  sourceType: string;
  sourceId: string;
  planCode: string;
  payerAccountId: number;
  idUser: number;
  payerName: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  /** Itens cadastrados nesta organização, dentro do pool da conta (null para linhas USER). */
  itemsUsedByOrg: number | null;
  /** Total de itens usados somando todas as organizações da conta (pool compartilhado, TASK-111). */
  itemsUsedTotalAccount: number;
  /** Limite de itens do plano da conta (0 = ilimitado). */
  maxItems: number;
};

const C = {
  navy: "#0f172a", blue: "#1d4ed8", blueSoft: "#eff6ff",
  border: "#e2e8f0", muted: "#64748b", surface: "#ffffff",
  error: "#dc2626",
};

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  ACTIVE:    { label: "Ativo",     bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  PAST_DUE:  { label: "Atrasado",  bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  OVERDUE:   { label: "Vencido",   bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  CANCELED:  { label: "Cancelado", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  SUSPENDED: { label: "Suspenso",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  TRIALING:  { label: "Trial",     bg: C.blueSoft, color: C.blue,   dot: "#3b82f6" },
  BLOCKED:   { label: "Bloqueado", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  INACTIVE:  { label: "Inativo",   bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
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

function SkeletonRow() {
  return (
    <tr className="sub-skel">
      {[30,15,12,10,15,15,14].map((w,i) => (
        <td key={i} style={{ padding:"13px 14px", borderBottom:"1px solid #e2e8f0" }}>
          <div style={{ height:12, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0" }} />
        </td>
      ))}
    </tr>
  );
}

function CardSkeleton() {
  return (
    <div className="sub-skel" style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #e2e8f0" }}>
      {[50,35,25,20].map((w,i) => (
        <div key={i} style={{ height:12, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0", marginBottom:8 }} />
      ))}
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        {[60,60,60].map((_,i) => (
          <div key={i} style={{ height:28, flex:1, borderRadius:8, backgroundColor:"#e2e8f0" }} />
        ))}
      </div>
    </div>
  );
}

const SEL: React.CSSProperties = { width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, color:"#0f172a", background:"#fff", outline:"none" };
const INP: React.CSSProperties = { ...SEL };

const TH: React.CSSProperties = { padding:"11px 14px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#64748b", backgroundColor:"#f8fafc", borderBottom:"1px solid #e2e8f0" };
const TD: React.CSSProperties = { padding:"13px 14px", fontSize:13, color:"#0f172a", borderBottom:"1px solid #e2e8f0", verticalAlign:"middle" };

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", planCode: "", payerName: "" });

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; planCode: string; idUser: number } | null>(null);
  const [itemToCancel, setItemToCancel] = useState<{ id: number; idUser: number } | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  async function fetchPlans() {
    try {
      const res = await api.get("/private/admin/billing/plans");
      setPlans(res.data);
    } catch {
      // silent
    }
  }

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      const res = await api.get("/private/admin/billing/subscriptions", { params });
      setSubscriptions(res.data.content || []);
    } catch {
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isMounted) {
      fetchPlans();
      if (filters.status === "" && filters.planCode === "" && filters.payerName === "") {
        fetchSubscriptions();
      }
    }
  }, [isMounted, filters]);

  if (!isMounted) return null;

  async function handleCancelSubscription(itemId: number, idUser: number) {
    try {
      setCancelLoading(true);
      const adminToken = window.localStorage.getItem("adminToken");
      await api.post(`/private/admin/billing/subscription-items/${itemId}/cancel`, {}, {
        headers: { "X-Admin-Token": adminToken, "X-id-User": idUser },
      });
      toast.success("Assinatura cancelada com sucesso!");
      setItemToCancel(null);
      fetchSubscriptions();
    } catch {
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setCancelLoading(false);
    }
  }

  function handleOpenChangePlan(itemId: number, planCode: string, idUser: number) {
    setSelectedItem({ id: itemId, planCode, idUser });
    setIsPlanModalOpen(true);
  }

  // EPIC-014/TASK-116: plano único por conta — troca de plano e cancelamento só existem no
  // nível da conta (item USER). Organizações incluídas são somente-leitura no painel admin.
  const actionBtns = (sub: Subscription) => {
    if (sub.sourceType !== "USER") {
      return (
        <span style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>Incluída na conta</span>
      );
    }
    return sub.status === "ACTIVE" ? (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button onClick={() => handleOpenChangePlan(sub.itemId, sub.planCode, sub.idUser)}
          style={{ padding:"5px 12px", borderRadius:7, border:`1px solid ${C.blue}`, color:C.blue, fontSize:12, fontWeight:600, background:"#fff", cursor:"pointer" }}>
          Upgrade
        </button>
        <button onClick={() => handleOpenChangePlan(sub.itemId, sub.planCode, sub.idUser)}
          style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #64748b", color:"#64748b", fontSize:12, fontWeight:600, background:"#fff", cursor:"pointer" }}>
          Downgrade
        </button>
        <button onClick={() => setItemToCancel({ id: sub.itemId, idUser: sub.idUser })}
          style={{ padding:"5px 12px", borderRadius:7, border:`1px solid ${C.error}`, color:C.error, fontSize:12, fontWeight:600, background:"#fff", cursor:"pointer" }}>
          Cancelar
        </button>
      </div>
    ) : <span style={{ fontSize:12, color:C.muted }}>—</span>;
  };

  // Rótulo da linha "Tipo": para organizações, mostra o código da org (não dá para distinguir
  // múltiplas organizações da mesma conta só pelo sourceType).
  function typeLabel(sub: Subscription) {
    const base = sourceTypeLabelMap[sub.sourceType] ?? sub.sourceType;
    return sub.sourceType === "USER" ? base : `${base} · ${sub.sourceId}`;
  }

  // Coluna "Valor": itens ORGANIZATION não têm preço próprio (valueCents sempre 0) — mostrar o
  // valor da assinatura ali passaria a impressão de cobrança duplicada. Mostramos uso do pool.
  function valueCell(sub: Subscription) {
    if (sub.sourceType !== "USER") {
      const used = sub.itemsUsedByOrg ?? 0;
      return (
        <span style={{ fontSize:12, color:C.muted }}>
          {used} {used === 1 ? "item" : "itens"} nesta org.
        </span>
      );
    }
    const poolLabel = sub.maxItems > 0
      ? `${sub.itemsUsedTotalAccount}/${sub.maxItems} itens (conta)`
      : `${sub.itemsUsedTotalAccount} itens (conta, ilimitado)`;
    return (
      <>
        <div style={{ fontWeight:600 }}>{formatMoney(sub.totalCents)}</div>
        <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{poolLabel}</div>
      </>
    );
  }

  return (
    <BillingAdminLayout>
      <style>{`
        @keyframes sub-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .sub-skel { animation: sub-pulse 1.5s ease-in-out infinite; }
        .sub-tbl { display: block; }
        .sub-cards { display: none; }
        @media (max-width: 639px) {
          .sub-tbl { display: none !important; }
          .sub-cards { display: flex !important; flex-direction: column; gap: 12px; padding: 4px 0; }
        }
      `}</style>

      {/* Filters */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.05em" }}>Filtros</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Status</label>
            <select style={SEL} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">Todos</option>
              {Object.entries(subscriptionStatusLabelMap).map(([k, label]) => (
                <option key={k} value={k}>{String(label)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Plano</label>
            <select style={SEL} value={filters.planCode} onChange={e => setFilters(f => ({ ...f, planCode: e.target.value }))}>
              <option value="">Todos</option>
              {plans.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Responsável</label>
            <input style={INP} type="text" placeholder="Pesquisar por nome..."
              value={filters.payerName} onChange={e => setFilters(f => ({ ...f, payerName: e.target.value }))} />
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:14 }}>
          <button onClick={() => fetchSubscriptions()}
            style={{ padding:"8px 20px", borderRadius:8, backgroundColor:C.blue, color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer" }}>
            Filtrar
          </button>
          <button onClick={() => setFilters({ status:"", planCode:"", payerName:"" })}
            style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, background:"#fff", cursor:"pointer" }}>
            Limpar
          </button>
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        {/* Desktop */}
        <div className="sub-tbl" style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Responsável</th>
                <th style={TH}>Tipo</th>
                <th style={TH}>Status</th>
                <th style={TH}>Valor</th>
                <th style={TH}>Início</th>
                <th style={TH}>Fim</th>
                <th style={{ ...TH, textAlign:"right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_,i) => <SkeletonRow key={i} />)
                : subscriptions.length === 0
                  ? <tr><td colSpan={7} style={{ ...TD, textAlign:"center", color:C.muted, padding:48 }}>Nenhuma assinatura encontrada</td></tr>
                  : subscriptions.map((sub, idx) => (
                    <tr key={sub.subscriptionId || idx}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      style={{ transition:"background 0.15s" }}>
                      <td style={TD}><span style={{ fontWeight:600 }}>{sub.payerName}</span></td>
                      <td style={{ ...TD, color:C.muted, fontSize:12 }}>{typeLabel(sub)}</td>
                      <td style={TD}><DotBadge status={sub.status} /></td>
                      <td style={TD}>{valueCell(sub)}</td>
                      <td style={{ ...TD, fontSize:12, color:C.muted }}>{formatDateTime(sub.periodStart)}</td>
                      <td style={{ ...TD, fontSize:12, color:C.muted }}>{formatDateTime(sub.periodEnd)}</td>
                      <td style={{ ...TD, textAlign:"right" }}>{actionBtns(sub)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="sub-cards" style={{ padding:"12px 0" }}>
          {loading
            ? Array.from({ length: 4 }).map((_,i) => <CardSkeleton key={i} />)
            : subscriptions.map((sub, idx) => (
              <div key={sub.subscriptionId || idx} style={{ background:"#fff", borderRadius:12, padding:16, border:`1px solid ${C.border}`, margin:"0 4px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.navy }}>{sub.payerName}</div>
                  <DotBadge status={sub.status} />
                </div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>
                  {typeLabel(sub)}
                </div>
                <div style={{ fontSize:12, color:C.navy, marginBottom:4 }}>
                  {valueCell(sub)}
                </div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
                  {formatDateTime(sub.periodStart)} → {formatDateTime(sub.periodEnd)}
                </div>
                {actionBtns(sub)}
              </div>
            ))
          }
        </div>
      </div>

      {isPlanModalOpen && selectedItem && (
        <PlanChangeDialog
          show={isPlanModalOpen}
          onClose={() => { setIsPlanModalOpen(false); setSelectedItem(null); }}
          onSuccess={fetchSubscriptions}
          itemId={selectedItem.id}
          currentPlanCode={selectedItem.planCode}
          isAdmin={true}
          idUser={selectedItem.idUser}
        />
      )}

      <ConfirmModal
        show={!!itemToCancel}
        title="Cancelar Assinatura"
        message="Tem certeza que deseja cancelar esta assinatura? Esta ação removerá o acesso aos recursos relacionados ao final do período vigente."
        confirmLabel="Confirmar Cancelamento"
        cancelLabel="Manter Assinatura"
        loading={cancelLoading}
        onConfirm={() => itemToCancel && handleCancelSubscription(itemToCancel.id, itemToCancel.idUser)}
        onCancel={() => !cancelLoading && setItemToCancel(null)}
      />
    </BillingAdminLayout>
  );
}
