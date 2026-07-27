"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

interface CancelMaintenanceModalProps {
  show: boolean;
  maintenanceId: string | number | null;
  onClose: () => void;
  onCancelled: () => void;
}

// Mesmo mínimo de @Size(min = 5) do CancelMaintenanceRequest no backend (TASK-137) — valida aqui
// só pra dar feedback imediato; o backend é a fonte de verdade.
const MIN_REASON_LENGTH = 5;

export default function CancelMaintenanceModal({
  show,
  maintenanceId,
  onClose,
  onCancelled,
}: CancelMaintenanceModalProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const trimmedReason = reason.trim();
  const isReasonInvalid = trimmedReason.length < MIN_REASON_LENGTH;

  function handleClose() {
    if (submitting) return;
    setReason("");
    setTouched(false);
    onClose();
  }

  async function handleConfirm() {
    setTouched(true);
    if (isReasonInvalid || !maintenanceId) return;

    setSubmitting(true);
    try {
      await api.post(`/items/maintenances/${maintenanceId}/cancel`, { reason: trimmedReason });
      toast.success("Manutenção cancelada com sucesso.");
      setReason("");
      setTouched(false);
      onCancelled();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail ?? "Não foi possível cancelar a manutenção. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!show) return null;

  return createPortal(
    <>
      <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1070 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
            <div className="modal-header border-0 bg-light p-4">
              <h5 className="modal-title fw-bold">Cancelar manutenção</h5>
              <button type="button" className="btn-close" onClick={handleClose} disabled={submitting} />
            </div>

            <div className="modal-body px-4 pb-2">
              <div
                className="d-flex align-items-start gap-3 mb-3 p-3 rounded-3"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-1" />
                <p className="mb-0 text-danger" style={{ fontSize: "0.85rem" }}>
                  Essa ação não pode ser desfeita. O registro fica no histórico marcado como
                  cancelado — se o cadastro estiver errado, registre uma nova manutenção correta
                  depois de cancelar esta.
                </p>
              </div>

              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                Motivo do cancelamento *
              </label>
              <textarea
                className={`form-control ${touched && isReasonInvalid ? "is-invalid" : ""}`}
                rows={3}
                placeholder="Ex.: item errado, deveria ser no extintor da cozinha"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                disabled={submitting}
                maxLength={1000}
              />
              {touched && isReasonInvalid && (
                <div className="invalid-feedback d-block">
                  Informe um motivo com pelo menos {MIN_REASON_LENGTH} caracteres.
                </div>
              )}
            </div>

            <div className="modal-footer border-0 p-4 pt-3 gap-2 flex-column flex-sm-row">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4 fw-bold flex-grow-1"
                onClick={handleClose}
                disabled={submitting}
              >
                Voltar
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4 fw-bold flex-grow-1 shadow-sm"
                onClick={handleConfirm}
                disabled={submitting || isReasonInvalid}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Cancelando...
                  </>
                ) : (
                  "Cancelar manutenção"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal-backdrop fade show"
        onClick={() => !submitting && handleClose()}
        style={{ zIndex: 1069 }}
      />
    </>,
    document.body
  );
}
