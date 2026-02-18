"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { formatMoney, formatDate } from "@/lib/formatters";

type InvoiceItem = {
  organizationCode: string;
  description: string;
  planCode: string;
  amountCents: number;
};

type Invoice = {
  id: string;
  payerUserId: string;
  periodStart: string;
  periodEnd: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  status: string;
  dueDate: string;
  items: InvoiceItem[];
};

interface InvoiceDetailsModalProps {
  invoiceId: string | null;
}

export default function InvoiceDetailsModal({ invoiceId }: InvoiceDetailsModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails(invoiceId);
    } else {
      setInvoice(null);
    }
  }, [invoiceId]);

  async function fetchInvoiceDetails(id: string) {
    try {
      setLoading(true);
      const res = await api.get(`/private/admin/billing/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error("Error fetching invoice details", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal fade"
      id="invoiceDetailsModal"
      tabIndex={-1}
      aria-labelledby="invoiceDetailsModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-0">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" id="invoiceDetailsModalLabel">
              Detalhes da Fatura
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body py-4">
            {loading ? (
              <div className="text-center py-5">Carregando detalhes...</div>
            ) : invoice ? (
              <>
                <div className="row mb-4 g-3">
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">ID Pagador</div>
                    <div className="fw-semibold">{invoice.payerUserId}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Status</div>
                    <span className={`badge ${invoice.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Período</div>
                    <div className="fw-semibold">
                      {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Vencimento</div>
                    <div className="fw-semibold">{formatDate(invoice.dueDate)}</div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Itens da Fatura</h6>
                <div className="table-responsive mb-4">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Descrição</th>
                        <th>Plano</th>
                        <th className="text-end">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.description}</td>
                          <td>{item.planCode}</td>
                          <td className="text-end">{formatMoney(item.amountCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex flex-column align-items-end gap-1">
                  <div className="d-flex justify-content-between w-25">
                    <span className="text-muted">Subtotal:</span>
                    <span>{formatMoney(invoice.subtotalCents)}</span>
                  </div>
                  <div className="d-flex justify-content-between w-25 text-danger">
                    <span className="">Desconto:</span>
                    <span>-{formatMoney(invoice.discountCents)}</span>
                  </div>
                  <div className="d-flex justify-content-between w-25 fw-bold border-top pt-1 mt-1">
                    <span>Total:</span>
                    <span className="h5 mb-0 fw-bold">{formatMoney(invoice.totalCents)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-muted">Fatura não encontrada</div>
            )}
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-light"
              data-bs-dismiss="modal"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
