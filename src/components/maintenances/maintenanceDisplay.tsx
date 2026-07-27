"use client";

import { useState } from "react";

export interface Maintenance {
  id: string | number;
  itemId: string | number;
  itemType?: string;
  performedAt: string;
  performedBy?: string;
  type: string;
  costCents: number;
  cancelled?: boolean;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: number | null;
  cancelledByName?: string | null;
}

export const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PREVENTIVE:   { label: "Preventiva",   bg: "#eff6ff", color: "#1d4ed8" },
  CORRECTIVE:   { label: "Corretiva",    bg: "#fef2f2", color: "#b91c1c" },
  INSPECTION:   { label: "Inspeção",     bg: "#f0fdf4", color: "#15803d" },
  CALIBRATION:  { label: "Calibração",   bg: "#fdf4ff", color: "#7e22ce" },
  EMERGENCY:    { label: "Emergência",   bg: "#fff7ed", color: "#c2410c" },
};

export function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? { label: type, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

export function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    const d = new Date(dt + "T00:00:00");
    return d.toLocaleDateString("pt-BR");
  } catch {
    return dt;
  }
}

// TASK-141: cancelledAt vem como Instant (data+hora ISO completo, ex. "2026-07-26T14:32:00Z"),
// diferente de performedAt (só data) — formatDate acima quebraria concatenando "T00:00:00" nele.
export function formatDateTime(dt?: string | null) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return dt;
  }
}

export function formatCost(cents?: number) {
  if (!cents) return "-";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// TASK-141: card expansível de uma manutenção cancelada — badge sempre visível (nunca se confunde
// com uma válida), motivo/autor/data só aparecem ao expandir. Sem ação de cancelar/anexar (TASK-140
// já não mostra o botão de cancelar em `maintDetail.cancelled`; aqui nem existe modal de detalhe —
// os dados já vêm completos do endpoint de canceladas, TASK-139).
// TASK-144: extraído de maintenances/page.tsx pra reaproveitar também em items/[id]/page.tsx.
export function CancelledMaintenanceRow({ m }: { m: Maintenance }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-3" style={{ border: "1px solid #fecaca", backgroundColor: "#fef2f2", overflow: "hidden" }}>
      <button
        type="button"
        className="w-100 d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-0 bg-transparent text-start"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="d-flex align-items-center gap-2 min-w-0">
          <span
            className="badge rounded-pill flex-shrink-0"
            style={{ backgroundColor: "#fecaca", color: "#991b1b", fontSize: "0.68rem", fontWeight: 700 }}
          >
            Cancelada
          </span>
          <span className="text-truncate" style={{ fontSize: "0.82rem", color: "#7f1d1d" }}>
            {formatDate(m.performedAt)}
          </span>
          <TypeBadge type={m.type} />
        </div>
        <span style={{ fontSize: "0.72rem", color: "#991b1b" }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3" style={{ borderTop: "1px solid #fecaca" }}>
          <div className="row g-2 pt-2" style={{ fontSize: "0.8rem" }}>
            <div className="col-6">
              <div style={{ fontSize: "0.68rem", color: "#991b1b", fontWeight: 600, textTransform: "uppercase" }}>
                Motivo do cancelamento
              </div>
              <div className="text-dark">{m.cancelReason || "—"}</div>
            </div>
            <div className="col-6">
              <div style={{ fontSize: "0.68rem", color: "#991b1b", fontWeight: 600, textTransform: "uppercase" }}>
                Cancelada por
              </div>
              <div className="text-dark">{m.cancelledByName || "—"}</div>
            </div>
            <div className="col-6">
              <div style={{ fontSize: "0.68rem", color: "#991b1b", fontWeight: 600, textTransform: "uppercase" }}>
                Cancelada em
              </div>
              <div className="text-dark">{formatDateTime(m.cancelledAt)}</div>
            </div>
            <div className="col-6">
              <div style={{ fontSize: "0.68rem", color: "#991b1b", fontWeight: 600, textTransform: "uppercase" }}>
                Responsável original
              </div>
              <div className="text-dark">{m.performedBy || "—"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
