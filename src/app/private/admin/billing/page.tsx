"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "./BillingAdminLayout";
import { formatMoney } from "@/lib/formatters";
import GenerateInvoicesModal from "@/components/billing/GenerateInvoicesModal";

type OverviewData = {
  counters: {
    totalOrganizations: number;
    totalPayers: number;
    estimatedMonthlyRevenueCents: number;
  };
  payers: {
    content: Array<{
      userId: number;
      name: string;
      email: string;
      totalPrice: number;
      orgCount: number;
      userSubscription: {
        planCode: string;
        planName: string;
        priceCents: number;
        status: string;
        currentPeriodEnd: string;
      };
      organizations: Array<{
        organizationId: number;
        organizationCode: string;
        organizationName: string;
        planCode: string;
        planName: string;
        priceCents: number;
        status: string;
        currentPeriodEnd: string;
      }>;
      revenue: {
        userCents: number;
        orgsCents: number;
        totalCents: number;
      };
    }>;
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  };
};

export default function BillingOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);
        const res = await api.get(`/private/admin/billing/overview?page=${page}&size=${size}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching billing overview", err);
        toast.error("Erro ao carregar visão geral do faturamento");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [page, size]);

  if (loading && !data) {
    return (
      <BillingAdminLayout>
        <div className="text-center py-5">Carregando...</div>
      </BillingAdminLayout>
    );
  }

  return (
    <BillingAdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0">Visão Geral de Faturamento</h5>
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#generateInvoicesModal"
        >
          Gerar Faturas
        </button>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
            <div className="text-muted small fw-medium mb-1">Total Organizações</div>
            <div className="h3 mb-0 fw-bold text-dark">{data?.counters.totalOrganizations || 0}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
            <div className="text-muted small fw-medium mb-1">Total Pagadores</div>
            <div className="h3 mb-0 fw-bold text-dark">{data?.counters.totalPayers || 0}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
            <div className="text-muted small fw-medium mb-1">Receita Mensal Estimada</div>
            <div className="h3 mb-0 fw-bold text-success">
              {formatMoney(data?.counters.estimatedMonthlyRevenueCents || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-0">
          <h6 className="fw-bold m-0">Pagadores e Assinaturas</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Pagador / Email</th>
                <th className="text-center">Assinatura Usuário</th>
                <th className="text-center">Organizações</th>
                <th className="text-center">Receita Total</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.payers.content.map((payer) => (
                <tr key={payer.userId}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{payer.name}</div>
                    <div className="small text-muted">{payer.email}</div>
                  </td>
                  <td className="text-center">
                    {payer.userSubscription ? (
                      <div>
                        <span className={`badge rounded-pill mb-1 ${payer.userSubscription.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                          {payer.userSubscription.planName}
                        </span>
                        <div className="small text-muted">{formatMoney(payer.userSubscription.priceCents)}</div>
                      </div>
                    ) : (
                      <span className="text-muted small">Sem plano</span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="fw-bold">{payer.orgCount}</div>
                    <div className="small text-muted">
                      {payer.organizations.map(o => o.planName).join(", ")}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="fw-bold text-primary">{formatMoney(payer.revenue.totalCents)}</div>
                    <div className="x-small text-muted">
                      User: {formatMoney(payer.revenue.userCents)} | Orgs: {formatMoney(payer.revenue.orgsCents)}
                    </div>
                  </td>
                  <td className="text-end pe-4">
                    <Link
                      href={`/private/users/${payer.userId}`}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    >
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
              {(!data?.payers.content || data.payers.content.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    Nenhum pagador encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.payers.totalPages > 1 && (
          <div className="card-footer bg-white border-0 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="small text-muted">
                Página {data.payers.page + 1} de {data.payers.totalPages} ({data.payers.totalElements} registros)
              </span>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={data.payers.page === 0 || loading}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={data.payers.page >= data.payers.totalPages - 1 || loading}
                  onClick={() => setPage(p => p + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <GenerateInvoicesModal />
    </BillingAdminLayout>
  );
}
