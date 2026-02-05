"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney } from "@/lib/formatters";
import PlanModal from "@/components/billing/PlanModal";

type Plan = {
  code: string;
  name: string;
  priceCents: number;
  billingCycle: string;
  status: string;
  featuresJson: string;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      setLoading(true);
      const res = await api.get("/private/admin/billing/plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans", err);
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BillingAdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0">Planos</h5>
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#planModal"
          onClick={() => setSelectedPlan(null)}
        >
          + Criar Plano
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Ciclo</th>
              <th>Status</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Carregando...
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Nenhum plano encontrado
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.code}>
                  <td className="fw-medium">{plan.code}</td>
                  <td>{plan.name}</td>
                  <td>{formatMoney(plan.priceCents)}</td>
                  <td>{plan.billingCycle}</td>
                  <td>
                    <span
                      className={`badge ${
                        plan.status === "ACTIVE" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {plan.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#planModal"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PlanModal plan={selectedPlan} onSave={fetchPlans} />
    </BillingAdminLayout>
  );
}
