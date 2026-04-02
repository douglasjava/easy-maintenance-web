"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import {formatMoney, formatDate, formatDateTime} from "@/lib/formatters";
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
  idUser: number;
  payerName: string;
  status: string;
  periodStart: number;
  periodEnd: number;
  totalCents: number;
  organizationCode?: string; // Mantido para compatibilidade se necessário
  organizationName?: string; // Mantido para compatibilidade se necessário
};

import PlanChangeDialog from "@/components/billing/PlanChangeDialog";
import ConfirmModal from "@/components/ConfirmModal";
import StatusBadge from "@/components/admin/StatusBadge";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    planCode: "",
    payerName: "",
  });

  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; planCode: string; idUser: number } | null>(null);
  const [itemToCancel, setItemToCancel] = useState<{ id: number; idUser: number } | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
      setSubscriptions(res.data.content || []);
    } catch (err) {
      console.error("Error fetching subscriptions", err);
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isMounted) {
      fetchPlans();
      if (filters.status === "" && filters.planCode === "" && filters.payerName === "") {
        fetchSubscriptions();
      }
    }
  }, [isMounted, filters]);

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

  if (!isMounted) return null;

  async function handleCancelSubscription(itemId: number, idUser: number) {
    try {
      setCancelLoading(true);
      const adminToken = window.localStorage.getItem("adminToken");
      await api.post(`/private/admin/billing/subscription-items/${itemId}/cancel`, {}, {
            headers: { "X-Admin-Token": adminToken , "X-id-User": idUser },
        });
      toast.success("Assinatura cancelada com sucesso!");
      setItemToCancel(null);
      fetchSubscriptions();
    } catch (err) {
      console.error("Error canceling subscription", err);
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setCancelLoading(false);
    }
  }

  function handleOpenChangePlan(itemId: number, planCode: string, idUser: number) {
    setSelectedItem({ id: itemId, planCode, idUser });
    setIsPlanModalOpen(true);
  }

  return (
    <BillingAdminLayout>
      <div className="mb-4">
        <h5 className="fw-bold mb-3">Filtros</h5>
        <div className="row g-3">
          <div className="col-12 col-md-4">
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
          <div className="col-12 col-md-4">
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
          <div className="col-12 col-md-4">
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
            <button className="btn btn-primary btn-sm px-4 flex-fill flex-md-initial" onClick={handleFilter}>
              Filtrar
            </button>
            <button className="btn btn-outline-secondary btn-sm px-4 flex-fill flex-md-initial" onClick={handleClear}>
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
                  </td>
                  <td>{sourceTypeLabelMap[sub.sourceType] || sub.sourceType}</td>
                  <td>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td>{formatMoney(sub.totalCents)}</td>
                  <td>{formatDateTime(sub.periodStart)}</td>
                  <td>{formatDateTime(sub.periodEnd)}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleOpenChangePlan(sub.itemId, sub.planCode, sub.idUser)}
                      >
                        Upgrade
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleOpenChangePlan(sub.itemId, sub.planCode, sub.idUser)}
                      >
                        Downgrade
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setItemToCancel({ id: sub.itemId, idUser: sub.idUser })}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isPlanModalOpen && selectedItem && (
        <PlanChangeDialog
          show={isPlanModalOpen}
          onClose={() => {
            setIsPlanModalOpen(false);
            setSelectedItem(null);
          }}
          onSuccess={fetchSubscriptions}
          itemId={selectedItem.id}
          currentPlanCode={selectedItem.planCode}
          isAdmin={true}
          payerAccountId={selectedItem.payerAccountId}
        />
      )}

      <ConfirmModal
        show={!!itemToCancel}
        title="Cancelar Assinatura"
        message="Tem certeza que deseja cancelar esta assinatura? Esta ação removerá o acesso aos recursos relacionados ao final do período vigente."
        confirmLabel="Confirmar Cancelamento"
        cancelLabel="Manter Assinatura"
        loading={cancelLoading}
        onConfirm={() => itemToCancel && handleCancelSubscription(itemToCancel.id, itemToCancel.idUser)}
        onCancel={() => !cancelLoading && setItemToCancel(null)}
      />
    </BillingAdminLayout>
  );
}
