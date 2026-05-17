"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { CreditCard, QrCode, Check } from "lucide-react";

type PaymentMethod = "CARD" | "PIX";

interface PaymentMethodSelectionModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: (method: PaymentMethod) => void;
  currentMethod?: PaymentMethod | null;
}

const METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: React.ReactNode; description: string; detail: string }
> = {
  CARD: {
    label: "Cartão de Crédito",
    icon: <CreditCard size={28} />,
    description: "Renovação automática mensal",
    detail:
      "Sua assinatura é renovada automaticamente todo mês. Você não precisa fazer nada — o débito acontece no cartão cadastrado.",
  },
  PIX: {
    label: "PIX",
    icon: <QrCode size={28} />,
    description: "Cobrança mensal via QR Code",
    detail:
      "Antes de cada vencimento, enviamos um e-mail com o QR Code e o código Copia e Cola. O acesso é liberado assim que o pagamento é confirmado.",
  },
};

export default function PaymentMethodSelectionModal({
  show,
  onClose,
  onSuccess,
  currentMethod,
}: PaymentMethodSelectionModalProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(
    currentMethod ?? null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setSelected(currentMethod ?? null);
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show, currentMethod]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading && show) onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [loading, show, onClose]);

  async function handleConfirm() {
    if (!selected) return;
    try {
      setLoading(true);
      await api.patch("/me/billing/payment-method", { method: selected });
      toast.success("Método de pagamento salvo com sucesso!");
      onSuccess?.(selected);
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(
        detail ?? "Não foi possível salvar o método de pagamento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!show) return null;

  return createPortal(
    <>
      <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 520 }}>
          <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
            {/* Header */}
            <div className="modal-header border-0 bg-light p-4 pb-3">
              <div>
                <h5 className="modal-title fw-bold mb-1">
                  Confirmar forma de pagamento
                </h5>
                <p className="text-muted small mb-0">
                  Escolha como prefere pagar sua assinatura mensal.
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
                aria-label="Fechar"
              />
            </div>

            {/* Body */}
            <div className="modal-body p-4 d-flex flex-column gap-3">
              {(["CARD", "PIX"] as PaymentMethod[]).map((method) => {
                const cfg = METHOD_CONFIG[method];
                const isSelected = selected === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelected(method)}
                    disabled={loading}
                    className={`btn text-start p-3 rounded-4 border-2 w-100 d-flex align-items-start gap-3 position-relative ${
                      isSelected
                        ? "border-primary bg-primary-subtle"
                        : "border bg-white"
                    }`}
                    style={{ borderStyle: "solid", transition: "all 0.15s" }}
                  >
                    <div
                      className={`flex-shrink-0 p-2 rounded-3 ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-light text-secondary"
                      }`}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold">{cfg.label}</div>
                      <div className="text-muted small fw-medium mb-1">
                        {cfg.description}
                      </div>
                      <div className="small text-muted">{cfg.detail}</div>
                    </div>
                    {isSelected && (
                      <span className="position-absolute top-0 end-0 mt-2 me-2 text-primary">
                        <Check size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4 fw-semibold flex-grow-1"
                onClick={handleConfirm}
                disabled={!selected || loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Salvando…
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal-backdrop fade show"
        onClick={() => !loading && onClose()}
        style={{ zIndex: 1050 }}
      />
    </>,
    document.body
  );
}
