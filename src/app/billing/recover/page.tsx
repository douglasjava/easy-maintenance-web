"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingPayment } from "@/hooks/usePendingPayment";
import PaymentMethodSelectionModal from "@/components/billing/PaymentMethodSelectionModal";
import PendingPixPaymentCard from "@/components/billing/PendingPixPaymentCard";
import { PrivateRoute } from "@/components/PrivateRoute";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface PaymentFailure {
  failureReason: string | null;
  bucket: string | null;
  failedAt: string | null;
}

const BUCKET_LABEL: Record<string, { title: string; description: string; color: string }> = {
  USER_ACTION: {
    title: "Ação necessária",
    description: "Seu banco recusou a cobrança. Verifique seu limite, saldo ou dados do cartão e atualize o método de pagamento.",
    color: "warning",
  },
  TRANSIENT: {
    title: "Falha temporária",
    description: "Ocorreu uma instabilidade temporária na tentativa de cobrança. Atualize seu método de pagamento para forçar uma nova tentativa.",
    color: "info",
  },
  HARD_FAIL: {
    title: "Método de pagamento inválido",
    description: "Seu método de pagamento foi recusado de forma definitiva (cartão cancelado, dados inválidos). É necessário cadastrar um novo método.",
    color: "danger",
  },
  INFO: {
    title: "Informação de cobrança",
    description: "A cobrança foi interrompida. Verifique seu método de pagamento e tente novamente.",
    color: "secondary",
  },
  UNKNOWN: {
    title: "Falha no pagamento",
    description: "Não conseguimos identificar o motivo exato da recusa. Atualize seu método de pagamento para resolver.",
    color: "danger",
  },
};

function humanizeFailedAt(failedAt: string | null): string | null {
  if (!failedAt) return null;
  try {
    return new Date(failedAt).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

export default function BillingRecoverPage() {
  const { token, loading: authLoading } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: failure, isLoading: failureLoading } = useQuery<PaymentFailure>({
    queryKey: ["billing", "payment-failure"],
    queryFn: async () => {
      const res = await api.get<PaymentFailure>("/me/billing/payment-failure");
      return res.data;
    },
    enabled: !!token && !authLoading,
  });

  const { pendingPayment, isLoading: pixLoading } = usePendingPayment();
  const hasPendingPix = pendingPayment?.methodType === "PIX";

  const bucket = failure?.bucket ?? "UNKNOWN";
  const bucketInfo = BUCKET_LABEL[bucket] ?? BUCKET_LABEL.UNKNOWN;
  const formattedDate = humanizeFailedAt(failure?.failedAt ?? null);

  return (
    <PrivateRoute>
      <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="pt-4 pb-2">
            <Link
              href="/"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 mb-3"
            >
              <ArrowLeft size={14} /> Voltar ao dashboard
            </Link>
            <h4 className="fw-bold mb-1">Recuperar assinatura</h4>
            <p className="text-muted small mb-0">
              Sua assinatura está com pagamento em atraso. Resolva abaixo para recuperar o acesso completo.
            </p>
          </div>

          {/* Failure summary card */}
          {failureLoading ? (
            <div className="card rounded-4 shadow-sm border-0 p-4 mb-4">
              <div className="placeholder-glow">
                <span className="placeholder col-8 mb-2 d-block" />
                <span className="placeholder col-10 d-block" />
              </div>
            </div>
          ) : (
            <div className={`card rounded-4 shadow-sm border-0 border-start border-3 border-${bucketInfo.color} mb-4`}>
              <div className="card-body p-4">
                <div className="d-flex align-items-start gap-3">
                  <AlertCircle size={22} className={`text-${bucketInfo.color} flex-shrink-0 mt-1`} />
                  <div>
                    <div className="fw-bold mb-1">{bucketInfo.title}</div>
                    <p className="small text-muted mb-1">{bucketInfo.description}</p>
                    {formattedDate && (
                      <div className="small text-muted">
                        Última tentativa: <strong>{formattedDate}</strong>
                      </div>
                    )}
                    {failure?.failureReason && (
                      <div className="small text-muted mt-1">
                        Código: <code className="small">{failure.failureReason}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA: Update payment method */}
          <div className="card rounded-4 shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-1">Atualizar método de pagamento</h6>
              <p className="small text-muted mb-3">
                Escolha um novo método e uma nova tentativa de cobrança será feita automaticamente.
              </p>
              <button
                className="btn btn-primary rounded-pill fw-semibold px-4 d-inline-flex align-items-center gap-2"
                onClick={() => setShowPaymentModal(true)}
              >
                <RefreshCw size={15} />
                Atualizar método de pagamento
              </button>
            </div>
          </div>

          {/* Pending PIX payment (if any) */}
          {!pixLoading && hasPendingPix && pendingPayment && (
            <div className="mb-4">
              <h6 className="fw-semibold mb-3">Pagar agora via PIX</h6>
              <PendingPixPaymentCard payment={pendingPayment} />
            </div>
          )}
        </div>

        <PaymentMethodSelectionModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => setShowPaymentModal(false)}
        />
      </section>
    </PrivateRoute>
  );
}
