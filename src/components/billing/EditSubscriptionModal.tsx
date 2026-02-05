"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

type Plan = {
  code: string;
  name: string;
  priceCents: number;
};

type Subscription = {
  organizationCode: string;
  organizationName: string;
  planCode: string;
  planName: string;
  priceCents: number;
  payerUserId: string;
  payerEmail: string;
  status: string;
  currentPeriodEnd: string;
};

interface EditSubscriptionModalProps {
  subscription: Subscription | null;
  plans: Plan[];
  onSave: () => void;
}

export default function EditSubscriptionModal({ subscription, plans, onSave }: EditSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payerUserId: "",
    planCode: "",
    status: "",
    currentPeriodEnd: "",
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        payerUserId: subscription.payerUserId || "",
        planCode: subscription.planCode || "",
        status: subscription.status || "",
        currentPeriodEnd: subscription.currentPeriodEnd ? subscription.currentPeriodEnd.split("T")[0] : "",
      });
    }
  }, [subscription]);

  async function handleSave() {
    if (!subscription) return;

    try {
      setLoading(true);
      await api.put(`/private/admin/billing/organizations/${subscription.organizationCode}/subscription`, formData);
      toast.success("Assinatura atualizada com sucesso!");
      
      // Close modal
      const el = document.getElementById("editSubscriptionModal");
      const bs = (window as any).bootstrap;
      if (el && bs?.Modal) {
        const instance = bs.Modal.getInstance(el);
        instance?.hide();
      }
      onSave();
    } catch (err) {
      console.error("Error updating subscription", err);
      toast.error("Erro ao atualizar assinatura");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal fade"
      id="editSubscriptionModal"
      tabIndex={-1}
      aria-labelledby="editSubscriptionModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content border-0">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" id="editSubscriptionModalLabel">
              Editar Assinatura
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body py-4">
            <div className="mb-3">
              <label className="form-label small fw-medium">ID do Usuário Pagador</label>
              <input
                type="number"
                className="form-control"
                value={formData.payerUserId}
                onChange={(e) => setFormData({ ...formData, payerUserId: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Plano</label>
              <select
                className="form-select"
                value={formData.planCode}
                onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
              >
                <option value="">Selecione um plano</option>
                {plans.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.priceCents / 100)})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAST_DUE">PAST_DUE</option>
                <option value="CANCELED">CANCELED</option>
                <option value="TRIALING">TRIALING</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Fim do Período Atual</label>
              <input
                type="date"
                className="form-control"
                value={formData.currentPeriodEnd}
                onChange={(e) => setFormData({ ...formData, currentPeriodEnd: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-light"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
