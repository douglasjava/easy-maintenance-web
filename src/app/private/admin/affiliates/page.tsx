"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

interface Commission {
  id: number;
  affiliateName: string;
  affiliateEmail: string;
  affiliateWhatsapp: string;
  organizationId: number;
  planName: string;
  planPrice: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

type Filter = "ALL" | "PENDING" | "PAID";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const waLink = (phone: string) =>
  `https://wa.me/55${phone.replace(/\D/g, "")}`;

export default function AdminAffiliatesPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [paying, setPaying] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Commission[]>(
        "/private/admin/affiliates-commissions/commissions"
      );
      setCommissions(data);
    } catch {
      toast.error("Erro ao carregar comissões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id: number) => {
    if (!confirm("Confirmar que o PIX foi enviado e marcar esta comissão como paga?")) return;
    setPaying(id);
    try {
      await api.patch(`/private/admin/affiliates-commissions/commissions/${id}/pay`);
      toast.success("Comissão marcada como paga.");
      await load();
    } catch {
      toast.error("Erro ao marcar comissão como paga.");
    } finally {
      setPaying(null);
    }
  };

  const filtered = commissions.filter(
    (c) => filter === "ALL" || c.status === filter
  );

  const totalPending = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const pendingCount = commissions.filter((c) => c.status === "PENDING").length;

  return (
    <div className="p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h5 fw-bold mb-1">Comissões de Afiliados</h1>
          {pendingCount > 0 ? (
            <p className="text-muted small mb-0">
              <span className="badge bg-warning text-dark me-2">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>
              Total a pagar:{" "}
              <strong className="text-warning">{BRL.format(totalPending)}</strong>
            </p>
          ) : (
            <p className="text-muted small mb-0">Nenhuma comissão pendente.</p>
          )}
        </div>

        {/* Filter tabs */}
        <div className="btn-group btn-group-sm" role="group">
          {(["ALL", "PENDING", "PAID"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`btn ${filter === f ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "Todas" : f === "PENDING" ? "Pendentes" : "Pagas"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5 text-muted">
            <div style={{ fontSize: "2rem" }}>💸</div>
            <p className="mt-3 mb-0 fw-semibold">
              {filter === "ALL"
                ? "Nenhuma comissão gerada ainda."
                : filter === "PENDING"
                ? "Nenhuma comissão pendente."
                : "Nenhuma comissão paga ainda."}
            </p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3 py-2 small fw-semibold text-muted">Afiliado</th>
                  <th className="py-2 small fw-semibold text-muted">WhatsApp</th>
                  <th className="py-2 small fw-semibold text-muted">Org ID</th>
                  <th className="py-2 small fw-semibold text-muted">Plano</th>
                  <th className="py-2 small fw-semibold text-muted text-end">Valor plano</th>
                  <th className="py-2 small fw-semibold text-muted text-end">Comissão</th>
                  <th className="py-2 small fw-semibold text-muted">Status</th>
                  <th className="py-2 small fw-semibold text-muted">Data</th>
                  <th className="pe-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-3">
                      <div className="fw-semibold small">{c.affiliateName}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {c.affiliateEmail}
                      </div>
                    </td>
                    <td>
                      <a
                        href={waLink(c.affiliateWhatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-success small text-decoration-none"
                      >
                        {c.affiliateWhatsapp}
                      </a>
                    </td>
                    <td className="text-muted small">{c.organizationId}</td>
                    <td className="small">{c.planName}</td>
                    <td className="small text-end">{BRL.format(c.planPrice)}</td>
                    <td className="small text-end fw-bold">
                      {BRL.format(c.commissionAmount)}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          c.status === "PAID" ? "bg-success" : "bg-warning text-dark"
                        }`}
                      >
                        {c.status === "PAID" ? "Pago" : "Pendente"}
                      </span>
                      {c.paidAt && (
                        <div className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>
                          {new Date(c.paidAt).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </td>
                    <td className="text-muted small">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="pe-3">
                      {c.status === "PENDING" && (
                        <button
                          className="btn btn-success btn-sm rounded-pill px-3"
                          disabled={paying === c.id}
                          onClick={() => markPaid(c.id)}
                        >
                          {paying === c.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" />
                          ) : (
                            "Marcar pago"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
