"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { formatMoney, formatDate } from "@/lib/formatters";
import { Calendar, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

// Tipagens do endpoint /me/billing/summary
type BillingAccount = {
  id: number;
  userId: number;
  billingEmail: string;
  doc: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type InvoiceItem = {
  id: number;
  organizationCode?: string;
  planCode?: string;
  description: string;
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
  createdAt: string;
};

type OpenInvoice = {
  id: number;
  payerUserId: number;
  currency: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  status: string; // OPEN | PAID | etc
  dueDate: string; // YYYY-MM-DD
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
};

type BillingSummary = {
  account: BillingAccount | null;
  currentOpenInvoice: OpenInvoice | null;
};

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const { data } = await api.get("/me/billing/summary");
        setSummary(data);
      } catch (err) {
        console.error("Erro ao carregar faturamento do usuário", err);
        toast.error("Não foi possível carregar seu faturamento.");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const account = summary?.account || null;
  const invoice = summary?.currentOpenInvoice || null;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="mb-1 fw-bold">Faturamento</h2>
        <p className="text-muted mb-0">Gerencie seu plano, faturas e métodos de pagamento</p>
      </div>

      {loading && (
        <div className="text-center text-muted py-5">Carregando informações de faturamento...</div>
      )}

      {!loading && (
        <>
          {/* Resumo em Cards */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="text-muted small mb-1">Status da Conta</div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge rounded-pill ${account?.status === "ACTIVE" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                      {account?.status || "Indefinido"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="text-muted small mb-1">Próximo Vencimento</div>
                  <div className="h5 mb-0">{invoice?.dueDate ? formatDate(invoice.dueDate) : "—"}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="text-muted small mb-1">Total a Pagar (Fatura Aberta)</div>
                  <div className="h5 mb-0 text-primary">{formatMoney(invoice?.totalCents || 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal: Conta e Fatura Atual */}
          <div className="row g-4">
            {/* Conta de Faturamento */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <div className="card-header bg-white border-0 py-3 px-4">
                  <h6 className="mb-0 fw-bold">Conta de Faturamento</h6>
                </div>
                <div className="card-body p-4">
                  {!account ? (
                    <div className="text-muted small">Nenhuma conta de faturamento encontrada.</div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <div className="text-muted small">E-mail de Cobrança</div>
                        <div className="fw-semibold">{account.billingEmail}</div>
                      </div>
                      <div>
                        <div className="text-muted small">Documento</div>
                        <div className="fw-semibold">{account.doc}</div>
                      </div>
                      <div>
                        <div className="text-muted small">Endereço</div>
                        <div className="fw-semibold">
                          {account.street}, {account.number}
                        </div>
                        <div className="small text-muted">
                          {account.neighborhood} • {account.city}/{account.state}
                        </div>
                        <div className="small text-muted">CEP {account.zipCode} • {account.country}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <div className="fw-semibold small">Método de Pagamento</div>
                          <div className="text-muted x-small">Definido pela plataforma • Somente visualização</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fatura Aberta Atual */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold">Fatura Atual</h6>
                    <div className="small text-muted">Período {invoice ? `${formatDate(invoice.periodStart)} a ${formatDate(invoice.periodEnd)}` : "—"}</div>
                  </div>
                  <div>
                    <span className={`badge rounded-pill ${invoice?.status === "PAID" ? "bg-success-subtle text-success" : invoice?.status === "OPEN" ? "bg-warning-subtle text-warning" : "bg-secondary-subtle text-secondary"}`}>
                      {invoice?.status || "Sem fatura"}
                    </span>
                  </div>
                </div>
                <div className="card-body p-0">
                  {!invoice ? (
                    <div className="text-muted small px-4 py-4">Nenhuma fatura em aberto.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-4">Descrição</th>
                            <th className="text-center">Qtd.</th>
                            <th className="text-center">Plano</th>
                            <th className="text-end pe-4">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item) => (
                            <tr key={item.id}>
                              <td className="ps-4">
                                <div className="fw-semibold">{item.description}</div>
                              </td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-center">{item.planCode || "-"}</td>
                              <td className="text-end pe-4">{formatMoney(item.amountCents)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="text-end fw-medium">Subtotal</td>
                            <td className="text-end pe-4">{formatMoney(invoice.subtotalCents)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="text-end fw-medium">Desconto</td>
                            <td className="text-end pe-4 text-danger">-{formatMoney(invoice.discountCents)}</td>
                          </tr>
                          <tr className="table-light">
                            <td colSpan={3} className="text-end fw-bold">Total</td>
                            <td className="text-end pe-4 fw-bold text-primary">{formatMoney(invoice.totalCents)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
                {invoice && (
                  <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                    <div className="small text-muted">Vencimento: <span className="fw-semibold">{formatDate(invoice.dueDate)}</span></div>
                    <div className="small text-muted">Moeda: <span className="fw-semibold">{invoice.currency}</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <style jsx>{`
            .bg-success-subtle { background-color: #d1e7dd; }
            .bg-warning-subtle { background-color: #fff3cd; }
            .bg-secondary-subtle { background-color: #e2e3e5; }
            .bg-primary-subtle { background-color: #e7f0fe; }
          `}</style>
        </>
      )}
    </div>
  );
}
