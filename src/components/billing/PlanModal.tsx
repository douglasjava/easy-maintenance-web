"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

type Plan = {
  code: string;
  name: string;
  priceCents: number;
  billingCycle: string;
  status: string;
  featuresJson: string;
};

interface PlanModalProps {
  plan: Plan | null;
  onSave: () => void;
}

export default function PlanModal({ plan, onSave }: PlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Plan>({
    code: "",
    name: "",
    priceCents: 0,
    billingCycle: "MONTHLY",
    status: "ACTIVE",
    featuresJson: "{}",
  });

  const isEdit = !!plan;

  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        featuresJson: typeof plan.featuresJson === 'string' ? plan.featuresJson : JSON.stringify(plan.featuresJson, null, 2)
      });
    } else {
      setFormData({
        code: "",
        name: "",
        priceCents: 0,
        billingCycle: "MONTHLY",
        status: "ACTIVE",
        featuresJson: "{}",
      });
    }
  }, [plan]);

  async function handleSave() {
    // Basic validation
    if (!formData.code || !formData.name) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      JSON.parse(formData.featuresJson);
    } catch (e) {
      toast.error("JSON de funcionalidades inválido");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await api.patch(`/private/admin/billing/plans/${formData.code}`, formData);
        toast.success("Plano atualizado com sucesso!");
      } else {
        await api.post("/private/admin/billing/plans", formData);
        toast.success("Plano criado com sucesso!");
      }

      const el = document.getElementById("planModal");
      const bs = (window as any).bootstrap;
      if (el && bs?.Modal) {
        const instance = bs.Modal.getInstance(el);
        instance?.hide();
      }
      onSave();
    } catch (err) {
      console.error("Error saving plan", err);
      toast.error("Erro ao salvar plano");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal fade"
      id="planModal"
      tabIndex={-1}
      aria-labelledby="planModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content border-0">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" id="planModalLabel">
              {isEdit ? "Editar Plano" : "Criar Novo Plano"}
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
              <label className="form-label small fw-medium">Código</label>
              <input
                type="text"
                className="form-control"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isEdit}
                placeholder="Ex: PRO_MONTHLY"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Nome</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Plano Profissional"
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-medium">Preço (Centavos)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.priceCents}
                  onChange={(e) => setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-medium">Ciclo</label>
                <select
                  className="form-select"
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                >
                  <option value="MONTHLY">Mensal</option>
                  <option value="YEARLY">Anual</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Funcionalidades (JSON)</label>
              <textarea
                className="form-control font-monospace small"
                rows={5}
                value={formData.featuresJson}
                onChange={(e) => setFormData({ ...formData, featuresJson: e.target.value })}
              ></textarea>
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
              {loading ? "Salvando..." : "Salvar Plano"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
