import React from "react";
import { formatMoney, formatDate } from "@/lib/formatters";

type Invoice = {
  id: number;
  status: string;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  paymentLink?: string | null;
};

const StatusBadge = ({ status }: { status: string }) => {
  const getBadgeStyles = (s: string) => {
    switch (s.toUpperCase()) {
      case "ACTIVE":
      case "PAID":
        return "bg-success-subtle text-success border-success-subtle";
      case "PAST_DUE":
      case "OVERDUE":
      case "DEBT":
        return "bg-danger-subtle text-danger border-danger-subtle";
      case "OPEN":
      case "PENDING":
        return "bg-warning-subtle text-warning-emphasis border-warning-subtle";
      case "CANCELED":
        return "bg-secondary-subtle text-secondary border-secondary-subtle";
      default:
        return "bg-light text-dark border-light";
    }
  };

  return (
    <span className={`badge rounded-pill border px-2 py-1 ${getBadgeStyles(status)}`} style={{ fontSize: '0.7rem' }}>
      {status}
    </span>
  );
};

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const pendingInvoice = invoices.find(
    (i) => i.status === "OPEN" || i.status === "OVERDUE"
  );

  return (
    <div id="invoice-section">
      <h6 className="fw-bold mb-3">Faturas recentes</h6>

      {pendingInvoice && (
        <div className="alert alert-warning border-0 rounded-4 mb-3 shadow-sm">
          <div className="fw-bold mb-1">Pagamento pendente</div>
          <div className="small mb-2">
            Existe uma cobrança em aberto referente à sua assinatura.
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <strong className="text-dark">{formatMoney(pendingInvoice.amountCents)}</strong>
            {pendingInvoice.paymentLink && (
              <a
                href={pendingInvoice.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary rounded-pill d-flex align-items-center gap-1 fw-bold px-3"
              >
                Pagar agora
              </a>
            )}
          </div>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {invoices.length === 0 ? (
          <div className="text-muted small text-center py-3">
            Nenhuma fatura encontrada
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="card border shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                    {formatDate(invoice.periodStart)} — {formatDate(invoice.periodEnd)}
                  </div>
                  <div className="fw-bold text-primary">
                    {formatMoney(invoice.amountCents)}
                  </div>
                </div>

                <div className="text-end">
                  <StatusBadge status={invoice.status} />
                  {invoice.paymentLink && (
                    <div className="mt-2">
                      <a
                        href={invoice.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Pagar
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
