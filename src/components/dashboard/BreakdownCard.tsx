interface BreakdownCardProps {
  statusBreakdown?: Record<string, number>;
  categoryBreakdown?: Record<string, number>;
  itemTypeBreakdown?: { itemType: string; count: number }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OK:       { label: "Em dia",           color: "#10b981" },
  NEAR_DUE: { label: "Vencendo em breve", color: "#f59e0b" },
  OVERDUE:  { label: "Atrasado",          color: "#ef4444" },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  REGULATORY:   { label: "Regulatório",  color: "#6366f1" },
  OPERATIONAL:  { label: "Operacional",  color: "#0ea5e9" },
};

function BarRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted" style={{ fontSize: "0.8rem" }}>
          {label}
        </span>
        <span className="fw-semibold" style={{ fontSize: "0.8rem", color }}>
          {value}
          <span className="text-muted fw-normal ms-1" style={{ fontSize: "0.72rem" }}>
            ({pct}%)
          </span>
        </span>
      </div>
      <div
        className="rounded-pill overflow-hidden"
        style={{ height: 5, backgroundColor: "#f1f5f9" }}
      >
        <div
          className="h-100 rounded-pill"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            transition: "width 0.6s ease",
            minWidth: value > 0 ? 4 : 0,
          }}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div
        className="fw-semibold text-muted text-uppercase mb-3"
        style={{ fontSize: "0.68rem", letterSpacing: "0.07em" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function BreakdownCard({
  statusBreakdown,
  categoryBreakdown,
  itemTypeBreakdown,
}: BreakdownCardProps) {
  const statusTotal = statusBreakdown
    ? Object.values(statusBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  const categoryTotal = categoryBreakdown
    ? Object.values(categoryBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  const itemTypeTotal = itemTypeBreakdown
    ? itemTypeBreakdown.reduce((a, b) => a + b.count, 0)
    : 0;

  const topItemTypes = itemTypeBreakdown
    ? [...itemTypeBreakdown].sort((a, b) => b.count - a.count).slice(0, 5)
    : [];

  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h3
          className="fw-bold mb-4 text-dark"
          style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}
        >
          Distribuição
        </h3>

        {/* Por Status */}
        {statusBreakdown && statusTotal > 0 && (
          <Section title="Por status">
            {Object.entries(statusBreakdown).map(([key, val]) => {
              const cfg = STATUS_CONFIG[key] ?? { label: key, color: "#94a3b8" };
              return (
                <BarRow
                  key={key}
                  label={cfg.label}
                  value={val}
                  total={statusTotal}
                  color={cfg.color}
                />
              );
            })}
          </Section>
        )}

        {/* Por Categoria */}
        {categoryBreakdown && categoryTotal > 0 && (
          <Section title="Por categoria">
            {Object.entries(categoryBreakdown).map(([key, val]) => {
              const cfg = CATEGORY_CONFIG[key] ?? { label: key, color: "#94a3b8" };
              return (
                <BarRow
                  key={key}
                  label={cfg.label}
                  value={val}
                  total={categoryTotal}
                  color={cfg.color}
                />
              );
            })}
          </Section>
        )}

        {/* Por Tipo de Item — top 5 */}
        {topItemTypes.length > 0 && (
          <Section title="Top tipos de item">
            {topItemTypes.map((item) => (
              <BarRow
                key={item.itemType}
                label={item.itemType}
                value={item.count}
                total={itemTypeTotal}
                color="#2563eb"
              />
            ))}
            {itemTypeBreakdown && itemTypeBreakdown.length > 5 && (
              <p
                className="text-muted mb-0 mt-1"
                style={{ fontSize: "0.75rem" }}
              >
                +{itemTypeBreakdown.length - 5} outros tipos
              </p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
