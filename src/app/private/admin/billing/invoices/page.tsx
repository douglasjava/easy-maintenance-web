"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney, formatDate } from "@/lib/formatters";
import Pagination from "@/components/Pagination";
import GenerateInvoicesModal from "@/components/billing/GenerateInvoicesModal";
import InvoiceDetailsModal from "@/components/billing/InvoiceDetailsModal";

type Invoice = {
  id: string;
  payerUserId: string;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  status: string;
  dueDate: string;
};

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
    payerUserId: "",
  });
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [page, size]);

  async function fetchInvoices() {
    try {
      setLoading(true);
      const res = await api.get("/private/admin/billing/invoices", {
        params: { ...filters, page, size },
      });
      setInvoices(res.data.content || []);
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
      payerUserId: "",
    });
  }

  return (
    <BillingAdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0">Filtros</h5>
        <button
          className="btn btn-primary btn-sm"
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
              <option value="PAID">Paga</option>
              <option value="PENDING">Pendente</option>
              <option value="OVERDUE">Atrasada</option>
              <option value="VOID">Cancelada</option>
            </select>
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label small fw-medium">Data Início</label>
            <input
              type="date"
              className="form-control"
              value={filters.periodStart}
              onChange={(e) => setFilters({ ...filters, periodStart: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label small fw-medium">Data Fim</label>
            <input
              type="date"
              className="form-control"
              value={filters.periodEnd}
              onChange={(e) => setFilters({ ...filters, periodEnd: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-medium">ID Pagador</label>
            <input
              type="number"
              className="form-control"
              value={filters.payerUserId}
              onChange={(e) => setFilters({ ...filters, payerUserId: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-2 d-flex align-items-end gap-2">
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={handleFilter}>
              Filtrar
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleClear}>
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
                  <td>{inv.payerUserId}</td>
                  <td className="fw-semibold">{formatMoney(inv.totalCents)}</td>
                  <td>
                    <span
                      className={`badge ${
                        inv.status === "PAID" ? "bg-success" : "bg-warning text-dark"
                      }`}
                    >
                      {inv.status}
                    </span>
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
