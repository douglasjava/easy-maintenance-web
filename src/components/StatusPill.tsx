"use client";

type Props = { status: "OK" | "NEAR_DUE" | "OVERDUE" };

const STATUS_CONFIG = {
  OK:       { label: "Em dia",   bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  NEAR_DUE: { label: "Vencendo", bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  OVERDUE:  { label: "Atrasado", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
} as const;

export default function StatusPill({ status }: Props) {
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
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
