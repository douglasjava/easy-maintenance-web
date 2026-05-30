import React from "react";
import { formatMoney, formatDate } from "@/lib/formatters";

type Invoice = {
  id: number;
  status: string;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  paymentLink?: string | null;
  receiptUrl?: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  PAID:     { label: "Pago",      bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  ACTIVE:   { label: "Ativo",     bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  PAST_DUE: { label: "Em atraso", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
  OVERDUE:  { label: "Em atraso", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
  DEBT:     { label: "Em atraso", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
  OPEN:     { label: "Pendente",  bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  PENDING:  { label: "Pendente",  bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  CANCELED: { label: "Cancelado", bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status.toUpperCase()] ?? { label: status, bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: "0.7rem",
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const pendingInvoice = invoices.find(
    (i) => i.status === "OPEN" || i.status === "OVERDUE"
  );

  return (
    <div id="invoice-section">
      <h6 style={{ fontWeight: 700, marginBottom: 12, fontSize: "0.85rem", color: "#374151" }}>
        Faturas recentes
      </h6>

      {pendingInvoice && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderLeft: "3px solid #f59e0b",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "0.85rem", color: "#92400e" }}>
            Pagamento pendente
          </div>
          <div style={{ fontSize: "0.8rem", marginBottom: 10, color: "#a16207" }}>
            Existe uma cobrança em aberto referente à sua assinatura.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ color: "#111827" }}>{formatMoney(pendingInvoice.amountCents)}</strong>
            {pendingInvoice.paymentLink && (
              <a
                href={pendingInvoice.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 14px",
                  borderRadius: 20,
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  textDecoration: "none",
                }}
              >
                Pagar agora
              </a>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {invoices.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.82rem", padding: "20px 0" }}>
            Nenhuma fatura encontrada
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.73rem", color: "#9ca3af", marginBottom: 3 }}>
                    {formatDate(invoice.periodStart)} — {formatDate(invoice.periodEnd)}
                  </div>
                  <div style={{ fontWeight: 700, color: "#2563eb", fontSize: "0.95rem" }}>
                    {formatMoney(invoice.amountCents)}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <StatusBadge status={invoice.status} />
                  {invoice.paymentLink && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={invoice.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "3px 12px",
                          borderRadius: 20,
                          border: "1px solid #bfdbfe",
                          color: "#2563eb",
                          fontWeight: 600,
                          fontSize: "0.73rem",
                          textDecoration: "none",
                          backgroundColor: "#eff6ff",
                        }}
                      >
                        Pagar
                      </a>
                    </div>
                  )}
                  {invoice.receiptUrl && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={invoice.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "3px 12px",
                          borderRadius: 20,
                          border: "1px solid #bbf7d0",
                          color: "#15803d",
                          fontWeight: 600,
                          fontSize: "0.73rem",
                          textDecoration: "none",
                          backgroundColor: "#f0fdf4",
                        }}
                      >
                        Ver recibo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
