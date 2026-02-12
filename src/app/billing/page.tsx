"use client";

import { useState } from "react";
import { CreditCard, Download, CheckCircle2, Calendar } from "lucide-react";

export default function BillingPage() {
  const [invoices] = useState([
    { id: "1", date: "2026-02-01", amount: "R$ 149,90", status: "Pago", method: "Cartão **** 1234" },
    { id: "2", date: "2026-01-01", amount: "R$ 149,90", status: "Pago", method: "Cartão **** 1234" },
    { id: "3", date: "2025-12-01", amount: "R$ 149,90", status: "Pago", method: "Cartão **** 1234" },
  ]);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="mb-1 fw-bold">Faturamento</h2>
        <p className="text-muted mb-0">Gerencie seu plano, faturas e métodos de pagamento</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden border-top border-primary border-4">
            <div className="card-body p-4">
              <h6 className="text-muted small text-uppercase fw-bold mb-3">Plano Atual</h6>
              <h3 className="fw-bold mb-2">Plano Pro</h3>
              <p className="text-muted mb-4">Seu próximo ciclo de faturamento começa em 01 de Março de 2026</p>
              
              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-success">
                  <CheckCircle2 size={18} />
                  <span className="small fw-medium">Até 500 ativos de manutenção</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2 text-success">
                  <CheckCircle2 size={18} />
                  <span className="small fw-medium">Relatórios avançados</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-success">
                  <CheckCircle2 size={18} />
                  <span className="small fw-medium">Suporte prioritário 24/7</span>
                </div>
              </div>

              <button className="btn btn-primary w-100 rounded-3 py-2 fw-bold">Alterar Plano</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="card-title mb-0 fw-bold">Histórico de Faturas</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3 text-muted small text-uppercase">Data</th>
                      <th className="border-0 py-3 text-muted small text-uppercase">Valor</th>
                      <th className="border-0 py-3 text-muted small text-uppercase">Método</th>
                      <th className="border-0 py-3 text-muted small text-uppercase">Status</th>
                      <th className="border-0 py-3 text-end px-4 text-muted small text-uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <Calendar size={16} className="text-muted" />
                            <span className="fw-medium">{new Date(inv.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </td>
                        <td className="py-3 fw-bold text-dark">{inv.amount}</td>
                        <td className="py-3 text-muted small">{inv.method}</td>
                        <td className="py-3">
                          <span className="badge bg-success-subtle text-success rounded-pill px-3">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-end px-4">
                          <button className="btn btn-light btn-sm rounded-circle p-2 border-0" title="Baixar PDF">
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-white border-top py-3 px-4 text-center">
              <button className="btn btn-link text-muted text-decoration-none small p-0">Ver todas as faturas</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mt-4 overflow-hidden">
        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary-subtle p-3 rounded-3 text-primary">
              <CreditCard size={24} />
            </div>
            <div>
              <h6 className="fw-bold mb-1">Método de Pagamento</h6>
              <p className="text-muted small mb-0">Cartão de crédito terminando em 1234 • Expira em 08/2028</p>
            </div>
          </div>
          <button className="btn btn-outline-primary rounded-pill px-4">Editar</button>
        </div>
      </div>

      <style jsx>{`
        .bg-success-subtle {
          background-color: #d1e7dd;
        }
        .bg-primary-subtle {
          background-color: #e7f0fe;
        }
      `}</style>
    </div>
  );
}
