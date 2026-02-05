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
    subscriptionsAtRisk: number;
  };
  topPayers: Array<{
    userId: string;
    name: string;
    email: string;
    orgCount: number;
    totalCents: number;
  }>;
  subscriptions: Array<{
    organizationId: string;
    organizationCode: string;
    organizationName: string;
    planName: string;
    payerEmail: string;
    priceCents: number;
    status: string;
  }>;
};

export default function BillingOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await api.get("/private/admin/billing/overview");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching billing overview", err);
        toast.error("Erro ao carregar visão geral do faturamento");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <BillingAdminLayout>
        <div className="text-center py-5">Carregando...</div>
      </BillingAdminLayout>
    );
  }

  return (
    <BillingAdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0">Visão Geral</h5>
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
          <div className="card border shadow-sm p-3">
            <div className="text-muted small">Total Organizações</div>
            <div className="h3 mb-0 fw-bold">{data?.counters.totalOrganizations}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border shadow-sm p-3">
            <div className="text-muted small">Total Pagadores</div>
            <div className="h3 mb-0 fw-bold">{data?.counters.totalPayers}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border shadow-sm p-3">
            <div className="text-muted small">Receita Mensal Estimada</div>
            <div className="h3 mb-0 fw-bold text-success">
              {formatMoney(data?.counters.estimatedMonthlyRevenueCents || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h6 className="fw-bold m-0">Top Pagadores</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Pagador</th>
                    <th className="text-center">Orgs</th>
                    <th>Total Mensal</th>
                    <th className="text-end">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topPayers.map((payer) => (
                    <tr key={payer.userId}>
                      <td>
                        <div className="fw-semibold">{payer.name}</div>
                        <div className="small text-muted">{payer.email}</div>
                      </td>
                      <td className="text-center">{payer.orgCount}</td>
                      <td>{formatMoney(payer.totalCents)}</td>
                      <td className="text-end">
                        <Link
                          href={`/private/users/${payer.userId}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!data?.topPayers || data.topPayers.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">
                        Nenhum pagador encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h6 className="fw-bold m-0">Assinaturas Recentes</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Organização</th>
                    <th>Plano</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th className="text-end">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.subscriptions.slice(0, 10).map((sub) => (
                    <tr key={sub.organizationCode}>
                      <td>
                        <div className="fw-semibold">{sub.organizationName}</div>
                        <div className="small text-muted">{sub.payerEmail}</div>
                      </td>
                      <td>{sub.planName}</td>
                      <td>{formatMoney(sub.priceCents)}</td>
                      <td>
                        <span
                          className={`badge ${
                            sub.status === "ACTIVE" ? "bg-success" : "bg-warning text-dark"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link
                          href={`/private/organizations/${sub.organizationId}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!data?.subscriptions || data.subscriptions.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        Nenhuma assinatura encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <GenerateInvoicesModal />
    </BillingAdminLayout>
  );
}
