"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney, formatDate } from "@/lib/formatters";
import EditSubscriptionModal from "@/components/billing/EditSubscriptionModal";

type Plan = {
  code: string;
  name: string;
  priceCents: number;
};

type Subscription = {
  organizationCode: string;
  organizationName: string;
  planCode: string;
  planName: string;
  priceCents: number;
  payerUserId: string;
  payerEmail: string;
  status: string;
  currentPeriodEnd: string;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    planCode: "",
    payerUserId: "",
    queryNameOrCodeOrganization: "",
  });
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, []);

  async function fetchPlans() {
    try {
      const res = await api.get("/private/admin/billing/plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans", err);
    }
  }

  async function fetchSubscriptions() {
    try {
      setLoading(true);

      const params = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );

      const res = await api.get("/private/admin/billing/subscriptions", { params: params });
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Error fetching subscriptions", err);
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    fetchSubscriptions();
  }

  function handleClear() {
    setFilters({
      status: "",
      planCode: "",
      payerUserId: "",
      queryNameOrCodeOrganization: "",
    });
  }

  return (
    <BillingAdminLayout>
      <div className="mb-4">
        <h5 className="fw-bold mb-3">Filtros</h5>
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-medium">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Ativa</option>
              <option value="PAST_DUE">Em atraso</option>
              <option value="CANCELED">Cancelada</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-medium">Plano</label>
            <select
              className="form-select"
              value={filters.planCode}
              onChange={(e) => setFilters({ ...filters, planCode: e.target.value })}
            >
              <option value="">Todos</option>
              {plans.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label small fw-medium">ID Pagador</label>
            <input
              type="number"
              className="form-control"
              value={filters.payerUserId}
              onChange={(e) => setFilters({ ...filters, payerUserId: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-medium">Empresa (Nome ou Código)</label>
            <input
              type="text"
              className="form-control"
              value={filters.queryNameOrCodeOrganization}
              onChange={(e) => setFilters({ ...filters, queryNameOrCodeOrganization: e.target.value })}
            />
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary btn-sm px-4" onClick={handleFilter}>
              Filtrar
            </button>
            <button className="btn btn-outline-secondary btn-sm px-4" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Organização</th>
              <th>Plano</th>
              <th>Pagador</th>
              <th>Status</th>
              <th>Período Fim</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Carregando...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Nenhuma assinatura encontrada
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.organizationCode}>
                  <td>
                    <div className="fw-semibold">{sub.organizationName}</div>
                    <small className="text-muted">{sub.organizationCode}</small>
                  </td>
                  <td>
                    <div className="fw-medium">{sub.planName}</div>
                    <small className="text-muted">{formatMoney(sub.priceCents)}</small>
                  </td>
                  <td className="small">{sub.payerEmail}</td>
                  <td>
                    <span
                      className={`badge ${
                        sub.status === "ACTIVE" ? "bg-success" : "bg-warning text-dark"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td>{formatDate(sub.currentPeriodEnd)}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#editSubscriptionModal"
                      onClick={() => setSelectedSubscription(sub)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditSubscriptionModal
        subscription={selectedSubscription}
        plans={plans}
        onSave={fetchSubscriptions}
      />
    </BillingAdminLayout>
  );
}
