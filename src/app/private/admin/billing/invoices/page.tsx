"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney, formatDate } from "@/lib/formatters";
import Pagination from "@/components/Pagination";
import GenerateInvoicesModal from "@/components/billing/GenerateInvoicesModal";
import InvoiceDetailsModal from "@/components/billing/InvoiceDetailsModal";
import AsyncSelect from "react-select/async";
import { adminBillingService } from "@/services/private/admin-billing.service";

type Invoice = {
  id: string;
  payerUserId: string;
  payerUserName?: string;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  status: string;
  dueDate: string;
};

import StatusBadge from "@/components/admin/StatusBadge";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
      status: "",
      periodStart: "",
      periodEnd: "",
      dueDateStart: "",
      dueDateEnd: "",
      payerUserId: "",
  });
  const [payerFilter, setPayerFilter] = useState<{ value: string; label: string } | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchInvoices();
    }
  }, [page, size, isMounted]);

  if (!isMounted) return null;

  async function fetchInvoices() {
    try {
      setLoading(true);
      const res = await api.get("/private/admin/billing/invoices", {
        params: { 
          ...filters, 
          payerUserId: filters.payerUserId || undefined,
          page, 
          size 
        },
      });
      
      const content = res.data.content || [];
      
      setInvoices(content);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Error fetching invoices", err);
      toast.error("Erro ao carregar faturas");
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    setPage(0);
    fetchInvoices();
  }

  function handleClear() {
    setFilters({
      status: "",
      periodStart: "",
      periodEnd: "",
      dueDateStart: "",
      dueDateEnd: "",
      payerUserId: "",
    });
    setPayerFilter(null);
  }

  async function loadPayerOptions(inputValue: string) {
    if (!inputValue || inputValue.length < 3) return [];

    try {
      const data = await adminBillingService.listAccounts({ name: inputValue });
      return (data.content || []).map((account: any) => ({
        value: String(account.userId),
        label: account.name,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  return (
    <BillingAdminLayout>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h5 className="fw-bold m-0">Filtros e Faturas</h5>
        <button
          className="btn btn-primary btn-sm align-self-stretch align-self-sm-center"
          data-bs-toggle="modal"
          data-bs-target="#generateInvoicesModal"
        >
          Gerar Faturas
        </button>
      </div>

      <div className="mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-medium">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="OPEN">Aberto</option>
              <option value="PAID">Pago</option>
              <option value="CANCELED">Cancelado</option>
              <option value="OVERDUE">Vencido</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label small fw-medium">Data Vencimento Início</label>
            <input
              type="date"
              className="form-control"
              value={filters.dueDateStart}
              onChange={(e) => setFilters({ ...filters, dueDateStart: e.target.value })}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label small fw-medium">Data Vencimento Fim</label>
            <input
              type="date"
              className="form-control"
              value={filters.dueDateEnd}
              onChange={(e) => setFilters({ ...filters, dueDateEnd: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-medium">Pagador</label>
            <AsyncSelect
              cacheOptions
              loadOptions={loadPayerOptions}
              defaultOptions
              value={payerFilter}
              onChange={(option) => {
                setPayerFilter(option);
                setFilters({ ...filters, payerUserId: option ? option.value : "" });
              }}
              placeholder="Buscar por nome..."
              noOptionsMessage={() => "Nenhum pagador encontrado"}
              loadingMessage={() => "Buscando..."}
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  borderRadius: "0.375rem",
                  borderColor: "#dee2e6",
                }),
              }}
            />
          </div>
          <div className="col-12 col-md-2 d-flex align-items-end gap-2">
            <button className="btn btn-primary btn-sm flex-fill" onClick={handleFilter}>
              Filtrar
            </button>
            <button className="btn btn-outline-secondary btn-sm flex-fill" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Período</th>
              <th>Pagador</th>
              <th>Total</th>
              <th>Status</th>
              <th>Vencimento</th>
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
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Nenhuma fatura encontrada
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    {formatDate(inv.periodStart)} - {formatDate(inv.periodEnd)}
                  </td>
                  <td>
                    {inv.payerUserName || inv.payerUserId}
                  </td>
                  <td className="fw-semibold">{formatMoney(inv.totalCents)}</td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#invoiceDetailsModal"
                      onClick={() => setSelectedInvoiceId(inv.id)}
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          page={page}
          size={size}
          totalPages={totalPages}
          onChange={setPage}
          onSizeChange={setSize}
        />
      </div>

      <GenerateInvoicesModal />
      <InvoiceDetailsModal invoiceId={selectedInvoiceId} />
    </BillingAdminLayout>
  );
}
