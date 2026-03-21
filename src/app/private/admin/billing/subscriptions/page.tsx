"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney, formatDate } from "@/lib/formatters";
import EditSubscriptionModal from "@/components/billing/EditSubscriptionModal";
import { sourceTypeLabelMap, subscriptionStatusLabelMap } from "@/lib/enums/labels";

type Plan = {
  code: string;
  name: string;
  priceCents: number;
};

type Subscription = {
  itemId: number;
  subscriptionId: number;
  sourceType: string;
  planCode: string;
  payerAccountId: number;
  payerName: string;
  status: string;
  periodStart: number;
  periodEnd: number;
  totalCents: number;
  organizationCode?: string; // Mantido para compatibilidade se necessário
  organizationName?: string; // Mantido para compatibilidade se necessário
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    planCode: "",
    payerName: "",
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
      // O response agora vem com "content", "totalElements", etc.
      setSubscriptions(res.data.content || []);
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
      payerName: "",
    });
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-success";
      case "TRIAL":
        return "bg-info text-dark";
      case "PENDING_PAYMENT":
      case "PENDING_ACTIVATION":
        return "bg-warning text-dark";
      case "PAST_DUE":
      case "PAYMENT_FAILED":
        return "bg-danger";
      case "BLOCKED":
      case "CANCELED":
        return "bg-secondary";
      default:
        return "bg-light text-dark border";
    }
  };

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
              {Object.entries(subscriptionStatusLabelMap).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
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
          <div className="col-12 col-md-6">
            <label className="form-label small fw-medium">Nome do Responsável</label>
            <input
              type="text"
              className="form-control"
              value={filters.payerName}
              onChange={(e) => setFilters({ ...filters, payerName: e.target.value })}
              placeholder="Pesquisar por nome..."
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
              <th>Nome do Responsável</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Início</th>
              <th>Fim</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  Carregando...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  Nenhuma assinatura encontrada
                </td>
              </tr>
            ) : (
              subscriptions.map((sub, index) => (
                <tr key={sub.subscriptionId || index}>
                  <td>
                    <div className="fw-semibold">{sub.payerName}</div>
                    <small className="text-muted">ID: {sub.payerAccountId}</small>
                  </td>
                  <td>{sourceTypeLabelMap[sub.sourceType] || sub.sourceType}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(sub.status)}`}>
                      {subscriptionStatusLabelMap[sub.status] || sub.status}
                    </span>
                  </td>
                  <td>{formatMoney(sub.totalCents)}</td>
                  <td>{formatDate(sub.periodStart)}</td>
                  <td>{formatDate(sub.periodEnd)}</td>
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

      {selectedSubscription && (
        <EditSubscriptionModal
          subscription={selectedSubscription as any}
          plans={plans}
          onSave={() => {
            fetchSubscriptions();
            setSelectedSubscription(null);
          }}
        />
      )}
    </BillingAdminLayout>
  );
}
