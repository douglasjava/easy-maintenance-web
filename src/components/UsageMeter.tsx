"use client";

interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
  upgradeHref?: string;
}

function getColor(pct: number): { bar: string; text: string } {
  if (pct >= 100) return { bar: "#DC3545", text: "#DC3545" };
  if (pct >= 80) return { bar: "#FD7E14", text: "#CC6600" };
  if (pct >= 60) return { bar: "#FFC107", text: "#856404" };
  return { bar: "#198754", text: "#145A32" };
}

export default function UsageMeter({ label, current, max, upgradeHref }: UsageMeterProps) {
  if (max <= 0) return null;

  const pct = Math.min(Math.round((current / max) * 100), 100);
  const { bar, text } = getColor(pct);
  const atLimit = current >= max;

  return (
    <div style={{ minWidth: 160 }}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="small fw-medium" style={{ color: "#374151" }}>
          {label}
        </span>
        <span className="small fw-semibold" style={{ color: text }}>
          {current}/{max}
        </span>
      </div>

      <div
        className="rounded-pill"
        style={{ height: 6, backgroundColor: "#E5E7EB", overflow: "hidden" }}
      >
        <div
          className="rounded-pill"
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: bar,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {atLimit && upgradeHref && (
        <div className="mt-1">
          <a
            href={upgradeHref}
            className="small"
            style={{ color: "#0B5ED7", textDecoration: "none", fontSize: "0.72rem" }}
          >
            Limite atingido — faça upgrade →
          </a>
        </div>
      )}

      {!atLimit && pct >= 80 && (
        <div className="mt-1 small" style={{ color: text, fontSize: "0.72rem" }}>
          Próximo do limite
        </div>
      )}
    </div>
  );
}
