"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Copy, ExternalLink, QrCode } from "lucide-react";
import { formatMoney } from "@/lib/formatters";
import type { PendingPayment } from "@/hooks/usePendingPayment";

interface Props {
  payment: PendingPayment;
}

function isExpired(pixExpiresAt: string | null | undefined): boolean {
  if (!pixExpiresAt) return false;
  return new Date(pixExpiresAt) < new Date();
}

function formatExpiration(pixExpiresAt: string | null | undefined): string {
  if (!pixExpiresAt) return "";
  const d = new Date(pixExpiresAt);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PendingPixPaymentCard({ payment }: Props) {
  const [copied, setCopied] = useState(false);

  const expired = isExpired(payment.pixExpiresAt);
  const isOverdue = payment.status === "OVERDUE";
  const hasPaid = payment.status === "PAID";

  if (hasPaid) return null;

  async function handleCopy() {
    if (!payment.pixQrCode) return;
    try {
      await navigator.clipboard.writeText(payment.pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard API not available — user can select text manually
    }
  }

  return (
    <div className="card border shadow-sm rounded-4 overflow-hidden">
      <div className="card-header bg-white border-bottom py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <QrCode size={18} className="text-success" />
          <h6 className="mb-0 fw-bold">Pagamento PIX Pendente</h6>
        </div>
      </div>

      <div className="card-body px-4 pb-4 pt-3">
        {/* OVERDUE banner */}
        {isOverdue && (
          <div className="alert alert-danger border-0 rounded-3 p-3 mb-3 d-flex align-items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <div className="small fw-medium">
              Sua cobrança PIX venceu. Pague o quanto antes para evitar o bloqueio do seu acesso.
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="text-center mb-3">
          <div className="text-muted small mb-1">Valor a pagar</div>
          <div className="fs-4 fw-bold text-dark">{formatMoney(payment.amountCents)}</div>
        </div>

        {/* QR Code image */}
        {payment.pixQrCodeBase64 && !expired ? (
          <div className="text-center mb-3">
            <img
              src={`data:image/png;base64,${payment.pixQrCodeBase64}`}
              alt="QR Code PIX"
              className="img-fluid rounded-3 border"
              style={{ maxWidth: "200px" }}
            />
          </div>
        ) : expired ? (
          <div className="alert alert-warning border-0 rounded-3 p-3 mb-3 text-center d-flex flex-column align-items-center gap-2">
            <AlertTriangle size={24} className="text-warning" />
            <div className="fw-bold small">QR Code expirado</div>
            {payment.paymentLink && (
              <a
                href={payment.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-warning rounded-pill px-3 d-flex align-items-center gap-1"
              >
                Solicitar novo QR Code <ExternalLink size={12} />
              </a>
            )}
          </div>
        ) : null}

        {/* Copia e Cola */}
        {payment.pixQrCode && !expired && (
          <div className="mb-3">
            <div className="text-muted small mb-2">Copia e Cola</div>
            <div className="d-flex gap-2 align-items-stretch">
              <div
                className="flex-grow-1 border rounded-3 px-3 py-2 bg-light small text-truncate fw-mono"
                style={{ fontFamily: "var(--bs-font-monospace)", fontSize: "0.75rem" }}
                title={payment.pixQrCode}
              >
                {payment.pixQrCode}
              </div>
              <button
                className={`btn btn-sm rounded-3 flex-shrink-0 d-flex align-items-center gap-1 ${copied ? "btn-success" : "btn-outline-secondary"}`}
                onClick={handleCopy}
                title="Copiar código PIX"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {/* Expiration info */}
        {payment.pixExpiresAt && !expired && (
          <div className="d-flex align-items-center gap-2 text-muted small mb-3">
            <Clock size={14} className="flex-shrink-0" />
            <span>Expira em: <strong>{formatExpiration(payment.pixExpiresAt)}</strong></span>
          </div>
        )}

        {/* Pay via link (fallback or expired) */}
        {payment.paymentLink && !expired && (
          <a
            href={payment.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 mb-2"
          >
            Pagar com PIX <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
