"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { formatMoney } from "@/lib/formatters";
import { CheckCircle2, XCircle, Lock } from "lucide-react";

interface PlanFeatures {
  maxItems: number;
  maxUsers: number;
  maxOrganizations: number;
  aiEnabled: boolean;
  reportsEnabled: boolean;
  aiMonthlyCredits: number;
  emailMonthlyLimit: number;
  supportLevel: string;
}

export interface PublicPlan {
  code: string;
  name: string;
  priceCents: number;
  billingCycle: "MONTHLY" | "YEARLY";
  features: PlanFeatures;
}

interface Props {
  currentPlanCode: string | null;
  onUpgradeClick: () => void;
}

const FEATURE_ROWS: { key: keyof PlanFeatures; label: string; format: (v: any) => string }[] = [
  { key: "maxItems", label: "Itens cadastrados", format: (v) => (v <= 0 ? "Ilimitado" : String(v)) },
  { key: "maxUsers", label: "Usuários por organização", format: (v) => (v <= 0 ? "Ilimitado" : String(v)) },
  { key: "maxOrganizations", label: "Organizações", format: (v) => (v <= 0 ? "Ilimitado" : String(v)) },
  { key: "aiEnabled", label: "Assistente IA", format: (v) => (v ? "Incluso" : "Não incluso") },
  { key: "reportsEnabled", label: "Exportação de relatórios", format: (v) => (v ? "Incluso" : "Não incluso") },
  { key: "aiMonthlyCredits", label: "Créditos IA/mês", format: (v) => (v <= 0 ? "—" : String(v)) },
  { key: "emailMonthlyLimit", label: "E-mails/mês", format: (v) => (v <= 0 ? "—" : String(v)) },
  { key: "supportLevel", label: "Suporte", format: (v) => v || "—" },
];

function isFeatureEnabled(key: keyof PlanFeatures, value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return !!value;
}

export default function PlanComparisonSection({ currentPlanCode, onUpgradeClick }: Props) {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/me/billing/plans")
      .then((res) => setPlans(res.data))
      .catch(() => {/* silent — comparison is non-critical */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4 text-muted small">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        Carregando planos...
      </div>
    );
  }

  if (plans.length === 0) return null;

  const currentPlanIndex = plans.findIndex((p) => p.code === currentPlanCode);

  return (
    <div className="mt-5">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Comparação de planos</h4>
        <p className="text-muted small mb-0">
          Veja o que cada plano oferece e faça upgrade a qualquer momento.
        </p>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle" style={{ minWidth: 600 }}>
          <thead>
            <tr className="table-light">
              <th style={{ width: "30%" }}>Recurso</th>
              {plans.map((plan, idx) => {
                const isCurrent = plan.code === currentPlanCode;
                return (
                  <th
                    key={plan.code}
                    className="text-center"
                    style={{
                      background: isCurrent ? "#e7f1ff" : undefined,
                      borderTop: isCurrent ? "3px solid #0B5ED7" : undefined,
                    }}
                  >
                    <div className="fw-bold">{plan.name}</div>
                    <div className="text-primary fw-bold">
                      {plan.priceCents === 0
                        ? "Gratuito"
                        : `${formatMoney(plan.priceCents)}/mês`}
                    </div>
                    {isCurrent ? (
                      <span className="badge bg-primary rounded-pill mt-1 d-inline-block">
                        Plano atual
                      </span>
                    ) : (
                      <button
                        className={`btn btn-sm mt-1 rounded-pill fw-medium px-3 ${
                          idx > currentPlanIndex ? "btn-primary" : "btn-outline-secondary"
                        }`}
                        onClick={onUpgradeClick}
                      >
                        {idx > currentPlanIndex ? "Fazer upgrade" : "Ver plano"}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {FEATURE_ROWS.map((row) => {
              const currentPlan = plans[currentPlanIndex];
              return (
                <tr key={row.key}>
                  <td className="small fw-medium text-secondary">{row.label}</td>
                  {plans.map((plan) => {
                    const value = plan.features[row.key];
                    const enabled = isFeatureEnabled(row.key, value);
                    const isCurrent = plan.code === currentPlanCode;
                    const isLocked =
                      isCurrent && typeof value === "boolean" && !value && currentPlan !== undefined;

                    return (
                      <td
                        key={plan.code}
                        className="text-center small"
                        style={{ background: isCurrent ? "#f0f7ff" : undefined }}
                      >
                        {typeof value === "boolean" ? (
                          <span className={`d-flex align-items-center justify-content-center gap-1 ${enabled ? "text-success" : "text-danger"}`}>
                            {enabled ? (
                              <CheckCircle2 size={16} />
                            ) : isLocked ? (
                              <>
                                <Lock size={14} className="text-warning" />
                                <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                                  Upgrade
                                </span>
                              </>
                            ) : (
                              <XCircle size={16} />
                            )}
                          </span>
                        ) : (
                          <span className={enabled ? "text-dark" : "text-muted"}>
                            {row.format(value)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
