"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney } from "@/lib/formatters";
import PlanModal from "@/components/billing/PlanModal";
import { billingCycleLabelMap, statusMap } from "@/lib/enums/labels";

type Plan = {
  code: string;
  name: string;
  priceCents: number;
  billingCycle: string;
  status: string;
  featuresJson: string;
};

const C = {
  navy: "#0f172a", blue: "#1d4ed8", blueSoft: "#eff6ff",
  border: "#e2e8f0", muted: "#64748b", surface: "#ffffff",
};

function parseFeatures(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === "object" && parsed !== null)
      return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`);
    return [];
  } catch {
    return [];
  }
}

function StatusPill({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600,
      backgroundColor: active ? "#f0fdf4" : "#f1f5f9",
      color: active ? "#15803d" : "#475569",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor: active ? "#22c55e" : "#94a3b8", flexShrink:0 }} />
      {statusMap[status] ?? status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="plan-skel" style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.border}` }}>
      {[35,20,25,12,12,12].map((w,i) => (
        <div key={i} style={{ height:i===0?18:12, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0", marginBottom:i===0?14:8 }} />
      ))}
      <div style={{ height:32, width:80, borderRadius:8, backgroundColor:"#e2e8f0", marginTop:16, marginLeft:"auto" }} />
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchPlans();
  }, []);

  if (!isMounted) return null;

  async function fetchPlans() {
    try {
      setLoading(true);
      const res = await api.get("/private/admin/billing/plans");
      setPlans(res.data);
    } catch {
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BillingAdminLayout>
      <style>{`
        @keyframes plan-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .plan-skel { animation: plan-pulse 1.5s ease-in-out infinite; }
        .plan-card { transition: box-shadow 0.18s, transform 0.18s; }
        .plan-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09); transform: translateY(-2px); }
      `}</style>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h6 style={{ fontWeight:700, margin:0, color:C.navy }}>Planos</h6>
          <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{plans.length} plano(s) cadastrado(s)</div>
        </div>
        <button
          data-bs-toggle="modal"
          data-bs-target="#planModal"
          onClick={() => setSelectedPlan(null)}
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, backgroundColor:C.blue, color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer" }}
        >
          + Criar Plano
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : plans.length === 0
            ? (
              <div style={{ gridColumn:"1/-1", textAlign:"center", padding:48, color:C.muted, fontSize:14 }}>
                Nenhum plano cadastrado
              </div>
            )
            : plans.map(plan => {
              const features = parseFeatures(plan.featuresJson);
              return (
                <div key={plan.code} className="plan-card" style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:18, color:C.navy }}>{plan.name}</div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:2, fontFamily:"monospace" }}>{plan.code}</div>
                    </div>
                    <StatusPill status={plan.status} />
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <span style={{ fontSize:28, fontWeight:800, color:C.blue }}>{formatMoney(plan.priceCents)}</span>
                    <span style={{ fontSize:13, color:C.muted, marginLeft:4 }}>/{billingCycleLabelMap[plan.billingCycle] ?? plan.billingCycle}</span>
                  </div>

                  {features.length > 0 && (
                    <ul style={{ margin:0, padding:0, listStyle:"none", marginBottom:20 }}>
                      {features.map((f, i) => (
                        <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#334155", marginBottom:6 }}>
                          <span style={{ color:"#22c55e", fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"auto", paddingTop:8 }}>
                    <button
                      data-bs-toggle="modal"
                      data-bs-target="#planModal"
                      onClick={() => setSelectedPlan(plan)}
                      style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${C.blue}`, color:C.blue, fontSize:12, fontWeight:600, background:C.surface, cursor:"pointer" }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })
        }
      </div>

      <PlanModal plan={selectedPlan} onSave={fetchPlans} />
    </BillingAdminLayout>
  );
}
