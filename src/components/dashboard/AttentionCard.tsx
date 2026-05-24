import Link from "next/link";
import { riskLevelLabelMap } from "@/lib/enums/labels";

interface AttentionItem {
  itemId: number;
  itemType: string;
  riskLevel: string;
  nextDueAt: string;
  status: string;
}

interface AttentionCardProps {
  items: AttentionItem[];
}

const RISK_STYLES: Record<string, { border: string; badge: string; badgeText: string }> = {
  CRITICAL: { border: "#ef4444", badge: "#fef2f2", badgeText: "#b91c1c" },
  HIGH:     { border: "#f59e0b", badge: "#fffbeb", badgeText: "#92400e" },
  MEDIUM:   { border: "#3b82f6", badge: "#eff6ff", badgeText: "#1d4ed8" },
  LOW:      { border: "#10b981", badge: "#f0fdf4", badgeText: "#065f46" },
};

const DEFAULT_RISK = { border: "#6b7280", badge: "#f9fafb", badgeText: "#374151" };

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    const d = new Date(dt + (dt.includes("T") ? "" : "T00:00:00"));
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return dt;
  }
}

function daysOverdue(dt?: string): number | null {
  if (!dt) return null;
  try {
    const due = new Date(dt + (dt.includes("T") ? "" : "T00:00:00")).getTime();
    const diff = Date.now() - due;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  } catch {
    return null;
  }
}

export function AttentionCard({ items }: AttentionCardProps) {
  return (
    <div
      className="card border-0 shadow-sm h-100"
      style={{ borderRadius: 12 }}
      data-tour="attention-card"
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="h6 fw-bold mb-0 text-dark" style={{ letterSpacing: "0.04em", fontSize: "0.75rem", textTransform: "uppercase" }}>
            Atenção Agora
          </h3>
          {items.length > 0 && (
            <Link
              href="/maintenances"
              className="text-decoration-none"
              style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 500 }}
            >
              Ver todos →
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
            <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
              Tudo em dia!
            </div>
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              Nenhuma manutenção crítica no momento.
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {items.map((item, idx) => {
              const risk = RISK_STYLES[item.riskLevel] ?? DEFAULT_RISK;
              const overdueDays = daysOverdue(item.nextDueAt);
              return (
                <div
                  key={idx}
                  className="d-flex justify-content-between align-items-center rounded-3 px-3 py-2"
                  style={{
                    borderLeft: `3px solid ${risk.border}`,
                    backgroundColor: risk.badge,
                    gap: "0.5rem",
                  }}
                >
                  <div className="min-w-0">
                    <div
                      className="fw-semibold text-dark text-truncate"
                      style={{ fontSize: "0.85rem", maxWidth: "100%" }}
                    >
                      {item.itemType}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {riskLevelLabelMap[item.riskLevel] ?? item.riskLevel}
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    {overdueDays !== null ? (
                      <span
                        className="d-block fw-bold"
                        style={{ fontSize: "0.75rem", color: risk.badgeText }}
                      >
                        {overdueDays}d atrasado
                      </span>
                    ) : (
                      <span
                        className="badge rounded-pill"
                        style={{ fontSize: "0.7rem", backgroundColor: risk.badge, color: risk.badgeText, border: `1px solid ${risk.border}` }}
                      >
                        Pendente
                      </span>
                    )}
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                      {formatDate(item.nextDueAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
