export type Item = {
  id: string;
  itemType: string;
  itemCategory: "REGULATORY" | "OPERATIONAL";
  status: "OK" | "NEAR_DUE" | "OVERDUE";
  nextDueAt: string;
  canUpdate?: boolean;
  reason?: string;
};

export const STATUS_CONFIG = {
  OK:       { label: "Em dia",   bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  NEAR_DUE: { label: "Vencendo", bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  OVERDUE:  { label: "Atrasado", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
} as const;

export const CATEGORY_CONFIG = {
  REGULATORY:  { label: "Regulatório",  bg: "#eff6ff", color: "#1d4ed8" },
  OPERATIONAL: { label: "Operacional",  bg: "#f0f9ff", color: "#0369a1" },
} as const;

export function StatusBadge({ status }: { status: Item["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.OK;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Item["itemCategory"] }) {
  const cfg = CATEGORY_CONFIG[category] ?? { label: category, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: "0.7rem",
        fontWeight: 500,
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
  const d = new Date(dt + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}
