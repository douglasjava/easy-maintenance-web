"use client";

type Props = { status: "OK" | "NEAR_DUE" | "OVERDUE" };

export default function StatusPill({ status }: Props) {
  const map = {
    OK: { cls: "text-bg-success", text: "Em dia" },
    NEAR_DUE: { cls: "text-bg-warning", text: "Vencendo" },
    OVERDUE: { cls: "text-bg-danger", text: "Atrasado" },
  } as const;
  const s = map[status] ?? map.OK;
  return <span className={`badge ${s.cls}`}>{s.text}</span>;
}
