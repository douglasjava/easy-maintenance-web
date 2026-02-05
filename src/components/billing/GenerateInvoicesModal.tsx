"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function GenerateInvoicesModal() {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!periodStart || !periodEnd) {
      toast.error("Selecione o período");
      return;
    }

    try {
      setLoading(true);
      await api.post("/private/admin/billing/invoices/generate", null, {
        params: { periodStart, periodEnd },
      });
      toast.success("Geração de faturas iniciada com sucesso!");
      
      // Close modal using bootstrap
      const el = document.getElementById("generateInvoicesModal");
      const bs = (window as any).bootstrap;
      if (el && bs?.Modal) {
        const instance = bs.Modal.getInstance(el);
        instance?.hide();
      }
    } catch (err) {
      console.error("Error generating invoices", err);
      toast.error("Erro ao gerar faturas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal fade"
      id="generateInvoicesModal"
      tabIndex={-1}
      aria-labelledby="generateInvoicesModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content border-0">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" id="generateInvoicesModalLabel">
              Gerar Faturas
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body py-4">
            <p className="text-muted small mb-4">
              Selecione o período para processar e gerar as faturas correspondentes.
            </p>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label small fw-medium">Data Início</label>
                <input
                  type="date"
                  className="form-control"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-medium">Data Fim</label>
                <input
                  type="date"
                  className="form-control"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-light"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Gerando..." : "Gerar Agora"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
