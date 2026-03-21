import React from "react";
import { CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/lib/formatters";

export interface Plan {
  code: string;
  name: string;
  price: number;
  features: string[];
  description: string;
  highlight?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isLoading: boolean;
  onSelect: (planCode: string) => void;
  selectedPlanCode: string | null;
  setSelectedPlanCode: (planCode: string | null) => void;
  applyImmediately: boolean;
  onConfirm: (planCode: string) => void;
  loading: string | null;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrent,
  isLoading,
  onSelect,
  selectedPlanCode,
  setSelectedPlanCode,
  applyImmediately,
  onConfirm,
  loading,
}) => {
  const isSelected = selectedPlanCode === plan.code;

  return (
    <div
      className={`card mb-3 border-2 transition-all overflow-hidden ${
        isCurrent
          ? "border-primary shadow-sm bg-primary bg-opacity-10"
          : isSelected
          ? "border-primary shadow-sm"
          : "border-light hover-shadow"
      }`}
      style={{
        cursor: isCurrent ? "default" : "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={() => !isCurrent && !loading && onSelect(plan.code)}
    >
      {plan.highlight && (
        <div className="bg-primary text-white text-center py-1 small fw-bold">
          Mais popular
        </div>
      )}
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold mb-0">{plan.name}</h5>
              {isCurrent && (
                <span className="badge bg-primary rounded-pill small">
                  Plano atual
                </span>
              )}
            </div>
            <p className="text-muted small mb-0 mt-1">{plan.description}</p>
          </div>
          <div className="text-end">
            <div className="h4 fw-bold mb-0 text-primary">
              {formatMoney(plan.price * 100)}
            </div>
            <div className="text-muted small">/mês</div>
          </div>
        </div>

        <hr className="my-3 opacity-10" />

        <div className="row g-2 mb-4">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="col-md-6 d-flex align-items-center gap-2">
              <CheckCircle2 size={16} className="text-success flex-shrink-0" />
              <span className="small text-secondary">{feature}</span>
            </div>
          ))}
        </div>

        {isSelected ? (
          <div className="mt-3 p-3 border rounded-4 bg-light shadow-sm">
            <p className="small mb-2">
              Você está mudando para <strong>{plan.name}</strong> ({formatMoney(plan.price * 100)}/mês)
            </p>
            <p className="small text-muted mb-3">
              A mudança será aplicada {applyImmediately ? "imediatamente" : "no próximo ciclo"}.
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm(plan.code);
                }}
                disabled={!!loading}
              >
                {loading === plan.code ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlanCode(null);
                }}
                disabled={!!loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            className={`btn w-100 rounded-pill fw-bold py-2 ${
              isCurrent
                ? "btn-outline-primary disabled"
                : "btn-primary shadow-sm"
            }`}
            disabled={isCurrent || !!loading}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(plan.code);
            }}
          >
            {isCurrent ? "Plano atual" : `Alterar para ${plan.name}`}
          </button>
        )}
      </div>

      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
          border-color: #0d6efd !important;
        }
      `}</style>
    </div>
  );
};
